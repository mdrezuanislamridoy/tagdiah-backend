import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ example: 'clxxx...' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({ example: 'Natural' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ example: 'Standard' })
  @IsString()
  @IsOptional()
  size?: string;
}

export class SyncCartDto {
  @ApiProperty({ type: [AddToCartDto] })
  items: AddToCartDto[];
}
