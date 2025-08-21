import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity.js';
import { RfidTag } from './rfid-tag.entity.js';

@Entity('rfid_devices')
export class RfidDevice {
    @PrimaryGeneratedColumn()
    id;

    @Column({ type: 'varchar', length: 100, unique: true })
    deviceId;

    @Column({ type: 'varchar', length: 100 })
    name;

    @Column({ type: 'varchar', length: 100, nullable: true })
    location;

    @Column({ type: 'varchar', length: 20, default: 'active' })
    status;

    @Column({ type: 'timestamp', nullable: true })
    lastSeen;

    @CreateDateColumn()
    registeredAt;

    @UpdateDateColumn()
    lastUpdated;

    // Relations
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user;

    @Column({ type: 'int' })
    userId;

    @OneToMany(() => RfidTag, tag => tag.device)
    tags;
}