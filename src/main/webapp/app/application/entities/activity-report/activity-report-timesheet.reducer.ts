import { IStandardActivity } from 'app/shared/model/standard-activity.model';
import { IExceptionalActivity } from 'app/shared/model/exceptional-activity.model';

export const ACTION_TYPES = {
  SET_LOADING: 'activityReportTimeSheet/SET_LOADING',
  SET_HAS_ERROR: 'activityReportTimeSheet/SET_HAS_ERROR',
  SET_STANDARD_ACTIVITY: 'activityReportTimeSheet/SET_STANDARD_ACTIVITY',
  SET_EXCEPTIONAL_ACTIVITY: 'activityReportTimeSheet/SET_EXCEPTIONAL_ACTIVITY',
  RESET: 'activityReportTimeSheet/RESET'
};

const initialState = {
  loading: false,
  hasError: false,
  standardActivities: [] as ReadonlyArray<IStandardActivity>,
  standardActivitiesChanged: false,
  exceptionalActivities: [] as ReadonlyArray<IExceptionalActivity>,
  exceptionalActivitiesChanged: false
};

export type ActivityReportTimeSheetReducer = Readonly<typeof initialState>;

// Reducer
export default (state: ActivityReportTimeSheetReducer = initialState, action): ActivityReportTimeSheetReducer => {
  switch (action.type) {
    case ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    case ACTION_TYPES.SET_HAS_ERROR:
      return {
        ...state,
        hasError: action.payload
      };
    case ACTION_TYPES.SET_STANDARD_ACTIVITY:
      return {
        ...state,
        standardActivities: action.payload.activities,
        standardActivitiesChanged: action.payload.changed
      };
    case ACTION_TYPES.SET_EXCEPTIONAL_ACTIVITY:
      return {
        ...state,
        exceptionalActivities: action.payload.activities,
        exceptionalActivitiesChanged: action.payload.changed
      };
    case ACTION_TYPES.RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
