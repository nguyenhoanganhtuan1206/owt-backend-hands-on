import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { differenceInBusinessDays } from 'date-fns';
import type { SelectQueryBuilder } from 'typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import type { PageDto } from '../../../common/dto/page.dto';
import {
  DateType,
  GenderType,
  Order,
  RequestStatusType,
  TOTAL_WORK_DAYS_IN_YEAR,
} from '../../../constants';
import {
  ErrorCode,
  InvalidBadRequestException,
  InvalidNotFoundException,
} from '../../../exceptions';
import MailService from '../../../integrations/mail/mail.service';
import { Mail, Recipient } from '../../../integrations/mail/models';
import { DateProvider } from '../../../providers';
import { AwsS3Service } from '../../../shared/services/aws-s3.service';
import { ExternalUserAccessDto } from '../../auth/dto/ExternalUserAccessDto';
import { AuthService } from '../../auth/services/auth.service';
import { UserEntity } from '../../user/entities/user.entity';
import { UserService } from '../../user/services/user.service';
import { AllowanceDto } from '../../vacation-balance/dtos/allowance.dto';
import { CreateTimeOffRequestDto } from '../dtos/create-time-off-request.dto';
import type { TimeOffRequestDto } from '../dtos/time-off-request.dto';
import { TimeOffRequestPageMeta } from '../dtos/time-off-request-page-meta.dto';
import type { TimeOffRequestsPageOptionsDto } from '../dtos/time-off-requests-page-options.dto';
import { UpdateTimeOffRequestDto } from '../dtos/update-time-off-request-dto';
import { TimeOffRequestEntity } from '../entities/time-off-request.entity';
import TimeOffRequestMapper from '../mapper/time-off-request.mapper';
import TimeOffRequestValidator from '../validators/time-off-request.validator';

@Injectable()
export class TimeOffRequestService {
  constructor(
    @InjectRepository(TimeOffRequestEntity)
    private timeOffRequestRepository: Repository<TimeOffRequestEntity>,
    private readonly timeOffRequestMapper: TimeOffRequestMapper,
    private readonly timeOffRequestValidator: TimeOffRequestValidator,
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly authService: AuthService,
    private readonly s3Service: AwsS3Service,
  ) {}

  async getTimeOffRequests(
    userId: number,
    pageOptionsDto: TimeOffRequestsPageOptionsDto,
  ): Promise<PageDto<TimeOffRequestDto>> {
    const user = await this.userService.findUserById(userId);

    const queryBuilder = this.getTimeOffRequestQueryBuilder(pageOptionsDto);

    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

    const allowanceDto = await this.calculateAllowanceUser(user);

    const pageMeta = new TimeOffRequestPageMeta({
      pageOptionsDto,
      itemCount: pageMetaDto.itemCount,
      allowance: allowanceDto,
    });

    return items.toPageDto(pageMeta);
  }

  async getAllTimeOffRequests(
    pageOptionsDto: TimeOffRequestsPageOptionsDto,
  ): Promise<PageDto<TimeOffRequestDto>> {
    const queryBuilder = this.getTimeOffRequestQueryBuilder(pageOptionsDto);

    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

    return items.toPageDto(pageMetaDto);
  }

  async getTimeOffRequestDetails(
    timeOffRequestId: number,
    userId?: number,
  ): Promise<TimeOffRequestDto> {
    let timeOffRequestEntity =
      await this.findTimeOffRequestById(timeOffRequestId);

    if (userId) {
      timeOffRequestEntity = await this.findTimeOffRequestByIdAndUserId(
        userId,
        timeOffRequestId,
      );
    }

    return this.getTimeOffRequestWithAllowance(timeOffRequestEntity);
  }

