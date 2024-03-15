import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TimeOffCollaboratorEntity } from './entities/time-off-collaborator.entity';
import { TimeOffCollaboratorMapper } from './mapper/time-off-collaborator.mapper';
import { TimeOffCollaboratorService } from './services/time-off-collaborator.service';

@Module({
  imports: [TypeOrmModule.forFeature([TimeOffCollaboratorEntity])],
  exports: [TimeOffCollaboratorService, TimeOffCollaboratorMapper],
  providers: [TimeOffCollaboratorService, TimeOffCollaboratorMapper],
})
export class TimeOffCollaboratorModule {}
