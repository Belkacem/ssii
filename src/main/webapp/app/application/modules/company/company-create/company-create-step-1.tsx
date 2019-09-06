import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Button, Col, Icon, Row } from 'antd';
import * as Company from 'app/application/entities/company/company.actions';
import { ICompany } from 'app/shared/model/company.model';
import SirenField, { isValidSiren, sirenParser } from 'app/application/components/zsoft-form/custom-fields/sirenField.component';
import { tvaFormatter } from 'app/application/components/zsoft-form/custom-fields/tvaField.component';

interface IClientsFormStep1Props extends StateProps, DispatchProps {
  onChangeStep: (step: number, company: ICompany) => void;
  company: ICompany;
}

let sirenExistError = false;
let sirenNotFoundError = false;
let startFetching = false;

const validationSchema = Yup.object().shape({
  siren: Yup.number()
    .label('Numéro SIREN')
    .required('Votre numéro SIREN est obligatoire.')
    .test('length', 'Le numéro SIREN composé de 9 chiffres', value => isValidSiren(`${value}`))
    .test('is-exist', 'Ce numéro SIREN est correspond déjà à un client !', () => Promise.resolve(!sirenExistError))
    .test('not-found', 'Pas de résultat pour ce numéro SIREN !', () => Promise.resolve(!sirenNotFoundError))
});
const ClientsFormStep1: FunctionComponent<IClientsFormStep1Props> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>();
  const [fetched, setFetched] = useState(false);
  const { fetching, company, fetchedCompany } = props;

  useEffect(() => {
    startFetching = false;
    props.reset();
  }, []);

  useEffect(
    () => {
      if (!!fetchedCompany && startFetching) {
        if (fetchedCompany.id && !fetched) {
          sirenExistError = true;
          formikRef.current.setFieldTouched('siren');
        } else {
          if (fetchedCompany.name && fetchedCompany.id === null) {
            setFetched(true);
            startFetching = false;
            const values = {
              ...fetchedCompany,
              id: null,
              siren: sirenParser(fetchedCompany.siren),
              tva: tvaFormatter(fetchedCompany.tva)
            };
            props.onChangeStep(1, values);
          }
        }
      }
    },
    [fetchedCompany]
  );

  useEffect(
    () => {
      if (props.errorMessage) {
        sirenNotFoundError = true;
        formikRef.current.setFieldTouched('siren');
      }
    },
    [props.errorMessage]
  );

  const handleNext = () => props.onChangeStep(1, formikRef.current.state.values);

  const handleFetchSiren = values => {
    startFetching = true;
    props.getCompanyBySiren(sirenParser(values.siren));
  };

  const handleSirenChange = (siren: string) => {
    formikRef.current.setFieldValue('siren', siren);
    setFetched(false);
    sirenExistError = false;
    sirenNotFoundError = false;
  };

  return (
    <Formik ref={formikRef} initialValues={company} enableReinitialize validationSchema={validationSchema} onSubmit={handleFetchSiren}>
      <Form>
        <div className="flex-step-content">
          <Row gutter={32}>
            <Col sm={24} md={8}>
              <div className="text-center">
                <h2>Information</h2>
                <h1>
                  <Icon type="search" />
                </h1>
              </div>
              <div className="text-justify">
                <small>
                  <div>Pour aller super vite, il nous faudrait le SIREN de votre entreprise.</div>
                  <div>Cela va nous permettre de vous inscrire super vite.</div>
                  <div>
                    Vous pouvez le trouver facilement sur{' '}
                    <a href={'http://infogreffe.fr'} target="_blank">
                      infogreffe.fr
                    </a>{' '}
                    (recherche par le nom et la localité).
                  </div>
                </small>
              </div>
            </Col>
            <Col sm={24} md={16} className="text-center">
              <h2>Votre entreprise</h2>
              <small>Chercher votre entreprise par le numéro SIREN.</small>
              <SirenField onChange={handleSirenChange} autoFocus />
              <div className="text-right">
                <a onClick={handleNext}>Ignorer</a>{' '}
                <Button type="primary" htmlType="submit" loading={fetching}>
                  Chercher
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </Form>
    </Formik>
  );
};

const mapStateToProps = ({ application }: IRootState) => ({
  fetchedCompany: application.company.fetched,
  fetching: application.company.fetching,
  errorMessage: application.company.errorMessage
});

const mapDispatchToProps = {
  getCompanyBySiren: Company.fetchBySiren,
  reset: Company.reset
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ClientsFormStep1);
