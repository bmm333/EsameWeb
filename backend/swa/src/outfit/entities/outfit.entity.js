import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../user/entities/user.entity.js';

@Entity('outfits')
@Index(['userId'])
export class Outfit {
    @PrimaryGeneratedColumn()
    id;

    @Column({ type: 'varchar', length: 100 })
    name;

    @Column({ type: 'json' })
    items; // Array of item IDs/tagIds

    @Column({ 
        type: 'enum', 
        enum: ['casual', 'formal', 'business', 'sporty', 'party', 'vacation'], 
        nullable: true 
    })
    occasion;

    @Column({ 
        type: 'enum', 
        enum: ['spring', 'summer', 'fall', 'winter', 'all-season'], 
        default: 'all-season' 
    })
    season;

    @Column({ type: 'text', nullable: true })
    notes;

    @Column({ type: 'boolean', default: false })
    isFavorite;

    @Column({ type: 'int', default: 0 })
    wearCount;

    @Column({ type: 'timestamp', nullable: true })
    lastWorn;

    @Column({ type: 'json', nullable: true })
    wearHistory; 

    @Column({ type: 'boolean', default: true })
    isAvailable; 

    @CreateDateColumn()
    createdAt;

    @UpdateDateColumn()
    updatedAt;

    // Relationships
    @ManyToOne(() => User, user => user.outfits, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user;

    @Column()
    userId;
}