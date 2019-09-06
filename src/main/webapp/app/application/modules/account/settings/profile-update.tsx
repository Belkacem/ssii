import React, { ChangeEvent, FunctionComponent, RefObject, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { Button, Col, message, Row } from 'antd';
import { IRootState } from 'app/shared/reducers';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import TextField from 'app/application/components/zsoft-form/generic-fields/textField.component';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { saveAccountSettings, reset } from 'app/modules/account/settings/settings.reducer';

interface IProfileUpdateProps extends DispatchProps, StateProps, RouteComponentProps {}

export const ProfileUpdate: FunctionComponent<IProfileUpdateProps> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>(null);
  const { loading, updateSuccess } = props;
  const saveEntity = values => {
    if (!loading) {
      props.saveAccountSettings({ ...props.account, ...values });
    }
  };

  useEffect(
    () => {
      if (updateSuccess) {
        props.history.push('/app/account/details');
        message.success('Félicitations!, Vous avez change votre profile information avec succès.');
        props.reset();
      }
    },
    [updateSuccess]
  );

  const validationSchema = Yup.object().shape({
    firstName: Yup.string()
      .label('Prénom')
      .required(),
    lastName: Yup.string()
      .label('Nom')
      .required()
  });

  return (
    <Formik ref={formikRef} initialValues={props.account} enableReinitialize validationSchema={validationSchema} onSubmit={saveEntity}>
      <Form>
        <PageHead
          title="Informations personnelles"
          subTitle="Mettez à jour vos informations de compte"
          onBack="/app/account/details"
          actions={
            <Button type="primary" htmlType="submit" loading={loading} icon="save" className="ant-btn-textual">
              <span>Sauvegarder</span>
            </Button>
          }
        />
        <div style={{ padding: '0 16px' }}>
          <Row>
            <Col sm={24} md={12} lg={8}>
              <TextField name="firstName" label="Prénom" layout="horizontal" autoFocus />
              <TextField name="lastName" label="Nom" layout="horizontal" />
            </Col>
          </Row>
        </div>
      </Form>
    </Formik>
  );
};

const mapStateToProps = ({ authentication, settings }: IRootState) => ({
  account: authentication.account,
  updateSuccess: settings.updateSuccess,
  loading: settings.loading
});

const mapDispatchToProps = { saveAccountSettings, reset };

type DispatchProps = typeof mapDispatchToProps;
type StateProps = ReturnType<typeof mapStateToProps>;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ProfileUpdate));
