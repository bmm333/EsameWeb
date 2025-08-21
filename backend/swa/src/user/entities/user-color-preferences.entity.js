import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { User } from './user.entity.js';

@Entity('user_color_preferences')
@Index(['userId', 'color'])
export class UserColorPreference {
    @PrimaryGeneratedColumn()
    id;

    @Column({ type: 'varchar', length: 30 })
    color;

    @Column({ type: 'varchar', length: 7, nullable: true })
    hexCode; // #FF0000

    @Column({ type: 'int', default: 1 })
    preference; // 1 = love, 2 = like, 3 = neutral, 4 = dislike, 5 = hate

    @CreateDateColumn()
    createdAt;
    
    @ManyToOne(() => User, user => user.colorPreferences, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user;

    @Column({ type: 'int' })
    userId;
}