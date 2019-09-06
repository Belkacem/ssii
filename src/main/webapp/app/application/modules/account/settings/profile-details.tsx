import React, { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { getSession } from 'app/shared/reducers/authentication';
import { IRootState } from 'app/shared/reducers';
import { Card, Col, Divider, Row, Button } from 'antd';
import { AUTHORITIES, AUTHORITIES_LABELS } from 'app/application/common/config/constants';
import { APP_DATE_FORMAT } from 'app/config/constants';
import { Avatar } from 'app/application/components/avatar/avatar.component';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import { DateFormat } from 'app/application/components/date.format.component';
import { RouteComponentProps, withRouter } from 'react-router-dom';

interface IProfileDetailsProps extends DispatchProps, StateProps, RouteComponentProps {}

const ProfileDetails: FunctionComponent<IProfileDetailsProps> = props => {
  const { account, loading } = props;
  if (!account.id && !loading) {
    props.getSession();
  }

  const handleOpenEditPage = () => {
    props.history.push('/app/account/details/update');
  };

  return (
    <div>
      <PageHead
        title="Mon Profil de l'utilisateur"
        actions={
          <Button type="primary" icon="edit" onClick={handleOpenEditPage} className="ant-btn-textual">
            <span>Modifier</span>
          </Button>
        }
      />
      <Row>
        <Col md={7}>
          <Card bordered={false} bodyStyle={{ padding: '0 8px' }}>
            <div style={{ textAlign: 'center' }}>
              <Avatar name={`${account.firstName} ${account.lastName}`} size={120} borderRadius="4px" />
            </div>
          </Card>
        </Col>
        <Col md={17} style={{ padding: 16 }}>
          <div>
            <h3>
              <b>{`${account.firstName} ${account.lastName}`}</b>
            </h3>
            <div>
              <small>
                <i>
                  {account.authorities
                    .filter(r => r !== AUTHORITIES.USER)
                    .map(r => AUTHORITIES_LABELS[r])
                    .join(', ')}
                </i>
              </small>
            </div>
          </div>
          <Divider />
          <dl className="jh-entity-details" style={{ padding: 0 }}>
            {account.login !== account.email && (
              <>
                <dt>Pseudo</dt>
                <dd>{account.login}</dd>
              </>
            )}
            <dt>Prénom</dt>
            <dd>{account.firstName}</dd>
            <dt>Nom</dt>
            <dd>{account.lastName}</dd>
            <dt>E-mail</dt>
            <dd>{account.email}</dd>
            <dt>Date de Création</dt>
            <dd>
              <DateFormat value={account.createdDate} format={APP_DATE_FORMAT} />
            </dd>
          </dl>
        </Col>
      </Row>
    </div>
  );
};

const mapStateToProps = ({ authentication }: IRootState) => ({
  account: authentication.account,
  loading: authentication.loading,
  isAuthenticated: authentication.isAuthenticated
});

const mapDispatchToProps = { getSession };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ProfileDetails));
