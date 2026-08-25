import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
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
}
