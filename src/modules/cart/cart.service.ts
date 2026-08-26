import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddToCartDto, SyncCartDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  /* ── Get User's Cart ── */
  async getUserCart(userId: string) {
    const items = await (this.prisma as any).cartItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    return items;
  }

  /* ── Add or Update Item in Cart ── */
  async addToCart(userId: string, dto: AddToCartDto) {
    const qty = dto.quantity || 1;
    const color = dto.color || null;
    const size = dto.size || null;

    const existing = await (this.prisma as any).cartItem.findFirst({
      where: {
        userId,
        productId: dto.productId,
        color,
        size,
      },
    });

    if (existing) {
      return (this.prisma as any).cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + qty },
      });
    }

    return (this.prisma as any).cartItem.create({
      data: {
        userId,
        productId: dto.productId,
        quantity: qty,
        color,
        size,
      },
    });
  }

  /* ── Sync Cart (batch sync on login) ── */
  async syncCart(userId: string, dto: SyncCartDto) {
    if (!dto.items || dto.items.length === 0) return this.getUserCart(userId);

    for (const item of dto.items) {
      await this.addToCart(userId, item);
    }

    return this.getUserCart(userId);
  }

  /* ── Update Item Quantity ── */
  async updateQuantity(userId: string, itemId: string, quantity: number) {
    const item = await (this.prisma as any).cartItem.findFirst({
      where: { id: itemId, userId },
    });

    if (!item) throw new NotFoundException(`Cart item ${itemId} not found.`);

    if (quantity <= 0) {
      await (this.prisma as any).cartItem.delete({ where: { id: itemId } });
      return { success: true, message: 'Item removed from cart' };
    }

    return (this.prisma as any).cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  /* ── Remove Single Item ── */
  async removeItem(userId: string, itemId: string) {
    const item = await (this.prisma as any).cartItem.findFirst({
      where: { id: itemId, userId },
    });

    if (!item) throw new NotFoundException(`Cart item ${itemId} not found.`);

    await (this.prisma as any).cartItem.delete({ where: { id: itemId } });
    return { success: true, message: 'Item removed' };
  }

  /* ── Clear Entire Cart ── */
  async clearCart(userId: string) {
    await (this.prisma as any).cartItem.deleteMany({
      where: { userId },
    });
    return { success: true, message: 'Cart cleared' };
  }
}
