import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, FilterProductsDto } from './dto/product.dto';

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Auto-seed catalogue on startup if empty
    await this.seedCatalogueIfEmpty();
  }

  async findAll(filters?: FilterProductsDto) {
    const where: any = {};

    if (filters?.q) {
      const q = filters.q.toLowerCase();
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { materials: { contains: q } },
        { colors: { contains: q } },
      ];
    }

    if (filters?.category && filters.category !== 'all') {
      if (filters.category === 'new-arrivals') {
        where.badge = 'New Arrival';
      } else {
        where.OR = [
          { categoryId: filters.category },
          { category: { slug: filters.category } },
        ];
      }
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) where.price.gte = Number(filters.minPrice);
      if (filters.maxPrice !== undefined) where.price.lte = Number(filters.maxPrice);
    }

    if (filters?.availability && filters.availability !== 'all') {
      where.availability = filters.availability;
    }

    if (filters?.featured !== undefined) {
      where.featured = String(filters.featured) === 'true';
    }

    let orderBy: any = { createdAt: 'desc' };
    if (filters?.sort) {
      switch (filters.sort) {
        case 'newest':
          orderBy = { createdAt: 'desc' };
          break;
        case 'price-asc':
          orderBy = { price: 'asc' };
          break;
        case 'price-desc':
          orderBy = { price: 'desc' };
          break;
        case 'popularity':
          orderBy = { popularity: 'desc' };
          break;
      }
    }

    return this.prisma.product.findMany({
      where,
      include: {
        category: true,
        variations: true,
        reviews: {
          select: {
            id: true,
            author: true,
            rating: true,
            title: true,
            body: true,
            createdAt: true,
          },
        },
      },
      orderBy,
    });
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        variations: true,
        reviews: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" not found.`);
    }

    return product;
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        category: true,
        variations: true,
        reviews: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found.`);
    }

    return product;
  }

  async create(dto: CreateProductDto) {
    const exists = await this.prisma.product.findUnique({ where: { slug: dto.slug } });
    if (exists) {
      throw new BadRequestException(`Product with slug "${dto.slug}" already exists.`);
    }

    return this.prisma.product.create({
      data: {
        ...dto,
        images: dto.images || '[]',
      },
      include: {
        category: true,
        variations: true,
      },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: {
        category: true,
        variations: true,
      },
    });
  }

  /* ── Adjust Product Inventory Stock (Admin) ── */
  async adjustStock(id: string, delta?: number, newStock?: number, lowStockAt?: number) {
    const product = await this.findOne(id);

    let nextStock = product.stock;
    if (newStock !== undefined) {
      nextStock = Math.max(0, Number(newStock));
    } else if (delta !== undefined) {
      nextStock = Math.max(0, product.stock + Number(delta));
    }

    const nextStatus = nextStock === 0 ? 'Out of Stock' : 'Active';
    const nextAvailability = nextStock === 0 ? 'made-to-order' : nextStock <= (lowStockAt ?? product.lowStockAt) ? 'low-stock' : 'in-stock';

    return this.prisma.product.update({
      where: { id: product.id },
      data: {
        stock: nextStock,
        status: nextStatus,
        availability: nextAvailability,
        ...(lowStockAt !== undefined && { lowStockAt: Number(lowStockAt) }),
      },
      include: {
        category: true,
        variations: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.delete({ where: { id } });
  }

  /** Seed catalogue if database has 0 products */
  async seedCatalogueIfEmpty() {
    const count = await this.prisma.product.count();
    if (count > 0) return;

    // 1. Seed Categories
    const categoriesData = [
      {
        slug: 'curtains-porda',
        name: 'Curtains & Porda',
        tagline: 'Hand-loomed cotton & linen drapes',
        description: 'Natural woven textures designed for tropical light and breezy spaces.',
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800',
      },
      {
        slug: 'brass-metalcraft',
        name: 'Brass & Metalcraft',
        tagline: 'Hand-cast bells, mirrors & incense burners',
        description: 'Heirloom metal art cast in Dhamrai workshops using the lost-wax technique.',
        image: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&q=80&w=800',
      },
      {
        slug: 'terracotta-ceramics',
        name: 'Terracotta & Ceramics',
        tagline: 'Clay planters, urns & tableware',
        description: 'Earthy ceramics fired with rice-husk kilns in Rayerbazar and Bogura.',
        image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800',
      },
      {
        slug: 'cane-bamboo',
        name: 'Cane & Bamboo',
        tagline: 'Woven pendant lamps & stools',
        description: 'Lightweight, sustainable cane woven by master basket-makers in Sylhet.',
        image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=800',
      },
      {
        slug: 'rugs-textiles',
        name: 'Rugs & Dhurries',
        tagline: 'Jute & cotton floor runners',
        description: 'Hand-knotted rugs made from golden fibre jute and unbleached organic cotton.',
        image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=800',
      },
    ];

    const categoryMap = new Map<string, string>();

    for (const cat of categoriesData) {
      const created = await this.prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      });
      categoryMap.set(cat.slug, created.id);
    }

    // 2. Seed Products
    const productsData = [
      {
        slug: 'aranya-macrame-door-porda',
        sku: 'TGD-PRD-001',
        name: 'Aranya Macramé Door Porda',
        description: 'Hand-knotted from unbleached organic cotton cord with a seasoned teakwood rod. Filters tropical sunlight into soft geometric shadows.',
        story: 'Woven by an artisan women cooperative in Manikganj over three days.',
        price: 3850,
        compareAt: 4400,
        stock: 18,
        status: 'Active',
        featured: true,
        badge: 'Bestseller',
        availability: 'in-stock',
        popularity: 98,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1200',
          'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=1200',
        ]),
        colors: JSON.stringify(['Natural', 'Oatmeal', 'Earthen Clay']),
        materials: JSON.stringify(['Organic Cotton', 'Teakwood']),
        sizes: JSON.stringify(['7 ft — Door (84" × 36")', '5 ft — Window (60" × 36")']),
        categoryId: categoryMap.get('curtains-porda'),
      },
      {
        slug: 'dhamrai-brass-bell-ghonta',
        sku: 'TGD-BRS-002',
        name: 'Dhamrai Hand-Cast Brass Bell (Ghonta)',
        description: 'A resonant brass bell handcrafted in Dhamrai using generational lost-wax techniques. Finished with an antique patina and braided jute rope.',
        story: 'Handcrafted by fifth-generation metalsmiths in Dhamrai using bell-metal alloy.',
        price: 2450,
        compareAt: 2800,
        stock: 12,
        status: 'Active',
        featured: true,
        badge: 'Heirloom',
        availability: 'in-stock',
        popularity: 94,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&q=80&w=1200',
        ]),
        colors: JSON.stringify(['Antique Brass', 'Mirror Gold']),
        materials: JSON.stringify(['Cast Brass', 'Jute Rope']),
        sizes: JSON.stringify(['Medium (6" height)', 'Large (9" height)']),
        categoryId: categoryMap.get('brass-metalcraft'),
      },
      {
        slug: 'bogura-terracotta-urn-planter',
        sku: 'TGD-CER-003',
        name: 'Bogura Terracotta Urn Planter',
        description: 'Hand-thrown on a foot wheel and kiln-fired with natural wood smoke. Porous clay allows plant roots to breathe in tropical weather.',
        story: 'Formed from rich silt clay deposited along the Karatoya riverbank.',
        price: 1950,
        compareAt: 2200,
        stock: 24,
        status: 'Active',
        featured: false,
        badge: 'New Arrival',
        availability: 'in-stock',
        popularity: 88,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=1200',
        ]),
        colors: JSON.stringify(['Raw Terracotta', 'Charcoal Smoked']),
        materials: JSON.stringify(['River Silt Clay']),
        sizes: JSON.stringify(['10" Diameter', '14" Diameter']),
        categoryId: categoryMap.get('terracotta-ceramics'),
      },
      {
        slug: 'sylhet-cane-pendant-lamp',
        sku: 'TGD-CAN-004',
        name: 'Sylhet Cane Woven Pendant Lamp',
        description: 'Organic dome pendant lamp woven from untreated wild cane. Creates a warm, atmospheric ambient glow in living rooms and dining nooks.',
        story: 'Harvested sustainably from the hill tracts of Sreemangal.',
        price: 4200,
        compareAt: 4800,
        stock: 8,
        status: 'Active',
        featured: true,
        badge: 'Artisan Pick',
        availability: 'in-stock',
        popularity: 91,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=1200',
        ]),
        colors: JSON.stringify(['Honey Cane', 'Natural Tan']),
        materials: JSON.stringify(['Wild Cane', 'Brass Fitting']),
        sizes: JSON.stringify(['16" Diameter', '20" Diameter']),
        categoryId: categoryMap.get('cane-bamboo'),
      },
      {
        slug: 'golden-fibre-jute-runner',
        sku: 'TGD-RUG-005',
        name: 'Golden Fibre Jute Floor Runner',
        description: 'Braided from finest grade-A Bangladeshi tossa jute. Durable, naturally textured, and reversible for everyday living.',
        story: 'Spun from golden monsoon harvest jute in Faridpur.',
        price: 3200,
        compareAt: 3600,
        stock: 15,
        status: 'Active',
        featured: false,
        badge: 'Eco-Friendly',
        availability: 'in-stock',
        popularity: 85,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=1200',
        ]),
        colors: JSON.stringify(['Natural Jute', 'Charcoal Stripe']),
        materials: JSON.stringify(['Tossa Jute']),
        sizes: JSON.stringify(['2 × 6 ft', '2.5 × 8 ft']),
        categoryId: categoryMap.get('rugs-textiles'),
      },
    ];

    for (const p of productsData) {
      await this.prisma.product.create({
        data: p,
      });
    }
  }
}
