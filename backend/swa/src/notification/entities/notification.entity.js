// src/notification/entities/notification.entity.js
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity.js';

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn()
    id;

    @Column({type: 'int' })
    userId;

    @Column({ type: 'varchar', length: 50 })
    type; // 'outfit_suggestion', 'schedule_reminder', 'rfid_alert'

    @Column({ type: 'varchar', length: 200 })
    title;

    @Column({ type: 'text' })
    message;

    @Column({ type: 'json', nullable: true })
    data; // Additional notification data (outfit suggestions, etc.)

    @Column({ type: 'varchar', length: 50, default: 'pending' })
    status; // 'pending', 'sent', 'delivered', 'failed'

    @Column({ type: 'varchar', length: 50, nullable: true })
    channel; // 'email', 'push', 

    @Column({ type: 'timestamp', nullable: true })
    sentAt;

    @Column({ type: 'timestamp', nullable: true })
    readAt;

    @ManyToOne(() => User)
    user;

    @CreateDateColumn()
    createdAt;
}