import { ErrorCode } from './error-code';

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.USER_NOT_FOUND]: 'User not found',
  [ErrorCode.TRAINING_NOT_FOUND]: 'Training not found',
  [ErrorCode.TRAINING_TOPIC_NOT_FOUND]: 'Training topic not found',
  [ErrorCode.TRAINING_LEVEL_NOT_FOUND]: 'Training level not found',
  [ErrorCode.STRING_NOT_LINK_BAD_REQUEST]: 'String not link bad request',
  [ErrorCode.PAGE_TYPE_BAD_REQUEST]: 'Page type bad request',
  [ErrorCode.FILE_NOT_IMAGE_BAD_REQUEST]: 'File not image bad request',
  [ErrorCode.CURRENT_PASSWORD_NOT_MATCH]: 'Current password is not match',
  [ErrorCode.PASSWORD_IS_NOT_STRONG]: 'Password is not strong enough',
  [ErrorCode.USERNAME_PASSWORD_INVALID]:
    'Invalid username or password. Please try again.',
  [ErrorCode.DURATION_LIMIT_BAD_REQUEST]:
    'You have reached the maximum 8 training hours for this day.',
  [ErrorCode.TRAINING_DATE_BAD_REQUEST]:
    'Can not select the date after the current date.',
  [ErrorCode.EMAIL_DOES_NOT_EXIST]: 'Email does not exist.',
  [ErrorCode.EMAIL_IS_EXISTED]: 'Email is existed.',
  [ErrorCode.POSITION_DOES_NOT_EXIST]: 'Position does not exist.',
  [ErrorCode.TRAINING_CAN_NOT_BE_CHANGED]:
    'Cannot delete or update the report after one week from the reported date',
  [ErrorCode.LEVEL_DOES_NOT_EXIST]: 'Level does not exist',
  [ErrorCode.DATE_TO_BEFORE_DATE_FROM]:
    'Date To cannot be earlier than Date From.',
  [ErrorCode.INVALID_HALF_DAY_SELECTION_WHEN_FROM_AND_TO_DIFFERENT]:
    'Cannot select Half Day if date from and date to are different',
  [ErrorCode.TIME_OFF_TYPE_REQUEST_NOT_FOUND]:
    'Time-off type request not found',
  [ErrorCode.TIME_OFF_REQUEST_NOT_EXISTED]: 'The request has no longer existed',
  [ErrorCode.WFH_REQUEST_NOT_FOUND]: 'Wfh request not found',
  [ErrorCode.COACHES_TRAINING_CANNOT_EXCEED_THREE]:
    'Coaches in a training cannot exceed 3',
  [ErrorCode.CANNOT_COACH_SAME_USER_FROM_TRAINING]:
    'Cannot coach the same user from the training',
  [ErrorCode.COACHES_IN_TRAINING_CANNOT_DUPLICATED]:
    'Coaches in one training cannot be duplicated',
  [ErrorCode.ONLY_ALPHABETIC_ARE_ALLOWED]:
    'Only alphabetic characters are allowed',
  [ErrorCode.MODEL_CAN_NOT_BE_DELETED]:
    'Cannot delete model that is assigned with a device',
  [ErrorCode.TYPE_CAN_NOT_BE_DELETED]:
    'Cannot delete type that is assigned with a device',
  [ErrorCode.DEVICE_NOT_FOUND]: 'Device not found',
  [ErrorCode.DEVICE_MODEL_NOT_FOUND]: 'Device model not found',
  [ErrorCode.DEVICE_TYPE_NOT_FOUND]: 'Device type not found',
  [ErrorCode.DEVICE_MODEL_DOES_NOT_BELONG_TO_DEVICE_TYPE]:
    'Device model does not belong to device type',
  [ErrorCode.CANNOT_ASSIGN_ANOTHER_USER_TO_AN_ALREADY_ASSIGNED_DEVICE]:
    'Cannot assign another user to an already assigned device',
  [ErrorCode.USER_NOT_TRAINING_OWNER]:
    'The report can be deleted or updated by the creator only.',
  [ErrorCode.CANNOT_SELECT_REPAIR_DATE_IN_FUTURE]:
    'Cannot select the repair date after the current date',
  [ErrorCode.DEVICE_REPAIR_HISTORY_NOT_FOUND]:
    'Device repair history not found',
  [ErrorCode.CANNOT_DELETE_WHEN_HAS_ASSIGNEE]:
    'Cannot delete a device has assignee',
  [ErrorCode.CANNOT_DELETE_WHEN_HAVE_DEVICE_ASSIGN_HISTORY]:
    'Cannot delete a device with assigned history',
  [ErrorCode.CANNOT_DELETE_WHEN_HAVE_DEVICE_REPAIR_HISTORY]:
    'Cannot delete a device with repaired history',
  [ErrorCode.TYPE_IS_EXISTING]: 'Device type is existing',
  [ErrorCode.MODEL_IS_EXISTING]: 'Device model is existing',
  [ErrorCode.REPAIR_REQUEST_NOT_FOUND]: 'Repair request not found',
  [ErrorCode.USER_NOT_ASSIGNED_TO_DEVICE]: 'User is not assigned to the device',
  [ErrorCode.FILE_SIZE_EXCEEDS_LIMIT]: 'File size exceeds the limit (2MB)',
  [ErrorCode.CANNOT_SEND_EMAIL_TO_PM_WHEN_EMAIL_PM_IS_EMPTY]:
    'Canot send email to PM when email PM is empty',
  [ErrorCode.CANNOT_SEND_EMAIL_WHEN_TIME_OFF_REQUEST_APPROVED_OR_REFUSED]:
    'Cannot send confirmation email when current status is Approved or Refused',
  [ErrorCode.TOTAL_DAYS_OF_REQUEST_IS_NOT_CORRECT]:
    'Total days of request is not correct',
  [ErrorCode.CANNOT_SEND_EMAIL_TO_ASSISTANT_WHEN_EMAIL_ASSISTANT_IS_EMPTY]:
    'Cannot send email to Assistant when email assistant is empty',
  [ErrorCode.CANNOT_UPDATE_TIME_OFF_REQUEST_APPROVED_OR_REFUSED]:
    'Cannot update time-off request approved/refused',
  [ErrorCode.CANNOT_UPLOAD_FILE_EMPTY]: 'Cannot upload file is empty',
  [ErrorCode.ERROR_DELETE_FILE]:
    'Unable to delete file. Please verify the file path',
  [ErrorCode.INVALID_FILE_FORMAT]: 'Invalid file format',
  [ErrorCode.TIME_OFF_COLLABORATOR_NOT_FOUND]:
    'Time-off collaborator not found',
  [ErrorCode.CANNOT_UPDATE_STATUS_SCRAPPED_WITH_ASSIGNEE]:
    'Cannot update device status to scrapped with assignee',
  [ErrorCode.CANNOT_REQUEST_FORGOT_PASSWORD_IF_NOT_USER]:
    'Only user accounts are allowed to request a password reset',
  [ErrorCode.DEVICE_CODE_IS_EXISTING]: 'Device code is existing',
  [ErrorCode.DEVICE_OWNER_NOT_FOUND]: 'Device owner not found',
  [ErrorCode.DEVICE_OWNER_IS_EXISTING]: 'Device owner is existing',
  [ErrorCode.OWNER_CAN_NOT_BE_DELETE]: 'Device owner cannot be delete',
  [ErrorCode.SKILL_GROUP_NOT_FOUND]: 'Skill group not found',
  [ErrorCode.USER_SKILL_NOT_FOUND]: 'User skill not found',
  [ErrorCode.SKILL_NOT_FOUND]: 'Skill not found',
  [ErrorCode.EDUCATION_NOT_FOUND]: 'Education not found',
  [ErrorCode.EXPERIENCE_NOT_FOUND]: 'Experience not found',
  [ErrorCode.USER_TIMEKEEPER_NOT_FOUND]: 'User timekeeper not found',
  [ErrorCode.ACCOUNT_EXPIRED]: 'The account was expired.',
};
