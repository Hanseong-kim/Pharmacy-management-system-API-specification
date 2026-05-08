import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class FindUsersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ['ADMIN', 'PHARMACIST', 'STAFF'], description: 'filter as role' })
  @IsOptional()
  @IsEnum(['ADMIN', 'PHARMACIST', 'STAFF'])
  role?: string;
}
