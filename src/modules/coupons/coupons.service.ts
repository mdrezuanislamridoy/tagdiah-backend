import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto } from './dto/coupon.dto';

import { SettingsService } from '../settings/settings.service';

@Injectable()
export class CouponsService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private settingsService: SettingsService,
  ) {}

  async onModuleInit() {
    await this.seedCouponsIfEmpty();
  }

  /* ── Validate Coupon Code for Storefront ── */
  async validate(dto: ValidateCouponDto) {
    const allSettings = this.settingsService.getAllSettings();
    if (allSettings?.payment?.allowDiscounts === false) {
      throw new BadRequestException('Discount codes and coupon promotions are currently disabled by store administration.');
    }

    const code = dto.code.trim().toUpperCase();
    const subtotal = dto.subtotal || 0;

    const coupon = await this.prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon) {
      throw new NotFoundException(`“${code}” is not a valid coupon code.`);
    }

    if (coupon.status !== 'Active') {
      throw new BadRequestException(`Coupon “${code}” is currently ${coupon.status.toLowerCase()}.`);
    }

    if (coupon.expires && new Date(coupon.expires) < new Date()) {
      throw new BadRequestException(`Coupon “${code}” expired on ${new Date(coupon.expires).toLocaleDateString()}.`);
    }

    if (coupon.used >= coupon.limit) {
      throw new BadRequestException(`Coupon “${code}” usage limit has been reached.`);
    }

    if (dto.email) {
      const email = dto.email.trim().toLowerCase();
      const existingOrder = await this.prisma.order.findFirst({
        where: {
          email,
          discount: { gt: 0 },
        },
      });

      if (existingOrder) {
        throw new BadRequestException(
          `Coupon “${code}” has already been redeemed for ${email}. This discount code is valid for 1-time use only per customer.`
        );
      }
    }

    if (subtotal < coupon.minOrder) {
      throw new BadRequestException(
        `Coupon “${code}” requires a minimum order of ৳${coupon.minOrder.toLocaleString()}.`
      );
    }

    let discount = 0;
    let label = '';

    if (coupon.type === 'Percentage') {
      discount = Math.round((subtotal * coupon.amount) / 100);
      label = `${coupon.amount}% off entire order`;
    } else if (coupon.type === 'Fixed') {
      discount = Math.min(subtotal, coupon.amount);
      label = `৳${coupon.amount} flat discount`;
    } else if (coupon.type === 'Free Delivery') {
      discount = 120;
      label = 'Free standard doorstep delivery';
    }

    return {
      valid: true,
      code: coupon.code,
      type: coupon.type,
      amount: coupon.amount,
      discount,
      label,
      minOrder: coupon.minOrder,
    };
  }

  /* ── Get All Coupons (Admin) ── */
  async findAll() {
    return this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /* ── Get Single Coupon ── */
  async findOne(id: string) {
    const coupon = await this.prisma.coupon.findFirst({
      where: {
        OR: [{ id }, { code: id.toUpperCase() }],
      },
    });

    if (!coupon) throw new NotFoundException(`Coupon ${id} not found.`);
    return coupon;
  }

  /* ── Create Coupon (Admin) ── */
  async create(dto: CreateCouponDto) {
    const code = dto.code.trim().toUpperCase();
    const exists = await this.prisma.coupon.findUnique({ where: { code } });
    if (exists) {
      throw new BadRequestException(`Coupon code “${code}” already exists.`);
    }

    return this.prisma.coupon.create({
      data: {
        code,
        type: dto.type,
        amount: Number(dto.amount),
        minOrder: Number(dto.minOrder || 0),
        limit: Number(dto.limit || 100),
        status: dto.status || 'Active',
        expires: dto.expires ? new Date(dto.expires) : null,
      },
    });
  }

  /* ── Update Coupon (Admin) ── */
  async update(id: string, dto: UpdateCouponDto) {
    await this.findOne(id);
    return this.prisma.coupon.update({
      where: { id },
      data: {
        ...(dto.type && { type: dto.type }),
        ...(dto.amount !== undefined && { amount: Number(dto.amount) }),
        ...(dto.minOrder !== undefined && { minOrder: Number(dto.minOrder) }),
        ...(dto.limit !== undefined && { limit: Number(dto.limit) }),
        ...(dto.status && { status: dto.status }),
        ...(dto.expires && { expires: new Date(dto.expires) }),
      },
    });
  }

  /* ── Delete Coupon (Admin) ── */
  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.coupon.delete({ where: { id } });
  }

  /* ── Seed Coupons if Empty ── */
  async seedCouponsIfEmpty() {
    const count = await this.prisma.coupon.count();
    if (count > 0) return;

    const initialCoupons = [
      {
        code: 'TAGDIAH10',
        type: 'Percentage',
        amount: 10,
        minOrder: 1500,
        limit: 1000,
        status: 'Active',
        expires: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      },
      {
        code: 'MONSOON15',
        type: 'Percentage',
        amount: 15,
        minOrder: 3000,
        limit: 500,
        status: 'Active',
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
      {
        code: 'ARTISAN20',
        type: 'Percentage',
        amount: 20,
        minOrder: 5000,
        limit: 250,
        status: 'Active',
        expires: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
      {
        code: 'FREESHIP',
        type: 'Free Delivery',
        amount: 0,
        minOrder: 1000,
        limit: 500,
        status: 'Active',
        expires: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const c of initialCoupons) {
      await this.prisma.coupon.create({ data: c });
    }
  }
}