  async getAccruedBalance(userId: number): Promise<number> {
    const user = await this.userService.findUserById(userId);
    const totalWorkDaysInYear = TOTAL_WORK_DAYS_IN_YEAR;
    const startOfCurrentDay = new Date();
    startOfCurrentDay.setUTCHours(0, 0, 0, 0);

    const currentYear = startOfCurrentDay.getUTCFullYear();
    let fullYearBalance = user.yearlyAllowance;

    if (user.startDate && user.startDate.getUTCFullYear() >= currentYear) {
      user.startDate.setUTCHours(0, 0, 0, 0);

      const workDaysToEndYearDate = differenceInBusinessDays(
        new Date(Date.UTC(currentYear, 11, 31)),
        user.startDate,
      );
      fullYearBalance =
        (user.yearlyAllowance / totalWorkDaysInYear) * workDaysToEndYearDate;
    }

    const startOfYear = new Date(Date.UTC(currentYear, 0, 1));
    const workDaysToDate = differenceInBusinessDays(
      startOfCurrentDay,
      startOfYear,
    );

    const lastYearBalance = await this.getLastYearBalance(user.id);

    return (
      (fullYearBalance / totalWorkDaysInYear) * workDaysToDate + lastYearBalance
    );
  }

  private async getLastYearBalance(userId: number): Promise<number> {
    const lastYearBalanceUser = await this.timeOffRequestRepository.findOne({
      where: {
        status: RequestStatusType.BALANCE,
        user: { id: userId },
      },
    });

    return lastYearBalanceUser ? lastYearBalanceUser.totalDays : 0;
  }

  private async getTimeOffRequestWithAllowance(
    timeOffRequest: TimeOffRequestEntity,
  ): Promise<TimeOffRequestDto> {
    const allowance = await this.calculateAllowanceUser(timeOffRequest.user);

    const timeOffRequestDto = timeOffRequest.toDto();

    timeOffRequestDto.allowance = allowance;

    return timeOffRequestDto;
  }

  async getTimeOffRequestDetailsByPM(
    externalToken: string,
  ): Promise<TimeOffRequestDto> {
    const userAuthentication = this.authService.decodeToken(externalToken);

    if (!userAuthentication) {
      throw new UnauthorizedException(
        'Invalid or missing authentication token.',
      );
    }

    const timeOffRequestEntity = await this.findTimeOffRequestById(
      userAuthentication.timeOffRequestId,
    );

    return timeOffRequestEntity.toDto();
  }

  @Transactional()
  async createTimeOffRequest(
    user: UserEntity,
    createTimeOffRequestDto: CreateTimeOffRequestDto,
  ): Promise<TimeOffRequestDto> {
    this.timeOffRequestValidator.validateTimeOffRequestDate(
      createTimeOffRequestDto.dateFrom,
      createTimeOffRequestDto.dateTo,
      createTimeOffRequestDto.dateType,
    );

    if (createTimeOffRequestDto.dateType !== DateType.HALF_DAY.toString()) {
      this.timeOffRequestValidator.validateTimeOffRequestTotalDays(
        createTimeOffRequestDto.dateFrom,
        createTimeOffRequestDto.dateTo,
        createTimeOffRequestDto.totalDays,
      );
    }

    const timeOffRequestEntity =
      await this.timeOffRequestMapper.toTimeOffRequestEntity(
        user.id,
        createTimeOffRequestDto,
      );

    timeOffRequestEntity.status = RequestStatusType.PENDING;

    const createdTimeOffRequest =
      await this.timeOffRequestRepository.save(timeOffRequestEntity);

    return createdTimeOffRequest.toDto();
  }

  @Transactional()
  async approveTimeOffRequestByAdminOrAssistant(
    timeOffRequestId: number,
    updateTimeOffRequestDto: UpdateTimeOffRequestDto,
  ): Promise<TimeOffRequestDto> {
    return this.confirmTimeOffRequestByAdminOrAssistant(
      timeOffRequestId,
      updateTimeOffRequestDto,
      RequestStatusType.APPROVED,
    );
  }

  @Transactional()
  async approveTimeOffRequestByPM(
    externalAccess: ExternalUserAccessDto,
  ): Promise<TimeOffRequestDto> {
    return this.confirmTimeOffRequestByPM(
      externalAccess,
      RequestStatusType.APPROVED,
    );
  }

  @Transactional()
  async refuseTimeOffRequestByAdminOrAssistant(
    timeOffRequestId: number,
    updateTimeOffRequestDto: UpdateTimeOffRequestDto,
  ): Promise<TimeOffRequestDto> {
    return this.confirmTimeOffRequestByAdminOrAssistant(
      timeOffRequestId,
      updateTimeOffRequestDto,
      RequestStatusType.REFUSED,
    );
  }

