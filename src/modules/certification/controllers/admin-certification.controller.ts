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
import { Auth } from '../../../decorators';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { CertificationDto } from '../dtos/certification.dto';
import { CreateCertificationDto } from '../dtos/create-certification.dto';
import { UpdateCertificationDto } from '../dtos/update-certification.dto';
import { UpdateCertificationPositionDto } from '../dtos/update-certification-position.dto';
import { CertificationService } from '../services/certification.service';

@Controller('admin/certifications')
@ApiTags('admin/certifications')
@UseGuards(JwtAuthGuard)
export class AdminCertificationController {
  constructor(private readonly certificationService: CertificationService) {}

  @Get(':userId')
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Get all certifications of employee',
    type: [CertificationDto],
  })
  async getEmployeeCertifications(
    @Param('userId') userId: number,
  ): Promise<CertificationDto[]> {
    return this.certificationService.getCertificationsByUserId(userId);
  }

  @Post(':userId')
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Create certification for employee',
    type: CertificationDto,
  })
  async createEmployeeCertification(
    @Param('userId') userId: number,
    @Body() createCertification: CreateCertificationDto,
  ): Promise<CertificationDto> {
    return this.certificationService.createCertification(
      userId,
      createCertification,
    );
  }

  @Put(':userId/positions')
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Update positions certifications of employee',
    type: [CertificationDto],
  })
  async updateEmployeeCertificationPositions(
    @Param('userId') userId: number,
    @Body(new ParseArrayPipe({ items: UpdateCertificationPositionDto }))
    updatePositionDtos: UpdateCertificationPositionDto[],
  ): Promise<CertificationDto[]> {
    return this.certificationService.updateCertificationPositions(
      userId,
      updatePositionDtos,
    );
  }

  @Put('/:userId/:id/toggle')
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @ApiOkResponse({
    description: `Update tick/untick checkbox for employee's certifications by id`,
  })
  async updateToggleCertification(
    @Param('userId') userId: number,
    @Param('id') experienceId: number,
  ): Promise<CertificationDto> {
    return this.certificationService.updateToggleCertification(
      userId,
      experienceId,
    );
  }

  @Put('/:userId')
  @ApiOkResponse({ description: `Update a list of employee's certifications` })
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  async updateCertifications(
    @Body(new ParseArrayPipe({ items: UpdateCertificationDto }))
    updateCertificationDtos: UpdateCertificationDto[],
    @Param('userId') userId: number,
  ): Promise<CertificationDto[]> {
    return this.certificationService.updateCertifications(
      userId,
      updateCertificationDtos,
    );
  }

  @Delete('/:userId/:id')
  @ApiOkResponse({ description: 'Delete certification' })
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  async deleteCertification(
    @Param('userId') userId: number,
    @Param('id') id: number,
  ): Promise<void> {
    return this.certificationService.deleteCertification(userId, id);
  }
}
