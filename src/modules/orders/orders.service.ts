import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  /** Generate a unique branded order sequence like TGD-28941 */
  private generateOrderNumber(): string {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `TGD-${randomNum}`;
  }

  /* ── Create Order (Cash on Delivery) ── */
  async create(dto: CreateOrderDto, userId?: string) {
    let orderNumber = this.generateOrderNumber();
    // Ensure uniqueness
    let exists = await this.prisma.order.findUnique({ where: { orderNumber } });
    while (exists) {
      orderNumber = this.generateOrderNumber();
      exists = await this.prisma.order.findUnique({ where: { orderNumber } });
    }

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        customerId: userId || null,
        customerName: dto.customerName,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        city: dto.city,
        subtotal: dto.subtotal,
        delivery: dto.delivery || 0,
        discount: dto.discount || 0,
        total: dto.total,
        payment: 'Unpaid', // COD is unpaid until courier delivery
        method: 'COD',    // Strict Cash on Delivery
        status: 'Pending',
        courier: 'Pathao Courier',
        tracking: `PT-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        notes: dto.notes || null,
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId || null,
            name: item.name,
            image: item.image || null,
            variant: item.variant || null,
            color: item.color || null,
            size: item.size || null,
            qty: item.qty,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Send confirmation email (non-blocking)
    this.mailService.sendOrderConfirmation(
      dto.email,
      dto.customerName,
      order.orderNumber,
      order.total,
      dto.address,
      dto.items.length
    );

    return order;
  }

  /* ── Get All Orders (Admin) ── */
  async findAll() {
    return this.prisma.order.findMany({
      include: {
        items: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /* ── Get Orders for Logged-In Customer ── */
  async findMyOrders(userId: string, email: string) {
    return this.prisma.order.findMany({
      where: {
        OR: [
          { customerId: userId },
          { email: email },
        ],
      },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /* ── Get Single Order Details ── */
  async findOne(identifier: string) {
    // Supports finding by ID or OrderNumber (e.g. TGD-28941)
    const order = await this.prisma.order.findFirst({
      where: {
        OR: [
          { id: identifier },
          { orderNumber: identifier },
        ],
      },
      include: {
        items: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${identifier} not found.`);
    }

    return order;
  }

  /* ── Update Order Status (Admin) ── */
  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found.`);
    }

    return this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: dto.status,
        ...(dto.courier && { courier: dto.courier }),
        ...(dto.tracking && { tracking: dto.tracking }),
        ...(dto.notes && { notes: dto.notes }),
        // If marked as Delivered, update payment status to Paid for COD
        ...(dto.status === 'Delivered' && { payment: 'Paid' }),
      },
      include: {
        items: true,
      },
    });
  }
}
