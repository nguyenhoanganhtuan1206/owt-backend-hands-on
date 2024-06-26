export enum ErrorCode {
  USER_NOT_FOUND,
  TRAINING_NOT_FOUND,
  TRAINING_TOPIC_NOT_FOUND,
  TRAINING_LEVEL_NOT_FOUND,
  TRAINING_CAN_NOT_BE_CHANGED,
  USER_NOT_TRAINING_OWNER,
  DURATION_LIMIT_BAD_REQUEST,
  STRING_NOT_LINK_BAD_REQUEST,
  PAGE_TYPE_BAD_REQUEST,
  FILE_NOT_IMAGE_BAD_REQUEST,
  CURRENT_PASSWORD_NOT_MATCH,
  PASSWORD_IS_NOT_STRONG,
  USERNAME_PASSWORD_INVALID,
  TRAINING_DATE_BAD_REQUEST,
  EMAIL_DOES_NOT_EXIST,
  EMAIL_IS_EXISTED,
  POSITION_DOES_NOT_EXIST,
  LEVEL_DOES_NOT_EXIST,
  DATE_TO_BEFORE_DATE_FROM,
  INVALID_HALF_DAY_SELECTION_WHEN_FROM_AND_TO_DIFFERENT,
  TIME_OFF_TYPE_REQUEST_NOT_FOUND,
  TIME_OFF_REQUEST_NOT_EXISTED,
  WFH_REQUEST_NOT_FOUND,
  COACHES_TRAINING_CANNOT_EXCEED_THREE,
  CANNOT_COACH_SAME_USER_FROM_TRAINING,
  COACHES_IN_TRAINING_CANNOT_DUPLICATED,
  ONLY_ALPHABETIC_ARE_ALLOWED,
  MODEL_CAN_NOT_BE_DELETED,
  TYPE_CAN_NOT_BE_DELETED,
  TYPE_IS_EXISTING,
  MODEL_IS_EXISTING,
  DEVICE_NOT_FOUND,
  DEVICE_TYPE_NOT_FOUND,
  DEVICE_MODEL_NOT_FOUND,
  DEVICE_MODEL_DOES_NOT_BELONG_TO_DEVICE_TYPE,
  CANNOT_ASSIGN_ANOTHER_USER_TO_AN_ALREADY_ASSIGNED_DEVICE,
  CANNOT_SELECT_REPAIR_DATE_IN_FUTURE,
  DEVICE_REPAIR_HISTORY_NOT_FOUND,
  CANNOT_DELETE_WHEN_HAS_ASSIGNEE,
  CANNOT_DELETE_WHEN_HAVE_DEVICE_ASSIGN_HISTORY,
  CANNOT_DELETE_WHEN_HAVE_DEVICE_REPAIR_HISTORY,
  REPAIR_REQUEST_NOT_FOUND,
  USER_NOT_ASSIGNED_TO_DEVICE,
  FILE_SIZE_EXCEEDS_LIMIT,
  CANNOT_UPLOAD_FILE_EMPTY,
  CANNOT_SEND_EMAIL_TO_PM_WHEN_EMAIL_PM_IS_EMPTY,
  CANNOT_SEND_EMAIL_WHEN_TIME_OFF_REQUEST_APPROVED_OR_REFUSED,
  TOTAL_DAYS_OF_REQUEST_IS_NOT_CORRECT,
  CANNOT_SEND_EMAIL_TO_ASSISTANT_WHEN_EMAIL_ASSISTANT_IS_EMPTY,
  CANNOT_UPDATE_TIME_OFF_REQUEST_APPROVED_OR_REFUSED,
  ERROR_DELETE_FILE,
  INVALID_FILE_FORMAT,
  TIME_OFF_COLLABORATOR_NOT_FOUND,
  CANNOT_UPDATE_STATUS_SCRAPPED_WITH_ASSIGNEE,
  CANNOT_REQUEST_FORGOT_PASSWORD_IF_NOT_USER,
  DEVICE_CODE_IS_EXISTING,
  DEVICE_OWNER_NOT_FOUND,
  DEVICE_OWNER_IS_EXISTING,
  OWNER_CAN_NOT_BE_DELETE,
  SKILL_GROUP_NOT_FOUND,
  USER_SKILL_NOT_FOUND,
  SKILL_NOT_FOUND,
  EDUCATION_NOT_FOUND,
  EXPERIENCE_NOT_FOUND,
  USER_TIMEKEEPER_NOT_FOUND,
  ACCOUNT_EXPIRED,
}
