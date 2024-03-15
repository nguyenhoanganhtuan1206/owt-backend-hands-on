import type { CvDto } from '../../dtos/cv.dto';
import type { CvEntity } from '../../entities/cv.entity';

export class CvFake {
  static buildCvDto(): CvDto {
    const cvDto: CvDto = {
      id: 1,
      version: '1',
      cv: 'cv',
      createdBy: 1,
      updatedBy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return cvDto;
  }

  static buildCvEntity(cv: CvDto): CvEntity {
    return {
      id: cv.id,
      version: cv.version,
      cv: cv.cv,
      toDto: jest.fn(() => cv) as unknown,
    } as unknown as CvEntity;
  }
}
