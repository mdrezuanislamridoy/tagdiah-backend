import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { RegisterCustomerDto } from './dto/auth.dto';

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  /** Generate a 6-digit OTP */
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /** 15-minute expiry from now */
  private otpExpiry(): Date {
    return new Date(Date.now() + 15 * 60 * 1000);
  }

  /* ── Customer Self-Registration ── */
  async registerCustomer(dto: RegisterCustomerDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) {
      throw new BadRequestException('An account with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const code = this.generateOtp();
    const hashedCode = await bcrypt.hash(code, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        phone: dto.phone,
        role: 'Customer',
        emailVerified: false,
        verifyCode: hashedCode,
        verifyCodeExp: this.otpExpiry(),
        avatar: `https://i.pravatar.cc/120?u=${encodeURIComponent(dto.name)}`,
      },
    });

    // Send verification email (non-blocking)
    this.mailService.sendVerificationCode(user.email, user.name, code);

    return {
      message: 'Account created. Please check your email for the verification code.',
      userId: user.id,
      email: user.email,
    };
  }

  /* ── Verify Email ── */
  async verifyEmail(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('Account not found.');
    }
    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified.');
    }
    if (!user.verifyCode || !user.verifyCodeExp) {
      throw new BadRequestException('No verification code found. Please request a new one.');
    }
    if (new Date() > user.verifyCodeExp) {
      throw new BadRequestException('Verification code has expired. Please request a new one.');
    }

    const isValid = await bcrypt.compare(code, user.verifyCode);
    if (!isValid) {
      throw new BadRequestException('Invalid verification code.');
    }

    // Mark as verified and clear code
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: true,
        verifyCode: null,
        verifyCodeExp: null,
      },
    });

    // Return JWT so user is logged in after verification
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: this.toUserResponse(user),
    };
  }

  /* ── Resend Verification Code ── */
  async resendVerificationCode(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Don't reveal whether the email exists
      return { message: 'If the email is registered, a new code has been sent.' };
    }
    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified.');
    }

    const code = this.generateOtp();
    const hashedCode = await bcrypt.hash(code, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verifyCode: hashedCode,
        verifyCodeExp: this.otpExpiry(),
      },
    });

    this.mailService.sendVerificationCode(user.email, user.name, code);

    return { message: 'If the email is registered, a new code has been sent.' };
  }

  /* ── Customer / Storefront Login ── */
  async loginCustomer(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (!user.emailVerified) {
      // Generate a new code and send it
      const code = this.generateOtp();
      const hashedCode = await bcrypt.hash(code, 10);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { verifyCode: hashedCode, verifyCodeExp: this.otpExpiry() },
      });
      this.mailService.sendVerificationCode(user.email, user.name, code);

      return {
        needsVerification: true,
        userId: user.id,
        email: user.email,
        message: 'Please verify your email first. A new code has been sent.',
      };
    }

    if (user.status !== 'Active') {
      throw new UnauthorizedException('Your account has been suspended.');
    }

    // Update lastLogin
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: this.toUserResponse(user),
    };
  }

  /* ── Admin / Staff Login ── */
  async loginAdmin(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid admin credentials.');
    }

    // Check if password is hashed (bcrypt hashes start with $2)
    const isHashed = user.password.startsWith('$2');
    let isValid: boolean;

    if (isHashed) {
      isValid = await bcrypt.compare(password, user.password);
    } else {
      // Legacy plaintext comparison — allow once, then hash
      isValid = user.password === password;
      if (isValid) {
        const hashed = await bcrypt.hash(password, 12);
        await this.prisma.user.update({
          where: { id: user.id },
          data: { password: hashed },
        });
      }
    }

    if (!isValid) {
      throw new UnauthorizedException('Invalid admin credentials.');
    }

    // Check role — only admin-like roles allowed
    const adminRoles = ['Super Admin', 'Store Admin', 'Store Manager'];
    if (!adminRoles.includes(user.role)) {
      throw new UnauthorizedException('You do not have admin access.');
    }

    if (user.status !== 'Active') {
      throw new UnauthorizedException('Your account has been suspended.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: this.toUserResponse(user),
    };
  }

  /* ── Forgot Password ── */
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'If the email is registered, a reset code has been sent.' };
    }

    const code = this.generateOtp();
    const hashedCode = await bcrypt.hash(code, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetCode: hashedCode,
        resetCodeExp: this.otpExpiry(),
      },
    });

    this.mailService.sendPasswordResetCode(user.email, user.name, code);

    return { message: 'If the email is registered, a reset code has been sent.' };
  }

  /* ── Reset Password ── */
  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new BadRequestException('Invalid email or reset code.');
    }
    if (!user.resetCode || !user.resetCodeExp) {
      throw new BadRequestException('No reset code found. Please request a new one.');
    }
    if (new Date() > user.resetCodeExp) {
      throw new BadRequestException('Reset code has expired. Please request a new one.');
    }

    const isValid = await bcrypt.compare(code, user.resetCode);
    if (!isValid) {
      throw new BadRequestException('Invalid reset code.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetCode: null,
        resetCodeExp: null,
      },
    });

    return { message: 'Password has been reset successfully. You can now log in.' };
  }

  /* ── Get current user profile from JWT ── */
  async getProfile(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
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
        createdAt: true,
      },
    });

    if (!user) throw new UnauthorizedException('Account not found.');
    if (user.status !== 'Active') throw new UnauthorizedException('Account suspended.');

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      department: user.department,
      city: user.city,
      address: user.address,
      since: this.formatSince(user.createdAt),
    };
  }

  /* ── Helpers ── */
  private toUserResponse(user: { id: string; name: string; email: string; role: string; phone: string | null; avatar: string | null; department: string | null; city: string | null; address: string | null; createdAt: Date }) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      department: user.department,
      city: user.city,
      address: user.address,
      since: this.formatSince(user.createdAt),
    };
  }

  private formatSince(date: Date): string {
    const months = [
      'January','February','March','April','May','June',
      'July','August','September','October','November','December',
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }
}
