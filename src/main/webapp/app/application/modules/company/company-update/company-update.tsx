import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Button, Col, Divider, Icon, message, Row, Upload } from 'antd';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { Avatar } from 'app/application/components/avatar/avatar.component';
import * as CompanyExt from 'app/application/entities/company/company.actions';
import AddressForm from 'app/application/components/zsoft-form/custom-fields/addressForm.component';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import { Form as CompanyForms } from 'app/shared/model/company.model';
import IBAN from 'iban';
import { LoadingDiv } from 'app/application/common/config/ui-constants';
import { getUrlParameter } from 'app/application/common/utils/url-utils';
import SirenField, { isValidSiren } from 'app/application/components/zsoft-form/custom-fields/sirenField.component';
import TvaField, { isValidTva } from 'app/application/components/zsoft-form/custom-fields/tvaField.component';
import IbanField, { isValidIban } from 'app/application/components/zsoft-form/custom-fields/ibanField.component';
import MoneyField from 'app/application/components/zsoft-form/custom-fields/moneyField.component';
import SelectField from 'app/application/components/zsoft-form/generic-fields/selectField.component';
import TextField from 'app/application/components/zsoft-form/generic-fields/textField.component';

export interface ICompanyUpdateProps extends StateProps, DispatchProps, RouteComponentProps<{ f: string }> {}

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .label("Nom de l'entreprise")
    .required(),
  form: Yup.string()
    .label('Forme')
    .required(),
  siren: Yup.string()
    .label('Numéro de SIREN')
    .required()
    .test('valid-siren', 'Le numéro SIREN composé de 9 chiffres', siren => siren && isValidSiren(siren)),
  tva: Yup.string()
    .label('Numéro de TVA')
    .required()
    .test('valid-tva', 'la Composition du numéro de TVA :[FR + code clé (40) + numéro SIREN (123456824)]', tva => tva && isValidTva(tva))
    .nullable(true),
  domainName: Yup.string().nullable(true),
  email: Yup.string()
    .email()
    .nullable(true),
  addressLine1: Yup.string()
    .label('Adresse Ligne 1')
    .required(),
  addressLine2: Yup.string().label('Adresse Ligne 2'),
  city: Yup.string()
    .label('Ville')
    .required(),
  postalCode: Yup.string()
    .label('Code postal')
    .required(),
  country: Yup.string()
    .label('Pays')
    .required(),
  iban: Yup.string()
    .label('IBAN')
    .test('valid-iban', "Ce numéro IBAN n'est pas valide", iban => !iban || iban === '' || (iban && isValidIban(iban)))
    .nullable(true),
  bik: Yup.string()
    .label('BIK')
    .nullable(true),
  capital: Yup.number()
    .label('Capital social')
    .nullable(true)
});

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

const companyForms = [
  { value: CompanyForms.SARL, label: 'SARL' },
  { value: CompanyForms.EURL, label: 'EURL' },
  { value: CompanyForms.SAS, label: 'SAS' },
  { value: CompanyForms.SASU, label: 'SASU' },
  { value: CompanyForms.OTHER, label: 'Autre' }
];

