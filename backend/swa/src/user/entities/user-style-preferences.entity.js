import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { User } from './user.entity.js';

@Entity('user_style_preferences')
@Index(['userId', 'style'])
export class UserStylePreference {
    @PrimaryGeneratedColumn()
    id;

    @Column({ 
        type: 'enum',
        enum: ['casual', 'formal', 'business', 'sporty', 'trendy', 'classic']
    })
    style;

    @Column({ type: 'int', default: 1 })
    priority;

    @CreateDateColumn()
    createdAt;

    @ManyToOne(() => User, user => user.stylePreferences, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user;

    @Column({ type: 'int' })
    userId;
}