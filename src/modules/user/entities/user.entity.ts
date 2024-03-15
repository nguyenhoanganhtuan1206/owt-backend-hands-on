import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { ContractType } from '../../../constants/contract-type';
import { GenderType } from '../../../constants/gender-type';
import { IsPassword, UseDto } from '../../../decorators';
import { CertificationEntity } from '../../../modules/certification/entities/certification.entity';
import { EducationEntity } from '../../../modules/education/entities/education.entity';
import { EmploymentHistoryEntity } from '../../../modules/employment-history/entities/employment-history.entity';
import { ExperienceEntity } from '../../experience/entities/experience.entity';
import { TimeOffRequestEntity } from '../../time-off-request/entities/time-off-request.entity';
import { TimeKeeperEntity } from '../../timekeeper/entities/timekeeper.entity';
import { WfhRequestEntity } from '../../wfh-request/entities/wfh-request.entity';
import type { UserDtoOptions } from '../dtos/user.dto';
import { UserDto } from '../dtos/user.dto';
import { CvEntity } from './cv.entity';
import { LevelEntity } from './level.entity';
import { PermissionEntity } from './permission.entity';
import { PositionEntity } from './position.entity';

@Entity({ name: 'users' })
@UseDto(UserDto)
export class UserEntity extends AbstractEntity<UserDto, UserDtoOptions> {
  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  trigram?: string;

  @Column({ nullable: true })
  idNo?: number;

  @Column({ nullable: true })
  phoneNo?: string;

  @Column({ unique: true })
  qrCode?: string;

  @Column({ type: 'text', nullable: true })
  photo?: string;

  @Column({ unique: true })
  companyEmail: string;

  @Column()
  @IsPassword()
  password?: string;

  @Column({ type: 'enum', enum: GenderType })
  gender: GenderType;

  @Column({ type: 'enum', enum: ContractType })
  contractType: ContractType;

  @Column({ nullable: true })
  dateOfBirth?: Date;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  university?: string;

  @Column({ nullable: true, default: 0 })
  yearlyAllowance: number;

  @Column()
  startDate?: Date;

  @Column({ nullable: true })
  endDate?: Date;

  @Column()
  isActive?: boolean;

  @Column()
  firstLogin?: boolean;

  @Column({ unique: true })
  employeeId: string;

  @ManyToOne(() => PositionEntity, (position) => position.users, {
    eager: true,
  })
  @JoinColumn({ name: 'position_id' })
  position: PositionEntity;

  @ManyToOne(() => LevelEntity, (level) => level.users, {
    eager: true,
  })
  @JoinColumn({ name: 'level_id' })
  level: LevelEntity;

  @OneToMany(() => CvEntity, (cv) => cv.user, {
    onDelete: 'RESTRICT',
    eager: true,
  })
  cvs: CvEntity[];

  @OneToMany(() => PermissionEntity, (permission) => permission.user, {
    onDelete: 'RESTRICT',
    eager: true,
  })
  permissions: PermissionEntity[];

  @Column({ nullable: true })
  introduction?: string;

  @Column({ nullable: true })
  timekeeperUserId?: number;

  @OneToMany(() => TimeKeeperEntity, (timeKeeper) => timeKeeper.user, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: '=user_id' })
  timeKeepers: TimeKeeperEntity[];

  @OneToMany(
    () => TimeOffRequestEntity,
    (timeOffRequest) => timeOffRequest.user,
    {
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({ name: '=user_id' })
  timeOffRequests: TimeKeeperEntity[];

  @OneToMany(() => WfhRequestEntity, (wfhRequest) => wfhRequest.user, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: '=user_id' })
  wfhRequests: WfhRequestEntity[];

  @OneToMany(() => ExperienceEntity, (experience) => experience.user)
  experiences: ExperienceEntity[];

  @OneToMany(() => EducationEntity, (education) => education.user)
  educations: EducationEntity[];

  @OneToMany(() => CertificationEntity, (certification) => certification.user)
  certifications: CertificationEntity[];

  @OneToMany(
    () => EmploymentHistoryEntity,
    (employmentHistory) => employmentHistory.user,
  )
  employmentHistories: EmploymentHistoryEntity[];

  @Column({ name: 'custom_position', nullable: true, length: 255 })
  customPosition?: string;
}
