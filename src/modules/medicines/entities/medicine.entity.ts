// src/modules/medicines/entities/medicine.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Supplier } from '../../suppliers/entities/supplier.entity';

@Entity()
export class Medicine {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column('int')
  stockQty!: number;

  @Column('decimal')
  price!: number;

  @Column()
  expiryDate!: Date;

  @Column({ default: true })
  isActive!: boolean;

  // 1: many
  @ManyToOne(() => Supplier, (supplier) => supplier.medicines)
  supplier!: Supplier;
}