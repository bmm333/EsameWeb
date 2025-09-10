import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { RfidDevice } from '../../rfid/entities/rfid-device.entity.js';
import { RfidTag } from '../../rfid/entities/rfid-tag.entity.js';
import { Item } from '../../item/entities/item.entity.js';
import { UserStylePreference } from './user-style-preferences.entity.js'; 
import { UserColorPreference } from './user-color-preferences.entity.js';
import { UserLifestyle } from './user-lifestyle.entity.js';
import { UserOccasion } from './user-occasion.entity.js';

@Entity('user')
@Index(['email'])
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
        enum: ['male', 'female','non-binary','other','prefer-not-to-say'], 
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

    @Column({ type: 'varchar', nullable: true })
    refreshToken;

    @Column({ type: 'varchar', length: 100, nullable: true })
    location;

    @Column({ type: 'boolean', default: false})
    trial;

    @Column({ type: 'timestamp', nullable: true })
    trialExpires;

    @Column({ 
        type: 'enum', 
        enum: ['free','trial'], 
        default: 'free' 
    })
    subscriptionTier;

    @Column({ type: 'timestamp', nullable: true })
    subscriptionExpires;
    
    @Column({ type: 'boolean', default: false })
    hasRfidDevice;

    @Column({ type: 'integer', default: 0 })
    trialItemsUsed;

    @Column({ type: 'integer', default: 0 })
    trialOutfitsUsed;

    @Column({ 
        type: 'enum', 
        enum: ['local'], 
        default: 'local' 
    })
    provider;

    @Column({ type: 'varchar', nullable: true })
    profilePicture;

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

    @OneToMany(() => UserLifestyle, lifestyle => lifestyle.user)
    lifestyles;

    @OneToMany(() => UserOccasion, occasion => occasion.user)
    occasions;
}