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
    hexCode;

    @Column({ type: 'int', default: 1 })
    preference;

    @CreateDateColumn()
    createdAt;
    
    @ManyToOne(() => User, user => user.colorPreferences, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user;

    @Column({ type: 'int' })
    userId;
}