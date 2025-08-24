import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity.js';
import { Item } from '../../item/entities/item.entity.js';
import { RfidDevice } from './rfid-device.entity.js';

@Entity('rfid_tags')
export class RfidTag {
    @PrimaryGeneratedColumn()
    id;

    @Column({ type: 'varchar', unique: true })
    tagId; // RFID tag UID

    @Column({ type: 'varchar', default: 'detected' })
    status; // 'detected', 'missing', 'inactive'

    @Column({ type: 'varchar', default: 'wardrobe' })
    location; // 'wardrobe', 'being_worn', 'laundry', 'unknown'

    @Column({ type: 'timestamp', nullable: true })
    lastDetected;

    @Column({ type: 'timestamp', nullable: true })
    lastSeen;

    @Column({ type: 'int', default: 0 })
    signalStrength; // RSSI value

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

    @OneToOne(() => Item, item => item.rfidTag, { nullable: true })
    @JoinColumn({ name: 'itemId' })
    item;

    @Column({ type: 'int', nullable: true })
    itemId;

    @ManyToOne(() => RfidDevice, device => device.tags)
    @JoinColumn({ name: 'deviceId' })
    device;
    
    @Column({ type: 'int' })
    deviceId;
}