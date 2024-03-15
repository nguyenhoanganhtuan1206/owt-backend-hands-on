import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { FindOptionsWhere, SelectQueryBuilder } from 'typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import type { PageDto } from '../../../common/dto/page.dto';
import { validateHash, validateUserEndDate } from '../../../common/utils';
import { Order, RoleType } from '../../../constants';
import {
  InvalidBadRequestException,
  InvalidNotFoundException,
} from '../../../exceptions';
import { ErrorCode } from '../../../exceptions/error-code';
import MailService from '../../../integrations/mail/mail.service';
import { Mail, Recipient } from '../../../integrations/mail/models';
import { TimeTrackingService } from '../../../modules/timekeeper/services/time-tracking.service';
import type { VacationBalancesPageOptionsDto } from '../../../modules/vacation-balance/dtos/vacation-balances-page-options.dto';
import { GeneratorProvider } from '../../../providers/generator.provider';
import type { OtherUsersPageOptionsDto } from '../../attendance/dtos/other-users-page-options.dto';
import { BuddyBuddeePairService } from '../../buddy-buddee-pair/services/buddy-buddee-pair.service';
import type { LevelDto } from '../dtos/level.dto';
import { PasswordDto } from '../dtos/password.dto';
import type { PositionDto } from '../dtos/position.dto';
import { UpdateCustomPositionDto } from '../dtos/update-custom-position.dto';
import type { UpdateIntroductionDto } from '../dtos/update-introduction.dto';
import UpdateProfileDto from '../dtos/update-profile.dto';
import UpdateUserDto from '../dtos/update-user.dto';
import type { UserDto } from '../dtos/user.dto';
import UserCreationDto from '../dtos/user-creation.dto';
import type { UsersPageOptionsDto } from '../dtos/users-page-options.dto';
import { LevelEntity } from '../entities/level.entity';
import { PermissionEntity } from '../entities/permission.entity';
import { PositionEntity } from '../entities/position.entity';
import { UserEntity } from '../entities/user.entity';
import UserMapper from '../mappers/user.mapper';

