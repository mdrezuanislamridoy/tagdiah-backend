import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'curtains-porda' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'Curtains & Porda' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Hand-loomed cotton & linen drapes' })
  @IsString()
  @IsOptional()
  tagline?: string;

  @ApiPropertyOptional({ example: 'Natural woven textures designed for tropical light and breezy spaces.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38' })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({ example: 'Active', default: 'Active' })
  @IsString()
  @IsOptional()
  status?: string;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Curtains & Porda' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Hand-loomed cotton & linen drapes' })
  @IsString()
  @IsOptional()
  tagline?: string;

  @ApiPropertyOptional({ example: 'Natural woven textures...' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/...' })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({ example: 'Active' })
  @IsString()
  @IsOptional()
  status?: string;
}
