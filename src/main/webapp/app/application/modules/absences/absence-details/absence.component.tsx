import React, { FunctionComponent } from 'react';
import { Col, Row, Skeleton, Spin } from 'antd';
import { IAbsence } from 'app/shared/model/absence.model';
import ResourceName from 'app/application/common/entities/resource-name';
import { formatDaysNumber } from 'app/application/common/utils/absence-utils';
import { IAbsenceValidator } from 'app/shared/model/absence-validator.model';
import { IAbsenceType } from 'app/shared/model/absence-type.model';
import { IAbsenceBalance } from 'app/shared/model/absence-balance.model';
import { AbsenceDetailsTimeLine } from './absence-details-timeline';
import { DateFormat } from 'app/application/components/date.format.component';

interface IAbsenceComponentProps {
  absence: IAbsence;
  loading: boolean;
  absenceType: IAbsenceType;
  validator: IAbsenceValidator;
  balances: ReadonlyArray<IAbsenceBalance>;
}

export const AbsenceComponent: FunctionComponent<IAbsenceComponentProps> = props => {
  const { absence, loading, absenceType, balances, validator } = props;
  const balance = balances.filter(b => b.typeId === absence.typeId);
  if (loading || !absence.id) {
    return (
      <div style={{ padding: '1rem' }}>
        <Skeleton avatar active />
      </div>
    );
  }
  return (
    <Spin spinning={loading}>
      <Row style={{ padding: '1rem 1rem 0' }} gutter={32}>
        <Col md={14}>
          <div className="resource-meta top-flex">
            <div className="meta-content">
              <dl>
                <dt>Demandeur</dt>
                <dd>
                  <ResourceName resourceId={absence.resourceId} isMeta={false} />
                </dd>
                <dt>Type</dt>
                <dd>{absenceType.type}</dd>
                <dt>Date début</dt>
                <dd>
                  {absence.startHalfDay ? 'Après-midi du ' : ''}
                  <DateFormat value={absence.start} />
                </dd>
                <dt>Date fin</dt>
                <dd>
                  {absence.endHalfDay ? 'Matin du ' : ''}
                  <DateFormat value={absence.end} />
                </dd>
                <dt>Durée</dt>
                <dd>{absence.numberDays} jours</dd>
                {balance.length === 1 && (
                  <>
                    <dt>Solde</dt>
                    <dd>{formatDaysNumber(balance[0].balance)} jours</dd>
                  </>
                )}
              </dl>
            </div>
          </div>
        </Col>
        <Col md={10}>
          <AbsenceDetailsTimeLine absence={absence} validator={validator} />
        </Col>
      </Row>
    </Spin>
  );
};
