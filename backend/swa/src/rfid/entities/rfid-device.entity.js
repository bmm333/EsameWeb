import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity.js';
import { RfidTag } from './rfid-tag.entity.js';

@Entity('rfid_devices')
export class RfidDevice {
    @PrimaryGeneratedColumn()
    id;

    @Column({ type: 'varchar', length: 100, unique: true ,nullable:true})
    serialNumber;

    @Column({ type: 'varchar', length: 100, unique: true,nullable:true })
    apiKey;

    @Column({ type: 'varchar', length: 100 })
    deviceName;

    @Column({ type: 'timestamp', nullable: true })
    lastHeartbeat; // Last ping from device

    @Column({ type: 'timestamp', nullable: true })
    lastScan; // Last RFID scan

    @Column({ type: 'boolean', default: false })
    isOnline;

    @Column({ type: 'int', default: 30 })
    scanInterval; // Seconds between scans

    @Column({ type: 'boolean', default: false })
    powerSavingMode;

    @Column({ type: 'timestamp', nullable: true })
    lastConfigured;

    @CreateDateColumn()
    registeredAt;

    @UpdateDateColumn()
    lastUpdated;

    // Relations
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user;

    @Column({ type: 'int' ,nullable:true})
    userId;

    @OneToMany(() => RfidTag, tag => tag.device)
    tags;
}