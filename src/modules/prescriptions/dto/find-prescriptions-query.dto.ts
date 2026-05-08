import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class FindPrescriptionsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 1, description: '고객 ID로 필터' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  customerId?: number;
}
