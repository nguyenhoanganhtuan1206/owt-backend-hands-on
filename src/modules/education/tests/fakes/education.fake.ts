import { UserFake } from '../../../user/tests/fakes/user.fake';
import type {
  CreateEducationDto,
  EducationDto,
  UpdateEducationDto,
} from '../../dtos';
import type { UpdatePositionDto } from '../../dtos/update-position.dto';
import type { EducationEntity } from '../../entities/education.entity';

export class EducationFake {
  static buildEducationDto(): EducationDto {
    const educationDto: EducationDto = {
      id: 1,
      user: UserFake.buildUserDto(),
      institution: 'institutionFake',
      degree: 'degreeFake',
      dateFrom: new Date(),
      dateTo: new Date(),
      position: 0,
      isSelected: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return educationDto;
  }

  static buildEducationEntity(education: EducationDto): EducationEntity {
    return {
      id: education.id,
      user: education.user ? UserFake.buildUserEntity(education.user) : null,
      institution: education.institution,
      degree: education.degree,
      position: education.position,
      isSelected: education.isSelected,
      toDto: jest.fn(() => education) as unknown,
    } as unknown as EducationEntity;
  }

  static buildCreateEducationDto(): CreateEducationDto {
    const createEducation: CreateEducationDto = {
      institution: 'institutionFake',
      degree: 'degreeFake',
      dateFrom: new Date(),
      dateTo: new Date(),
    };

    return createEducation;
  }

  static buildUpdateEducationDto(): UpdateEducationDto {
    const updateEducation: UpdateEducationDto = {
      id: 1,
      institution: 'institutionFake',
      degree: 'degreeFake',
      dateFrom: new Date(),
      dateTo: new Date(),
    };

    return updateEducation;
  }

  static buildUpdatePositionDto(): UpdatePositionDto {
    const updatePosition: UpdatePositionDto = {
      educationId: 1,
      position: 0,
    };

    return updatePosition;
  }
}
