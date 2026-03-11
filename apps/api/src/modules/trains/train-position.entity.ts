import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('train_positions')
export class TrainPosition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'train_id' })
  trainId: string;

  @Index()
  @Column({ name: 'line_id' })
  lineId: string;

  @Column({ name: 'line_name' })
  lineName: string;

  @Column('float')
  lat: number;

  @Column('float')
  lon: number;

  @Column({ name: 'delay_seconds', default: 0 })
  delaySeconds: number;

  @Column({
    name: 'delay_status',
    default: 'ON_TIME',
  })
  delayStatus: string;

  @Column({ name: 'next_stop_name', default: '' })
  nextStopName: string;

  @CreateDateColumn({ name: 'recorded_at' })
  recordedAt: Date;
}