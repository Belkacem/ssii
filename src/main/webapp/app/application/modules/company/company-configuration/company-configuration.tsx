import React, { FunctionComponent, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Button, Col, Divider, Row } from 'antd';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import * as PersistedConfiguration from 'app/application/entities/persisted-configuration/persisted-configuration.actions';
import NumberField from 'app/application/components/zsoft-form/generic-fields/numberField.component';
import {
  DEFAULTS_CP_KEY,
  DEFAULTS_RTT_KEY,
  COMPANY_KEY_FORMAT,
  COMPANY_CP_KEY_FORMAT,
  COMPANY_RTT_KEY_FORMAT
} from 'app/application/common/config/persisted-config-constants';

export interface ICompanyConfigProps extends StateProps, DispatchProps, RouteComponentProps {}

const validationSchema = Yup.object().shape({
  cp: Yup.number()
    .label('Congé Payés')
    .required(),
  rtt: Yup.number()
    .label('Réduction du temps de travail')
    .required()
});

const CompanyConfig: FunctionComponent<ICompanyConfigProps> = props => {
  const { company, configurations, constants, loading, updating } = props;
  const [mounted, setMounted] = useState(false);
  let loadConfigCounter = 0;

  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(
    () => {
      if (!!company.id) {
        loadConfigCounter++;
        props.getConfigurations(COMPANY_KEY_FORMAT(company.id));
      }
    },
    [company]
  );

  useEffect(
    () => {
      if (props.updateSuccess && mounted) {
        handleClose();
      }
    },
    [props.updateSuccess]
  );

  useEffect(
    () => {
      if (configurations.length === 0 && loadConfigCounter === 1) {
        props.getConfigurations('defaults.');
      }
    },
    [configurations]
  );

  const handleClose = () => {
    props.history.push('/app/company/profile');
  };

  const handleSave = formValues => {
    const values = {};
    values[COMPANY_CP_KEY_FORMAT(company.id)] = formValues.cp;
    values[COMPANY_RTT_KEY_FORMAT(company.id)] = formValues.rtt;
    Object.keys(values).map(k => {
      const conf = configurations.find(c => c.key === k);
      if (conf) {
        const payload = {
          ...conf,
          value: `${values[conf.key]}`
        };
        props.updateConfigurations(payload);
      } else {
        const payload = {
          userId: props.account.id,
          key: k,
          value: `${values[k]}`
        };
        props.createConfigurations(payload);
      }
    });
  };
  const defaultConfCP = constants.find(conf => conf.key === DEFAULTS_CP_KEY);
  const defaultConfRTT = constants.find(conf => conf.key === DEFAULTS_RTT_KEY);
  const confCP = configurations.find(conf => conf.key === COMPANY_CP_KEY_FORMAT(company.id));
  const confRTT = configurations.find(conf => conf.key === COMPANY_RTT_KEY_FORMAT(company.id));
  const defaultValues = {
    cp: confCP ? confCP.value : defaultConfCP ? defaultConfCP.value : 25,
    rtt: confRTT ? confRTT.value : defaultConfRTT ? defaultConfRTT.value : 8
  };
  return (
    <Formik initialValues={defaultValues} validationSchema={validationSchema} onSubmit={handleSave} enableReinitialize>
      <Form className="fullwidth">
        <PageHead
          title="Configurations de l'entreprise"
          onBack="/app/company/profile"
          actions={
            <Button type="primary" htmlType="submit" loading={updating} icon="save" className="ant-btn-textual">
              <span>Sauvegarder</span>
            </Button>
          }
        />
        <div className="padding-1rem">
          <Divider orientation="left" className="margin-bottom-8">
            Congés et absences
          </Divider>
          <Row>
            <Col lg={12} md={16} sm={24} xs={24}>
              <NumberField
                label="CP"
                helper="Congé Payés (jour/année)"
                name="cp"
                layout="horizontal"
                step={1}
                min={0}
                suffix="jours"
                loading={loading}
              />
              <NumberField
                label="RTT"
                helper="Réduction du temps de travail (jour/année)"
                name="rtt"
                layout="horizontal"
                step={1}
                min={0}
                suffix="jours"
                loading={loading}
              />
              <br />
            </Col>
          </Row>
        </div>
      </Form>
    </Formik>
  );
};

const mapStateToProps = ({ application, authentication, persistedConfiguration, constant }: IRootState) => ({
  company: application.company.current,
  account: authentication.account,
  configurations: persistedConfiguration.entities,
  loading: persistedConfiguration.loading,
  updating: persistedConfiguration.updating,
  updateSuccess: persistedConfiguration.updateSuccess,
  constants: constant.entities
});

const mapDispatchToProps = {
  updateConfigurations: PersistedConfiguration.update,
  createConfigurations: PersistedConfiguration.create,
  getConfigurations: PersistedConfiguration.getByKey
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(CompanyConfig));
