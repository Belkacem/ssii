import { FAILURE, REQUEST, SUCCESS } from 'app/shared/reducers/action-type.util';
import { IActivityReport } from 'app/shared/model/activity-report.model';
import { IProject } from 'app/shared/model/project.model';
import { IProjectResource } from 'app/shared/model/project-resource.model';
import { IResource } from 'app/shared/model/resource.model';
import { IStandardActivity } from 'app/shared/model/standard-activity.model';
import { IExceptionalActivity } from 'app/shared/model/exceptional-activity.model';

export const ACTION_TYPES = {
  FETCH_ACTIVITYREPORT_LIST: 'activityReportList/FETCH_ACTIVITYREPORT_LIST',
  FETCH_PROJECTRESOURCE_LIST: 'activityReportList/FETCH_PROJECTRESOURCE_LIST',
  FETCH_PROJECTS_LIST: 'activityReportList/FETCH_PROJECTS_LIST',
  FETCH_STANDARD_ACTIVITIES_LIST: 'activityReportList/FETCH_STANDARD_ACTIVITIES_LIST',
  FETCH_EXCEPTIONAL_ACTIVITIES_LIST: 'activityReportList/FETCH_EXCEPTIONAL_ACTIVITIES_LIST',
  FETCH_RESOURCE_LIST: 'activityReportList/FETCH_RESOURCE_LIST',
  SET_LOADING: 'activityReportList/SET_LOADING'
};

const initialState = {
  loading: false,
  errorMessage: null,
  reports: [] as ReadonlyArray<IActivityReport>,
  projectResources: [] as ReadonlyArray<IProjectResource>,
  projects: [] as ReadonlyArray<IProject>,
  activities: [] as ReadonlyArray<IStandardActivity>,
  exceptionals: [] as ReadonlyArray<IExceptionalActivity>,
  resources: [] as ReadonlyArray<IResource>
};

export type ActivityReportListReducer = Readonly<typeof initialState>;

// Reducer

export default (state: ActivityReportListReducer = initialState, action): ActivityReportListReducer => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_ACTIVITYREPORT_LIST):
    case REQUEST(ACTION_TYPES.FETCH_PROJECTRESOURCE_LIST):
    case REQUEST(ACTION_TYPES.FETCH_PROJECTS_LIST):
    case REQUEST(ACTION_TYPES.FETCH_STANDARD_ACTIVITIES_LIST):
    case REQUEST(ACTION_TYPES.FETCH_EXCEPTIONAL_ACTIVITIES_LIST):
    case REQUEST(ACTION_TYPES.FETCH_RESOURCE_LIST):
      return {
        ...state,
        errorMessage: null
      };

    case FAILURE(ACTION_TYPES.FETCH_ACTIVITYREPORT_LIST):
    case FAILURE(ACTION_TYPES.FETCH_PROJECTRESOURCE_LIST):
    case FAILURE(ACTION_TYPES.FETCH_PROJECTS_LIST):
    case FAILURE(ACTION_TYPES.FETCH_STANDARD_ACTIVITIES_LIST):
    case FAILURE(ACTION_TYPES.FETCH_EXCEPTIONAL_ACTIVITIES_LIST):
    case FAILURE(ACTION_TYPES.FETCH_RESOURCE_LIST):
      return {
        ...state,
        loading: false,
        errorMessage: action.payload
      };

    case SUCCESS(ACTION_TYPES.FETCH_ACTIVITYREPORT_LIST):
      return {
        ...state,
        reports: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_PROJECTRESOURCE_LIST):
      return {
        ...state,
        projectResources: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_PROJECTS_LIST):
      return {
        ...state,
        projects: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_STANDARD_ACTIVITIES_LIST):
      return {
        ...state,
        activities: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_EXCEPTIONAL_ACTIVITIES_LIST):
      return {
        ...state,
        exceptionals: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_RESOURCE_LIST):
      return {
        ...state,
        resources: action.payload.data
      };
    case ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
};
