import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity.js';

@Entity('rfid_device')
export class RfidDevice {
  @PrimaryGeneratedColumn()
  id;

  @Column({ unique: true, length: 50 })
  serialNumber;

  @Column({ length: 100 })
  deviceName;

  @Column({ length: 20, default: 'inactive' })
  status;

  @Column({ type: 'json', nullable: true })
  bluetoothConfig;

  @Column({ type: 'json', nullable: true })
  wifiConfig;

  @Column({ length: 20, nullable: true })
  firmwareVersion;

  @Column({ type: 'datetime', nullable: true })
  lastHeartbeat;

  @Column({ type: 'datetime', nullable: true })
  lastSyncAt;

  @Column({ type: 'json', nullable: true })
  settings;

  @ManyToOne(() => User, user => user.rfidDevices)
  user;

  @Column()
  userId;

  @OneToMany(() => RfidTag, tag => tag.device)
  tags;

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;
}