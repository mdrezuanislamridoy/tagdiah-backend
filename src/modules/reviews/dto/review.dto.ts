import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: 'clxxx...' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 'Tahmina Chowdhury' })
  @IsString()
  @IsNotEmpty()
  author: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ example: 'Stunning craftsmanship and natural drape' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'The unbleached cotton filters tropical morning light beautifully in our Dhanmondi apartment.' })
  @IsString()
  @IsNotEmpty()
  body: string;
}

export class UpdateReviewStatusDto {
  @ApiProperty({ example: 'Approved', enum: ['Pending', 'Approved', 'Rejected'] })
  @IsString()
  @IsNotEmpty()
  status: string;
}
