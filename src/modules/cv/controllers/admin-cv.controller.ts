import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { RoleType } from '../../../constants';
import { Auth } from '../../../decorators';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { CvService } from '../services/cv.service';

@Controller('/admin/cvs')
@ApiTags('/admin/cvs')
@UseGuards(JwtAuthGuard)
export class AdminCvController {
  constructor(private readonly cvService: CvService) {}

  @Get('/:userId/export-pdf')
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: `Export employee's cv with pdf type`,
  })
  async exportEmployeeCv(
    @Param('userId') userId: number,
    @Res() res: Response,
  ) {
    const employeeCv = await this.cvService.exportCv(userId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${employeeCv.filename}`,
    );
    res.send(employeeCv.file);
  }
}
