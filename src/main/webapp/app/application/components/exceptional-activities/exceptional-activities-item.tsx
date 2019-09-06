import React, { FunctionComponent } from 'react';
import { Button, Icon, List, Tag } from 'antd';
import { nbrToHours } from 'app/application/common/utils/activity-utils';
import { FORMAT_DATE } from 'app/application/common/config/constants';
import { IExceptionalActivity, ValidationStatus } from 'app/shared/model/exceptional-activity.model';
import { IProject } from 'app/shared/model/project.model';
import { ASTREINTE_LABELS } from './exceptional-activities-list';
import moment from 'moment';

interface IExceptionalActivitiesItemProps {
  index: number;
  activity: IExceptionalActivity;
  project: IProject;
  editable: boolean;
  validation: boolean;
  onDelete: (index: number) => void;
  onUpdate: (activity: IExceptionalActivity, index: number) => void;
  onValidate: (activity: IExceptionalActivity, index: number) => void;
}

export const ExceptionalActivitiesItem: FunctionComponent<IExceptionalActivitiesItemProps> = props => {
  const { index, activity, project, editable, validation } = props;

  const handleUpdate = () => {
    if (props.onUpdate) {
      props.onUpdate(activity, index);
    }
  };

  const handleDelete = () => {
    if (props.onDelete) {
      props.onDelete(index);
    }
  };

  const handleValidate = (status: ValidationStatus) => {
    const validationDate = moment();
    if (props.onValidate) {
      props.onValidate(
        {
          ...activity,
          validationStatus: status,
          validationDate
        },
        index
      );
    }
  };

  const handleApprove = () => {
    handleValidate(ValidationStatus.APPROVED);
  };

  const handleReject = () => {
    handleValidate(ValidationStatus.REJECTED);
  };

  const validationStatus =
    !!activity.id &&
    (activity.validationStatus === ValidationStatus.REJECTED ? (
      <Tag color="rgba(244,67,54,0.5)">Refusée</Tag>
    ) : activity.validationStatus === ValidationStatus.APPROVED ? (
      <Tag color="rgba(10,111,15,0.5)">Approuvé</Tag>
    ) : (
      <Tag color="rgba(255,185,0,0.5)">En attente</Tag>
    ));

  const className =
    activity.validationStatus === ValidationStatus.REJECTED
      ? 'exception-activity rejected'
      : activity.validationStatus === ValidationStatus.APPROVED
        ? 'exception-activity approved'
        : 'exception-activity';

  return (
    <List.Item className={className}>
      <div className="exception-activity-content">
        <div className="exception-activity-hours">
          <span>{activity.nbHours}</span>
          <small>heures</small>
        </div>
        <div className="exception-activity-description">
          <small>
            <Icon type="calendar" />
            &nbsp;
            {moment(activity.date).format(FORMAT_DATE)}
            &nbsp;
            <Icon type="clock-circle" />
            &nbsp;
            {nbrToHours(activity.start).format('HH:mm')} -{' '}
            {nbrToHours(activity.start)
              .add(activity.nbHours, 'hours')
              .format('HH:mm')}
          </small>
          <b>
            <span>{ASTREINTE_LABELS[activity.type]}</span>
            <Icon type="right" />
            <span>{project && project.nom}</span>
          </b>
        </div>
      </div>
      {validationStatus}
      {editable && (
        <div className="exception-activity-actions">
          <Button icon="delete" title="Supprimer" type="danger" shape="circle" onClick={handleDelete} />
          <Button icon="edit" title="Modifier" type="primary" shape="circle" onClick={handleUpdate} />
        </div>
      )}
      {validation && (
        <div className="exception-activity-actions">
          <Button icon="check" title="Valider" type="primary" shape="circle" onClick={handleApprove} />
          <Button icon="close" title="Rejeter" type="danger" shape="circle" onClick={handleReject} />
        </div>
      )}
    </List.Item>
  );
};
