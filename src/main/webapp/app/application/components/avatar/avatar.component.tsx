import React from 'react';
import { Icon } from 'antd';
import './avatar.component.scss';
import { textToColor } from 'app/application/common/utils/color-utils';

interface IAvatarProps {
  name: string;
  src?: string;
  icon?: string | React.ReactNode;
  color?: string;
  size?: any;
  style?: React.CSSProperties;
  className?: string;
  borderRadius?: any;
}

const initials = str => {
  if (!str) {
    return '';
  }
  const split = str.split(' ');
  if (split.length > 1) {
    return split[0].charAt(0) + split[1].charAt(0);
  }
  return str.charAt(0) + str.charAt(1);
};

const setPx = size => (size.toString().indexOf('px') === -1 ? size + 'px' : size);

export const Avatar = (props: IAvatarProps) => {
  const { src, name, color, size = 72, icon, className, style = {}, borderRadius = '50%' } = props;
  const abbr = initials(name).toUpperCase();
  const imageStyle: React.CSSProperties = { display: 'block' };
  style.borderRadius = borderRadius;
  const innerStyle: React.CSSProperties = {
    lineHeight: setPx(size),
    textAlign: 'center',
    borderRadius,
    fontSize: size > 50 ? '170%' : size > 40 ? '120%' : size > 20 ? '90%' : '70%',
    fontWeight: 'bold'
  };
  if (size) {
    innerStyle.width = innerStyle.maxWidth = size;
    innerStyle.height = innerStyle.maxHeight = size;
  }
  const classes = [className, 'avatar'];
  innerStyle.backgroundColor = color ? color : textToColor(name, 15);

  let inner;
  if (src) {
    inner = <img className="avatar-img" style={imageStyle} src={src} alt={name} />;
    innerStyle.backgroundColor = 'white';
    innerStyle.padding = '10%';
  } else if (icon) {
    inner = !!icon && typeof icon === 'string' ? <Icon type={icon} className="shortcut-icon" /> : icon;
  } else {
    inner = <span>{abbr}</span>;
  }
  return (
    <div aria-label={name} className={classes.join(' ')} style={style}>
      <div className="avatar-inner" style={innerStyle}>
        {inner}
      </div>
    </div>
  );
};
