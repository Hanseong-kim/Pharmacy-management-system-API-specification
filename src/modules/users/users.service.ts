import { HttpException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Staff } from './entities/staff.entity';
import { UpdateStaffDto } from './dto/update-staff.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Staff) private staffRepository: Repository<Staff>,
    private dataSource: DataSource,
  ) {}

  async findAll(role?: string, page: number = 1, limit: number = 10) {
    const [data, total] = await this.userRepository.findAndCount({
      where: role ? { role } : {},
      relations: ['staff'],
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        staff: { id: true, name: true, phoneNumber: true, address: true, hireDate: true },
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'ASC' },
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async register(userData: any) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const user = manager.create(User, {
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          staff: manager.create(Staff, {
            name: userData.name,
            phoneNumber: userData.phoneNumber,
            address: userData.address,
            hireDate: userData.hireDate,
          }),
        });

        return await manager.save(User, user);
      });
    } catch (error) {
      this.logger.error('register failed', error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('회원가입 처리 중 오류가 발생했습니다.');
    }
  }

  async remove(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('해당 유저를 찾을 수 없습니다.');
    return await this.userRepository.remove(user);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      relations: ['staff'],
    });
  }

  // ---------- Staff CRUD ----------

  async findAllStaff(page: number = 1, limit: number = 10) {
    const [data, total] = await this.staffRepository.findAndCount({
      relations: ['user'],
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        address: true,
        hireDate: true,
        user: { id: true, email: true, role: true, createdAt: true },
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'ASC' },
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOneStaff(staffId: number) {
    const staff = await this.staffRepository.findOne({
      where: { id: staffId },
      relations: ['user'],
    });
    if (!staff) throw new NotFoundException('해당 직원을 찾을 수 없습니다.');
    return staff;
  }

  async updateStaff(staffId: number, dto: UpdateStaffDto) {
    const staff = await this.findOneStaff(staffId);
    Object.assign(staff, dto);
    return await this.staffRepository.save(staff);
  }

  async removeStaff(staffId: number) {
    const staff = await this.staffRepository.findOne({
      where: { id: staffId },
      relations: ['user'],
    });
    if (!staff) throw new NotFoundException('해당 직원을 찾을 수 없습니다.');
    return await this.userRepository.remove(staff.user);
  }
}
