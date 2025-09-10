import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, CreateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity.js';
import { Item } from '../../item/entities/item.entity.js';

@Entity('recommendations')
export class Recommendation {
    @PrimaryGeneratedColumn()
    id;

    @Column({type:'int'})
    userId;

    @Column({type: 'varchar', length: 100})
    title;

    @Column({ type: 'text', nullable: true })
    reason;
    
    @Column({type:'varchar', length: 100, nullable: true })
    occasion;

    @Column({ type: 'text', nullable: true })
    imageUrl;

    @Column({type:'boolean', default: false })
    wasWorn;

    @Column({ type: 'timestamp', nullable: true })
    wornAt;
    
    @Column({ type: 'timestamp', nullable: true, name: 'rejectedAt' })
    rejectedAt;

    @Column({ type: 'text', nullable: true, name: 'rejectionReason' })
    rejectionReason;

    @CreateDateColumn({type:'timestamp'})
    createdAt;

    @ManyToOne(() => User, user => user.recommendations)
    user;

    @ManyToMany(() => Item)
    @JoinTable({
        name: 'recommendation_items',
        joinColumn: { name: 'recommendationId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'itemId', referencedColumnName: 'id' }
    })
    items;
}