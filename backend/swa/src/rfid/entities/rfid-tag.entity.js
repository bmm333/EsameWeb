import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity.js';
import { Item } from '../../item/entities/item.entity.js';
import { RfidDevice } from './rfid-device.entity.js';

@Entity('rfid_tags')
export class RfidTag {
    @PrimaryGeneratedColumn()
    id;

    @Column({ type: 'varchar', unique: true })
    tagId;

    @Column({ type: 'varchar', default: 'detected' })
    status; 

    @Column({ 
        type: 'enum',
        enum: ['wardrobe', 'being_worn'],
        default: 'wardrobe' 
    })
    location;

    @Column({ type: 'timestamp', nullable: true })
    lastDetected;

    @Column({ type: 'timestamp', nullable: true })
    lastSeen;

    @Column({ type: 'int', default: 0 })
    signalStrength; 

    @Column({ type: 'boolean', default: true })
    isActive;

    @CreateDateColumn()
    registeredAt;

    @UpdateDateColumn()
    lastUpdated;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user;

    @Column({ type: 'int' })
    userId;

    @OneToOne(() => Item, item => item.rfidTag, { 
        nullable: true,
        onDelete: 'SET NULL',
        cascade: ['update'] //updates cascade
    })
    @JoinColumn({ name: 'itemId' })
    item;

    @Column({ type: 'int', nullable: true })
    itemId;

    @ManyToOne(() => RfidDevice, device => device.tags, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'deviceId' })
    device;
    
    @Column({ type: 'int' })
    deviceId;
}