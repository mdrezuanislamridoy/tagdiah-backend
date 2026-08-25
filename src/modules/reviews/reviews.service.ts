import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto, UpdateReviewStatusDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  /* ── Submit Review ── */
  async create(dto: CreateReviewDto, userId?: string) {
    // Check product exists by ID or Slug
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [{ id: dto.productId }, { slug: dto.productId }],
      },
    });

    if (!product) {
      throw new NotFoundException(`Product ${dto.productId} not found.`);
    }

    const review = await this.prisma.review.create({
      data: {
        productId: product.id,
        customerId: userId || null,
        author: dto.author,
        rating: Math.min(5, Math.max(1, Math.round(dto.rating))),
        title: dto.title || null,
        body: dto.body,
        status: 'Approved', // Auto-approved for verified experience
        verified: true,
      },
    });

    return review;
  }

  /* ── Get Approved Reviews for a Product with Breakdown ── */
  async findByProduct(productId: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [{ id: productId }, { slug: productId }],
      },
    });

    if (!product) {
      return {
        reviews: [],
        averageRating: 5.0,
        totalCount: 0,
        breakdown: [
          { stars: 5, count: 0 },
          { stars: 4, count: 0 },
          { stars: 3, count: 0 },
          { stars: 2, count: 0 },
          { stars: 1, count: 0 },
        ],
      };
    }

    const reviews = await this.prisma.review.findMany({
      where: {
        productId: product.id,
        status: 'Approved',
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalCount = reviews.length;
    const ratingSum = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalCount > 0 ? Number((ratingSum / totalCount).toFixed(1)) : 5.0;

    const breakdownMap = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) {
        breakdownMap[r.rating as keyof typeof breakdownMap]++;
      }
    });

    const breakdown = [
      { stars: 5, count: breakdownMap[5] },
      { stars: 4, count: breakdownMap[4] },
      { stars: 3, count: breakdownMap[3] },
      { stars: 2, count: breakdownMap[2] },
      { stars: 1, count: breakdownMap[1] },
    ];

    return {
      reviews,
      averageRating,
      totalCount,
      breakdown,
    };
  }

  /* ── Get All Reviews (Admin Moderation) ── */
  async findAll() {
    return this.prisma.review.findMany({
      include: {
        product: {
          select: { id: true, name: true, slug: true, images: true },
        },
        customer: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /* ── Update Review Status (Admin) ── */
  async updateStatus(id: string, dto: UpdateReviewStatusDto) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException(`Review ${id} not found.`);

    return this.prisma.review.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  /* ── Delete Review (Admin) ── */
  async remove(id: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException(`Review ${id} not found.`);

    return this.prisma.review.delete({ where: { id } });
  }
}
