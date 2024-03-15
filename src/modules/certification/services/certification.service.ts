import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import { validateYearRange } from '../../../common/utils';
import { Order } from '../../../constants';
import { ErrorCode, InvalidBadRequestException } from '../../../exceptions';
import { DateProvider } from '../../../providers';
import { ValidatorService } from '../../../shared/services/validator.service';
import type { CertificationDto } from '../dtos/certification.dto';
import { CreateCertificationDto } from '../dtos/create-certification.dto';
import type { UpdateCertificationDto } from '../dtos/update-certification.dto';
import type { UpdateCertificationPositionDto } from '../dtos/update-certification-position.dto';
import { CertificationEntity } from '../entities/certification.entity';
import CertificationMapper from '../mappers/certification.mapper';

@Injectable()
export class CertificationService {
  constructor(
    @InjectRepository(CertificationEntity)
    private readonly certificationRepository: Repository<CertificationEntity>,
    private readonly certificationMapper: CertificationMapper,
    private readonly validatorService: ValidatorService,
  ) {}

  async getCertificationsByUserId(userId: number): Promise<CertificationDto[]> {
    const certifications = await this.getCertificationEntitiesByUserId(userId);

    return certifications.toDtos();
  }

  async getSelectedCertificationsByUserId(
    userId: number,
  ): Promise<CertificationEntity[]> {
    return this.certificationRepository.find({
      where: { user: { id: userId }, isSelected: true },
      order: { position: { direction: 'ASC' } },
    });
  }

  @Transactional()
  async createCertification(
    userId: number,
    createCertification: CreateCertificationDto,
  ): Promise<CertificationDto> {
    this.validateCertificationBeforeCreateOrUpdate(createCertification);

    const certificationEntity =
      await this.certificationMapper.toCertificationEntity(
        userId,
        createCertification,
      );

    await this.incrementExistingCertificationPositions(userId);

    const newCertification =
      await this.certificationRepository.save(certificationEntity);

    return newCertification.toDto();
  }

  @Transactional()
  async updateCertificationPositions(
    userId: number,
    updatePositions: UpdateCertificationPositionDto[],
  ): Promise<CertificationDto[]> {
    const currentCertifications =
      await this.getCertificationEntitiesByUserId(userId);

    this.validateCertificationPositions(currentCertifications, updatePositions);

    const updatedCertifications = currentCertifications.map((certification) => {
      const updatePosition = updatePositions.find(
        (position) => position.certificationId === certification.id,
      );

      if (updatePosition) {
        certification.position = updatePosition.position;
      }

      return certification;
    });

    await this.certificationRepository.save(updatedCertifications);

    return updatedCertifications.toDtos();
  }

  private validateCertificationBeforeCreateOrUpdate(
    createCertification: CreateCertificationDto | UpdateCertificationDto,
  ): void {
    if (createCertification.credentialUrl) {
      this.validateCredentialUrl(createCertification.credentialUrl);
    }

    this.validateYearRange(createCertification.issueDate);
    this.validateYearRange(createCertification.expirationDate);

    this.validateIssueAndExpirationDates(
      createCertification.issueDate,
      createCertification.expirationDate,
    );
  }

  private validateYearRange(date: Date | null): void {
    if (date) {
      validateYearRange(date);
    }
  }

  private validateIssueAndExpirationDates(
    issueDate: Date | null,
    expirationDate: Date | null,
  ): void {
    if (issueDate && expirationDate) {
      const extractedIssueDate = DateProvider.extractDateFrom(issueDate);
      const extractedExpirationDate =
        DateProvider.extractDateTo(expirationDate);

      if (extractedExpirationDate < extractedIssueDate) {
        throw new BadRequestException(
          'Date Expired cannot be earlier than Date Issued.',
        );
      }
    }
  }

