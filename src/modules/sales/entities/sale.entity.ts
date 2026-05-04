import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity'; // 또는 Staff 엔티티와 연결 가능
import { SaleItem } from './sale-item.entity';

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
  
  // 1: many
  @ManyToOne(() => User, (user) => user.id) 
  staff!: User;

  // many : many
  @OneToMany(() => SaleItem, (saleItem) => saleItem.sale)
  items!: SaleItem[];
}