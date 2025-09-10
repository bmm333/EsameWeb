import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn,OneToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity.js';
import { RfidTag } from '../../rfid/entities/rfid-tag.entity.js';

@Entity('items')
export class Item {
    @PrimaryGeneratedColumn()
    id;

    @Column({type:'varchar', length: 100 })
    name;

    @Column({ 
        type: 'enum',
        enum: ['tops', 'bottoms', 'outerwear', 'shoes', 'accessories', 'dresses', 'bags']
    })
    category;

    @Column({ type:'varchar',nullable: true })
    imageUrl;

    @Column({ 
        type: 'enum',
        enum: ['wardrobe', 'being_worn'],
        default: 'wardrobe'
    })
    location;

    @Column({ type: 'int', default: 0 })
    wearCount;

    @Column({ type: 'timestamp', nullable: true })
    lastWorn;

    @Column({ type: 'json', nullable: true })
    wearHistory; 

    @Column({type:'boolean', default: false })
    isFavorite;

    @Column({type:'varchar', length: 50, nullable: true })
    color;

    @Column({ 
        type: 'enum',
        enum: ['casual', 'formal', 'sporty'],
        nullable: true 
    })
    occasion;

    @Column({ type: 'json', nullable: true })
    season; // Array: ['spring', 'summer', etc.]

    @Column({ type: 'text', nullable: true })
    notes;

    @CreateDateColumn()
    dateAdded;

    @UpdateDateColumn()
    lastUpdated;

    @Column({ type: 'timestamp', nullable: true })
    lastLocationUpdate;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user;

    @Column({ type: 'int' })
    userId;

    @OneToOne(() => RfidTag, tag => tag.item, { 
        nullable: true,
        onDelete: 'SET NULL',
        cascade: ['update']
    })
    @JoinColumn({ name: 'rfidTagId' })
    rfidTag;

    @Column({ type: 'int', nullable: true })
    rfidTagId;
}