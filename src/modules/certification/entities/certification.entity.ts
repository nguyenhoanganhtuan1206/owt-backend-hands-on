import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { UseDto } from '../../../decorators';
import { UserEntity } from '../../user/entities/user.entity';
import { CertificationDto } from '../dtos/certification.dto';

@Entity({ name: 'certifications' })
@UseDto(CertificationDto)
export class CertificationEntity extends AbstractEntity<CertificationDto> {
  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ length: 256, nullable: false })
  name: string;

  @Column({ length: 256, nullable: false })
  issuingOrganisation: string;

  @Column({ type: 'date', nullable: true })
  issueDate: Date;

  @Column({ type: 'date', nullable: true })
  expirationDate: Date;

  @Column({ length: 256, nullable: true })
  credentialId: string;

  @Column({ nullable: true })
  credentialUrl: string;

  @Column()
  position: number;

  @Column({ default: false })
  isSelected: boolean;
}
