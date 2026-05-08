import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto) {
    const existing = await this.customerRepository.findOne({ where: { email: createCustomerDto.email } });
    if (existing) throw new ConflictException('이미 등록된 이메일입니다.');
    const customer = this.customerRepository.create(createCustomerDto);
    return await this.customerRepository.save(customer);
  }

  async findAll(query: PaginationQueryDto) {
    const { page = 1, limit = 10, sortBy = 'id', order = 'ASC' } = query;
    const allowed: Record<string, string> = { id: 'id', name: 'name', createdAt: 'createdAt' };
    const col = allowed[sortBy] ?? 'id';

    const [data, total] = await this.customerRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { [col]: order },
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) throw new NotFoundException('해당 고객을 찾을 수 없습니다.');
    return customer;
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.findOne(id);
    Object.assign(customer, updateCustomerDto);
    return await this.customerRepository.save(customer);
  }

  async remove(id: number) {
    const customer = await this.findOne(id);
    return await this.customerRepository.remove(customer);
  }
}
