import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('customers')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: '고객 등록' })
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  @ApiOperation({ summary: '고객 목록 조회 (페이지네이션, 정렬)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.customersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '고객 단건 조회' })
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '고객 정보 수정' })
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customersService.update(+id, updateCustomerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '고객 삭제' })
  remove(@Param('id') id: string) {
    return this.customersService.remove(+id);
  }
}
