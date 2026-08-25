import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Aranya Macramé Wall Hanging' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'aranya-macrame-wall-hanging' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'TGD-WD-0001' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiPropertyOptional({ example: 'Handcrafted cotton macramé with seasoned teakwood dowel.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'Handmade by artisans in Bogura.' })
  @IsString()
  @IsOptional()
  story?: string;

  @ApiProperty({ example: 3450 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 4200 })
  @IsNumber()
  @IsOptional()
  compareAt?: number;

  @ApiPropertyOptional({ example: 25, default: 0 })
  @IsNumber()
  @IsOptional()
  stock?: number;

  @ApiPropertyOptional({ example: 'Active', default: 'Active' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 'in-stock', default: 'in-stock' })
  @IsString()
  @IsOptional()
  availability?: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  featured?: boolean;

  @ApiPropertyOptional({ example: 'Bestseller' })
  @IsString()
  @IsOptional()
  badge?: string;

  @ApiPropertyOptional({ example: '["https://images.unsplash.com/photo-1513519245088-0e12902e5a38"]' })
  @IsString()
  @IsOptional()
  images?: string;

  @ApiPropertyOptional({ example: '["Oatmeal", "Natural"]' })
  @IsString()
  @IsOptional()
  colors?: string;

  @ApiPropertyOptional({ example: '["Cotton", "Teakwood"]' })
  @IsString()
  @IsOptional()
  materials?: string;

  @ApiPropertyOptional({ example: '["Standard", "Large"]' })
  @IsString()
  @IsOptional()
  sizes?: string;

  @ApiPropertyOptional({ example: 'curtains-porda' })
  @IsString()
  @IsOptional()
  categoryId?: string;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Aranya Macramé Wall Hanging' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'aranya-macrame-wall-hanging' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ example: 'TGD-WD-0001' })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiPropertyOptional({ example: 'Handcrafted cotton macramé...' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 3450 })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ example: 4200 })
  @IsNumber()
  @IsOptional()
  compareAt?: number;

  @ApiPropertyOptional({ example: 25 })
  @IsNumber()
  @IsOptional()
  stock?: number;

  @ApiPropertyOptional({ example: 'Active' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 'in-stock' })
  @IsString()
  @IsOptional()
  availability?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  featured?: boolean;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/...' })
  @IsString()
  @IsOptional()
  images?: string;
}

export class FilterProductsDto {
  @ApiPropertyOptional({ description: 'Search term for name/description/materials' })
  @IsString()
  @IsOptional()
  q?: string;

  @ApiPropertyOptional({ description: 'Category slug or ID' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Minimum price' })
  @IsOptional()
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price' })
  @IsOptional()
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Color filter' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ description: 'Material filter' })
  @IsString()
  @IsOptional()
  material?: string;

  @ApiPropertyOptional({ description: 'Availability filter (in-stock, low-stock, made-to-order)' })
  @IsString()
  @IsOptional()
  availability?: string;

  @ApiPropertyOptional({ description: 'Sort by (popularity, newest, price-asc, price-desc, rating)' })
  @IsString()
  @IsOptional()
  sort?: string;

  @ApiPropertyOptional({ description: 'Featured products only' })
  @IsOptional()
  featured?: boolean;
}

export class AdjustStockDto {
  @ApiPropertyOptional({ example: 10, description: 'Relative change in stock (e.g. +10 or -5)' })
  @IsOptional()
  delta?: number;

  @ApiPropertyOptional({ example: 25, description: 'Absolute stock value to set directly' })
  @IsOptional()
  stock?: number;

  @ApiPropertyOptional({ example: 5, description: 'Reorder point threshold' })
  @IsOptional()
  lowStockAt?: number;

  @ApiPropertyOptional({ example: 'Restock from Mirpur workshop', description: 'Reason for adjustment' })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({ example: 'Batch #B-2026-08', description: 'Notes or batch info' })
  @IsString()
  @IsOptional()
  note?: string;
}

