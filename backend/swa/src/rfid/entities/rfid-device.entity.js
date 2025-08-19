import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity.js';
import { RfidTag } from './rfid-tag.entity.js';

@Entity('rfid_device')
export class RfidDevice {
  @PrimaryGeneratedColumn()
  id;

  @Column({ type: 'varchar', length: 50, unique: true })
  serialNumber;

  @Column({ type: 'varchar', length: 100 })
  deviceName;

  @Column({ type: 'varchar', length: 20, default: 'inactive' })
  status;

  @Column({ type: 'json', nullable: true })
  bluetoothConfig;

  @Column({ type: 'json', nullable: true })
  wifiConfig;

  @Column({ type: 'varchar', length: 20, nullable: true })
  firmwareVersion;

  @Column({ type: 'timestamp', nullable: true })
  lastHeartbeat;

  @Column({ type: 'timestamp', nullable: true })
  lastSyncAt;

  @Column({ type: 'json', nullable: true })
  settings;

  @ManyToOne(() => User, user => user.rfidDevices)
  user;

  @Column({ type: 'int' })
  userId;

  @OneToMany(() => RfidTag, tag => tag.device)
  tags;

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;
}