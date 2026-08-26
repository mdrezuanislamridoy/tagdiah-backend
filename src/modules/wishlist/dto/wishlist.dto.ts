import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ToggleWishlistDto {
  @ApiProperty({ example: 'clxxx...' })
  @IsString()
  @IsNotEmpty()
  productId: string;
}

export class SyncWishlistDto {
  @ApiProperty({ type: [String], example: ['prod_1', 'prod_2'] })
  productIds: string[];
}
