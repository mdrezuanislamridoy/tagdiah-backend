import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private configService: ConfigService,
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

  /** Ensure initial admin account exists on fresh empty DB using environment variables */
  async seedDefaultUsers() {
    const userCount = await this.prisma.user.count();
    if (userCount > 0) return;

    const initialEmail = this.configService.get<string>('INITIAL_ADMIN_EMAIL', 'mdrezuanislamridoy@gmail.com');
    const initialPassword = this.configService.get<string>('INITIAL_ADMIN_PASSWORD', 'SecurePassword123!');
    const hashedPassword = await bcrypt.hash(initialPassword, 12);

    await this.prisma.user.create({
      data: {
        email: initialEmail,
        name: 'Rezuan Islam Ridoy',
        role: 'Super Admin',
        department: 'Executive',
        phone: '+880 1712 004 118',
        status: 'Active',
        emailVerified: true,
        password: hashedPassword,
      },
    });
  }
}
