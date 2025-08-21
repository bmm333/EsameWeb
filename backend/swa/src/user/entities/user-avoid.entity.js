import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { User } from './user.entity.js';

@Entity('user_avoid_materials')
@Index(['userId'])
export class UserAvoidMaterial {
    @PrimaryGeneratedColumn()
    id;

    @Column({ length: 50 })
    material; // 'wool', 'leather', 'synthetic', 'cotton', etc.

    @Column({ 
        type: 'enum',
        enum: ['allergy', 'ethics', 'comfort', 'preference'],
        default: 'preference'
    })
    reason;

    @Column({ type: 'text', nullable: true })
    notes;

    @CreateDateColumn()
    createdAt;

    @ManyToOne(() => User, user => user.avoidMaterials, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user;

    @Column()
    userId;
}