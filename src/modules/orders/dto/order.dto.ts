import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateOrderItemDto {
  @ApiPropertyOptional({ example: 'prod-01' })
  @IsString()
  @IsOptional()
  productId?: string;

  @ApiProperty({ example: 'Brass Floor Lamp' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/...' })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({ example: 'Antique Brass' })
  @IsString()
  @IsOptional()
  variant?: string;

  @ApiPropertyOptional({ example: 'Antique Brass' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ example: 'Standard' })
  @IsString()
  @IsOptional()
  size?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  qty: number;

  @ApiProperty({ example: 4500 })
  @IsNumber()
  price: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'Ayesha Rahman' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ example: 'ayesha@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+880 1712 004 118' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'Flat 4B, House 27, Road 11, Dhanmondi' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Dhaka' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 8750 })
  @IsNumber()
  subtotal: number;

  @ApiPropertyOptional({ example: 120, default: 0 })
  @IsNumber()
  @IsOptional()
  delivery?: number;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsNumber()
  @IsOptional()
  discount?: number;

  @ApiProperty({ example: 8870 })
  @IsNumber()
  total: number;

  @ApiPropertyOptional({ example: 'COD', default: 'COD' })
  @IsString()
  @IsOptional()
  method?: string;

  @ApiPropertyOptional({ example: 'Unpaid', default: 'Unpaid' })
  @IsString()
  @IsOptional()
  payment?: string;

  @ApiPropertyOptional({ example: 'Please leave with security' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}

export class UpdateOrderStatusDto {
  @ApiProperty({ example: 'Confirmed', enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiPropertyOptional({ example: 'Pathao Courier' })
  @IsString()
  @IsOptional()
  courier?: string;

  @ApiPropertyOptional({ example: 'PT-8891-2241' })
  @IsString()
  @IsOptional()
  tracking?: string;

  @ApiPropertyOptional({ example: 'Order verified by phone' })
  @IsString()
  @IsOptional()
  notes?: string;
}
