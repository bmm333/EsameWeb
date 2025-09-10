import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { User } from './user.entity.js';

@Entity('user_occasions')
@Index(['userId'])
export class UserOccasion {
    @PrimaryGeneratedColumn()
    id;

    @Column({ 
        type: 'enum',
        enum: ['work', 'casual', 'formal-events', 'gym', 'travel', 'date-night', 'party']
    })
    occasion;

    @Column({ type: 'int', default: 1 })
    frequency;

    @CreateDateColumn()
    createdAt;

    @ManyToOne(() => User, user => user.occasions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user;

    @Column({type:'int'})
    userId;
}