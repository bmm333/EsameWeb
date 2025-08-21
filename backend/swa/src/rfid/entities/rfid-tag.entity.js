import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity.js';
import { Item } from '../../item/entities/item.entity.js';
import { RfidDevice } from './rfid-device.entity.js';

@Entity('rfid_tags')
export class RfidTag {
    @PrimaryGeneratedColumn()
    id;

    @Column({ unique: true })
    tagId;

    @Column({ default: 'active' })
    status;

    @Column({ type: 'datetime', nullable: true })
    lastScanned;

    @CreateDateColumn()
    registeredAt;

    @UpdateDateColumn()
    lastUpdated;

    // Relations
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user;

    @Column()
    userId;

    @OneToOne(() => Item, item => item.rfidTag, { nullable: true })
    item;
    @ManyToOne(()=>RfidDevice,device=>device.tags,{nullable:true})
    @JoinColumn({name:'deviceId'})
    device;
    
    @Column({nullable:true})
    deviceId;
}