  private validateCertificationPositions(
    currentCertifications: CertificationEntity[],
    updatePositions: UpdateCertificationPositionDto[],
  ): void {
    const uniquePositions = new Set<number>();

    for (const updatePosition of updatePositions) {
      if (uniquePositions.has(updatePosition.position)) {
        throw new BadRequestException(
          `Duplicate position ${updatePosition.position} found for user ID ${currentCertifications[0].user.id} in the update request`,
        );
      } else {
        uniquePositions.add(updatePosition.position);
      }

      const matchingCertification = currentCertifications.find(
        (certification) => certification.id === updatePosition.certificationId,
      );

      if (!matchingCertification) {
        throw new BadRequestException(
          `Certification with ID ${updatePosition.certificationId} not found`,
        );
      }
    }
  }

  private async getCertificationEntitiesByUserId(
    userId: number,
  ): Promise<CertificationEntity[]> {
    return this.certificationRepository.find({
      where: { user: { id: userId } },
      order: {
        position: Order.ASC,
      },
    });
  }

  private async incrementExistingCertificationPositions(
    userId: number,
  ): Promise<void> {
    const existingCertifications = await this.certificationRepository.find({
      where: { user: { id: userId } },
    });

    if (existingCertifications.length > 0) {
      const updatedCertifications = existingCertifications.map(
        (certification) => {
          certification.position += 1;

          return certification;
        },
      );

      await this.certificationRepository.save(updatedCertifications);
    }
  }

  private validateCredentialUrl(credentialUrl: string): void {
    if (credentialUrl && !this.validatorService.isUrl(credentialUrl)) {
      throw new InvalidBadRequestException(
        ErrorCode.STRING_NOT_LINK_BAD_REQUEST,
      );
    }
  }

  private async getCertificationByIdAndUserIdOrThrow(
    id: number,
    userId: number,
  ): Promise<CertificationEntity> {
    const certification = await this.certificationRepository.findOne({
      where: { id, userId },
    });

    if (!certification) {
      throw new NotFoundException('Certification not found');
    }

    return certification;
  }

  updateCertifications(
    userId: number,
    updateCertificationDtos: UpdateCertificationDto[],
  ): Promise<CertificationDto[]> {
    return Promise.all(
      updateCertificationDtos.map(async (updateCertificationDto) => {
        this.validateCertificationBeforeCreateOrUpdate(updateCertificationDto);

        let certification = await this.getCertificationByIdAndUserIdOrThrow(
          updateCertificationDto.id,
          userId,
        );
        certification = this.certificationMapper.updateEntity(
          certification,
          updateCertificationDto,
        );

        const updatedCertification =
          await this.certificationRepository.save(certification);

        return updatedCertification.toDto();
      }),
    );
  }

  @Transactional()
  async deleteCertification(userId: number, id: number) {
    const certificationEntity = await this.getCertificationByIdAndUserIdOrThrow(
      id,
      userId,
    );
    const positionBeforeDelete = certificationEntity.position;

    await this.certificationRepository.remove(certificationEntity);

    await this.updateCertificationPositionsAfterDelete(
      userId,
      positionBeforeDelete,
    );
  }

  private async updateCertificationPositionsAfterDelete(
    userId: number,
    deletedPosition: number,
  ): Promise<void> {
    const existingCertifications = await this.certificationRepository.find({
      where: { user: { id: userId }, position: MoreThan(deletedPosition) },
    });

    if (existingCertifications.length > 0) {
      const updatedCertifications = existingCertifications.map(
        (certification) => {
          certification.position -= 1;

          return certification;
        },
      );

      await this.certificationRepository.save(updatedCertifications);
    }
  }

  async updateToggleCertification(
    userId: number,
    id: number,
  ): Promise<CertificationDto> {
    const certification = await this.certificationRepository.findOne({
      where: { id, userId },
    });

    if (!certification) {
      throw new NotFoundException('Certification not found');
    }

    certification.isSelected = !certification.isSelected;

    const updatedCertification =
      await this.certificationRepository.save(certification);

    return updatedCertification.toDto();
  }
}
