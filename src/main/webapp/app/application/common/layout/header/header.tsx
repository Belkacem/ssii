import React, { FunctionComponent, useState } from 'react';
import Brand from './brand';
import ChangeCompanyModal from './change-company-modal';
import ChangeAccountModal from './change-account-modal';
import AppMenu from './app-menu';
import { Link } from 'react-router-dom';
import { Button, Drawer, Icon, Layout, Menu, Badge } from 'antd';
import './header.scss';
import { Avatar } from 'app/application/components/avatar/avatar.component';
import { AUTHORITIES } from 'app/application/common/config/constants';
import { hasAnyAuthority } from 'app/application/common/utils/user-utils';
import { ICompany } from 'app/shared/model/company.model';

interface IHeaderProps {
  isAuthenticated: boolean;
  account: any;
  companies: ReadonlyArray<ICompany>;
  isDrawer: boolean;
  countAccounts: number;
}

export const Header: FunctionComponent<IHeaderProps> = props => {
  const [drawerToggle, setDrawerToggler] = useState(false);
  const [showCompaniesModal, setShowCompaniesModal] = useState(false);
  const [showAccountsModal, setShowAccountsModal] = useState(false);
  const { isAuthenticated, account, companies, isDrawer } = props;

  const handleOpenDrawer = () => setDrawerToggler(true);

  const handleCloseDrawer = () => setDrawerToggler(false);

  const handleOpenAccountsModal = () => {
    setDrawerToggler(false);
    setShowAccountsModal(true);
  };

  const handleOpenCompaniesModal = () => {
    setDrawerToggler(false);
    setShowCompaniesModal(true);
  };

  const handleCloseModals = () => {
    if (isDrawer) {
      setDrawerToggler(true);
    }
    setShowAccountsModal(false);
    setShowCompaniesModal(false);
  };

  const getHeaderMenu = (inDrawer = false) => {
    const menuMode = inDrawer ? 'inline' : 'horizontal';
    const menuStyle: any = inDrawer ? {} : { textAlign: 'right' };
    const menuTheme = inDrawer ? 'light' : 'dark';
    return (
      <Menu
        theme={menuTheme}
        mode={menuMode}
        inlineIndent={8}
        selectable={false}
        style={menuStyle}
        defaultOpenKeys={inDrawer ? ['account'] : []}
      >
        {!isAuthenticated && (
          <Menu.Item key="login">
            <Link to="/login">Se connecter</Link>
          </Menu.Item>
        )}
        {isAuthenticated &&
          props.countAccounts > 1 && (
            <Menu.Item onClick={handleOpenAccountsModal} title="Commutateur de compte" className="ant-btn-icon-only">
              <Badge dot>
                <Icon type="team" />
                {inDrawer && 'Commutateur de compte'}
              </Badge>
            </Menu.Item>
          )}
        {isAuthenticated && (
          <Menu.SubMenu
            key="account"
            title={
              <div className="dropdown-user">
                <Avatar size={28} name={`${account.firstName} ${account.lastName}`} src={account.imageURL} />
                <div className="user-name">
                  <span>{`${account.firstName} ${account.lastName}`}</span>
                  <small>{account.login}</small>
                </div>
              </div>
            }
          >
            {companies.length > 1 && (
              <Menu.Item>
                <a onClick={handleOpenCompaniesModal}>
                  <Icon type="swap" /> Changer l'entreprise
                </a>
              </Menu.Item>
            )}
            {companies.length === 1 &&
              hasAnyAuthority(account.authorities, [AUTHORITIES.COMPANY_OWNER]) && (
                <Menu.Item>
                  <Link to="/app/company/fetch-by-siren">
                    <Icon type="plus" /> Ajouter une entreprise
                  </Link>
                </Menu.Item>
              )}
            <Menu.Item>
              <Link to="/app/account/details">
                <Icon type="setting" /> Paramètres
              </Link>
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item>
              <Link to="/logout">
                <Icon type="poweroff" /> Déconnexion
              </Link>
            </Menu.Item>
          </Menu.SubMenu>
        )}
      </Menu>
    );
  };

  return (
    <>
      <Layout.Header>
        <div className="header-container">
          {isAuthenticated && isDrawer && <AppMenu isMobile />}
          <Brand theme="light" size="small" />
          {isDrawer ? (
            <div style={{ textAlign: 'right' }}>
              <Button icon="setting" onClick={handleOpenDrawer} className="account-menu-btn" />
              <Drawer
                placement="right"
                onClose={handleCloseDrawer}
                closable={false}
                visible={drawerToggle}
                destroyOnClose
                className="header-drawer"
              >
                <Brand theme="dark" size="small" />
                {getHeaderMenu(true)}
              </Drawer>
            </div>
          ) : (
            getHeaderMenu()
          )}
          <ChangeCompanyModal visible={showCompaniesModal} onClose={handleCloseModals} />
          <ChangeAccountModal visible={showAccountsModal} onClose={handleCloseModals} />
        </div>
      </Layout.Header>
    </>
  );
};
