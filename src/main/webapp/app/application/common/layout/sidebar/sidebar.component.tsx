import React, { FunctionComponent, useEffect, useState, ReactNode } from 'react';
import { Layout, Skeleton } from 'antd';
import SidebarMenuComponent from './sidebar-menu.component';

export interface ISidebarMenuItem {
  link: string;
  title?: string | ReactNode;
  icon?: string;
  badge?: number;
}

interface ISidebarProps {
  title?: string | ReactNode;
  items: ISidebarMenuItem[];
  theme?: 'dark' | 'light';
  loading?: boolean;
  isMenu?: boolean;
  showSideBar?: boolean;
  collapsible?: boolean;
  breakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
}

const responsiveMap = {
  xs: '(max-width: 575px)',
  sm: '(min-width: 576px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 992px)',
  xl: '(min-width: 1200px)',
  xxl: '(min-width: 1600px)'
};

export const Sidebar: FunctionComponent<ISidebarProps> = props => {
  const [inSideBar, setInSideBar] = useState(true);
  const { items, showSideBar = true, isMenu = false, loading = false, breakpoint = 'md', theme = 'dark', collapsible = false } = props;

  const mqlListener = ev => {
    if (ev.matches) {
      setInSideBar(true);
    } else {
      setInSideBar(false);
    }
  };

  useEffect(() => {
    const mql = window.matchMedia(responsiveMap[breakpoint]);
    mql.addListener(mqlListener);
    mqlListener(mql);
    return () => {
      mql.removeListener(mqlListener);
    };
  }, []);

  return (
    <Layout className="bg-white fullwidth">
      {showSideBar && inSideBar && !isMenu ? (
        <Layout.Sider theme={theme} collapsible={collapsible}>
          <SidebarMenuComponent inSider items={items} theme={theme} title={props.title} />
        </Layout.Sider>
      ) : (
        <div>
          <SidebarMenuComponent inSider={false} items={items} theme={theme} title={props.title} />
        </div>
      )}
      <Layout.Content>
        <Skeleton active loading={loading}>
          {props.children}
        </Skeleton>
      </Layout.Content>
    </Layout>
  );
};
