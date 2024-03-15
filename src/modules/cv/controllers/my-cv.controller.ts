import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { RoleType } from '../../../constants';
import { Auth, AuthUser } from '../../../decorators';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { UserEntity } from '../../user/entities/user.entity';
import { CvService } from '../services/cv.service';

@Controller('my-cvs')
@ApiTags('my-cvs')
@UseGuards(JwtAuthGuard)
export class MyCvController {
  constructor(private readonly cvService: CvService) {}

  @Get('export-pdf')
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Export my cv with pdf type',
  })
  async exportMyCv(@AuthUser() user: UserEntity, @Res() res: Response) {
    const employeeCv = await this.cvService.exportCv(user.id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${employeeCv.filename}`,
    );
    res.send(employeeCv.file);
  }
}
