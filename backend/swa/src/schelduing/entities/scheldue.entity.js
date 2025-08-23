import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity.js';

@Entity('schedules')
export class Schedule {
    @PrimaryGeneratedColumn()
    id;

    @Column({type:'int'})
    userId;

    @Column({ type: 'varchar', length: 50 })
    type; // 'daily', 'weekly', 'event-based'

    @Column({ type: 'varchar', length: 100 })
    name; // 'Morning Outfit', 'Work Reminder', etc.

    @Column({ type: 'time', nullable: true })
    time; // '07:00', '18:30'

    @Column({ type: 'json', nullable: true })
    daysOfWeek; // [1, 2, 3, 4, 5] for weekdays

    @Column({ type: 'varchar', length: 50, nullable: true })
    occasion; // 'work', 'casual', 'formal', 'sport'

    @Column({ type: 'boolean', default: true })
    isActive;

    @Column({ type: 'boolean', default: true })
    includeWeatherCheck;

    @Column({ type: 'json', nullable: true })
    preferences; 

    @Column({ type: 'text', nullable: true })
    message; // Custom notification message

    @ManyToOne(() => User)
    user;

    @CreateDateColumn()
    createdAt;

    @UpdateDateColumn()
    updatedAt;
}