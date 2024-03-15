/* eslint-disable @typescript-eslint/require-await */
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseArrayPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';

import { RoleType } from '../../../constants';
import { Auth, AuthUser } from '../../../decorators';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { UserEntity } from '../../user/entities/user.entity';
import { CertificationDto } from '../dtos/certification.dto';
import { CreateCertificationDto } from '../dtos/create-certification.dto';
import { UpdateCertificationDto } from '../dtos/update-certification.dto';
import { UpdateCertificationPositionDto } from '../dtos/update-certification-position.dto';
import { CertificationService } from '../services/certification.service';

@Controller('my-certifications')
@ApiTags('my-certifications')
@UseGuards(JwtAuthGuard)
export class MyCertificationController {
  constructor(private readonly certificationService: CertificationService) {}

  @Get()
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Get all my certifications',
    type: [CertificationDto],
  })
  async getMyCertifications(
    @AuthUser() user: UserEntity,
  ): Promise<CertificationDto[]> {
    return this.certificationService.getCertificationsByUserId(user.id);
  }

  @Post()
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Create my certification',
    type: CertificationDto,
  })
  async createMyCertification(
    @AuthUser() user: UserEntity,
    @Body() createCertification: CreateCertificationDto,
  ): Promise<CertificationDto> {
    return this.certificationService.createCertification(
      user.id,
      createCertification,
    );
  }

  @Put(':id/toggle')
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @ApiOkResponse({
    description: 'Update tick/untick checkbox for my certification by id',
  })
  async updateToggleCertification(
    @AuthUser() user: UserEntity,
    @Param('id') certificationId: number,
  ): Promise<CertificationDto> {
    return this.certificationService.updateToggleCertification(
      user.id,
      certificationId,
    );
  }

  @Put('positions')
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Update positions of my certifications',
    type: [CertificationDto],
  })
  async updateMyCertificationPositions(
    @AuthUser() user: UserEntity,
    @Body(new ParseArrayPipe({ items: UpdateCertificationPositionDto }))
    updatePositionDtos: UpdateCertificationPositionDto[],
  ): Promise<CertificationDto[]> {
    return this.certificationService.updateCertificationPositions(
      user.id,
      updatePositionDtos,
    );
  }

  @Put()
  @ApiOkResponse({ description: 'Update a list of my certifications' })
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  async updateMyCertifications(
    @AuthUser() user: UserEntity,
    @Body(new ParseArrayPipe({ items: UpdateCertificationDto }))
    updateCertificationDtos: UpdateCertificationDto[],
  ): Promise<CertificationDto[]> {
    return this.certificationService.updateCertifications(
      user.id,
      updateCertificationDtos,
    );
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Delete certification' })
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  async deleteCertification(
    @AuthUser() user: UserEntity,
    @Param('id') id: number,
  ): Promise<void> {
    return this.certificationService.deleteCertification(user.id, id);
  }
}
