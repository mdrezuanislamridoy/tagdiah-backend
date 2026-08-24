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

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38' })
  @IsString()
  @IsOptional()
  images?: string;
}
