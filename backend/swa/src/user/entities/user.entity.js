import 'reflect-metadata';
import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, BeforeUpdate } from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id;

  @Column({ type: 'varchar' })
  firstName;

  @Column({ type: 'varchar' })
  lastName;

  @Column({ type: 'varchar', unique: true })
  email;

  @Column({ type: 'varchar', nullable: true })
  password; // Nullable bcs we will add  social login users

  @Column({ type: 'boolean', default: false })
  isVerified;

  @Column({ type: 'varchar', nullable: true })
  verificationToken;

  @Column({ type: 'timestamp', nullable: true })
  verificationTokenExpires;

  @Column({ type: 'varchar', nullable: true })
  resetPasswordToken;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires;

  // this fileds are needed for social login
  @Column({ type: 'varchar', nullable: true })
  googleId; // Google's unique ID for the user

  @Column({ type: 'varchar', default: 'local' })
  provider; // 'local', 'google', etc.

  @Column({ type: 'varchar', nullable: true })
  profilePicture;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt;

  @BeforeInsert()
  setCreatedAt() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  @BeforeUpdate()
  setUpdatedAt() {
    this.updatedAt = new Date();
  }

  constructor(partial = {}) {
    this.isVerified = false;
    this.provider = 'local';
    Object.assign(this, partial);
  }

  // Helper method to create a safe user object without sensitive data
  toJSON() {
    const { password, verificationToken, resetPasswordToken, ...safeUser } = this;
    return safeUser;
  }
}