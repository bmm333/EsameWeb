import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id;

  // Basic Profile Information
  @Column({ type: 'varchar', length: 50 })
  firstName;

  @Column({ type: 'varchar', length: 50 })
  lastName;

  @Column({ type: 'varchar', length: 100, unique: true })
  email;

  @Column({ type: 'varchar' })
  password;

  @Column({ type: 'varchar', length: 15, nullable: true })
  phoneNumber;

  @Column({ type: 'date', nullable: true })
  dateOfBirth;

  @Column({ 
    type: 'enum', 
    enum: ['male', 'female'], 
    nullable: true 
  })
  gender;

  // Account Verification
  @Column({ type: 'boolean', default: false })
  isVerified;

  @Column({ type: 'varchar', nullable: true })
  verificationToken;

  @Column({ type: 'timestamp', nullable: true })
  verificationTokenExpires;

  // Profile Setup Status
  @Column({ type: 'boolean', nullable: false, default: false })
  profileSetupCompleted;

  @Column({ type: 'timestamp', nullable: true })
  profileSetupCompletedAt;

  // Password Reset Fields
  @Column({ type: 'varchar', nullable: true })
  resetPasswordToken;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires;

  // Password Security
  @Column({ type: 'timestamp', nullable: true })
  passwordChangedAt;

  @Column({ type: 'integer', default: 0 })
  failedLoginAttempts;

  @Column({ type: 'timestamp', nullable: true })
  lockedUntil;

  // Wardrobe & Style Preferences
  @Column({ type: 'json', nullable: true })
  stylePreferences; // ['casual', 'formal', 'business', 'sporty', 'trendy', 'classic']

  @Column({ type: 'json', nullable: true })
  colorPreferences; // ['black', 'white', 'blue', 'red', etc.]

  @Column({ type: 'json', nullable: true })
  favoriteShops; // ['Zara', 'H&M', 'Nike', etc.]

  @Column({ type: 'json', nullable: true })
  sizes; // { tops: 'M', bottoms: '32', shoes: '9' }

  @Column({ 
    type: 'enum', 
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], 
    nullable: true 
  })
  primarySize;

  // Physical Characteristics
  @Column({ 
    type: 'enum', 
    enum: ['cool', 'warm', 'neutral'], 
    nullable: true 
  })
  skinTone;

  // Lifestyle & Occasions
  @Column({ type: 'json', nullable: true })
  lifestyle; // ['work-from-home', 'office-worker', 'student', 'parent', 'traveler']

  @Column({ type: 'json', nullable: true })
  occasions; // ['work', 'casual', 'formal-events', 'gym', 'travel']

  @Column({ 
    type: 'enum', 
    enum: ['conservative', 'moderate', 'bold'], 
    default: 'moderate' 
  })
  riskTolerance;

  @Column({ type: 'boolean', default: false })
  sustainabilityFocus;

  @Column({ type: 'json', nullable: true })
  avoidMaterials; // ['wool', 'leather', 'synthetic']

  // Climate & Location
  @Column({ type: 'varchar', length: 100, nullable: true })
  location;

  @Column({ 
    type: 'enum', 
    enum: ['tropical', 'temperate', 'cold', 'arid'], 
    nullable: true 
  })
  climate;

  // Smart Wardrobe Features
  @Column({ type: 'boolean', default: true })
  enableRecommendations;

  @Column({ type: 'boolean', default: true })
  enableWeatherNotifications;

  @Column({ type: 'boolean', default: false })
  enableOutfitReminders;

  @Column({ type: 'time', nullable: true })
  morningNotificationTime;

  // Subscription & Trial
  @Column({ type: 'boolean', default: true })
  trial;

  @Column({ type: 'timestamp', nullable: true })
  trialExpires;

  @Column({ 
    type: 'enum', 
    enum: ['free', 'premium', 'pro'], 
    default: 'free' 
  })
  subscriptionTier;

  @Column({ type: 'timestamp', nullable: true })
  subscriptionExpires;

  // OAuth & External Auth
  @Column({ type: 'varchar', nullable: true })
  googleId;

  @Column({ 
    type: 'enum', 
    enum: ['local', 'google'], 
    default: 'local' 
  })
  provider;

  @Column({ type: 'varchar', nullable: true })
  profilePicture;

  // Privacy Settings
  @Column({ type: 'json', nullable: true })
  privacySettings;

  // Timestamps
  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt;
  
  @Column({ default: false })
  hasRfidDevice;

  @Column({ type: 'varchar', length: 20, default: 'none' })
  deviceSetupStatus;

  @Column({ type: 'datetime', nullable: true })
  deviceSetupCompletedAt;

  @OneToMany(() => RfidDevice, device => device.user)
  rfidDevices;

  @OneToMany(() => RfidTag, tag => tag.user)
  rfidTags;
}