  @Transactional()
  async refuseTimeOffRequestByPM(
    externalAccess: ExternalUserAccessDto,
  ): Promise<TimeOffRequestDto> {
    return this.confirmTimeOffRequestByPM(
      externalAccess,
      RequestStatusType.REFUSED,
    );
  }

  @Transactional()
  async deleteTimeOffRequest(
    userId: number,
    timeOffRequestId: number,
  ): Promise<void> {
    const timeOffRequestEntity = await this.findTimeOffRequestByIdAndUserId(
      userId,
      timeOffRequestId,
    );

    this.timeOffRequestValidator.validateTimeOffRequestIsPending(
      timeOffRequestEntity.status,
    );

    if (timeOffRequestEntity.attachedFile) {
      await this.s3Service.deleteFile(timeOffRequestEntity.attachedFile);
    }

    await this.timeOffRequestRepository.remove(timeOffRequestEntity);
  }

  @Transactional()
  async attachFileRequest(userId: number, requestId: number, url: string) {
    const timeOffRequest = await this.findTimeOffRequestByIdAndUserId(
      userId,
      requestId,
    );

    timeOffRequest.attachedFile = url;
    await this.timeOffRequestRepository.save(timeOffRequest);
  }

  @Transactional()
  private async confirmTimeOffRequestByAdminOrAssistant(
    timeOffRequestId: number,
    updateTimeOffRequestDto: UpdateTimeOffRequestDto,
    status: RequestStatusType,
  ): Promise<TimeOffRequestDto> {
    let timeOffRequestEntity =
      await this.findTimeOffRequestById(timeOffRequestId);

    this.timeOffRequestValidator.validateTimeOffRequestStatus(
      timeOffRequestEntity,
    );

    timeOffRequestEntity =
      await this.timeOffRequestMapper.toTimeOffRequestEntityToUpdate(
        timeOffRequestEntity,
        updateTimeOffRequestDto,
      );

    timeOffRequestEntity.status = status;

    // TODO: will be minus taken dayoffs

    const updateTimeOffEntity =
      await this.timeOffRequestRepository.save(timeOffRequestEntity);

    this.sendMailToEmployee('Manager', updateTimeOffEntity);

    return updateTimeOffEntity.toDto();
  }

  @Transactional()
  private async confirmTimeOffRequestByPM(
    externalAccess: ExternalUserAccessDto,
    status: RequestStatusType,
  ): Promise<TimeOffRequestDto> {
    const userAuthentication = this.authService.decodeToken(
      externalAccess.accessToken,
    );

    if (!userAuthentication) {
      throw new UnauthorizedException(
        'Invalid or missing authentication token.',
      );
    }

    const timeOffRequestEntity = await this.findTimeOffRequestById(
      userAuthentication.timeOffRequestId,
    );

    this.timeOffRequestValidator.validateTimeOffRequestStatus(
      timeOffRequestEntity,
    );

    timeOffRequestEntity.status = status;
    timeOffRequestEntity.pmNote = externalAccess.pmNote;

    // TODO: will be minus taken dayoffs

    const updateTimeOffEntity =
      await this.timeOffRequestRepository.save(timeOffRequestEntity);

    this.sendMailToEmployee('PM', updateTimeOffEntity);

    return updateTimeOffEntity.toDto();
  }

  async sendEmailToPM(
    timeOffRequestId: number,
    updateTimeOffRequestDto: UpdateTimeOffRequestDto,
  ): Promise<TimeOffRequestDto> {
    let timeOffRequest = await this.findTimeOffRequestById(timeOffRequestId);
    const userRequest = timeOffRequest.user;

    this.timeOffRequestValidator.validateTimeOffRequestStatus(timeOffRequest);

    timeOffRequest =
      await this.timeOffRequestMapper.toTimeOffRequestEntityToUpdate(
        timeOffRequest,
        updateTimeOffRequestDto,
      );

    timeOffRequest.status = RequestStatusType.PROCESSING;

    const newTimeOffRequest =
      await this.timeOffRequestRepository.save(timeOffRequest);

    const timeOffRequestUrl =
      await this.createTimeOffRequestUrl(timeOffRequestId);

    this.sendConfirmationEmailToPM(
      timeOffRequest,
      userRequest,
      timeOffRequestUrl,
    );

    return newTimeOffRequest.toDto();
  }

