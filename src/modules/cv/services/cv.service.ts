/* eslint-disable unicorn/prefer-spread */
import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import * as handlebars from 'handlebars';
import path from 'path';
import * as puppeteer from 'puppeteer';

import { EmploymentHistoryService } from '../../../modules/employment-history/services/employment-history.service';
import { CertificationService } from '../../certification/services/certification.service';
import { EducationService } from '../../education/services/education.service';
import { ExperienceService } from '../../experience/services/experience.service';
import { SkillService } from '../../skill/services/skill.service';
import { UserService } from '../../user/services/user.service';

@Injectable()
export class CvService {
  constructor(
    private readonly educationService: EducationService,
    private readonly certificationService: CertificationService,
    private readonly experienceService: ExperienceService,
    private readonly userService: UserService,
    private readonly skillService: SkillService,
    private readonly employmentHistoryService: EmploymentHistoryService,
  ) {
    handlebars.registerHelper('for', function (start, end, block) {
      let accum = '';

      for (let i = start; i <= end; i++) {
        accum += block.fn(i);
      }

      return accum;
    });

    handlebars.registerHelper('subtract', function (a, b) {
      return a - b;
    });

    handlebars.registerHelper(
      'formatDate',
      function (date: string | number | Date) {
        const options: Intl.DateTimeFormatOptions = {
          month: 'short',
          year: 'numeric',
        };

        return new Date(date).toLocaleDateString('en-US', options);
      },
    );
  }

  async exportCv(userId: number): Promise<{ file: Buffer; filename: string }> {
    const user = await this.userService.getUserById(userId); // need to check if user exists or not first
    const educations =
      await this.educationService.getSelectedEducationsByUserId(userId);
    const certifications =
      await this.certificationService.getSelectedCertificationsByUserId(userId);
    const experiences =
      await this.experienceService.getSelectedExperiencesByUserId(userId);
    const useSkills =
      await this.skillService.getSelectedUserSkillsByUserId(userId);
    const employmentHistories =
      await this.employmentHistoryService.getSelectedEmploymentHistoriesByUserId(
        userId,
      );
    const browser = await puppeteer.launch({
      headless: 'new',
      executablePath: process.env.CHROMIUM_PATH,
      args: ['--no-sandbox', '--disable-gpu'],
    });
    const page = await browser.newPage();

    const employeeData = {
      user,
      employmentHistories,
      experiences,
      educations,
      certifications,
      userSkills: useSkills,
      logoBase64String: this.convertLogoToBase64(),
      position:
        user.customPosition ??
        (user.level && user.position
          ? user.level.label + ' ' + user.position.name
          : ''),
    };

    const template = this.compileTemplate('cv.hbs');
    const html = template(employeeData);

    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('screen');

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '50px', bottom: '50px' },
    });

    await browser.close();

    return {
      file: pdfBuffer,
      filename: `CV-${
        user.firstName ? user.firstName.replace(/ /g, '-') : ''
      }-${user.lastName ? user.lastName.replace(/ /g, '-') : ''}.pdf`,
    };
  }

  private compileTemplate(templatePath: string) {
    const fullPath = path.join(__dirname, templatePath);
    const templateString = readFileSync(fullPath, 'utf8');

    return handlebars.compile(templateString);
  }

  private convertLogoToBase64(): string {
    return readFileSync(path.join(__dirname, 'logo.png')).toString('base64');
  }
}
