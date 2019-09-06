import React, { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import * as Company from 'app/application/entities/company/company.actions';
import { Col, Modal, Row, Spin } from 'antd';
import { Avatar } from 'app/application/components/avatar/avatar.component';
import { IRootState } from 'app/shared/reducers';
import { ICompany } from 'app/shared/model/company.model';

interface IChangeCompanyModalProps extends StateProps, DispatchProps, RouteComponentProps {
  visible: boolean;
  onClose: Function;
}

const ChangeCompanyModal: FunctionComponent<IChangeCompanyModalProps> = props => {
  const { currentCompany, visible, companies, loading } = props;

  const connectToCompany = companyID => {
    if (currentCompany.id !== companyID) {
      props.connectAs(companyID);
      props.history.replace('/app/home');
      handleClose();
    }
  };

  const renderCompanyItem = (company: ICompany) => {
    const handleClick = () => connectToCompany(company.id);
    return (
      <div className={`card-item ${currentCompany && currentCompany.id === company.id ? 'selected' : ''}`} onClick={handleClick}>
        <Avatar
          size={100}
          borderRadius={0}
          name={company.name}
          src={!!company.logo ? `data:${company.logoContentType};base64, ${company.logo}` : undefined}
        />
        <span>{company.name}</span>
      </div>
    );
  };

  const handleClose = () => {
    props.onClose();
  };

  return (
    <Modal title={false} footer={false} visible={visible} className="card-items-modal" onCancel={handleClose} centered>
      <p>
        <b>Mes entreprises</b>
        <br />
        <small>Se connecter à un autre entreprise ou ajouter une nouvelle</small>
      </p>
      <Spin spinning={loading}>
        <Row type="flex">
          {companies.map(company => (
            <Col key={company.id}>{renderCompanyItem(company)}</Col>
          ))}
          <Col key="ADD_NEW_COMPANY">
            <Link to="/app/company/fetch-by-siren">
              <div className="card-item card-item-add" onClick={handleClose}>
                <Avatar size={100} borderRadius={0} name="Ajouter une entreprise" icon="plus" color="#fff" />
                <span>Ajouter une entreprise</span>
              </div>
            </Link>
          </Col>
        </Row>
      </Spin>
    </Modal>
  );
};

const mapStateToProps = ({ application, authentication, company }: IRootState) => ({
  currentCompany: application.company.current,
  companies: company.entities,
  loading: company.loading
});

const mapDispatchToProps = {
  getMyCompanies: Company.getMyCompanies,
  connectAs: Company.connect
};

type DispatchProps = typeof mapDispatchToProps;
type StateProps = ReturnType<typeof mapStateToProps>;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ChangeCompanyModal));
