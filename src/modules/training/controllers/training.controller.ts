import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { PageDto } from '../../../common/dto/page.dto';
import { RoleType } from '../../../constants';
import { ApiPageOkResponse, Auth, AuthUser } from '../../../decorators';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { UserEntity } from '../../user/entities/user.entity';
import { CreateTrainingDto } from '../dtos/create-training.dto';
import { TrainingDto } from '../dtos/training.dto';
import { TrainingLevelDto } from '../dtos/training-level.dto';
import { TrainingTopicDto } from '../dtos/training-topic.dto';
import { TrainingsPageOptionsDto } from '../dtos/trainings-page-options.dto';
import { UpdateTrainingDto } from '../dtos/update-training.dto';
import { TrainingService } from '../services/training.service';

@Controller('trainings')
@ApiTags('trainings')
@UseGuards(JwtAuthGuard)
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Get()
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get current user login list trainings',
    type: PageDto,
  })
  async getMyTrainings(
    @AuthUser() user: UserEntity,
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: TrainingsPageOptionsDto,
  ): Promise<PageDto<TrainingDto>> {
    pageOptionsDto.userIds = [user.id];

    return this.trainingService.getTrainings(pageOptionsDto);
  }

  @Get('levels')
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get all trainings levels by user',
    type: TrainingLevelDto,
  })
  async getAllLevels(): Promise<TrainingLevelDto[]> {
    return this.trainingService.findAllLevels();
  }

  @Get('topics')
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get all trainings topics by user',
    type: TrainingTopicDto,
  })
  async getAllTopics(): Promise<TrainingTopicDto[]> {
    return this.trainingService.findAllTopics();
  }

  @Get(':id')
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User get training by id',
    type: TrainingDto,
  })
  getMyTraining(
    @AuthUser() user: UserEntity,
    @Param('id') trainingId: number,
  ): Promise<TrainingDto> {
    return this.trainingService.getUserTrainingDetails(user.id, trainingId);
  }

  @Post()
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User create training report',
    type: TrainingDto,
  })
  async createTraining(
    @AuthUser() user: UserEntity,
    @Body() createTrainingDto: CreateTrainingDto,
  ): Promise<TrainingDto> {
    return this.trainingService.createTraining(
      user.id,
      user.id,
      createTrainingDto,
    );
  }

  @Put(':id')
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User update training report',
    type: TrainingDto,
  })
  updateTraining(
    @Param('id') id: number,
    @AuthUser() user: UserEntity,
    @Body() updateTrainingDto: UpdateTrainingDto,
  ): Promise<TrainingDto> {
    return this.trainingService.updateTraining(
      id,
      user.id,
      user.id,
      updateTrainingDto,
    );
  }

  @Delete(':id')
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    description: 'User delete training report',
  })
  deleteTraining(
    @AuthUser() user: UserEntity,
    @Param('id') trainingId: number,
  ): Promise<void> {
    return this.trainingService.deleteUserTraining(
      user.id,
      user.id,
      trainingId,
    );
  }
}
