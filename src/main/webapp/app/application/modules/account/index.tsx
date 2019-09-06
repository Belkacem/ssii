import React, { FunctionComponent } from 'react';
import ProfileDetails from './settings/profile-details';
import ProfileUpdate from './settings/profile-update';
import Password from './password/password';
import { withRouter, Switch, RouteComponentProps, Route } from 'react-router-dom';
import { Sidebar, ISidebarMenuItem } from 'app/application/common/layout/sidebar/sidebar.component';
import { Icon } from 'antd';

const Account: FunctionComponent<RouteComponentProps> = props => {
  const { match } = props;
  const menuItems: ISidebarMenuItem[] = [
    {
      title: 'Compte',
      link: `${match.url}/details`,
      icon: 'user'
    },
    {
      title: 'Mot de passe',
      link: `${match.url}/password`,
      icon: 'lock'
    }
  ];
  return (
    <Sidebar
      items={menuItems}
      theme="light"
      title={
        <small>
          <Icon type="setting" /> paramètres du compte
        </small>
      }
    >
      <Switch>
        <Route path="/app/account/details/update" component={ProfileUpdate} />
        <Route path="/app/account/details" component={ProfileDetails} />
        <Route path="/app/account/password" component={Password} />
        <Route path="/app/account" component={ProfileDetails} />
      </Switch>
    </Sidebar>
  );
};

export default withRouter(Account);
