import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHealthStatus() {
    return {
      status: 'ok',
      service: 'Tagdiah API Service',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      docs: '/api/docs',
    };
  }

  /* ── Dynamic System Notifications ── */
  async getNotifications() {
    // 1. Fetch persistent notifications from DB
    const dbNotifications = await this.prisma.notification.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    const notifications: Array<{
      id: string;
      type: 'order' | 'stock' | 'review' | 'message';
      title: string;
      meta: string;
      at: string;
      timestamp: Date;
      link: string;
      tone: string;
      read: boolean;
    }> = [];

    dbNotifications.forEach((n) => {
      notifications.push({
        id: n.id,
        type: n.type as any,
        title: n.title,
        meta: n.meta,
        at: this.formatTimeAgo(n.createdAt),
        timestamp: n.createdAt,
        link: n.link,
        tone: n.tone,
        read: n.read,
      });
    });

    // 2. Fetch Recent Orders if DB notifications are few
    if (notifications.length < 5) {
      try {
        const recentOrders = await this.prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
        });

        recentOrders.forEach((o) => {
          if (!notifications.some((n) => n.link.includes(o.orderNumber || o.id))) {
            notifications.push({
              id: `ord-${o.id}`,
              type: 'order',
              title: `New order #${o.orderNumber || o.id}`,
              meta: `${o.customerName} · ৳${o.total.toLocaleString()} · ${o.status}`,
              at: this.formatTimeAgo(o.createdAt),
              timestamp: o.createdAt,
              link: `/admin/orders/${o.orderNumber || o.id}`,
              tone: 'text-brown',
              read: false,
            });
          }
        });
      } catch {}
    }

    // 3. Low Stock Alerts
    try {
      const lowStockProducts = await this.prisma.product.findMany({
        where: {
          stock: { lte: 5 },
        },
        take: 3,
        orderBy: { stock: 'asc' },
      });

      lowStockProducts.forEach((p) => {
        if (!notifications.some((n) => n.id === `stock-${p.id}`)) {
          notifications.push({
            id: `stock-${p.id}`,
            type: 'stock',
            title: `Low stock: ${p.name}`,
            meta: p.stock === 0 ? 'Out of Stock · Restock urgently' : `Only ${p.stock} units left in warehouse`,
            at: 'Live alert',
            timestamp: p.updatedAt,
            link: '/admin/inventory',
            tone: p.stock === 0 ? 'text-danger' : 'text-gold',
            read: false,
          });
        }
      });
    } catch {}

    // Sort all notifications by timestamp
    notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const unreadCount = notifications.filter((n) => !n.read).length;

    return {
      unreadCount,
      notifications: notifications.slice(0, 15),
    };
  }

  /* ── Mark Single Notification as Read ── */
  async markAsRead(id: string) {
    try {
      await this.prisma.notification.update({
        where: { id },
        data: { read: true },
      });
    } catch {}
    return { success: true, id };
  }

  /* ── Mark All Notifications as Read ── */
  async markAllAsRead() {
    try {
      await this.prisma.notification.updateMany({
        where: { read: false },
        data: { read: true },
      });
    } catch {}
    return { success: true, message: 'All notifications marked as read.' };
  }

  private formatTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}
