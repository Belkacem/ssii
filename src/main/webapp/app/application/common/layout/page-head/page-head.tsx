import React, { FunctionComponent, CSSProperties, ReactNode } from 'react';
import { Affix, Icon, Divider } from 'antd';
import { Link } from 'react-router-dom';
import './page-head.scss';

interface IPageHeadProps {
  onBack?: Function | string;
  backText?: string;
  backIcon?: ReactNode;
  backOnlyMobile?: boolean;
  title: string | ReactNode;
  subTitle?: string | ReactNode;
  actions?: ReactNode;
  className?: string;
  style?: CSSProperties;
  bordered?: boolean;
  margin?: boolean;
}

export const PageHead: FunctionComponent<IPageHeadProps> = props => {
  const {
    title,
    subTitle,
    onBack,
    backText = 'Retour',
    backIcon = <Icon type="arrow-left" />,
    backOnlyMobile = false,
    actions,
    style,
    className,
    bordered = false,
    margin = true
  } = props;

  const handleGoBack = () => {
    if (props.onBack && typeof props.onBack !== 'string') {
      props.onBack();
    }
  };

  const classes = ['page-head'];
  if (!!className) classes.push(className);
  if (bordered) classes.push('bordered');
  if (!margin) classes.push('no-margin');

  return (
    <Affix offsetTop={0}>
      <div className={classes.join(' ')} style={style}>
        <div className="page-head-content">
          {onBack && (
            <div className={backOnlyMobile ? 'page-head-back-btn page-head-back-btn-mobile' : 'page-head-back-btn'}>
              {typeof onBack === 'string' ? (
                <Link replace to={onBack} title={backText} children={backIcon} />
              ) : (
                <a onClick={handleGoBack} title={backText} children={backIcon} />
              )}
              <Divider type="vertical" />
            </div>
          )}
          <span className="page-head-title">{title}</span>
          {!!subTitle && <span className="page-head-subtitle">{subTitle}</span>}
        </div>
        {actions && <div className="page-head-actions">{actions}</div>}
      </div>
    </Affix>
  );
};
