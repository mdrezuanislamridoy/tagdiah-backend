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
    const notifications: Array<{
      id: string;
      type: 'order' | 'stock' | 'review' | 'message';
      title: string;
      meta: string;
      at: string;
      timestamp: Date;
      link: string;
      tone: string;
    }> = [];

    // 1. Recent Orders (Last 5 orders)
    try {
      const recentOrders = await this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      });

      recentOrders.forEach((o) => {
        const timeAgo = this.formatTimeAgo(o.createdAt);
        notifications.push({
          id: `ord-${o.id}`,
          type: 'order',
          title: `New order ${o.orderNumber || o.id}`,
          meta: `${o.customerName} · ৳${o.total.toLocaleString()} · ${o.status}`,
          at: timeAgo,
          timestamp: o.createdAt,
          link: `/admin/orders/${o.orderNumber || o.id}`,
          tone: 'text-brown',
        });
      });
    } catch {}

    // 2. Low Stock Alerts
    try {
      const lowStockProducts = await this.prisma.product.findMany({
        where: {
          stock: { lte: 5 },
        },
        take: 3,
        orderBy: { stock: 'asc' },
      });

      lowStockProducts.forEach((p) => {
        notifications.push({
          id: `stock-${p.id}`,
          type: 'stock',
          title: `Low stock: ${p.name}`,
          meta: p.stock === 0 ? 'Out of Stock · Restock urgently' : `Only ${p.stock} units left in warehouse`,
          at: 'Live alert',
          timestamp: p.updatedAt,
          link: '/admin/inventory',
          tone: p.stock === 0 ? 'text-danger' : 'text-gold',
        });
      });
    } catch {}

    // 3. Pending Reviews
    try {
      const pendingReviews = await this.prisma.review.findMany({
        where: { status: 'Pending' },
        include: { product: { select: { name: true } } },
        take: 3,
        orderBy: { createdAt: 'desc' },
      });

      if (pendingReviews.length > 0) {
        notifications.push({
          id: `rev-pending`,
          type: 'review',
          title: `${pendingReviews.length} review${pendingReviews.length > 1 ? 's' : ''} awaiting approval`,
          meta: pendingReviews.map((r) => r.product?.name || 'Item').slice(0, 2).join(', '),
          at: this.formatTimeAgo(pendingReviews[0].createdAt),
          timestamp: pendingReviews[0].createdAt,
          link: '/admin/reviews',
          tone: 'text-terracotta',
        });
      }
    } catch {}

    // 4. Unread Contact Inquiries
    try {
      const unreadMessages = await this.prisma.contactMessage.findMany({
        where: { status: 'Unread' },
        take: 3,
        orderBy: { createdAt: 'desc' },
      });

      unreadMessages.forEach((m) => {
        notifications.push({
          id: `msg-${m.id}`,
          type: 'message',
          title: `Inquiry from ${m.name}`,
          meta: `${m.topic} · "${m.message.slice(0, 40)}..."`,
          at: this.formatTimeAgo(m.createdAt),
          timestamp: m.createdAt,
          link: '/admin/contact',
          tone: 'text-sage',
        });
      });
    } catch {}

    // Sort all notifications by most recent
    notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return notifications.slice(0, 10);
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
