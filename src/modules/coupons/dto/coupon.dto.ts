import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateCouponDto {
  @ApiProperty({ example: 'TAGDIAH10' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Percentage', enum: ['Percentage', 'Fixed', 'Free Delivery'] })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ example: 2000, default: 0 })
  @IsNumber()
  @IsOptional()
  minOrder?: number;

  @ApiPropertyOptional({ example: 500, default: 100 })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ example: 'Active', default: 'Active' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.000Z' })
  @IsOptional()
  expires?: string;
}

export class UpdateCouponDto {
  @ApiPropertyOptional({ example: 'Percentage' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ example: 15 })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({ example: 2500 })
  @IsNumber()
  @IsOptional()
  minOrder?: number;

  @ApiPropertyOptional({ example: 500 })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ example: 'Active' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  expires?: string;
}

export class ValidateCouponDto {
  @ApiProperty({ example: 'TAGDIAH10' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ example: 3850 })
  @IsNumber()
  @IsOptional()
  subtotal?: number;
}
