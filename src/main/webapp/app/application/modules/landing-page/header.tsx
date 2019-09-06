import React, { Component } from 'react';
import Brand from 'app/application/common/layout/header/brand';
import { NavLink } from 'react-router-dom';
import { Layout, Menu } from 'antd';

class Header extends Component {
  public render() {
    return (
      <Layout.Header style={{ backgroundColor: '#fff', height: 59 }}>
        <Brand theme="dark" size="small" />
        <Menu theme="light" mode="horizontal" style={{ lineHeight: '56px', textAlign: 'right' }}>
          <Menu.Item key="login">
            <NavLink to="/login">Se connecter</NavLink>
          </Menu.Item>
        </Menu>
      </Layout.Header>
    );
  }
}

export default Header;
