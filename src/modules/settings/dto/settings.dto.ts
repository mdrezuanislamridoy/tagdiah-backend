import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class DeliveryOptionDto {
  @ApiProperty({ example: 'standard' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Standard Delivery' })
  @IsString()
  label: string;

  @ApiProperty({ example: '3–5 working days' })
  @IsString()
  body: string;

  @ApiProperty({ example: 120 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class UpdateDeliverySettingsDto {
  @ApiProperty({ example: 120 })
  @IsNumber()
  @Min(0)
  insideDhakaFee: number;

  @ApiProperty({ example: 150 })
  @IsNumber()
  @Min(0)
  outsideDhakaFee: number;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(0)
  freeDeliveryThreshold: number;

  @ApiProperty({ example: 'Pathao Courier' })
  @IsString()
  defaultCourier: string;

  @ApiProperty({ example: '2–4 business days' })
  @IsString()
  estimatedTime: string;

  @ApiPropertyOptional({ type: [DeliveryOptionDto] })
  @IsArray()
  @IsOptional()
  options?: DeliveryOptionDto[];
}
