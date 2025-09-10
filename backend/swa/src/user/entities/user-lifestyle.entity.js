import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { User } from './user.entity.js';

@Entity('user_lifestyle')
@Index(['userId'])
export class UserLifestyle {
    @PrimaryGeneratedColumn()
    id;

    @Column({ 
        type: 'enum',
        enum: ['work-from-home', 'office-worker', 'student', 'parent', 'traveler', 'freelancer', 'retired']
    })
    lifestyle;

    @Column({ type: 'int', default: 50 })
    percentage;

    @CreateDateColumn()
    createdAt;

    @ManyToOne(() => User, user => user.lifestyles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user;

    @Column({ type: 'int' })
    userId; 
}