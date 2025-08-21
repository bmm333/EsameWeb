import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from './user.entity.js';

@Entity('user_sizes')
@Index(['userId', 'category'])
export class UserSize {
    @PrimaryGeneratedColumn()
    id;

    @Column({ 
        type: 'enum',
        enum: ['tops', 'bottoms', 'shoes', 'dress', 'outerwear']
    })
    category;

    @Column({ type: 'varchar', length: 10 })
    size; // 'M', '32', '9', etc.

    @Column({ type: 'varchar', length: 20, nullable: true })
    brand; // Different brands have different sizing

    @Column({ type: 'text', nullable: true })
    notes;

    @UpdateDateColumn()
    updatedAt;

    // Relations
    @ManyToOne(() => User, user => user.sizes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user;

    @Column({ type: 'int' })
    userId;
}