import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity.js';

@Entity('recommendations')
export class Recommendation {
    @PrimaryGeneratedColumn()
    id;

    @Column({type:'int'})
    userId;

    @Column({ type: 'varchar', length: 50 })
    type; // 'scheduled', 'rfid-triggered', 'manual', 'weather-based'

    @Column({ type: 'varchar', length: 100 })
    occasion; // 'work', 'casual', 'formal', 'sport'

    @Column({ type: 'json' })
    outfitSuggestion; // Complete outfit with items

    @Column({ type: 'json', nullable: true })
    weatherData; // Weather context

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    confidenceScore; // 0.00 - 100.00

    @Column({ type: 'json', nullable: true })
    reasoning; // Why this outfit was recommended

    @Column({ type: 'boolean', default: false })
    wasAccepted;

    @Column({ type: 'boolean', default: false })
    wasViewed;

    @Column({ type: 'timestamp', nullable: true })
    viewedAt;

    @Column({ type: 'timestamp', nullable: true })
    acceptedAt;

    @ManyToOne(() => User)
    user;

    @CreateDateColumn()
    createdAt;
}