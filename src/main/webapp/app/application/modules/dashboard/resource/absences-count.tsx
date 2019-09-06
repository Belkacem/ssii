import React, { FunctionComponent, useEffect, useState } from 'react';
import { IRootState } from 'app/shared/reducers';
import { connect } from 'react-redux';
import * as AbsenceType from 'app/entities/absence-type/absence-type.reducer';
import { getAbsenceBalancesByResource } from 'app/application/entities/absence-balance/absence-balance.actions';
import * as ResourceConfiguration from 'app/application/entities/resource-configuration/resource-configuration.actions';
import { Divider, Row, Spin, Statistic } from 'antd';
import { CP_CODE, RTT_CODE } from 'app/application/common/config/constants';

interface IAbsencesCountProps extends StateProps, DispatchProps {}

export const AbsencesCount: FunctionComponent<IAbsencesCountProps> = props => {
  const { absenceBalances, absenceTypes, resource, loading, resourceConfig } = props;
  const [rtt, setRtt] = useState<number>(0);
  const [cp, setCP] = useState<number>(0);

  useEffect(
    () => {
      props.getAbsenceTypes();
      props.getAbsenceBalancesByResource(resource.id);
      props.getResourceConfiguration(resource.id);
    },
    [resource]
  );

  useEffect(
    () => {
      if (absenceBalances && absenceTypes) {
        const rttType = absenceTypes.find(type => type.code === RTT_CODE);
        if (rttType) {
          const balance = absenceBalances.find(absenceBalance => absenceBalance.typeId === rttType.id);
          if (balance) {
            setRtt(balance.balance);
          }
        }
        const cpType = absenceTypes.find(type => type.code === CP_CODE);
        if (cpType) {
          const balance = absenceBalances.find(absenceBalance => absenceBalance.typeId === cpType.id);
          if (balance) {
            setCP(balance.balance);
          }
        }
      }
    },
    [absenceBalances, absenceTypes]
  );

  return (
    <Spin spinning={loading}>
      <div className="text-muted text-right">
        <small>Solde d'absence</small>
      </div>
      <Row type="flex" style={{ alignItems: 'center' }}>
        <Statistic prefix={<small className="text-muted">CP</small>} suffix={<small className="text-muted">j</small>} value={cp} />
        {resourceConfig &&
          resourceConfig.hasRTT && (
            <>
              <Divider type="vertical" />
              <Statistic prefix={<small className="text-muted">RTT</small>} suffix={<small className="text-muted">j</small>} value={rtt} />
            </>
          )}
      </Row>
    </Spin>
  );
};

const mapStateToProps = ({ application, absenceBalance, absenceType, resourceConfiguration }: IRootState) => ({
  resource: application.resource.current.entity,
  absenceBalances: absenceBalance.entities,
  loading: absenceBalance.loading,
  absenceTypes: absenceType.entities,
  resourceConfig: resourceConfiguration.entity
});

const mapDispatchToProps = {
  getAbsenceBalancesByResource,
  getAbsenceTypes: AbsenceType.getEntities,
  getResourceConfiguration: ResourceConfiguration.getByResource
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(AbsencesCount);