  async getPendingTimeOffRequestsCount(): Promise<number> {
    const queryBuilderTimeOff = this.timeOffRequestRepository
      .createQueryBuilder('timeOffRequest')
      .where('timeOffRequest.status = :status', {
        status: RequestStatusType.PENDING,
      });

    return queryBuilderTimeOff.getCount();
  }

  async getPendingTimeOffRequestsCountForUser(userId: number): Promise<number> {
    const queryBuilderTimeOffRequest = this.timeOffRequestRepository
      .createQueryBuilder('timeOffRequest')
      .where('timeOffRequest.status = :status', {
        status: RequestStatusType.PENDING,
      })
      .andWhere('timeOffRequest.user_id = :userId', { userId });

    return queryBuilderTimeOffRequest.getCount();
  }

  private sendConfirmationEmailToPM(
    timeOffRequest: TimeOffRequestEntity,
    userRequest: UserEntity,
    timeOffRequestUrl: string,
  ) {
    if (!timeOffRequest.collaborator) {
      throw new InvalidBadRequestException(
        ErrorCode.CANNOT_SEND_EMAIL_TO_PM_WHEN_EMAIL_PM_IS_EMPTY,
      );
    }

    const variables = new Map<string, string>();
    variables.set(
      'pmName',
      `${timeOffRequest.collaborator.collaboratorFirstName} ${timeOffRequest.collaborator.collaboratorLastName}`,
    );
    variables.set(
      'fullName',
      `${userRequest.firstName} ${userRequest.lastName}`,
    );
    variables.set('companyEmail', `${userRequest.companyEmail}`);
    variables.set('trigram', `${userRequest.trigram ?? 'N/A'}`);
    variables.set('totalDays', `${timeOffRequest.totalDays}`);
    variables.set(
      'dateFrom',
      `${DateProvider.formatDate(timeOffRequest.dateFrom)}`,
    );
    variables.set(
      'dateTo',
      `${DateProvider.formatDate(timeOffRequest.dateTo)}`,
    );
    variables.set('details', `${timeOffRequest.details}`);
    variables.set('timeOffRequestUrl', timeOffRequestUrl);

    const ccRecipients: string[] = [];

    if (timeOffRequest.assistant) {
      ccRecipients.push(timeOffRequest.assistant.companyEmail);
    }

    this.sendEmail(
      timeOffRequest.collaborator.collaboratorEmail,
      ccRecipients.length > 0 ? ccRecipients : null,
      '[OWT VN] Time-Off Request',
      'pm_confirm_request',
      variables,
    );
  }

  private async createTimeOffRequestUrl(
    timeOffRequestId: number,
  ): Promise<string> {
    const timeOffRequestUrl = process.env.TIME_OFF_REQUEST_URL as string;
    const token = await this.authService.createExternalUserAccessTokenToPM({
      timeOffRequestId,
    });
    const accessToken = token.accessToken;

    return `${timeOffRequestUrl}?token=${accessToken}`;
  }

  @Transactional()
  async sendEmailToAssistant(
    timeOffRequestId: number,
    updateTimeOffRequestDto: UpdateTimeOffRequestDto,
  ): Promise<TimeOffRequestDto> {
    let timeOffRequest = await this.findTimeOffRequestById(timeOffRequestId);
    const userRequest = timeOffRequest.user;

    timeOffRequest =
      await this.timeOffRequestMapper.toTimeOffRequestEntityToUpdate(
        timeOffRequest,
        updateTimeOffRequestDto,
      );

    if (!timeOffRequest.assistant) {
      throw new InvalidBadRequestException(
        ErrorCode.CANNOT_SEND_EMAIL_TO_ASSISTANT_WHEN_EMAIL_ASSISTANT_IS_EMPTY,
      );
    }

    this.timeOffRequestValidator.validateTimeOffRequestStatus(timeOffRequest);

    const assistant = await this.userService.findUserByCompanyEmail(
      timeOffRequest.assistant.companyEmail,
    );

    timeOffRequest.status = RequestStatusType.ASSISTANT;

    const newTimeOffRequest =
      await this.timeOffRequestRepository.save(timeOffRequest);

    this.sendConfirmationEmailToAssistant(
      timeOffRequest,
      userRequest,
      assistant,
    );

    return newTimeOffRequest.toDto();
  }

