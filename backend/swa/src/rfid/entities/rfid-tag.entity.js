import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RfidDevice } from './rfid-device.entity.js';
import { User } from '../../user/entities/user.entity.js';

@Entity('rfid_tag')
export class RfidTag {
  @PrimaryGeneratedColumn()
  id;

  @Column({ unique: true, length: 50 })
  tagId; 

  @Column({ length: 100, nullable: true })
  itemName; 

  @Column({ length: 50, nullable: true })
  itemCategory;

  @Column({ length: 20, default: 'unknown' })
  location;

  @Column({ type: 'datetime', nullable: true })
  lastDetected;

  @Column({ type: 'json', nullable: true })
  itemMetadata; 
  @ManyToOne(() => RfidDevice, device => device.tags)
  device;

  @Column()
  deviceId;

  @ManyToOne(() => User, user => user.rfidTags)
  user;

  @Column()
  userId;

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;
}