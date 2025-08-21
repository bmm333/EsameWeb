import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { User } from './user.entity.js';

@Entity('user_favorite_shops')
@Index(['userId'])
export class UserFavoriteShop {
    @PrimaryGeneratedColumn()
    id;

    @Column({ type: 'varchar', length: 100 })
    shopName;

    @Column({ type: 'varchar', length: 50, nullable: true })
    category; // 'clothing', 'shoes', 'accessories'

    @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
    rating; // 1.00 to 5.00

    @Column({ type: 'text', nullable: true })
    notes;

    @CreateDateColumn()
    createdAt;

    @ManyToOne(() => User, user => user.favoriteShops, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user;

    @Column({ type: 'int' })
    userId;
}