  private sendConfirmationEmailToAssistant(
    timeOffRequest: TimeOffRequestEntity,
    userRequest: UserEntity,
    assistant: UserEntity,
  ) {
    const variables = new Map<string, string>();
    variables.set(
      'gender',
      assistant.gender === GenderType.MALE ? 'Mr.' : 'Ms.',
    );
    variables.set(
      'fullNameAssistant',
      `${assistant.firstName} ${assistant.lastName}`,
    );
    variables.set(
      'fullNameUser',
      `${userRequest.firstName} ${userRequest.lastName}`,
    );
    variables.set('companyEmail', `${userRequest.companyEmail}`);
    variables.set('trigram', `${userRequest.trigram ?? 'N/A'}`);
    variables.set('totalDays', `${timeOffRequest.totalDays}`);
    variables.set(
      'dateFrom',
      `${DateProvider.formatDate(timeOffRequest.dateFrom)}`,
    );
    variables.set(
      'dateTo',
      `${DateProvider.formatDate(timeOffRequest.dateTo)}`,
    );
    variables.set('details', `${timeOffRequest.details}`);
    variables.set(
      'pmName',
      `${
        timeOffRequest.collaborator === null
          ? 'N/A'
          : `${timeOffRequest.collaborator.collaboratorFirstName} ${timeOffRequest.collaborator.collaboratorLastName}`
      }`,
    );
    variables.set(
      'pmMail',
      `${
        timeOffRequest.collaborator === null
          ? 'N/A'
          : timeOffRequest.collaborator.collaboratorEmail
      }`,
    );

    this.sendEmail(
      assistant.companyEmail,
      null,
      '[OWT VN] Time-Off Request',
      'assistant_confirm_request',
      variables,
    );
  }

  private sendEmail(
    to: string,
    cc: string[] | null,
    subject: string,
    template: string,
    variables: Map<string, string>,
  ) {
    const mail = new Mail();
    const toRecipient = new Recipient(to);

    if (cc && cc.length > 0) {
      const ccRecipients = cc.map((recipient) => new Recipient(recipient));
      mail.cc = ccRecipients;
    }

    mail.to = toRecipient;
    mail.subject = subject;
    mail.template = template;
    mail.variables = variables;

    this.mailService.send(mail);
  }

  private sendMailToEmployee(
    reviewedBy: string,
    timeOffRequest: TimeOffRequestEntity,
  ) {
    const toRecipient = timeOffRequest.user.companyEmail;
    const status = timeOffRequest.status;

    const variables = new Map<string, string>();
    variables.set(
      'gender',
      `${timeOffRequest.user.gender === GenderType.MALE ? 'Mr.' : 'Ms.'}`,
    );
    variables.set(
      'fullName',
      `${timeOffRequest.user.firstName} ${timeOffRequest.user.lastName}`,
    );
    variables.set('totalDays', `${timeOffRequest.totalDays}`);
    variables.set(
      'dateFrom',
      `${DateProvider.formatDate(timeOffRequest.dateFrom)}`,
    );
    variables.set(
      'dateTo',
      `${DateProvider.formatDate(timeOffRequest.dateTo)}`,
    );
    variables.set('details', `${timeOffRequest.details}`);
    variables.set(
      'createdAt',
      `${DateProvider.formatDateUTC(timeOffRequest.createdAt)}`,
    );
    variables.set(
      'status',
      `${status.charAt(0) + status.slice(1).toLowerCase()}`,
    );
    variables.set(
      'updatedAt',
      `${DateProvider.formatDateUTC(timeOffRequest.updatedAt)}`,
    );

    const note = timeOffRequest.pmNote ?? timeOffRequest.adminNote ?? null;

    variables.set('note', note === null ? 'N/A' : note);

    variables.set('reviewer', `${reviewedBy}`);

    const ccRecipients: string[] = [];

    if (timeOffRequest.assistant) {
      ccRecipients.push(timeOffRequest.assistant.companyEmail);
    }

    this.sendEmail(
      toRecipient,
      ccRecipients.length > 0 ? ccRecipients : null,
      '[OWT VN] Time-Off Request',
      'confirm_time_off_request',
      variables,
    );
  }