const CompanyUpdate: FunctionComponent<ICompanyUpdateProps> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>(null);
  const { company, loading, updating } = props;
  const [mounted, setMounted] = useState(false);
  const customRequest = () => false;

  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(
    () => {
      const focusParam = getUrlParameter('f', props.location.search);
      if (focusParam && formikRef.current && document.getElementById(focusParam)) {
        document.getElementById(focusParam).focus();
      }
    },
    [props.location.search]
  );

  useEffect(
    () => {
      if (props.updateSuccess && mounted) {
        handleClose();
      }
    },
    [props.updateSuccess]
  );

  const handleChange = (formProps, info) => {
    if (info.file.originFileObj) {
      getBase64(info.file.originFileObj, imageBase64 => {
        let encoded = imageBase64.replace(/^data:(.*;base64,)?/, '');
        if (encoded.length % 4 > 0) {
          encoded += '='.repeat(4 - (encoded.length % 4));
        }
        formProps.setFieldValue('logo', encoded);
        formProps.setFieldValue('logoContentType', info.file.originFileObj.type);
      });
    }
  };

  const beforeUpload = file => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Vous pouvez uniquement télécharger des images!\n');
    }
    const isLt1M = file.size / 1024 / 1024 < 1;
    if (!isLt1M) {
      message.error("La taille d'image doit être inférieure à 1 Mo!!");
    }
    return isImage && isLt1M;
  };

  const handleClose = () => {
    props.history.push('/app/company/profile');
  };

  const handleSave = values => {
    const payload = {
      ...company,
      ...values,
      iban: IBAN.isValid(values.iban) ? IBAN.electronicFormat(values.iban) : null
    };
    props.updateCompany(payload);
  };

  if (loading || !company.id) {
    return <LoadingDiv />;
  }

  return (
    <Formik ref={formikRef} initialValues={company} validationSchema={validationSchema} onSubmit={handleSave} enableReinitialize>
      {formProps => (
        <Form className="fullwidth">
          <PageHead
            title={`Entreprise ${company.form} ${company.name}`}
            onBack="/app/company/profile"
            actions={
              <Button type="primary" htmlType="submit" loading={updating} icon="save" className="ant-btn-textual">
                <span>Sauvegarder</span>
              </Button>
            }
          />
          <Row className="padding-1rem">
            <Col lg={16} md={20} sm={24} xs={24}>
              <Row>
                <Col sm={6} className="ant-form-item-label">
                  <label htmlFor="firstName">Logo</label>
                </Col>
                <Col sm={18}>
                  <Upload
                    name="avatar"
                    listType="picture-card"
                    className="avatar-uploader"
                    showUploadList={false}
                    customRequest={customRequest}
                    beforeUpload={beforeUpload}
                    onChange={handleChange.bind(null, formProps)}
                    accept="image/*"
                  >
                    {formProps.values.logo ? (
                      <Avatar
                        name={formProps.values.name}
                        src={`data:${formProps.values.logoContentType};base64, ${formProps.values.logo}`}
                        size={120}
                        borderRadius="4px"
                      />
                    ) : (
                      <div>
                        <Icon type="plus" />
                        <div className="ant-upload-text">Upload</div>
                      </div>
                    )}
                  </Upload>
                </Col>
              </Row>
            </Col>
            <Divider orientation="left" className="margin-bottom-8">
              Information de base
            </Divider>
            <Col lg={16} md={20} sm={24} xs={24}>
              <Row>
                <Col sm={6} className="ant-form-item-label">
                  <label htmlFor="firstName">
                    Nom de l'entreprise <b className="required-start">*</b>
                  </label>
                </Col>
                <Col sm={6}>
                  <SelectField name="form" placeholder="Forme" options={companyForms} />
                </Col>
                <Col sm={12}>
                  <TextField name="name" placeholder="Nom de l'entreprise" autoFocus />
                </Col>
              </Row>
              <SirenField layout="horizontal" />
              <TvaField layout="horizontal" helper="le numéro de TVA intracommunautaire" />
              <MoneyField name="capital" label="Capital social" layout="horizontal" />
            </Col>
            <Divider orientation="left" className="margin-bottom-8">
              Information de contact
            </Divider>
            <Col lg={16} md={20} sm={24} xs={24}>
              <TextField label="E-mail" layout="horizontal" name="email" />
              <TextField label="Nom de domaine" layout="horizontal" name="domainName" />
            </Col>
            <Divider orientation="left" className="margin-bottom-8">
              Adresse d'entreprise
            </Divider>
            <Col lg={16} md={20} sm={24} xs={24}>
              <AddressForm formProps={formProps} />
            </Col>
            <Divider orientation="left" className="margin-bottom-8">
              Coordonnées bancaires
            </Divider>
            <Col lg={16} md={20} sm={24} xs={24}>
              <IbanField layout="horizontal" />
              <TextField label="BIC" layout="horizontal" name="bic" />
              <br />
            </Col>
          </Row>
        </Form>
      )}
    </Formik>
  );
};

const mapStateToProps = ({ company, application }: IRootState) => ({
  company: application.company.current,
  loading: application.company.loading_current,
  updating: company.updating,
  updateSuccess: company.updateSuccess
});

const mapDispatchToProps = {
  updateCompany: CompanyExt.update
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(CompanyUpdate));
