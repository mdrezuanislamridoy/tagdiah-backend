import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SyncWishlistDto, ToggleWishlistDto } from './dto/wishlist.dto';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  /* ── Get User's Wishlist (Returns Product IDs) ── */
  async getUserWishlist(userId: string) {
    const items = await (this.prisma as any).wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((i: any) => i.productId);
  }

  /* ── Toggle Wishlist Item ── */
  async toggleWishlist(userId: string, dto: ToggleWishlistDto) {
    const existing = await (this.prisma as any).wishlistItem.findFirst({
      where: {
        userId,
        productId: dto.productId,
      },
    });

    if (existing) {
      await (this.prisma as any).wishlistItem.delete({
        where: { id: existing.id },
      });
      return { wishlisted: false, productId: dto.productId };
    }

    await (this.prisma as any).wishlistItem.create({
      data: {
        userId,
        productId: dto.productId,
      },
    });

    return { wishlisted: true, productId: dto.productId };
  }

  /* ── Batch Sync Wishlist ── */
  async syncWishlist(userId: string, dto: SyncWishlistDto) {
    if (!dto.productIds || dto.productIds.length === 0) return this.getUserWishlist(userId);

    for (const productId of dto.productIds) {
      const existing = await (this.prisma as any).wishlistItem.findFirst({
        where: { userId, productId },
      });

      if (!existing) {
        await (this.prisma as any).wishlistItem.create({
          data: { userId, productId },
        });
      }
    }

    return this.getUserWishlist(userId);
  }

  /* ── Clear Wishlist ── */
  async clearWishlist(userId: string) {
    await (this.prisma as any).wishlistItem.deleteMany({
      where: { userId },
    });
    return { success: true, message: 'Wishlist cleared' };
  }
}
