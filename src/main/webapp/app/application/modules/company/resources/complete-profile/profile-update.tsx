import React, { FunctionComponent, RefObject, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import * as ResourceContract from 'app/application/entities/resource-contract/resource-contract.actions';
import * as ResourceExt from 'app/application/entities/resource/resource.actions';
import { RouteComponentProps } from 'react-router-dom';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import { Gender, IResource } from 'app/shared/model/resource.model';
import { convertDateTimeFromServer } from 'app/application/modules/company/resources/resource-form/resources-form';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Button, Col, Divider, Row } from 'antd';
import DateField from 'app/application/components/zsoft-form/generic-fields/dateField.component';
import RadioFields from 'app/application/components/zsoft-form/generic-fields/radioFields.component';
import TextField from 'app/application/components/zsoft-form/generic-fields/textField.component';
import PhoneNumberField, { isValidPhoneNumber } from 'app/application/components/zsoft-form/custom-fields/phoneField.component';
import AddressForm from 'app/application/components/zsoft-form/custom-fields/addressForm.component';
import moment from 'moment';
import { FORMAT_DATE_SERVER } from 'app/application/common/config/constants';

const validationSchema = Yup.object().shape({
  firstName: Yup.string()
    .label('Prénom')
    .nullable(true)
    .required(),
  lastName: Yup.string()
    .label('Nom')
    .nullable(true)
    .required(),
  secondaryEmail: Yup.string()
    .label('E-mail secondaire')
    .email()
    .nullable(true),
  gender: Yup.string()
    .label('Sexe')
    .nullable(true)
    .required(),
  dateOfBirth: Yup.date()
    .label('Date de naissance')
    .nullable(true)
    .required(),
  phoneNumber: Yup.string()
    .label('Numéro de téléphone')
    .test(
      'valid-phone',
      'Le numéro Téléphone composé de 9 chiffres, ex: +33 1 23 45 67 89',
      value => !value || value === '' || (value && isValidPhoneNumber(value))
    )
    .nullable(true)
    .required(),
  addressLine1: Yup.string()
    .label('Adresse Ligne 1')
    .nullable(true)
    .required(),
  addressLine2: Yup.string()
    .label('Adresse Ligne 2')
    .nullable(true),
  city: Yup.string()
    .label('Ville')
    .nullable(true)
    .required(),
  postalCode: Yup.string()
    .label('Code postal')
    .nullable(true)
    .required(),
  country: Yup.string()
    .label('Pays')
    .nullable(true)
    .required()
});

interface IResourceProfileUpdateProps extends StateProps, DispatchProps, RouteComponentProps {}

const ProfileUpdate: FunctionComponent<IResourceProfileUpdateProps> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>(null);
  const { profile, updating } = props;

  useEffect(() => {
    props.resetContracts();
    props.getContractByResource(props.profile.id);
  }, []);

  const handleSave = (values: IResource) => {
    const resource = {
      ...values,
      dateOfBirth: moment(values.dateOfBirth).format(FORMAT_DATE_SERVER)
    };
    props.completeProfile(resource);
  };

  const birthDayMaxDate = current => current > moment().add(-23, 'years');

  return (
    <Formik ref={formikRef} initialValues={profile} enableReinitialize validationSchema={validationSchema} onSubmit={handleSave}>
      {formProps => (
        <Form>
          <PageHead
            title="Modifier mon profil"
            onBack="/app/resource/profile"
            actions={
              <>
                <Button type="primary" htmlType="submit" icon="save" loading={updating} className="ant-btn-textual">
                  <span>Sauvegarder</span>
                </Button>
              </>
            }
          />
          <Divider className="margin-bottom-8" orientation="left">
            Informations personnelles
          </Divider>
          <Row>
            <Col lg={16} md={20}>
              <Row>
                <Col sm={6} className="ant-form-item-label">
                  <label htmlFor="firstName">
                    Nom et Prénom <b className="required-start">*</b>
                  </label>
                </Col>
                <Col sm={9}>
                  <TextField name="firstName" placeholder="Prénom" autoFocus />
                </Col>
                <Col sm={9}>
                  <TextField name="lastName" placeholder="Nom" />
                </Col>
              </Row>
              <TextField label="E-mail secondaire" name="secondaryEmail" layout="horizontal" />
              <RadioFields
                label="Sexe"
                name="gender"
                layout="horizontal"
                options={[
                  { label: 'Masculin', value: Gender.MALE },
                  { label: 'Féminin', value: Gender.FEMALE },
                  { label: 'Autre', value: Gender.OTHER }
                ]}
              />
              <DateField
                label="Date de naissance"
                name="dateOfBirth"
                disabledDate={birthDayMaxDate}
                defaultPickerValue={convertDateTimeFromServer(formProps.values.dateOfBirth) || moment().add(-23, 'years')}
                layout="horizontal"
              />
            </Col>
          </Row>
          <Divider className="margin-bottom-8" orientation="left">
            Détails du contact
          </Divider>
          <Row>
            <Col lg={16} md={20}>
              <PhoneNumberField name="phoneNumber" label="N° Téléphone" layout="horizontal" autoFocus />
              <AddressForm formProps={formProps} />
            </Col>
          </Row>
        </Form>
      )}
    </Formik>
  );
};

const mapStateToProps = ({ application, resource }: IRootState) => ({
  profile: application.resource.current.entity,
  updating: resource.updating,
  updateSuccess: resource.updateSuccess,
  errorMessage: resource.errorMessage
});

const mapDispatchToProps = {
  resetContracts: ResourceContract.resetContracts,
  getContractByResource: ResourceContract.getByResource,
  completeProfile: ResourceExt.completeProfile
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(ProfileUpdate);
