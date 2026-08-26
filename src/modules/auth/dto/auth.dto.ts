import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'nusrat@example.com', description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'YourPassword123', description: 'Password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegisterCustomerDto {
  @ApiProperty({ example: 'Ayesha Rahman', description: 'Full name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'ayesha@example.com', description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'MySecurePass123', description: 'Password (min 6 characters)' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: '+880 1712 004 118', description: 'Phone number' })
  @IsString()
  @IsOptional()
  phone?: string;
}

export class VerifyEmailDto {
  @ApiProperty({ example: 'cmt8xyz...', description: 'User ID returned from registration' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: '482917', description: '6-digit verification code' })
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class ResendCodeDto {
  @ApiProperty({ example: 'ayesha@example.com', description: 'Email of the unverified account' })
  @IsEmail()
  email: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'ayesha@example.com', description: 'Email address' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'ayesha@example.com', description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '482917', description: '6-digit reset code from email' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'NewSecurePass456', description: 'New password (min 6 characters)' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
