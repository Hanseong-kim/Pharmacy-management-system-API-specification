import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Supplier } from '../../suppliers/entities/supplier.entity';

@Entity()
export class Medicine {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column('int')
  stockQty!: number;

  @Column('decimal')
  price!: number;

  @Column()
  expiryDate!: Date;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Supplier, (supplier) => supplier.medicines, { nullable: true })
  supplier!: Supplier;
}