  private async findTimeOffRequestById(
    id: number,
  ): Promise<TimeOffRequestEntity> {
    const timeOffRequestEntity = await this.timeOffRequestRepository.findOneBy({
      id,
    });

    if (!timeOffRequestEntity) {
      throw new InvalidNotFoundException(
        ErrorCode.TIME_OFF_REQUEST_NOT_EXISTED,
      );
    }

    return timeOffRequestEntity;
  }

  async calculateAllowanceUser(user: UserEntity): Promise<AllowanceDto> {
    const currentUser = user;
    const totalAllowance = currentUser.yearlyAllowance;

    const approvedTimeOffRequests: TimeOffRequestEntity[] =
      await this.timeOffRequestRepository
        .createQueryBuilder('timeOffRequest')
        .where('timeOffRequest.user.id = :id', { id: currentUser.id })
        .andWhere('timeOffRequest.status = :status', {
          status: RequestStatusType.APPROVED,
        })
        .getMany();

    const allowanceDto = new AllowanceDto(totalAllowance);
    const taken: number = approvedTimeOffRequests.reduce(
      (totalDays, request) => totalDays + request.totalDays,
      0,
    );
    const balance: number = totalAllowance - taken;

    allowanceDto.user = user;
    allowanceDto.taken = taken;
    allowanceDto.balance = balance;

    return allowanceDto;
  }

  private async findTimeOffRequestByIdAndUserId(
    userId: number,
    timeOffRequestId: number,
  ): Promise<TimeOffRequestEntity> {
    const timeOffRequest = await this.timeOffRequestRepository.findOne({
      where: {
        id: timeOffRequestId,
        user: { id: userId },
      },
    });

    if (!timeOffRequest) {
      throw new InvalidNotFoundException(
        ErrorCode.TIME_OFF_REQUEST_NOT_EXISTED,
      );
    }

    return timeOffRequest;
  }

  private getTimeOffRequestQueryBuilder(
    pageOptionsDto: TimeOffRequestsPageOptionsDto,
  ): SelectQueryBuilder<TimeOffRequestEntity> {
    const { userIds, dateFrom, dateTo, statuses } = pageOptionsDto;

    const queryBuilder = this.timeOffRequestRepository
      .createQueryBuilder('timeOffRequest')
      .addSelect(
        "CASE WHEN (timeOffRequest.status = 'PENDING') THEN 5 " +
          "WHEN (timeOffRequest.status = 'ASSISTANT') THEN 4 " +
          "WHEN (timeOffRequest.status = 'PROCESSING') THEN 3 " +
          "WHEN (timeOffRequest.status = 'APPROVED') THEN 2 " +
          "WHEN (timeOffRequest.status = 'REFUSED') THEN 1 " +
          'ELSE 0 END ',
        'status_order',
      )
      .leftJoinAndSelect('timeOffRequest.user', 'user')
      .leftJoinAndSelect('user.position', 'position')
      .leftJoinAndSelect('user.level', 'userLevel')
      .leftJoinAndSelect('user.permissions', 'permissions');

    if (userIds) {
      queryBuilder.andWhere('timeOffRequest.user.id in (:...userIds)', {
        userIds,
      });
    }

    if (dateFrom && dateTo) {
      queryBuilder.andWhere(
        `(
            (timeOffRequest.date_from BETWEEN :dateFrom AND :dateTo) OR
            (timeOffRequest.date_to BETWEEN :dateFrom AND :dateTo) OR
            (:dateFrom > timeOffRequest.date_from AND :dateTo < timeOffRequest.date_to) OR
            (:dateFrom < timeOffRequest.date_from AND :dateTo > timeOffRequest.date_to) 
        )`,
        { dateFrom, dateTo },
      );
    }

    if (statuses?.length) {
      queryBuilder.andWhere('timeOffRequest.status IN (:...statuses)', {
        statuses,
      });
    }

    queryBuilder.orderBy('status_order', Order.DESC);
    queryBuilder.addOrderBy('timeOffRequest.dateFrom', Order.DESC);
    queryBuilder.addOrderBy('timeOffRequest.createdAt', Order.DESC);

    return queryBuilder;
  }
}
