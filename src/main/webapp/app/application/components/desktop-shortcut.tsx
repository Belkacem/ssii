import React, { FunctionComponent } from 'react';
import { Avatar } from 'app/application/components/avatar/avatar.component';
import { Link } from 'react-router-dom';

interface IDesktopShortcutProps {
  title: string;
  textIcon?: string;
  icon?: string | React.ReactNode;
  image?: string;
  link?: string;
  size?: 'default' | 'small';
  onClick?: Function;
}

export const DesktopShortcut: FunctionComponent<IDesktopShortcutProps> = props => {
  const { title, textIcon = title, icon, image, link = '#', size = 'default', children } = props;
  const handleClick = event => {
    if (props.onClick) {
      props.onClick(event);
    }
    if (!props.link) {
      event.preventDefault();
    }
  };
  return (
    <Link className="desktop-shortcut" to={link} onClick={handleClick} title={title}>
      <Avatar
        name={textIcon}
        src={image}
        icon={icon}
        borderRadius={size === 'default' ? '15px' : '7px'}
        size={size === 'small' ? 50 : 72}
      />
      <div className="shortcut-label">{title}</div>
      {children && <div className="shortcut-badge">{children}</div>}
    </Link>
  );
};
