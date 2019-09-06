import React, { FunctionComponent, useEffect } from 'react';
import { IRootState } from 'app/shared/reducers';
import { connect } from 'react-redux';
import { Avatar } from 'app/application/components/avatar/avatar.component';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { Button, Card, Col, Icon, Row, Tabs } from 'antd';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import IBAN from 'iban';
import { formatMoney } from 'app/application/common/utils/invoice-utils';
import { LoadingDiv } from 'app/application/common/config/ui-constants';
import * as PersistedConfiguration from 'app/application/entities/persisted-configuration/persisted-configuration.actions';
import { sirenFormatter } from 'app/application/components/zsoft-form/custom-fields/sirenField.component';
import { tvaFormatter } from 'app/application/components/zsoft-form/custom-fields/tvaField.component';
import {
  COMPANY_CP_KEY_FORMAT,
  COMPANY_KEY_FORMAT,
  COMPANY_RTT_KEY_FORMAT,
  DEFAULTS_CP_KEY,
  DEFAULTS_RTT_KEY
} from 'app/application/common/config/persisted-config-constants';
import { MissingFieldsAlert } from 'app/application/modules/company/company-details/missing-field-alert';

interface ICompanyProfileProps extends StateProps, DispatchProps, RouteComponentProps {}

const CompanyProfile: FunctionComponent<ICompanyProfileProps> = props => {
  const { company, configurations, constants, loading } = props;
  let loadConfigCounter = 0;

  useEffect(() => {
    loadConfigCounter++;
    props.getConfigurations(COMPANY_KEY_FORMAT(props.company.id));
  }, []);

  useEffect(
    () => {
      if (props.configurations.length === 0 && loadConfigCounter === 1) {
        props.getConfigurations('defaults.');
      }
    },
    [props.configurations]
  );

  if (loading || !company.id) {
    return <LoadingDiv />;
  }
  const defaultConfCP = constants.find(conf => conf.key === DEFAULTS_CP_KEY);
  const defaultConfRTT = constants.find(conf => conf.key === DEFAULTS_RTT_KEY);
  const confCP = configurations.find(conf => conf.key === COMPANY_CP_KEY_FORMAT(company.id));
  const confRTT = configurations.find(conf => conf.key === COMPANY_RTT_KEY_FORMAT(company.id));
  return (
    <div className="page-layout">
      <PageHead
        title={`Entreprise ${company.form} ${company.name}`}
        onBack="/app/home"
        actions={
          <>
            <Button key="edit" type="primary" className="ant-btn-textual" title="Modifier les information de l'entreprise">
              <Link replace to="/app/company/update">
                <Icon type="edit" />
                <span>Modifier</span>
              </Link>
            </Button>
            <Button key="config" className="ant-btn-textual" title="Modifier les configurations de l'entreprise">
              <Link replace to="/app/company/update-config">
                <Icon type="setting" />
                <span>Configurations</span>
              </Link>
            </Button>
          </>
        }
        margin={false}
      />
      <Row type="flex">
        <Col xs={24} sm={24} md={7} lg={4} style={{ borderRight: '1px solid #e8e8e8', background: '#f6f6f6' }}>
          <Card bordered={false} style={{ background: 'none' }}>
            <div className="text-center">
              <Avatar
                name={company.name}
                src={company.logo ? `data:${company.logoContentType};base64, ${company.logo}` : ''}
                size={120}
                borderRadius="4px"
              />
              <h3>
                <b>{company.name}</b>
              </h3>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={17} lg={20} className="padding-bottom-1rem">
          <MissingFieldsAlert company={company} />
          <Tabs size="small">
            <Tabs.TabPane
              tab={
                <small>
                  <Icon type="info-circle" /> À propos
                </small>
              }
              key="about"
            >
              <PageHead title="À propos de l'entreprise" />
              <dl className="jh-entity-details">
                <dt>Nom d'entreprise</dt>
                <dd>
                  {company.form} {company.name}
                </dd>
                <dt>Numéro Siren</dt>
                <dd>{sirenFormatter(company.siren)}</dd>
                <dt>Numéro de TVA</dt>
                <dd>{tvaFormatter(company.tva)}</dd>
                <dt>E-mail</dt>
                <dd>
                  <a href={`mailto:${company.email}`}>{company.email}</a>
                </dd>
                <dt>Nom de domain</dt>
                <dd>{company.domainName}</dd>
                {company.capital && (
                  <>
                    <dt>Capital social</dt>
                    <dd>{formatMoney(parseFloat(company.capital))} €</dd>
                  </>
                )}
              </dl>
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={
                <small>
                  <Icon type="home" /> Adresse
                </small>
              }
              key="address"
            >
              {/* COMPANY Address */}
              <PageHead title="Adresse de l'entreprise" />
              <dl className="jh-entity-details">
                <dt>Adresse Ligne 1</dt>
                <dd>{company.addressLine1}</dd>
                <dt>Adresse Ligne 2</dt>
                <dd>{company.addressLine2}</dd>
                <dt>Ville</dt>
                <dd>{company.city}</dd>
                <dt>Code postal</dt>
                <dd>{company.postalCode}</dd>
                <dt>Pays</dt>
                <dd>{company.country}</dd>
              </dl>
            </Tabs.TabPane>
            {company.iban && (
              <Tabs.TabPane
                tab={
                  <small>
                    <Icon type="bank" /> Compte bancaire
                  </small>
                }
                key="bank_account"
              >
                {/* COMPANY BANK ACCOUNT */}
                <PageHead title="Coordonnées bancaires" />
                <dl className="jh-entity-details">
                  <dt>Titulaire du compte</dt>
                  <dd>
                    {company.form} {company.name}
                  </dd>
                  <dt>RIB</dt>
                  <dd>{IBAN.toBBAN(company.iban)}</dd>
                  <dt>IBAN</dt>
                  <dd>{IBAN.printFormat(company.iban, ' ')}</dd>
                  {company.bic && (
                    <>
                      <dt>BIC</dt>
                      <dd>{company.bic}</dd>
                    </>
                  )}
                </dl>
              </Tabs.TabPane>
            )}
            <Tabs.TabPane
              tab={
                <small>
                  <Icon type="setting" /> Configuration
                </small>
              }
              key="config"
            >
              <PageHead title="Congés et absences" />
              <dl className="jh-entity-details">
                <dt>Congé Payés</dt>
                <dd>{confCP ? confCP.value : defaultConfCP ? defaultConfCP.value : 25} jour par année</dd>
                <dt>Réduction du temps de travail</dt>
                <dd>{confRTT ? confRTT.value : defaultConfRTT ? defaultConfRTT.value : 8} jour par année</dd>
              </dl>
            </Tabs.TabPane>
          </Tabs>
        </Col>
      </Row>
    </div>
  );
};

const mapStateToProps = ({ application, persistedConfiguration, constant }: IRootState) => ({
  company: application.company.current,
  loading: application.company.loading_current,
  configurations: persistedConfiguration.entities,
  constants: constant.entities
});

const mapDispatchToProps = {
  getConfigurations: PersistedConfiguration.getByKey
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(CompanyProfile));
