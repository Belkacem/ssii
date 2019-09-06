import React, { FunctionComponent } from 'react';
import { Icon, Timeline } from 'antd';
import { IAbsence, ValidationStatus } from 'app/shared/model/absence.model';
import { FORMAT_DATETIME } from 'app/application/common/config/constants';
import { IAbsenceValidator } from 'app/shared/model/absence-validator.model';
import { DateFormat } from 'app/application/components/date.format.component';

interface IAbsenceDetailsTimeLineProps {
  absence: IAbsence;
  validator: IAbsenceValidator;
}

export const AbsenceDetailsTimeLine: FunctionComponent<IAbsenceDetailsTimeLineProps> = props => {
  const { absence, validator } = props;
  return (
    <Timeline style={{ padding: '1rem' }}>
      {absence.submissionDate && (
        <Timeline.Item dot={<Icon type="mail" theme="twoTone" twoToneColor="#2196F3" />}>
          <div>
            <strong style={{ color: '#2196F3' }}>Dépôt de la demande</strong>
            <div>
              <small>
                le &nbsp;
                <b>
                  <DateFormat value={absence.submissionDate} format={FORMAT_DATETIME} />
                </b>
              </small>
            </div>
            {absence.description && <small>{absence.description}</small>}
          </div>
        </Timeline.Item>
      )}
      {absence.validationStatus !== ValidationStatus.PENDING && (
        <Timeline.Item
          dot={
            absence.validationStatus === ValidationStatus.REJECTED ? (
              <Icon type="close-circle" theme="twoTone" twoToneColor="#E53935" />
            ) : (
              <Icon type="check-circle" theme="twoTone" twoToneColor="#52C41A" />
            )
          }
        >
          <div>
            {absence.validationStatus === ValidationStatus.REJECTED ? (
              <strong style={{ color: '#E53935' }}>Rejetée</strong>
            ) : (
              <strong style={{ color: '#43A047' }}>Approvée</strong>
            )}
            <div>
              <small>
                le &nbsp;
                <b>
                  <DateFormat value={absence.validationDate} format={FORMAT_DATETIME} />
                </b>
                , par &nbsp;
                <i>
                  <b>{validator.fullname}</b>
                </i>
              </small>
            </div>
            {absence.validationComment && <small>{absence.validationComment}</small>}
          </div>
        </Timeline.Item>
      )}
    </Timeline>
  );
};
