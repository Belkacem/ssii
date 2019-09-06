import { FAILURE, REQUEST, SUCCESS } from 'app/shared/reducers/action-type.util';

export const ACTION_TYPES = {
  SEND_REMINDER_ACTIVITYREPORT: 'activityReport/SEND_REMINDER_ACTIVITYREPORT',
  DOWNLOAD_ACTIVITYREPORT: 'activityReport/DOWNLOAD_ACTIVITYREPORT'
};

const initialState = {
  sending: false,
  errorMessage: null,
  downloading: false,
  pdf: null
};

export type ActivityReportReducer = Readonly<typeof initialState>;

// Reducer
export default (state: ActivityReportReducer = initialState, action): ActivityReportReducer => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.SEND_REMINDER_ACTIVITYREPORT):
      return {
        ...state,
        errorMessage: null,
        sending: true
      };
    case REQUEST(ACTION_TYPES.DOWNLOAD_ACTIVITYREPORT):
      return {
        ...state,
        pdf: null,
        downloading: true
      };
    case FAILURE(ACTION_TYPES.SEND_REMINDER_ACTIVITYREPORT):
      return {
        ...state,
        sending: false
      };
    case FAILURE(ACTION_TYPES.DOWNLOAD_ACTIVITYREPORT):
      return {
        ...state,
        downloading: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.DOWNLOAD_ACTIVITYREPORT):
      return {
        ...state,
        downloading: false,
        pdf: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.SEND_REMINDER_ACTIVITYREPORT):
      return {
        ...state,
        sending: false
      };
    default:
      return state;
  }
};
