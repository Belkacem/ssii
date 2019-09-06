import React, { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { DesktopShortcut } from 'app/application/components/desktop-shortcut';

interface IShortcutsProps extends StateProps, DispatchProps {}

export const Shortcuts: FunctionComponent<IShortcutsProps> = props => {
  const resourceConfig = props.resourceConfig;

  return (
    <div className="desktop-shortcuts desktop-shortcuts-sm">
      <DesktopShortcut title="Congés et Absences" link="/app/resource/absences" icon="calendar" size="small" />
      <DesktopShortcut title="Mes soldes de congé" link="/app/resource/absences/counters" icon="table" size="small" />
      {props.currentProjectResource.filter(pr => pr.active).length > 0 && (
        <DesktopShortcut title="Mes activités" link="/app/resource/my-activities" icon="audit" size="small" />
      )}
      {!!resourceConfig.id &&
        resourceConfig.canReportExpenses && <DesktopShortcut title="Mes frais" link="/app/resource/expenses" icon="euro" size="small" />}
    </div>
  );
};

const mapStateToProps = ({ projectResource, resourceConfiguration }: IRootState) => ({
  currentProjectResource: projectResource.entities,
  resourceConfig: resourceConfiguration.entity
});

const mapDispatchToProps = {};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(Shortcuts);
