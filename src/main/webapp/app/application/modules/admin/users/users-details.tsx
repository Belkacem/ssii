import React, { useEffect, FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { Alert, Button, Card, Col, Icon, Row, Tabs, Tag, Skeleton } from 'antd';
import { APP_DATE_FORMAT } from 'app/config/constants';
import { getUser, reset } from 'app/modules/administration/user-management/user-management.reducer';
import { IRootState } from 'app/shared/reducers';
import { Avatar } from 'app/application/components/avatar/avatar.component';
import { AUTHORITIES_LABELS } from 'app/application/common/config/constants';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import moment from 'moment';
import { DateFormat } from 'app/application/components/date.format.component';

export interface IUsersDetailsProps extends StateProps, DispatchProps, RouteComponentProps<{ login: string }> {}

const UsersDetails: FunctionComponent<IUsersDetailsProps> = props => {
  const { user, loading, errorMessage } = props;

  useEffect(
    () => {
      props.reset();
      props.getUser(props.match.params.login);
    },
    [props.match.params.login]
  );

  return (
    <div className="page-layout">
      <PageHead
        title="Détails d'utilisateur"
        onBack="/app/admin/users"
        actions={
          <Button.Group>
            <Button type="primary" className="ant-btn-textual">
              <Link replace to={`/app/admin/users/${user.login}/update`}>
                <Icon type="edit" />
                <span>Modifier</span>
              </Link>
            </Button>
          </Button.Group>
        }
        margin={false}
      />
      {(!user.id && !errorMessage) || loading ? (
        <Skeleton loading active paragraph title avatar />
      ) : errorMessage || !props.match.params.login ? (
        <div className="padding-3rem">
          <Alert
            message="Erreur"
            description={
              <small>
                Le compte <b>"{props.match.params.login}"</b> utilisateur non trouvé !
              </small>
            }
            type="error"
            showIcon
          />
        </div>
      ) : (
        <Row type="flex">
          <Col xs={24} sm={24} md={7} lg={4} style={{ borderRight: '1px solid #e8e8e8', background: '#f6f6f6' }}>
            <Card bordered={false} style={{ background: 'none' }}>
              <div className="text-center">
                <Avatar name={`${user.firstName} ${user.lastName}`} size={120} borderRadius="4px" />
                <h3>
                  <b>{`${user.firstName} ${user.lastName}`}</b>
                </h3>
                <div>
                  <small>
                    <i>{user.authorities.map(r => AUTHORITIES_LABELS[r]).join(', ')}</i>
                  </small>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={24} md={17} lg={20} className="padding-bottom-1rem">
            <Tabs
              defaultActiveKey="user-about"
              size="small"
              className="padding-bottom-1rem"
              tabBarGutter={16}
              animated={{ inkBar: false, tabPane: true }}
            >
              <Tabs.TabPane
                tab={
                  <small>
                    <Icon type="info-circle" /> À propos
                  </small>
                }
                key="user-about"
              >
                <PageHead title="À propos de l'utilisateur" />
                <dl className="jh-entity-details">
                  <dt>Pseudo</dt>
                  <dd>
                    <span>{user.login}</span>
                    &nbsp;
                    {user.activated ? <Tag color="green">Activer</Tag> : <Tag color="red">Désactiver</Tag>}
                  </dd>
                  <dt>Prénom</dt>
                  <dd>{user.firstName}</dd>
                  <dt>Nom</dt>
                  <dd>{user.lastName}</dd>
                  <dt>Adresse Email</dt>
                  <dd>
                    <a href={`mailto:${user.email}`}>{user.email}</a>
                  </dd>
                  <dt>Crée par</dt>
                  <dd>
                    {user.createdBy === user.login ? (
                      user.createdBy
                    ) : (
                      <Link to={`/app/admin/users/${user.createdBy}`}>{user.createdBy}</Link>
                    )}
                  </dd>
                  {user.createdDate && (
                    <>
                      <dt>Date de Création</dt>
                      <dd>
                        <DateFormat value={user.createdDate} format={APP_DATE_FORMAT} /> ({moment(user.createdDate).fromNow()})
                      </dd>
                    </>
                  )}
                  <dt>Dernier modification</dt>
                  <dd>
                    {user.lastModifiedBy === user.login ? (
                      user.lastModifiedBy
                    ) : (
                      <Link to={`/app/admin/users/${user.lastModifiedBy}`}>{user.lastModifiedBy}</Link>
                    )}
                  </dd>
                  {user.lastModifiedDate && (
                    <>
                      <dt>Date de la dernier modification</dt>
                      <dd>
                        <DateFormat value={user.lastModifiedDate} format={APP_DATE_FORMAT} /> ({moment(user.lastModifiedDate).fromNow()})
                      </dd>
                    </>
                  )}
                  <dt>Les autorités</dt>
                  <dd>
                    {user.authorities.map((authority, i) => (
                      <Tag key={`user-auth-${i}`} color="blue">
                        {AUTHORITIES_LABELS[authority]}
                      </Tag>
                    ))}
                  </dd>
                </dl>
              </Tabs.TabPane>
            </Tabs>
          </Col>
        </Row>
      )}
    </div>
  );
};

const mapStateToProps = ({ userManagement }: IRootState) => ({
  user: userManagement.user,
  loading: userManagement.loading,
  errorMessage: userManagement.errorMessage
});

const mapDispatchToProps = { getUser, reset };
type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(UsersDetails));
