import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity.js';
import { Item } from '../../item/entities/item.entity.js';
import { RfidDevice } from './rfid-device.entity.js';

@Entity('rfid_tags')
export class RfidTag {
    @PrimaryGeneratedColumn()
    id;

    @Column({ type: 'varchar',unique: true })
    tagId;

    @Column({type: 'varchar', default: 'active' })
    status;

    @Column({ type: 'timestamp', nullable: true })
    lastScanned;

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

    @OneToOne(() => Item, item => item.rfidTag, { nullable: true })
    item;
    @ManyToOne(()=>RfidDevice,device=>device.tags,{nullable:true})
    @JoinColumn({name:'deviceId'})
    device;
    
    @Column({type: 'int',nullable:true})
    deviceId;
}