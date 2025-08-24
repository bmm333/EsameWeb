import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { RfidDevice } from '../../rfid/entities/rfid-device.entity.js';
import { RfidTag } from '../../rfid/entities/rfid-tag.entity.js';
import { Item } from '../../item/entities/item.entity.js';
import { UserStylePreference } from './user-style-preferences.entity.js'; 
import { UserColorPreference } from './user-color-preferences.entity.js';
import { UserFavoriteShop } from './user-shop.entity.js';
import { UserSize } from './user-size.entity.js';
import { UserLifestyle } from './user-lifestyle.entity.js';
import { UserOccasion } from './user-occasion.entity.js';
import { UserAvoidMaterial } from './user-avoid.entity.js';

@Entity('user')
@Index(['email']) // For login queries
export class User {
    @PrimaryGeneratedColumn()
    id;

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

    @Column({ type: 'boolean', default: false })
    isVerified;

    @Column({ type: 'varchar', nullable: true })
    verificationToken;

    @Column({ type: 'timestamp', nullable: true })
    verificationTokenExpires;

    @Column({ type: 'boolean', nullable: false, default: false })
    profileSetupCompleted;

    @Column({ type: 'timestamp', nullable: true })
    profileSetupCompletedAt;

    @Column({ type: 'varchar', nullable: true })
    resetPasswordToken;

    @Column({ type: 'timestamp', nullable: true })
    resetPasswordExpires;

    @Column({ type: 'timestamp', nullable: true })
    passwordChangedAt;

    @Column({ type: 'integer', default: 0 })
    failedLoginAttempts;

    @Column({ type: 'timestamp', nullable: true })
    lockedUntil;

    @Column({ 
        type: 'enum', 
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], 
        nullable: true 
    })
    primarySize;

    @Column({ 
        type: 'enum', 
        enum: ['cool', 'warm', 'neutral'], 
        nullable: true 
    })
    skinTone;

    @Column({ 
        type: 'enum', 
        enum: ['conservative', 'moderate', 'bold'], 
        default: 'moderate' 
    })
    riskTolerance;

    @Column({ type: 'boolean', default: false })
    sustainabilityFocus;

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
    
    @Column({ type: 'boolean', default: false })
    hasRfidDevice;

    // OAuth & External 
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

    @Column({ type: 'text', nullable:true})
    pushSubscription; //json
    
    // Timestamps
    @CreateDateColumn()
    createdAt;

    @UpdateDateColumn()
    updatedAt;

    @Column({ type: 'timestamp', nullable: true })
    lastLoginAt;
    
    @Column({ type: 'varchar', length: 20, default: 'none' })
    deviceSetupStatus;

    @Column({ type: 'timestamp', nullable: true })
    deviceSetupCompletedAt;

    @OneToMany(() => RfidDevice, device => device.user)
    rfidDevices;

    @OneToMany(() => RfidTag, tag => tag.user)
    rfidTags;

    @OneToMany(() => Item, item => item.user)
    items;

    @OneToMany(() => UserStylePreference, pref => pref.user)
    stylePreferences;

    @OneToMany(() => UserColorPreference, pref => pref.user)
    colorPreferences;

    @OneToMany(() => UserFavoriteShop, shop => shop.user)
    favoriteShops;

    @OneToMany(() => UserSize, size => size.user)
    sizes;

    @OneToMany(() => UserLifestyle, lifestyle => lifestyle.user)
    lifestyles;

    @OneToMany(() => UserOccasion, occasion => occasion.user)
    occasions;

    @OneToMany(() => UserAvoidMaterial, material => material.user)
    avoidMaterials;
}