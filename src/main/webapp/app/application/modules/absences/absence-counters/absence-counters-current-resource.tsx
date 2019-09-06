import React, { FunctionComponent, lazy, Suspense } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { LoadingDiv } from 'app/application/common/config/ui-constants';
import { PageHead } from 'app/application/common/layout/page-head/page-head';

const AbsenceCounters = lazy(() => import('app/application/modules/absences/absence-counters/absence-counters-per-resource'));

interface IAbsencesCountersProps extends StateProps, DispatchProps, RouteComponentProps<{ url: string }> {}

const AbsencesCounters: FunctionComponent<IAbsencesCountersProps> = props => (
  <div className="page-layout-max-content">
    <PageHead title="Mes compteurs d'absence" margin={false} />
    <Suspense fallback={<LoadingDiv />}>
      <AbsenceCounters resource={props.resource} />
    </Suspense>
  </div>
);

const mapStateToProps = ({ application }: IRootState) => ({
  resource: application.resource.current.entity
});

const mapDispatchToProps = {};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(AbsencesCounters);
