import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../../user/entities/user.entity.js';

@Entity('media')
@Index(['userId'])
@Index(['folder'])
export class Media {
  @PrimaryGeneratedColumn()
  id;

  @Column({ type: 'int' })
  userId;

  @Column({ type: 'varchar', length: 255 })
  originalName;

  @Column({ type: 'varchar', length: 500 })
  fileName; // S3 key

  @Column({ type: 'text' })
  url; // S3 URL

  @Column({ type: 'varchar', length: 100 })
  mimeType;

  @Column({ type: 'int' })
  size; //bytes

  @Column({ type: 'varchar', length: 50, default: 'general' })
  folder; // profiles, items

  @Column({ type: 'boolean', default: false })
  backgroundRemoved;

  @Column({ type: 'json', nullable: true })
  metadata; // Additional data like dimensions, tags, etc.

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user;
}