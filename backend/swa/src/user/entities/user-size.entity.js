import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from './user.entity.js';

@Entity('user_sizes')
@Index(['userId', 'category']) // One record per category per user
export class UserSize {
    @PrimaryGeneratedColumn()
    id;

    @Column({ 
        type: 'enum',
        enum: ['tops', 'bottoms', 'shoes', 'dress', 'outerwear']
    })
    category;

    @Column({ length: 10 })
    size; // 'M', '32', '9', etc.

    @Column({ length: 20, nullable: true })
    brand; // Different brands have different sizing

    @Column({ type: 'text', nullable: true })
    notes;

    @UpdateDateColumn()
    updatedAt;

    // Relations
    @ManyToOne(() => User, user => user.sizes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user;

    @Column()
    userId;
}