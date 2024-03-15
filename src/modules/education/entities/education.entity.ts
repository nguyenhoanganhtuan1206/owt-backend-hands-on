import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { UseDto } from '../../../decorators';
import { UserEntity } from '../../user/entities/user.entity';
import { EducationDto } from '../dtos/education.dto';

@Entity({ name: 'educations' })
@UseDto(EducationDto)
export class EducationEntity extends AbstractEntity<EducationDto> {
  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  @Column({ length: 256, nullable: false })
  institution: string;

  @Column({ length: 256, nullable: false })
  degree: string;

  @Column({ type: 'date' })
  dateFrom: Date;

  @Column({ type: 'date' })
  dateTo: Date;

  @Column()
  position: number;

  @Column({ default: false })
  isSelected: boolean;
}
