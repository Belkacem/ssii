import React, { RefObject, useEffect, useRef, FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { Alert, Button, Col, Row, Skeleton } from 'antd';
import { createUser, getRoles, getUser, reset, updateUser } from 'app/modules/administration/user-management/user-management.reducer';
import { IRootState } from 'app/shared/reducers';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { AUTHORITIES_LABELS } from 'app/application/common/config/constants';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import SelectField from 'app/application/components/zsoft-form/generic-fields/selectField.component';
import CheckboxField from 'app/application/components/zsoft-form/generic-fields/checkboxField.component';
import TextField from 'app/application/components/zsoft-form/generic-fields/textField.component';

export interface IUsersUpdateProps extends StateProps, DispatchProps, RouteComponentProps<{ login: string }> {}

const UsersUpdate: FunctionComponent<IUsersUpdateProps> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>(null);
  const { user, loading, updating, roles, errorMessage, updateSuccess } = props;

  useEffect(
    () => {
      props.reset();
      props.getUser(props.match.params.login);
      props.getRoles();
    },
    [props.match.params.login]
  );

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
    if (!updating) {
      props.updateUser(payload);
    }
  };

  const handleSubmit = () => {
    formikRef.current.submitForm();
  };

  const handleGoBack = () => {
    props.history.goBack();
  };

  const validationSchema = Yup.object().shape({
    firstName: Yup.string()
      .label('Prénom')
      .max(50),
    lastName: Yup.string()
      .label('Nom')
      .max(50),
    login: Yup.string()
      .label('Pseudo')
      .min(1)
      .max(50)
      .required(),
    email: Yup.string()
      .label('E-mail')
      .email()
      .required()
      .min(5)
      .max(254),
    activated: Yup.boolean().label('Activivation'),
    authorities: Yup.array()
      .label('Les autorités')
      .min(1)
      .required()
  });

  return (
    <div>
      <PageHead
        title="Modifie un compte utilisateur"
        onBack={handleGoBack}
        actions={
          <Button type="primary" onClick={handleSubmit} loading={updating} icon="save" className="ant-btn-textual">
            <span>Sauvegarder</span>
          </Button>
        }
      />
      {loading ? (
        <Skeleton loading active paragraph title avatar />
      ) : (
        <div style={{ padding: 24 }}>
          <Formik ref={formikRef} initialValues={user} enableReinitialize validationSchema={validationSchema} onSubmit={handleSave}>
            <Form>
              {errorMessage || !props.match.params.login ? (
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
                <Row className="bg-white">
                  <Col xs={22} sm={22} md={16} lg={12}>
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
                    <TextField label="Pseudo" placeholder="Pseudo" name="login" layout="horizontal" />
                    <TextField label="E-mail" placeholder="E-mail" name="email" layout="horizontal" />
                    <CheckboxField label="Active" optionLabel="Oui" name="activated" layout="horizontal" />
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
              )}
            </Form>
          </Formik>
        </div>
      )}
    </div>
  );
};

const mapStateToProps = ({ userManagement }: IRootState) => ({
  user: userManagement.user,
  roles: userManagement.authorities,
  loading: userManagement.loading,
  updating: userManagement.updating,
  errorMessage: userManagement.errorMessage,
  updateSuccess: userManagement.updateSuccess
});

const mapDispatchToProps = { getUser, getRoles, updateUser, createUser, reset };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(UsersUpdate));
