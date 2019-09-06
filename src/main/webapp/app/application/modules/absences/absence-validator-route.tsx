import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Absences from './absence-lists/absences-list-per-company';
import AbsenceDetails from './absence-details';
import { IRootState } from 'app/shared/reducers';
import { connect } from 'react-redux';
import { LoadingDiv } from 'app/application/common/config/ui-constants';
import { AccessDenied } from 'app/application/components/errors/access-denied.component';
import { InactiveAccount } from 'app/application/components/errors/inactive-account.component';

interface IAbsenceRouteProps extends StateProps, DispatchProps {}

const AbsencesRoute = (props: IAbsenceRouteProps) => {
  const { current, loading, errorMessage } = props;
  if (loading || (!loading && !current && !errorMessage)) {
    return <LoadingDiv />;
  }
  if (!!current && !current.active) {
    return <InactiveAccount fullName={current.fullname} />;
  }
  if (!current) {
    return <AccessDenied />;
  }
  return (
    <Switch>
      <Route path="/app/absences/details/:absence_id" component={AbsenceDetails} />
      <Route path="/app/absences/:absence_id?" component={Absences} />
      <Route path="/app/absences" component={Absences} />
    </Switch>
  );
};

const mapStateToProps = ({ application }: IRootState) => ({
  loading: application.absenceValidator.loading,
  current: application.absenceValidator.current,
  errorMessage: application.absenceValidator.errorMessage
});
const mapDispatchToProps = {};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(AbsencesRoute);
