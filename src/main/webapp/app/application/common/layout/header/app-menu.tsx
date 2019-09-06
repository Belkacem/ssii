import React, { FunctionComponent, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { Badge, Button, Drawer, Icon, Layout, Menu } from 'antd';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { getCurrentStep } from 'app/application/common/utils/resource-utils';
import { countNotValidated as countNotValidatedAbsences } from 'app/application/entities/absence/absence.actions';
import { countNotValidated as countNotValidatedExpenses } from 'app/application/entities/expense/expense.actions';
import { ACCOUNT_TYPES } from 'app/application/common/layout/header/change-account-modal';

interface IAppMenuProps extends StateProps, DispatchProps, RouteComponentProps {
  isMobile: boolean;
  open?: boolean;
}

interface IAppMenuItemProps {
  id: string;
  title: string;
  icon: string;
  link?: string;
  counter?: number;
  subMenus?: IAppMenuItemProps[];
}

const MenuItem = (menuItem: IAppMenuItemProps) => {
  const { id, title, icon, link, subMenus, counter } = menuItem;
  return !!subMenus && subMenus.length > 0 ? (
    SubMenu(menuItem)
  ) : (
    <Menu.Item key={id} title={title}>
      <Link to={link}>
        <Badge count={counter < 0 ? 0 : counter} showZero={false} offset={counter > 0 && [15, 5]}>
          <Icon type={icon} />
          <span>
            <small>{title}</small>
          </span>
          {counter < 0 && <Badge dot status="processing" />}
        </Badge>
      </Link>
    </Menu.Item>
  );
};

const SubMenu = (menuItem: IAppMenuItemProps) => {
  const { id, title, icon, subMenus, counter } = menuItem;
  return (
    <Menu.SubMenu
      key={id}
      title={
        <span>
          <Icon type={icon} />
          <span>
            <small>{title}</small>
          </span>
          {counter > 0 && <Badge dot />}
        </span>
      }
      children={subMenus.map(MenuItem)}
    />
  );
};

const getSelectedKeys = (items, pathname) => {
  const exactMatch = items
    .flatMap(item => {
      if (!!item.link) {
        return pathname === item.link && item.id;
      } else if (item.subMenus) {
        const selectedSubmenuItem = item.subMenus.find(submenuitem => pathname === submenuitem.link);
        if (selectedSubmenuItem) {
          return [item.id, selectedSubmenuItem.id];
        }
      }
      return false;
    })
    .filter(item => !!item);
  if (exactMatch.length > 0) {
    return exactMatch;
  } else {
    const match = items
      .flatMap(item => {
        if (!!item.link) {
          return pathname.indexOf(item.link) !== -1 && item.id;
        } else if (item.subMenus) {
          const selectedSubmenuItem = item.subMenus.find(submenuitem => pathname.indexOf(submenuitem.link) !== -1);
          if (selectedSubmenuItem) {
            return [item.id, selectedSubmenuItem.id];
          }
        }
        return false;
      })
      .filter(item => !!item);
    if (match.length > 0) {
      return match;
    } else {
      return ['home'];
    }
  }
};

const AppMenu: FunctionComponent<IAppMenuProps> = props => {
  const [drawerToggle, setDrawerToggle] = useState(false);
  const [selectedLinks, setSelectedLinks] = useState([]);
  const { companies, companySessionLoading, currentCompany, resourceConfig, isMobile, open = false, currentAccountType } = props;
  const [collapsed, setCollapsed] = useState(!open);
  const [menuItems, setMenuItems] = useState([]);
  const loading = companies.length > 0 && !currentAccountType && (companySessionLoading || !currentCompany);

  useEffect(
    () => {
      if (!!props.currentAbsenceValidator) {
        props.countNotValidatedAbsences();
      }
    },
    [props.currentAbsenceValidator]
  );

  useEffect(
    () => {
      if (!!props.currentExpenseValidator) {
        props.countNotValidatedExpenses();
      }
    },
    [props.currentExpenseValidator]
  );

  useEffect(
    () => {
      setMenuItems(getMenuItems());
    },
    [props.notValidAbsences, props.notValidExpenses, loading, currentAccountType]
  );

  useEffect(
    () => {
      const selectedItems = getSelectedKeys(menuItems, props.location.pathname);
      setSelectedLinks(selectedItems);
    },
    [props.location.pathname, menuItems]
  );

  useEffect(
    () => {
      setCollapsed(!open);
    },
    [open]
  );

  const principalMenu = (
    <Menu theme="light" mode="inline" selectedKeys={selectedLinks}>
      {menuItems.length === 0 || loading ? <Menu.Item disabled children={<Icon type="loading" />} /> : menuItems.map(MenuItem)}
    </Menu>
  );

  const handleOpenDrawer = () => setDrawerToggle(true);

  const handleCloseDrawer = () => setDrawerToggle(false);

  const handleCollapse = (value: boolean) => setCollapsed(value);

  const getMenuItems = () => {
    const _menuItems: IAppMenuItemProps[] = [{ id: 'home', title: 'Acceuil', link: '/app/home', icon: 'home' }];
    if (currentAccountType === ACCOUNT_TYPES.ADMIN) {
      _menuItems.push(
        ...[
          { id: 'users', title: 'Utilisateurs', link: '/app/admin/users', icon: 'team' },
          { id: 'holidays', title: 'Fériés', link: '/app/admin/holidays', icon: 'carry-out' },
          { id: 'absence_types', title: 'Types de congé', link: '/app/admin/absence-types', icon: 'calendar' },
          { id: 'expense_types', title: 'Notes de frais', link: '/app/admin/expense-types', icon: 'euro' },
          { id: 'settings', title: 'Configurations', link: '/app/admin/configuration', icon: 'setting' },
          { id: 'entity-manager', title: "Gestionnaire d'entités", link: '/app/admin/entity-manager', icon: 'control' },
          {
            id: 'system-tools',
            title: 'Outils système',
            link: '/app/admin/system-tools',
            icon: 'tool',
            subMenus: [
              { id: 'sys-tools-health', title: 'Contrôles de santé', link: '/app/admin/system-tools/health', icon: 'heart' },
              { id: 'sys-tools-metrics', title: "Métriques d'application", link: '/app/admin/system-tools/metrics', icon: 'dashboard' },
              { id: 'sys-tools-docs', title: 'Swagger Api', link: '/app/admin/system-tools/docs', icon: 'api' },
              { id: 'sys-tools-configuration', title: 'Configuration', link: '/app/admin/system-tools/configuration', icon: 'setting' },
              { id: 'sys-tools-audits', title: 'Vérification', link: '/app/admin/system-tools/audits', icon: 'bell' },
              { id: 'sys-tools-logs', title: 'Journaux système', link: '/app/admin/system-tools/logs', icon: 'code' }
            ]
          }
        ]
      );
    }
    if (currentAccountType === ACCOUNT_TYPES.COMPANY_OWNER) {
      _menuItems.push(
        ...[
          { id: 'company_info', title: 'Mon entreprise', link: '/app/company/profile', icon: 'info' },
          { id: 'resources', title: 'Les Ressources', link: '/app/company/resources', icon: 'team' },
          {
            id: 'absences',
            title: 'Congés et Absences',
            icon: 'calendar',
            counter: props.notValidAbsences,
            subMenus: [
              {
                id: 'absences_list',
                title: 'Congés et Absences',
                link: '/app/company/absences',
                icon: 'check',
                counter: props.notValidAbsences
              },
              { id: 'absences_validators', title: 'Validateurs', link: '/app/company/absences/validators', icon: 'safety-certificate' },
              { id: 'absences_calendar', title: 'Calendrier', link: '/app/company/absences/calendar', icon: 'calendar' }
            ]
          },
          { id: 'reports', title: "Les Rapports d'activités", link: '/app/company/activity-reports', icon: 'audit' },
          { id: 'projects', title: 'Les Projets', link: '/app/company/projects', icon: 'project' },
          { id: 'clients', title: 'Les Clients', link: '/app/company/clients', icon: 'shopping' },
          { id: 'invoices', title: 'Les Factures', link: '/app/company/invoices', icon: 'file-done' },
          {
            id: 'expenses',
            title: 'Notes de frais',
            icon: 'euro',
            counter: props.notValidExpenses,
            subMenus: [
              {
                id: 'expenses_list',
                title: 'Notes de frais',
                link: '/app/company/expenses',
                icon: 'check',
                counter: props.notValidExpenses
              },
              { id: 'expenses_validators', title: 'Validateurs', link: '/app/company/expenses/validators', icon: 'safety-certificate' }
            ]
          }
        ]
      );
    }
    if (currentAccountType === ACCOUNT_TYPES.RESOURCE) {
      if (props.currentResource && props.currentResource.draft) {
        _menuItems.pop();
      }
      if (getCurrentStep(props.currentResource) < 4) {
        _menuItems.push({
          id: 'complete_profile',
          title: 'Completer mon Profil',
          link: '/app/resource/create-profile',
          icon: 'user',
          counter: -1
        });
      } else {
        _menuItems.push({ id: 'my_profile', title: 'Mon Profil', link: '/app/resource/profile', icon: 'user' });
      }
      if (props.currentResource && !props.currentResource.draft) {
        _menuItems.push({
          id: 'resource_absences',
          title: 'Congés et Absences',
          icon: 'calendar',
          subMenus: [
            { id: 'resource_absences_list', title: 'Congés et Absences', link: '/app/resource/absences', icon: 'calendar' },
            { id: 'resource_ansence_counters', title: 'Mes soldes de congé', link: '/app/resource/absences/counters', icon: 'table' }
          ]
        });
        if (props.currentProjectResource.filter(pr => pr.active).length > 0) {
          _menuItems.push({ id: 'resource_reports', title: 'Mes activité', link: '/app/resource/my-activities', icon: 'audit' });
        }
        if (!!resourceConfig.id && resourceConfig.canReportExpenses) {
          _menuItems.push({ id: 'resource_expenses', title: 'Mes frais', link: '/app/resource/expenses', icon: 'euro' });
        }
      }
    }
    if (currentAccountType === ACCOUNT_TYPES.ABSENCE_VALIDATOR) {
      _menuItems.push({ id: 'validator_absences', title: 'Congés et Absences', link: '/app/absences', icon: 'calendar' });
    }
    if (currentAccountType === ACCOUNT_TYPES.PROJECT_VALIDATOR) {
      _menuItems.push({ id: 'validator_reports', title: "Rapports d'activités à valider", link: '/app/activities', icon: 'audit' });
    }
    if (currentAccountType === ACCOUNT_TYPES.EXPENSE_VALIDATOR) {
      _menuItems.push({ id: 'validator_expenses', title: 'Notes de frais', link: '/app/expenses', icon: 'euro' });
    }
    if (currentAccountType === ACCOUNT_TYPES.PROJECT_CONTRACTOR) {
      _menuItems.push({ id: 'contractor_reports', title: "Rapports d'activités", link: '/app/activities', icon: 'audit' });
    }
    return _menuItems;
  };

  return (
    menuItems.length > 0 &&
    (isMobile ? (
      <div style={{ float: 'left' }}>
        <Button icon="appstore" onClick={handleOpenDrawer} className="app-menu-btn" />
        <Drawer
          placement="left"
          onClose={handleCloseDrawer}
          closable={false}
          visible={drawerToggle}
          destroyOnClose
          className="header-drawer"
        >
          {principalMenu}
        </Drawer>
      </div>
    ) : (
      <Layout.Sider defaultCollapsed collapsed={collapsed} onCollapse={handleCollapse} collapsible theme="light" collapsedWidth={60}>
        {principalMenu}
      </Layout.Sider>
    ))
  );
};

const mapStateToProps = ({ application, authentication, company, resourceConfiguration, projectResource }: IRootState) => ({
  account: authentication.account,
  notValidAbsences: application.absence.pending.totalItems,
  notValidExpenses: application.expense.pending.totalItems,
  currentResource: application.resource.current.entity,
  currentProjectResource: projectResource.entities,
  currentAbsenceValidator: application.absenceValidator.current,
  currentExpenseValidator: application.expenseValidator.current,
  companies: company.entities,
  currentCompany: application.company.current,
  companySessionLoading: application.company.session_loading,
  resourceConfig: resourceConfiguration.entity,
  currentAccountType: application.accountType.type
});

const mapDispatchToProps = {
  countNotValidatedAbsences,
  countNotValidatedExpenses
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AppMenu)
);
