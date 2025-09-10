import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity.js';

@Entity('outfits')
export class Outfit {
    @PrimaryGeneratedColumn()
    id;

    @Column({type: 'int'})
    userId;

    @Column({type:'varchar', length: 255 })
    name;

    @Column({ 
        type: 'enum', 
        enum: ['casual', 'work', 'formal', 'sport', 'party'],
        nullable: true 
    })
    occasion;

    @Column({ type: 'text', nullable: true })
    notes;

    @Column({ type: 'json', nullable: true })
    items;

    @Column({ type: 'boolean', default: false })
    isFavorite;

    @Column({ type: 'int', default: 0 })
    wearCount;

    @Column({ type: 'timestamp', nullable: true })
    lastWorn;

    @Column({ type: 'json', nullable: true })
    wearHistory;

    @Column({ type: 'varchar', length: 255, nullable: true })
    image;

    @Column({ type: 'varchar', length: 50, nullable: true })
    season;

    @Column({ type: 'boolean', default: true })
    isAvailable;

    @CreateDateColumn()
    createdAt;

    @UpdateDateColumn()
    updatedAt;

    @ManyToOne(() => User, user => user.outfits)
    user;
}