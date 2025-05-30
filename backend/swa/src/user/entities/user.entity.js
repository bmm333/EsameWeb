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

  // Trial user management
  @Column({ type: 'boolean', default: true })
  trial; // New users start as trial by default

  @Column({ type: 'timestamp', nullable: true })
  trialExpires; // When the trial period ends

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
    //will see how long should trial be , adjusting it later on for the exam presentation
   if (!this.trialExpires && this.trial) {
      this.trialExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days tried with this.trialExpires = new Date(Date.now() + 10*60*100);
    }
  }

  @BeforeUpdate()
  setUpdatedAt() {
    this.updatedAt = new Date();
  }

  constructor(partial = {}) {
    this.isVerified = false;
    this.provider = 'local';
    this.trial = true;
    Object.assign(this, partial);
  }

  isTrialExpired() {
    if (!this.trial) return false;
    if (!this.trialExpires) return false;
    return new Date() > this.trialExpires;
  }

  toJSON() {
    const { password, verificationToken, resetPasswordToken, ...safeUser } = this;
    return safeUser;
  }
}