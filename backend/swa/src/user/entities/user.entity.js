import 'reflect-metadata';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id;

  @Column({ type: 'varchar' })
  firstName;

  @Column({ type: 'varchar' })
  lastName;

  @Column({ type: 'varchar' })
  email;

  @Column({ type: 'varchar' })
  password;

  @Column({ type: 'boolean' })
  isVerified;

  @Column({ type: 'timestamp' })
  createdAt;

  @Column({ type: 'timestamp' })
  updatedAt;

  constructor(partial = {}) {
    this.isVerified = false;
    Object.assign(this, partial);
  }
}