import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity('user_states')
export class UserState {
  @PrimaryColumn({ type: 'bigint' })
  userId!: number;

  @Column({ type: 'varchar', length: 255 })
  action!: string;

  @Column({ 
    type: 'jsonb', 
    nullable: true,
    default: {}
  })
  data!: {
    recipientAddress?: string;
    playerTag?: string;
    betAmount?: number;
    targetPosition?: number;
    predictedStars?: number;
    escrowAccount?: string;
    targetTag?: string;
    [key: string]: any;
  };

  @Column({ 
    type: 'timestamp', 
    default: () => 'CURRENT_TIMESTAMP',
    name: 'updated_at'
  })
  updatedAt!: Date;
}