@Injectable()
export class UserService {
  private readonly allowedFieldsToSorting: Map<string, string> = new Map([
    ['startDate', 'user.startDate'],
    ['trigram', 'user.trigram'],
    ['gender', 'user.gender'],
    ['companyEmail', 'user.companyEmail'],
    ['dateOfBirth', 'user.dateOfBirth'],
    ['position', 'position.name'],
    ['level', 'level.label'],
  ]);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(PositionEntity)
    private readonly positionRepository: Repository<PositionEntity>,
    @InjectRepository(LevelEntity)
    private readonly levelRepository: Repository<LevelEntity>,
    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
    @Inject(forwardRef(() => BuddyBuddeePairService))
    private readonly buddyBuddeePairService: BuddyBuddeePairService,
    private readonly userMapper: UserMapper,
    private readonly mailService: MailService,
    private readonly timeTrackingService: TimeTrackingService,
  ) {}

  private readonly loginUserPageUrl: string = process.env.LOGIN_USER_PAGE_URL!;

  /**
   * Find single user
   */
  findOne(findData: FindOptionsWhere<UserEntity>): Promise<UserEntity | null> {
    return this.userRepository.findOneBy(findData);
  }

  async findByUsernameOrEmail(
    options: Partial<{ username: string; email: string }>,
  ): Promise<UserEntity | null> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (options.email) {
      queryBuilder.orWhere('user.email = :email', {
        email: options.email,
      });
    }

    if (options.username) {
      queryBuilder.orWhere('user.username = :username', {
        username: options.username,
      });
    }

    return queryBuilder.getOne();
  }

  @Transactional()
  async createUser(user: UserCreationDto): Promise<UserDto> {
    await this.verifyDataBeforeCreate(user);
    const userEntity = await this.userMapper.toUserEntity(user);

    // Generate password
    const generatedPassword = GeneratorProvider.generatePassword();
    // Set user data
    userEntity.password = generatedPassword;
    // Create
    const userEntityCreated = await this.userRepository.save(userEntity);

    // Update permissions
    await this.updateUserPermissions(userEntityCreated);

    // Send mail
    this.sendMailToCreatedUser(userEntityCreated, generatedPassword);

    return userEntityCreated.toDto();
  }

  private async updateUserPermissions(userEntity: UserEntity): Promise<void> {
    const permissionEntity = new PermissionEntity();

    permissionEntity.user = userEntity;
    permissionEntity.role = RoleType.USER;

    await this.permissionRepository.save(permissionEntity);

    userEntity.permissions = [permissionEntity];

    await this.userRepository.save(userEntity);
  }

  @Transactional()
  async updateUser(userId: number, user: UpdateUserDto): Promise<UserDto> {
    // Find existing user
    const existingUserEntity = await this.findUserById(userId);
    await this.verifyDataBeforeUpdate(existingUserEntity, user);

    // Copy changed value to existing
    const userEntityToUpdate = await this.userMapper.toUserEntityToUpdate(
      existingUserEntity,
      user,
    );

    // Update
    const userEntityUpdated =
      await this.userRepository.save(userEntityToUpdate);

    return userEntityUpdated.toDto();
  }

  @Transactional()
  async updateProfile(
    userId: number,
    profileUpdate: UpdateProfileDto,
  ): Promise<UserDto> {
    const existingUserEntity = await this.findUserById(userId);

    existingUserEntity.phoneNo = profileUpdate.phoneNo;
    existingUserEntity.address = profileUpdate.address;

    const updatedProfile = await this.userRepository.save(existingUserEntity);

    return updatedProfile.toDto();
  }

  async getUsers(
    pageOptionsDto: UsersPageOptionsDto,
  ): Promise<PageDto<UserDto>> {
    const queryBuilder = this.getUsersQueryBuilder(pageOptionsDto);

    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

    return items.toPageDto(pageMetaDto);
  }

  async getListAssistants(
    pageOptionsDto: UsersPageOptionsDto,
  ): Promise<PageDto<UserDto>> {
    const queryBuilder = this.getListAssistantsQueryBuilder(pageOptionsDto);

    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

    return items.toPageDto(pageMetaDto);
  }

  async getUsersWithoutPageDto(): Promise<UserDto[]> {
    const users = await this.getAllUsers();

    const buddyBuddeePairs =
      await this.buddyBuddeePairService.getAllBuddeePairs();

    return users.map((user) => {
      const isPairing = buddyBuddeePairs.some(
        (pair) => pair.buddee.id === user.id,
      );

      return { ...user, isPairing };
    });
  }

  async getUserById(userId: number): Promise<UserDto> {
    const userEntity = await this.findUserById(userId);

    return userEntity.toDto();
  }

  async findUsersByKeyword(keyword: string): Promise<UserDto[]> {
    let queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.position', 'position')
      .leftJoinAndSelect('user.level', 'level')
      .leftJoinAndSelect('user.permissions', 'permissions');

    if (keyword) {
      queryBuilder = queryBuilder.where(
        `LOWER(CONCAT(user.firstName, ' ', user.lastName)) LIKE LOWER(:keyword) OR LOWER(user.companyEmail) LIKE LOWER(:keyword)`,
        { keyword: `%${keyword}%` },
      );
    }

    const userEntity = await queryBuilder.getMany();

    return userEntity.toDtos();
  }

  async deactivatedUser(userId: number): Promise<void> {
    // Find existing user
    const existingUserEntity = await this.findUserById(userId);

    // Set user to deactivated
    existingUserEntity.isActive = false;

    // Update
    await this.userRepository.save(existingUserEntity);
  }

  @Transactional()
  async updateUserPhoto(userId: number, url: string) {
    const user = await this.findUserById(userId);

    user.photo = url;
    await this.userRepository.save(user);
  }

  @Transactional()
  async changePassword(
    userId: number,
    passwordDto: PasswordDto,
  ): Promise<void> {
    const existingUserEntity = await this.findUserById(userId);

    if (
      !(await validateHash(
        passwordDto.currentPassword,
        existingUserEntity.password,
      ))
    ) {
      throw new InvalidBadRequestException(
        ErrorCode.CURRENT_PASSWORD_NOT_MATCH,
      );
    }

    if (existingUserEntity.firstLogin) {
      existingUserEntity.firstLogin = false;
    }

    existingUserEntity.password = passwordDto.newPassword;

    await this.userRepository.save(existingUserEntity);
  }

  async findAllPositions(): Promise<PositionDto[]> {
    const positions = await this.positionRepository.find({
      order: {
        name: Order.ASC,
      },
    });

    return positions.toDtos();
  }

  async findAllLevels(): Promise<LevelDto[]> {
    const levels = await this.levelRepository.find({
      order: {
        label: Order.ASC,
      },
    });

    return levels.toDtos();
  }

  async findUserById(userId: number): Promise<UserEntity> {
    const userEntity = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.position', 'position')
      .leftJoinAndSelect('user.level', 'level')
      .leftJoinAndSelect('user.cvs', 'cvs')
      .leftJoinAndSelect('user.permissions', 'permissions')
      .leftJoinAndSelect('user.experiences', 'experiences')
      .leftJoinAndSelect('experiences.experienceSkills', 'experienceSkills')
      .leftJoinAndSelect('experienceSkills.skill', 'skill')
      .leftJoinAndSelect('user.educations', 'educations')
      .leftJoinAndSelect('user.certifications', 'certifications')
      .leftJoinAndSelect('user.employmentHistories', 'employmentHistories')
      .where('user.id = :userId', { userId })
      .getOne();

    if (!userEntity) {
      throw new InvalidNotFoundException(ErrorCode.USER_NOT_FOUND);
    }

    return userEntity;
  }

  async findUserByCompanyEmail(email: string): Promise<UserEntity> {
    const userEntity = await this.userRepository.findOneBy({
      companyEmail: email,
    });

    if (!userEntity) {
      throw new InvalidNotFoundException(ErrorCode.USER_NOT_FOUND);
    }

    return userEntity;
  }

  private sendMailToCreatedUser(user: UserEntity, generatedPassword: string) {
    const mail = new Mail();
    const toRecipient = new Recipient(user.companyEmail);
    // Setting variables
    const variables = new Map();
    variables.set('fullName', `${user.firstName} ${user.lastName}`);
    variables.set('loginUserPageUrl', this.loginUserPageUrl);
    variables.set('companyEmail', user.companyEmail);
    variables.set('password', generatedPassword);

    // Setting mail before send
    mail.to = toRecipient;
    mail.subject = '[OWT VN] Account activation';
    mail.template = 'new_user_created';
    mail.variables = variables;

    // Send mail
    this.mailService.send(mail);
  }

  @Transactional()
  async forgotPassword(email: string): Promise<void> {
    const existingUser = await this.findUserByEmail(email);

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const checkRoleUser = existingUser.permissions.every(
      (permission) => permission.role === RoleType.USER,
    );

    if (!checkRoleUser) {
      throw new InvalidBadRequestException(
        ErrorCode.CANNOT_REQUEST_FORGOT_PASSWORD_IF_NOT_USER,
      );
    }

    validateUserEndDate(existingUser.endDate);

    const newPassword = GeneratorProvider.generatePassword();

    existingUser.password = newPassword;

    await this.userRepository.save(existingUser);

    this.sendMailToUserRequestForgotPassword(existingUser, newPassword);
  }

  async getUsersInOffice(date: Date): Promise<UserEntity[]> {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.position', 'position')
      .leftJoinAndSelect('user.level', 'level')
      .leftJoinAndSelect('user.cvs', 'cvs')
      .leftJoinAndSelect('user.permissions', 'permissions')
      .leftJoinAndSelect('user.timeKeepers', 'timeKeepers')
      .andWhere('DATE(timeKeepers.time) = :date', { date })
      .getMany();
  }

  async getUsersWithWfhRequestApproved(date: Date): Promise<UserEntity[]> {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.position', 'position')
      .leftJoinAndSelect('user.level', 'level')
      .leftJoinAndSelect('user.permissions', 'permissions')
      .leftJoinAndSelect('user.wfhRequests', 'wfhRequests')
      .andWhere('wfhRequests.status = :status')
      .andWhere(
        '(:date BETWEEN wfhRequests.date_from AND wfhRequests.date_to)',
        {
          date,
          status: 'APPROVED',
        },
      )
      .getMany();
  }

  async getUsersWithTimeoffRequestApproved(date: Date): Promise<UserEntity[]> {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.position', 'position')
      .leftJoinAndSelect('user.level', 'userLevel')
      .leftJoinAndSelect('user.permissions', 'permissions')
      .leftJoinAndSelect('user.timeOffRequests', 'timeOffRequests')
      .andWhere('timeOffRequests.status = :status')
      .andWhere(
        '(:date BETWEEN timeOffRequests.date_from AND timeOffRequests.date_to)',
        {
          date,
          status: 'APPROVED',
        },
      )
      .getMany();
  }

  public getUserQueryBuilder(
    pageOptionsDto: OtherUsersPageOptionsDto,
  ): SelectQueryBuilder<UserEntity> {
    const { userIds, orderBy } = pageOptionsDto;

    const queryUserBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.position', 'position')
      .leftJoinAndSelect('user.level', 'level')
      .leftJoinAndSelect('user.cvs', 'cvs')
      .leftJoinAndSelect('user.permissions', 'permissions')
      .addSelect('UPPER(user.first_name)', 'upper_first_name')
      .addSelect('UPPER(user.last_name)', 'upper_last_name');

    if (userIds?.length) {
      queryUserBuilder.andWhere('user.id IN (:...userIds)', { userIds });
    }

    queryUserBuilder.orderBy('upper_first_name', orderBy);
    queryUserBuilder.addOrderBy('upper_last_name', orderBy);

    return queryUserBuilder;
  }

  private async getAllUsers(): Promise<UserDto[]> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.position', 'position')
      .leftJoinAndSelect('user.level', 'level')
      .leftJoinAndSelect('user.cvs', 'cvs')
      .leftJoinAndSelect('user.permissions', 'permissions')
      .orderBy('UPPER(user.firstName)', 'ASC')
      .addOrderBy('UPPER(user.lastName)', 'ASC')
      .addOrderBy('user.startDate', 'DESC')
      .getMany();

    return users.toDtos();
  }

  private async findUserByEmail(email: string): Promise<UserEntity> {
    const existingUserWithEmail = await this.userRepository.findOneBy({
      companyEmail: email,
    });

    if (!existingUserWithEmail) {
      throw new InvalidNotFoundException(ErrorCode.EMAIL_DOES_NOT_EXIST);
    }

    return existingUserWithEmail;
  }

  private sendMailToUserRequestForgotPassword(
    user: UserEntity,
    newPassword: string,
  ) {
    const mail = new Mail();
    const toRecipient = new Recipient(user.companyEmail);

    const variables = new Map();
    variables.set('fullName', `${user.firstName} ${user.lastName}`);
    variables.set('loginUserPageUrl', this.loginUserPageUrl);
    variables.set('newPassword', newPassword);

    mail.to = toRecipient;
    mail.subject = '[OWT VN] Reset Password';
    mail.template = 'forgot_password';
    mail.variables = variables;

    this.mailService.send(mail);
  }

  private async verifyDataBeforeCreate(user: UserCreationDto) {
    const existingUserWithEmail = await this.userRepository.findOneBy({
      companyEmail: user.companyEmail,
    });

    if (existingUserWithEmail) {
      throw new InvalidBadRequestException(ErrorCode.EMAIL_IS_EXISTED);
    }

    if (user.endDate && user.endDate < user.startDate) {
      throw new InvalidBadRequestException(ErrorCode.DATE_TO_BEFORE_DATE_FROM);
    }

    if (user.timekeeperUserId) {
      await this.verifyUserTimekeeper(user.timekeeperUserId);
    }
  }

  private async verifyDataBeforeUpdate(
    existingUserEntity: UserEntity,
    userToUpdateDto: UpdateUserDto,
  ): Promise<void> {
    if (
      userToUpdateDto.endDate &&
      userToUpdateDto.endDate < userToUpdateDto.startDate
    ) {
      throw new InvalidBadRequestException(ErrorCode.DATE_TO_BEFORE_DATE_FROM);
    }

    if (userToUpdateDto.companyEmail !== existingUserEntity.companyEmail) {
      const queryBuilder = this.userRepository
        .createQueryBuilder('user')
        .where(`user.id <> :userId AND user.companyEmail = :companyEmail`, {
          companyEmail: userToUpdateDto.companyEmail,
          userId: existingUserEntity.id,
        });

      const existingUserWithEmail = await queryBuilder.getOne();

      if (existingUserWithEmail) {
        throw new InvalidBadRequestException(ErrorCode.EMAIL_IS_EXISTED);
      }
    }

    if (
      userToUpdateDto.timekeeperUserId &&
      userToUpdateDto.timekeeperUserId !== existingUserEntity.timekeeperUserId
    ) {
      await this.verifyUserTimekeeper(userToUpdateDto.timekeeperUserId);
    }
  }

  private async verifyUserTimekeeper(timekeeperUserId: number) {
    const existingTimekeeperUserId = await this.userRepository.findOneBy({
      timekeeperUserId,
    });
    const userTimekeepers = await this.timeTrackingService.getUserTimekeepers();
    const isUserTimekeeperFound = userTimekeepers.some(
      (timekeeper) => timekeeper.timekeeperUserId === timekeeperUserId,
    );

    if (!isUserTimekeeperFound) {
      throw new InvalidNotFoundException(ErrorCode.USER_TIMEKEEPER_NOT_FOUND);
    }

    if (existingTimekeeperUserId) {
      throw new ConflictException('User timekeeper is existing');
    }
  }

  private getUsersQueryBuilder(
    usersPageOptionsDto: UsersPageOptionsDto,
  ): SelectQueryBuilder<UserEntity> {
    const {
      userIds,
      genders,
      emails,
      query,
      positionIds,
      levelIds,
      orderBy,
      sortColumn,
    } = usersPageOptionsDto;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.position', 'position')
      .leftJoinAndSelect('user.level', 'level')
      .leftJoinAndSelect('user.cvs', 'cvs')
      .leftJoinAndSelect('user.permissions', 'permissions')
      .addSelect(
        'CASE WHEN user.endDate IS NULL OR user.endDate > CURRENT_DATE THEN 0 ELSE 1 END',
        'end_date_order',
      )
      .addSelect('UPPER(user.first_name)', 'upper_first_name')
      .addSelect('UPPER(user.last_name)', 'upper_last_name');

    if (query) {
      queryBuilder.andWhere(
        [
          `LOWER(CONCAT(user.firstName, ' ', user.lastName)) LIKE LOWER(:query)`,
          `LOWER(user.companyEmail) LIKE LOWER(:query)`,
        ].join(' OR '),
        { query: `%${query}%` },
      );
    }

    if (userIds?.length) {
      queryBuilder.andWhere('user.id IN (:...userIds)', {
        userIds,
      });
    }

    if (genders?.length) {
      queryBuilder.andWhere('user.gender IN (:...genders)', {
        genders,
      });
    }

    if (emails?.length) {
      queryBuilder.andWhere('user.company_email IN (:...emails)', {
        emails,
      });
    }

    if (levelIds?.length) {
      queryBuilder.andWhere('user.level_id IN (:...levelIds)', {
        levelIds,
      });
    }

    if (positionIds?.length) {
      queryBuilder.andWhere('user.position_id IN (:...positionIds)', {
        positionIds,
      });
    }

    queryBuilder.orderBy('end_date_order', Order.ASC);

    const sort = this.allowedFieldsToSorting.get(sortColumn);

    if (sort) {
      queryBuilder.addOrderBy(sort, orderBy);
    }

    queryBuilder.addOrderBy(
      'upper_first_name',
      sortColumn === 'name' ? orderBy : Order.ASC,
    );
    queryBuilder.addOrderBy(
      'upper_last_name',
      sortColumn === 'name' ? orderBy : Order.ASC,
    );

    if (sortColumn !== 'startDate') {
      queryBuilder.addOrderBy('user.startDate', Order.DESC);
    }

    return queryBuilder;
  }

  private getListAssistantsQueryBuilder(
    usersPageOptionsDto: UsersPageOptionsDto,
  ): SelectQueryBuilder<UserEntity> {
    const { userIds, emails, orderBy } = usersPageOptionsDto;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.permissions', 'permissions')
      .andWhere('permissions.role = :role', { role: 'ASSISTANT' })
      .addSelect('UPPER(user.first_name)', 'upper_first_name')
      .addSelect('UPPER(user.last_name)', 'upper_last_name');

    if (userIds?.length) {
      queryBuilder.andWhere('user.id IN (:...userIds)', {
        userIds,
      });
    }

    if (emails?.length) {
      queryBuilder.andWhere('user.company_email IN (:...emails)', {
        emails,
      });
    }

    queryBuilder.orderBy('upper_first_name', orderBy);
    queryBuilder.addOrderBy('upper_last_name', orderBy);
    queryBuilder.addOrderBy('user.startDate', Order.DESC);

    return queryBuilder;
  }

  async updateIntroduction(
    userId: number,
    updateIntroductionDto: UpdateIntroductionDto,
  ): Promise<UserDto> {
    const existingUserEntity = await this.findUserById(userId);
    const { introduction } = updateIntroductionDto;
    existingUserEntity.introduction = introduction;

    const updatedUser = await this.userRepository.save(existingUserEntity);

    return updatedUser.toDto();
  }

  @Transactional()
  async updateCustomPosition(
    userId: number,
    updateCustomPositionDto: UpdateCustomPositionDto,
  ): Promise<UserDto> {
    const existingUserEntity = await this.findUserById(userId);
    const { customPosition } = updateCustomPositionDto;
    existingUserEntity.customPosition = customPosition;
    const updatedUser = await this.userRepository.save(existingUserEntity);

    return updatedUser.toDto();
  }

  public getVacationBalanceQueryBuilder(
    pageOptionsDto: VacationBalancesPageOptionsDto,
  ): SelectQueryBuilder<UserEntity> {
    const { userIds, orderBy } = pageOptionsDto;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.position', 'position')
      .leftJoinAndSelect('user.level', 'level')
      .leftJoinAndSelect('user.cvs', 'cvs')
      .leftJoinAndSelect('user.permissions', 'permissions')
      .addSelect('UPPER(user.first_name)', 'upper_first_name')
      .addSelect('UPPER(user.last_name)', 'upper_last_name');

    if (userIds?.length) {
      queryBuilder.andWhere('user.id IN (:...userIds)', {
        userIds,
      });
    }

    queryBuilder.orderBy('upper_first_name', orderBy);
    queryBuilder.addOrderBy('upper_last_name', orderBy);

    return queryBuilder;
  }

  async save(userEntity: UserEntity) {
    return this.userRepository.save(userEntity);
  }
}
