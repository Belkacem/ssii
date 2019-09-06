import React, { FunctionComponent, ReactNode, useEffect, useState } from 'react';
import { Drawer } from 'antd';
import './flex-page.scss';

interface IFlexPageProps {
  open?: boolean;
  enableEsc?: boolean;
  closable?: boolean;
  theme?: 'light' | 'dark' | 'gray';
  onClose?: any;
  animation?: 'top' | 'right' | 'bottom' | 'left';
  title?: String | ReactNode;
  addionalButtons?: ReactNode;
}

export const FlexPage: FunctionComponent<IFlexPageProps> = props => {
  const [visible, setVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { open = false, closable = true, theme = 'light', enableEsc = true, title = false, addionalButtons = false } = props;
  const animation = props.animation ? props.animation : closable ? 'top' : undefined;

  useEffect(() => {
    setIsMounted(true);
    document.addEventListener('keydown', escFunction, false);
    return () => {
      document.removeEventListener('keydown', escFunction, false);
    };
  }, []);

  useEffect(
    () => {
      if (isMounted && open !== visible && open && !visible) {
        setVisible(open);
      }
    },
    [open, isMounted]
  );

  useEffect(
    () => {
      if (isMounted && !visible && !!props.onClose) {
        props.onClose();
      }
    },
    [visible]
  );

  const escFunction = event => {
    if (event.keyCode === 27 && enableEsc && closable) {
      handleClose();
    }
  };

  const handleClose = () => {
    setVisible(false);
  };

  return (
    <Drawer
      title={title}
      placement={animation}
      closable={closable}
      destroyOnClose
      onClose={handleClose}
      visible={visible}
      className={`flex-page flex-page-${theme} ${animation ? '' : 'no-animation'}`}
      width="100%"
      height="100%"
    >
      {addionalButtons && <div className="ant-drawer-header-addon-btns">{addionalButtons}</div>}
      {props.children}
    </Drawer>
  );
};
