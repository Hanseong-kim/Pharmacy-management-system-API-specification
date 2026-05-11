import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Sale } from './sale.entity';
import { Medicine } from '../../medicines/entities/medicine.entity';

/**
 * Explicit junction entity resolving the Many-to-Many (M:N) relationship between Sale and Medicine.
 *
 * This entity is intentionally implemented this way to securely capture and store the `quantity`
 * and historical `unitPrice` at the exact moment of the transaction, which a standard TypeORM
 * `@ManyToMany` decorator cannot accommodate.
 *
 * 3NF note: `unitPrice` records the price at time of sale, not a derivable reference to the
 * current medicine price, so there is no transitive dependency on `Medicine.price`.
 */
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