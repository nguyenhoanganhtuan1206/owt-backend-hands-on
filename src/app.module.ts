import './boilerplate.polyfill';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import path from 'path';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';

import { MailModule } from './integrations/mail/mail.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { AuthModule } from './modules/auth/auth.module';
import { BuddyModule } from './modules/buddy/buddy.module';
import { BuddyBuddeePairModule } from './modules/buddy-buddee-pair/buddy-buddee-pair.module';
import { BuddyBuddeeTouchpointModule } from './modules/buddy-buddee-touchpoint/buddy-buddee-touchpoint.module';
import { CertificationModule } from './modules/certification/certification.module';
import { CvModule } from './modules/cv/cv.module';
import { DeviceModule } from './modules/device/device.module';
import { DeviceModelModule } from './modules/device-model/device-model.module';
import { DeviceOwnerModule } from './modules/device-owner/device-owner.module';
import { DeviceRepairHistoryModule } from './modules/device-repair-history/device-repair-history.module';
import { DeviceRepairRequestModule } from './modules/device-repair-request/device-repair-request.module';
import { DeviceTypeModule } from './modules/device-type/device-type.module';
import { EducationModule } from './modules/education/education.module';
import { EmploymentHistoryModule } from './modules/employment-history/employment-history.module';
import { ExperienceModule } from './modules/experience/experience.module';
import { HealthCheckerModule } from './modules/health-checker/health-checker.module';
import { MetricsModule } from './modules/metric/metric.module';
import { SkillModule } from './modules/skill/skill.module';
import { SkillGroupModule } from './modules/skill-group/skill-group.module';
import { TimeOffCollaboratorModule } from './modules/time-off-collaborator/time-off-collaborator.module';
import { TimeOffRequestModule } from './modules/time-off-request/time-off-request.module';
import { TimeKeeperModule } from './modules/timekeeper/timekeeper.module';
import { TrainingModule } from './modules/training/training.module';
import { UserModule } from './modules/user/user.module';
import { VacationBalanceModule } from './modules/vacation-balance/vacation-balance.module';
import { WfhRequestModule } from './modules/wfh-request/wfh-request.module';
import { ApiConfigService } from './shared/services/api-config.service';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    MetricsModule,
    AuthModule,
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [SharedModule],
      useFactory: (configService: ApiConfigService) =>
        configService.postgresConfig,
      inject: [ApiConfigService],
      // eslint-disable-next-line @typescript-eslint/require-await
      dataSourceFactory: async (options) => {
        if (!options) {
          throw new Error('Invalid options passed');
        }

        return addTransactionalDataSource(new DataSource(options));
      },
    }),
    I18nModule.forRootAsync({
      useFactory: (configService: ApiConfigService) => ({
        fallbackLanguage: configService.fallbackLanguage,
        loaderOptions: {
          path: path.join(__dirname, '/i18n/'),
          watch: configService.isDevelopment,
        },
        resolvers: [
          { use: QueryResolver, options: ['lang'] },
          AcceptLanguageResolver,
        ],
      }),
      imports: [SharedModule],
      inject: [ApiConfigService],
    }),
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        // ignoreTLS: true,
        secure: false,
        tls: {
          ciphers: 'SSLv3',
          rejectUnauthorized: false,
        },
        auth: {
          user: process.env.MAIL_AUTH_USERNAME,
          pass: process.env.MAIL_AUTH_PASSWORD,
        },
      },
      defaults: {
        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`,
      },
      template: {
        dir: path.join(__dirname, '/integrations/mail/templates/'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
      options: {
        partials: {
          dir: path.join(__dirname, '/integrations/mail/templates/partials'),
          options: {
            strict: true,
          },
        },
      },
    }),
    HealthCheckerModule,
    TrainingModule,
    MailModule,
    AttendanceModule,
    TimeOffRequestModule,
    WfhRequestModule,
    BuddyBuddeePairModule,
    BuddyBuddeeTouchpointModule,
    BuddyModule,
    DeviceModelModule,
    DeviceOwnerModule,
    DeviceTypeModule,
    DeviceRepairHistoryModule,
    DeviceRepairRequestModule,
    DeviceModule,
    SkillModule,
    SkillGroupModule,
    EducationModule,
    ExperienceModule,
    TimeKeeperModule,
    CertificationModule,
    CvModule,
    EmploymentHistoryModule,
    TimeOffCollaboratorModule,
    VacationBalanceModule,
  ],
  providers: [],
})
export class AppModule {}
