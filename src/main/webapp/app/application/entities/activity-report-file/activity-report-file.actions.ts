import { ACTION_TYPES } from 'app/entities/activity-report-file/activity-report-file.reducer';
import axios from 'axios';
import { IActivityReportFile } from 'app/shared/model/activity-report-file.model';

const apiUrl = 'api/activity-report-files';

export const getByActivityReportIdIn = (activityReportIds: number[]) => dispatch =>
  dispatch({
    type: ACTION_TYPES.FETCH_ACTIVITYREPORTFILE_LIST,
    payload: axios.get<IActivityReportFile>(`${apiUrl}/${activityReportIds.join(',')}?override`)
  });
