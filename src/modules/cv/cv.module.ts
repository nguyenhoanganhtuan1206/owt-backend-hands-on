import { Module } from '@nestjs/common';

import { CertificationModule } from '../certification/certification.module';
import { EducationModule } from '../education/education.module';
import { EmploymentHistoryModule } from '../employment-history/employment-history.module';
import { ExperienceModule } from '../experience/experience.module';
import { SkillModule } from '../skill/skill.module';
import { UserModule } from '../user/user.module';
import { AdminCvController } from './controllers/admin-cv.controller';
import { MyCvController } from './controllers/my-cv.controller';
import { CvService } from './services/cv.service';

@Module({
  imports: [
    UserModule,
    SkillModule,
    CertificationModule,
    EducationModule,
    ExperienceModule,
    EmploymentHistoryModule,
  ],
  controllers: [MyCvController, AdminCvController],
  exports: [CvService],
  providers: [CvService],
})
export class CvModule {}
