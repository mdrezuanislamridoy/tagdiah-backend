import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService, JwtPayload } from './auth.service';
import {
  LoginDto,
  RegisterCustomerDto,
  VerifyEmailDto,
  ResendCodeDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new customer account (sends verification email)' })
  @ApiResponse({ status: 201, description: 'Account created, verification email sent' })
  @ApiResponse({ status: 400, description: 'Email already exists' })
  register(@Body() dto: RegisterCustomerDto) {
    return this.authService.registerCustomer(dto);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email with 6-digit OTP code' })
  @ApiResponse({ status: 200, description: 'Email verified, returns JWT' })
  @ApiResponse({ status: 400, description: 'Invalid or expired code' })
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.userId, dto.code);
  }

  @Post('resend-code')
  @ApiOperation({ summary: 'Resend email verification code' })
  @ApiResponse({ status: 200, description: 'Code resent if email exists' })
  resendCode(@Body() dto: ResendCodeDto) {
    return this.authService.resendVerificationCode(dto.email);
  }

  @Post('login')
  @ApiOperation({ summary: 'Customer login' })
  @ApiResponse({ status: 200, description: 'Login successful, returns JWT' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or email not verified' })
  login(@Body() dto: LoginDto) {
    return this.authService.loginCustomer(dto.email, dto.password);
  }

  @Post('admin/login')
  @ApiOperation({ summary: 'Admin / staff login' })
  @ApiResponse({ status: 200, description: 'Admin login successful, returns JWT' })
  @ApiResponse({ status: 401, description: 'Invalid admin credentials or insufficient role' })
  adminLogin(@Body() dto: LoginDto) {
    return this.authService.loginAdmin(dto.email, dto.password);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request a password reset code via email' })
  @ApiResponse({ status: 200, description: 'Reset code sent if email exists' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using the emailed code' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired code' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.email, dto.code, dto.newPassword);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({ status: 200, description: 'Returns user profile from JWT' })
  @ApiResponse({ status: 401, description: 'Unauthorized — invalid or expired token' })
  getProfile(@Request() req: { user: JwtPayload }) {
    return this.authService.getProfile(req.user);
  }
}
