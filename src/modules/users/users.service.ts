import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        department: true,
        city: true,
        address: true,
        status: true,
        emailVerified: true,
        twoFactorEnabled: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        department: true,
        city: true,
        address: true,
        status: true,
        emailVerified: true,
        twoFactorEnabled: true,
        lastLogin: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException(`User with ID ${id} not found.`);
    return user;
  }

  async create(dto: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new BadRequestException(`Email ${dto.email} is already registered.`);

    // Keep the plaintext password for the welcome email
    const plaintextPassword = dto.password;

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const isCustomer = dto.role === 'Customer';

    const user = await this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
        // Admin-created accounts are pre-verified
        emailVerified: true,
        avatar: `https://i.pravatar.cc/120?u=${encodeURIComponent(dto.name)}`,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        status: true,
        createdAt: true,
      },
    });

    // If admin creates a Customer account, send welcome email with credentials
    if (isCustomer) {
      this.mailService.sendWelcomeCredentials(dto.email, dto.name, plaintextPassword);
    }

    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        department: true,
        city: true,
        address: true,
        status: true,
        twoFactorEnabled: true,
        avatar: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.user.delete({ where: { id } });
  }

  async getAuditLogs() {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async onModuleInit() {
    await this.seedDefaultUsers();
  }

  /** Ensure default accounts exist with proper credentials */
  async seedDefaultUsers() {
    const adminHashedPassword = await bcrypt.hash('admin123', 12);
    const customerHashedPassword = await bcrypt.hash('customer123', 12);

    const defaultAccounts = [
      {
        email: 'admin@tagdiah.com',
        name: 'Super Admin',
        role: 'Super Admin',
        department: 'Operations',
        phone: '+880 1712 000 001',
        city: 'Dhaka',
        address: 'Banani Studio, House 12, Road 27, Dhaka',
        status: 'Active',
        emailVerified: true,
        password: adminHashedPassword,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      },
      {
        email: 'manager@tagdiah.com',
        name: 'Store Manager',
        role: 'Store Manager',
        department: 'Catalogue & Orders',
        phone: '+880 1712 000 002',
        city: 'Dhaka',
        address: 'Mirpur Warehouse, Dhaka',
        status: 'Active',
        emailVerified: true,
        password: adminHashedPassword,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      },
      {
        email: 'customer@tagdiah.com',
        name: 'Farhana Yasmin',
        role: 'Customer',
        department: 'Customer',
        phone: '+880 1712 999 888',
        city: 'Dhaka',
        address: 'Apartment 4B, Road 11, Dhanmondi, Dhaka',
        status: 'Active',
        emailVerified: true,
        password: customerHashedPassword,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      },
    ];

    for (const acc of defaultAccounts) {
      await this.prisma.user.upsert({
        where: { email: acc.email },
        update: {
          password: acc.password,
          emailVerified: true,
          status: 'Active',
          role: acc.role,
        },
        create: acc,
      });
    }
  }
}
