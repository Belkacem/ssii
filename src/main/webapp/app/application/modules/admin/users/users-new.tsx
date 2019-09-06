import React, { RefObject, useEffect, useRef, useState, FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { Button, Col, Row } from 'antd';
import { createUser, getRoles, reset } from 'app/modules/administration/user-management/user-management.reducer';
import { IRootState } from 'app/shared/reducers';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { AUTHORITIES_LABELS } from 'app/application/common/config/constants';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import SelectField from 'app/application/components/zsoft-form/generic-fields/selectField.component';
import TextField from 'app/application/components/zsoft-form/generic-fields/textField.component';

const validationSchema = Yup.object().shape({
  firstName: Yup.string()
    .label('Prénom')
    .max(50),
  lastName: Yup.string()
    .label('Nom')
    .max(50),
  email: Yup.string()
    .label('E-mail')
    .email()
    .required()
    .min(5)
    .max(254),
  authorities: Yup.array()
    .label('Les autorités')
    .min(1)
    .required()
});

export interface IUsersNewProps extends StateProps, DispatchProps, RouteComponentProps {}

const UsersNew: FunctionComponent<IUsersNewProps> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>(null);
  const { updating, roles, updateSuccess } = props;
  const [isMounted, didMounted] = useState(false);

  if (!isMounted) {
    props.reset();
    props.getRoles();
    didMounted(true);
  }

  useEffect(
    () => {
      if (updateSuccess) {
        handleGoBack();
      }
    },
    [updateSuccess]
  );

  const handleSave = values => {
    const payload = {
      ...values,
      langKey: 'fr'
    };
    if (payload['authorities'].indexOf('ROLE_USER') === -1) {
      payload['authorities'].push('ROLE_USER');
    }
    payload['activated'] = true;
    payload['login'] = payload.email;
    props.createUser(payload);
  };

  const handleGoBack = () => {
    props.history.goBack();
  };

  return (
    <div>
      <Formik ref={formikRef} initialValues={{}} enableReinitialize validationSchema={validationSchema} onSubmit={handleSave}>
        <Form>
          <PageHead
            title="Crée un compte utilisateur"
            onBack="/app/admin/users"
            actions={
              <>
                <Button type="primary" htmlType="submit" icon="save" loading={updating} className="ant-btn-textual">
                  <span>Sauvegarder</span>
                </Button>
              </>
            }
          />
          <Row className="bg-white">
            <Col xs={22} sm={22} md={16} lg={12} style={{ padding: 24 }}>
              <Row>
                <Col span={6} className="ant-form-item-label">
                  <label htmlFor="firstName">Nom et Prénom</label>
                </Col>
                <Col span={9}>
                  <TextField name="firstName" placeholder="Prénom" autoFocus />
                </Col>
                <Col span={9}>
                  <TextField name="lastName" placeholder="Nom" />
                </Col>
              </Row>
              <TextField label="E-mail" name="email" placeholder="E-mail" layout="horizontal" />
              <SelectField
                label="Les autorités"
                name="authorities"
                placeholder="Les autorités"
                multiple
                options={roles.map(role => ({ label: AUTHORITIES_LABELS[role], value: role }))}
                layout="horizontal"
              />
            </Col>
          </Row>
        </Form>
      </Formik>
    </div>
  );
};

const mapStateToProps = ({ userManagement }: IRootState) => ({
  roles: userManagement.authorities,
  updating: userManagement.updating,
  updateSuccess: userManagement.updateSuccess
});

const mapDispatchToProps = { getRoles, createUser, reset };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(UsersNew));
