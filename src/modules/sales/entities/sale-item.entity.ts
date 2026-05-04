// src/modules/sales/entities/sale-item.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Sale } from './sale.entity';
import { Medicine } from '../../medicines/entities/medicine.entity';

@Entity()
export class SaleItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  quantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice!: number;

  // Many-to-One
  @ManyToOne(() => Sale, (sale) => sale.items, { onDelete: 'CASCADE' })
  sale!: Sale;

  // Many-to-One
  @ManyToOne(() => Medicine, { eager: true })
  medicine!: Medicine;
}