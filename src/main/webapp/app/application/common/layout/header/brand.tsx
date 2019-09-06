import React, { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { ZSoftLogoSvg } from 'app/application/common/config/ui-constants';
import { APP_DESC, APP_NAME, APP_VERSION } from 'app/application/common/config/constants';
import { ICompany } from 'app/shared/model/company.model';
import { Avatar } from 'app/application/components/avatar/avatar.component';
import { IRootState } from 'app/shared/reducers';

interface IBrandProps extends StateProps {
  theme?: 'dark' | 'light';
  size?: 'small' | 'medium' | 'large';
  isLink?: boolean;
}

const Brand: FunctionComponent<IBrandProps> = props => {
  const { homeLink, currentCompany, hostCompany, theme = 'light', size = 'small', isLink = true } = props;
  const [width, height] = size === 'small' ? [20, 20] : size === 'medium' ? [45, 30] : [60, 40];

  const renderCompanyBrand = (company: ICompany) => (
    <>
      <Avatar
        size={width}
        name={company.name}
        src={company.logo ? `data:${company.logoContentType};base64, ${company.logo}` : ''}
        borderRadius={0}
      />
      <div className="brand-title">
        <b>{company.name}</b>
      </div>
    </>
  );

  const renderAppBrand = () => (
    <>
      <ZSoftLogoSvg className="svg-logo" title={APP_DESC} width={width} height={height} />
      <div className="brand-title">
        <b>{APP_NAME}</b> <sup className="ant-scroll-number ant-badge-count ant-badge-multiple-words">{APP_VERSION}</sup>
      </div>
    </>
  );

  const renderBrand =
    currentCompany && currentCompany.id
      ? renderCompanyBrand(currentCompany)
      : hostCompany && hostCompany.id
        ? renderCompanyBrand(hostCompany)
        : renderAppBrand();

  return !isLink ? (
    <div className={`brand-logo brand-logo-${theme} brand-logo-${size}`}>{renderBrand}</div>
  ) : (
    <Link to={homeLink ? homeLink : '/'} className={`brand-logo brand-logo-${theme} brand-logo-${size}`}>
      {renderBrand}
    </Link>
  );
};

const mapStateToProps = ({ application }: IRootState) => ({
  homeLink: application.redirection.homeLink,
  currentCompany: application.company.current,
  hostCompany: application.domainName.company
});

type StateProps = ReturnType<typeof mapStateToProps>;

export default connect<StateProps>(mapStateToProps)(Brand);
