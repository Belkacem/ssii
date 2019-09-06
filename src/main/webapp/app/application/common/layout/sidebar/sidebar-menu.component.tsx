import React, { FunctionComponent, useEffect, useState, ReactNode } from 'react';
import { Badge, Icon, Menu } from 'antd';
import { NavLink, RouteComponentProps, withRouter } from 'react-router-dom';
import { ISidebarMenuItem } from './sidebar.component';

interface ISidebarMenuProps extends RouteComponentProps {
  title?: string | ReactNode;
  items: ISidebarMenuItem[];
  theme?: 'dark' | 'light';
  inSider?: boolean;
}

export const getSelectedKeys = (pathname, links) => {
  const selectedKey = pathname
    ? links
        .filter(link => pathname.startsWith(link))
        .reduce((acc, link) => (!acc || pathname.length - link.length < pathname.length - acc.length ? link : acc), undefined)
    : undefined;
  return selectedKey ? [selectedKey] : [];
};

const SidebarMenu: FunctionComponent<ISidebarMenuProps> = props => {
  const { location, items, theme = 'dark', inSider = false } = props;
  const [selectedKeys, setSelectedKeys] = useState([]);

  useEffect(
    () => {
      setSelectedKeys(getSelectedKeys(location.pathname, items.map(item => item.link)));
    },
    [location.pathname]
  );

  const menuMode = inSider ? 'inline' : 'horizontal';
  return (
    <Menu mode={menuMode} theme={theme} selectedKeys={selectedKeys} style={{ height: '100%' }}>
      <Menu.ItemGroup title={props.title}>
        {items.map(menuItem => (
          <Menu.Item key={menuItem.link}>
            <NavLink to={menuItem.link} className="nav-text">
              {menuItem.icon && (
                <>
                  <Icon type={menuItem.icon} />{' '}
                </>
              )}
              {menuItem.title && (
                <span>
                  <small>{menuItem.title}</small>
                </span>
              )}
              {!!menuItem.badge && (
                <>
                  {' '}
                  <Badge count={menuItem.badge} showZero={false} style={{ fontWeight: 'bold', boxShadow: 'none' }} />
                </>
              )}
            </NavLink>
          </Menu.Item>
        ))}
      </Menu.ItemGroup>
    </Menu>
  );
};

export default withRouter(SidebarMenu);
