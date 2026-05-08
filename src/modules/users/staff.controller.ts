import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('staff')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('staff')
export class StaffController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: '직원 등록 (ADMIN 전용) — User + Staff 동시 생성' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: '직원 목록 조회 (페이지네이션)' })
  findAll(@Query() pagination: PaginationQueryDto) {
    return this.usersService.findAllStaff(pagination.page, pagination.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: '직원 단건 조회' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOneStaff(+id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: '직원 프로필 수정 (ADMIN 전용)' })
  update(@Param('id') id: string, @Body() updateStaffDto: UpdateStaffDto) {
    return this.usersService.updateStaff(+id, updateStaffDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: '직원 삭제 (ADMIN 전용) — 연결된 User 계정도 함께 삭제' })
  remove(@Param('id') id: string) {
    return this.usersService.removeStaff(+id);
  }
}
