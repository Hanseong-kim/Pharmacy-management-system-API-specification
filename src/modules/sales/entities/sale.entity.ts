import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { SaleItem } from './sale-item.entity';

/**
 * Represents a completed sales transaction (3NF compliant).
 *
 * `totalAmount` is stored as a persisted value (not derived at query time) to preserve
 * the historical total even if medicine prices change later, avoiding a transitive
 * dependency on current price data. References to `staff` and `customer` use SET NULL
 * on deletion so that no transitive dependency on those entities can corrupt sale history.
 */
@Entity()
export class Sale {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount!: number;

  @Column({ type: 'enum', enum: ['COMPLETED', 'CANCELLED'], default: 'COMPLETED' })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // User 삭제 시 이력 보존 — staff 필드만 NULL로 변경
  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  staff?: User | null;

  // Customer 삭제 시에도 판매 이력 보존
  @ManyToOne(() => Customer, { onDelete: 'SET NULL', nullable: true })
  customer?: Customer | null;

  @OneToMany(() => SaleItem, (saleItem) => saleItem.sale)
  items!: SaleItem[];
}
