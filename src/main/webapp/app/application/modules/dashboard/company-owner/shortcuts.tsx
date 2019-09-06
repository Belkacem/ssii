import React, { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { DesktopShortcut } from 'app/application/components/desktop-shortcut';

interface IShortcutsProps extends StateProps, DispatchProps {}

export const Shortcuts: FunctionComponent<IShortcutsProps> = props => {
  const absences = props.notValidAbsences;
  const expenses = props.notValidExpenses;

  return (
    <div className="desktop-shortcuts desktop-shortcuts-sm">
      <DesktopShortcut title="A propos" link="/app/company/profile" icon="info" size="small" />
      <DesktopShortcut title="Ressources" link="/app/company/resources" icon="team" size="small" />
      <DesktopShortcut title="Congés et Absences" link="/app/company/absences" icon="calendar" size="small">
        {absences > 0 && absences}
      </DesktopShortcut>
      <DesktopShortcut title="Projets" link="/app/company/projects" icon="project" size="small" />
      <DesktopShortcut title="Rapports d'activités" link="/app/company/activity-reports" icon="audit" size="small" />
      <DesktopShortcut title="Clients" link="/app/company/clients" icon="shopping" size="small" />
      <DesktopShortcut title="Factures" link="/app/company/invoices" icon="file-done" size="small" />
      <DesktopShortcut title="Notes de frais" link="/app/company/expenses" icon="euro" size="small">
        {expenses > 0 && expenses}
      </DesktopShortcut>
    </div>
  );
};

const mapStateToProps = ({ application }: IRootState) => ({
  notValidAbsences: application.absence.pending.totalItems,
  notValidExpenses: application.expense.pending.totalItems
});

const mapDispatchToProps = {};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(Shortcuts);
