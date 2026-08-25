import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Rezuan Islam Ridoy', description: 'Full name of the user or staff' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'ridoy@tagdiah.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePassword123!', description: 'Password (min 6 characters)' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: '+880 1712 004 118' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Store Admin', default: 'Store Admin' })
  @IsString()
  @IsOptional()
  role?: string;

  @ApiPropertyOptional({ example: 'Operations' })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({ example: 'Dhaka' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'Flat 4B, House 27, Road 11, Dhanmondi' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  twoFactorEnabled?: boolean;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Rezuan Islam Ridoy' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'ridoy@tagdiah.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+880 1712 004 118' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Dhaka' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'Flat 4B, House 27, Road 11, Dhanmondi' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'Store Admin' })
  @IsString()
  @IsOptional()
  role?: string;

  @ApiPropertyOptional({ example: 'Active' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  twoFactorEnabled?: boolean;
}
