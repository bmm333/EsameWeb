import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RfidDevice } from './rfid-device.entity.js';
import { User } from '../../user/entities/user.entity.js';

@Entity('rfid_tag')
export class RfidTag {
  @PrimaryGeneratedColumn()
  id;

  @Column({ type: 'varchar', length: 50, unique: true })
  tagId;

  @Column({ type: 'varchar', length: 100, nullable: true })
  itemName;

  @Column({ type: 'varchar', length: 50, nullable: true })
  itemCategory;

  @Column({ type: 'varchar', length: 20, default: 'unknown' })
  location;

  @Column({ type: 'timestamp', nullable: true })
  lastDetected;

  @Column({ type: 'json', nullable: true })
  itemMetadata;

  @ManyToOne(() => RfidDevice, device => device.tags)
  device;

  @Column({ type: 'int' })
  deviceId;

  @ManyToOne(() => User, user => user.rfidTags)
  user;

  @Column({ type: 'int' })
  userId;

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;
}