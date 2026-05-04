import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Staff } from './staff.entity'; // 실제 파일 경로에 맞게 수정

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ type: 'enum', enum: ['ADMIN', 'PHARMACIST', 'STAFF'] })
  role!: string;

  // 1:1 관계: 유저는 하나의 Staff 프로필을 가짐
  @OneToOne(() => Staff, (staff) => staff.user)
  @JoinColumn() // FK가 어디 있는지 명시 (User 테이블에 staff_id 생성)
  staff!: Staff;
}