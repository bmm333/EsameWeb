import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity.js';
import { RfidTag } from '../../rfid/entities/rfid-tag.entity.js';

@Entity('items')
export class Item {
    @PrimaryGeneratedColumn()
    id;

    @Column({ length: 100 })
    name;

    @Column({ 
        type: 'enum',
        enum: ['tops', 'bottoms', 'outerwear', 'shoes', 'accessories']
    })
    category;

    @Column({ nullable: true })
    imageUrl;

    @Column({ 
        type: 'enum',
        enum: ['wardrobe', 'closet', 'laundry', 'worn', 'missing'],
        default: 'wardrobe'
    })
    location;

    @Column({ type: 'int', default: 0 })
    wearCount;

    @Column({ type: 'datetime', nullable: true })
    lastWorn;

    @Column({ type: 'json', nullable: true })
    wearHistory; // Array of wear events

    @Column({ default: false })
    isFavorite;

    @Column({ type: 'json', nullable: true })
    tags; // Array of strings like ['formal', 'casual']

    @Column({ length: 50, nullable: true })
    color;

    @Column({ length: 50, nullable: true })
    brand;

    @Column({ length: 20, nullable: true })
    size;

    @Column({ type: 'json', nullable: true })
    season; // Array: ['spring', 'summer', etc.]

    @Column({ type: 'text', nullable: true })
    notes;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    price;

    @Column({ type: 'date', nullable: true })
    purchaseDate;

    @CreateDateColumn()
    dateAdded;

    @UpdateDateColumn()
    lastUpdated;

    @Column({ type: 'datetime', nullable: true })
    lastLocationUpdate;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user;

    @Column()
    userId;

    @ManyToOne(() => RfidTag,tag=>tag.item, { nullable: true })
    @JoinColumn({ name: 'rfidTagId' })
    rfidTag;

    @Column({ nullable: true })
    rfidTagId;
}