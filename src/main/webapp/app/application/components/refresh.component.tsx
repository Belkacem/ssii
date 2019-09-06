import React, { FunctionComponent } from 'react';
import { Avatar } from 'antd';

interface IRefreshProps {
  onReload: () => void;
  visible: boolean;
  children?: any;
}

export const Refresh: FunctionComponent<IRefreshProps> = props => {
  const handleClick = () => {
    props.onReload();
  };

  return props.visible ? (
    <a className="refresh-component" onClick={handleClick}>
      <Avatar icon="reload" size="large" />
      <span>Cliquer pour réessayer</span>
    </a>
  ) : (
    props.children
  );
};
