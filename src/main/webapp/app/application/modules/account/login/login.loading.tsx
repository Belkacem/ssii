import React, { FunctionComponent } from 'react';
import { Modal, Spin } from 'antd';

interface ILoginLoadingProps {
  loadingMessage: string | boolean;
}

export const LoginLoading: FunctionComponent<ILoginLoadingProps> = props => (
  <Modal
    title={false}
    children={
      <>
        <Spin spinning size="large" />
        <div>
          <small>{`Chargement ${props.loadingMessage} ...`}</small>
        </div>
      </>
    }
    footer={false}
    centered
    visible={!!props.loadingMessage}
    width={250}
    closable={false}
    maskClosable={false}
    bodyStyle={{ textAlign: 'center' }}
    zIndex={9999}
    maskStyle={{ background: '#001529' }}
  />
);
