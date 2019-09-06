import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Button, Col, Row } from 'antd';
import { IClient } from 'app/shared/model/client.model';
import { ICompany } from 'app/shared/model/company.model';
import SirenField, {
  isValidSiren,
  sirenFormatter,
  sirenParser
} from 'app/application/components/zsoft-form/custom-fields/sirenField.component';
import { tvaFormatter } from 'app/application/components/zsoft-form/custom-fields/tvaField.component';

interface IClientsFormStep1Props {
  client: IClient;
  fetchedClient: IClient;
  fetching: boolean;
  errorMessage: any;
  company: ICompany;
  onChangeStep: (step: number, client: IClient) => void;
  onFetch: (siren: string) => void;
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

export const ClientsFormStep1: FunctionComponent<IClientsFormStep1Props> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>();
  const [fetched, setFetched] = useState(false);
  const { fetching, client, fetchedClient } = props;

  useEffect(() => {
    startFetching = false;
  }, []);

  useEffect(
    () => {
      if (!!fetchedClient && startFetching) {
        if (fetchedClient.id && fetchedClient.companyId === props.company.id && !fetched) {
          sirenExistError = true;
          formikRef.current.setFieldTouched('siren');
        } else {
          if (fetchedClient.name) {
            setFetched(true);
            startFetching = false;
            const values = {
              ...fetchedClient,
              id: null,
              paymentDelay: 30,
              siren: sirenFormatter(fetchedClient.siren),
              tva: tvaFormatter(fetchedClient.tva),
              attachActivityReports: false
            };
            props.onChangeStep(1, values);
          }
        }
      }
    },
    [fetchedClient]
  );

  useEffect(
    () => {
      if (props.errorMessage) {
        sirenNotFoundError = props.errorMessage && props.errorMessage.response.status === 400;
        formikRef.current.setFieldTouched('siren');
      }
    },
    [props.errorMessage]
  );
  const handleNext = () => props.onChangeStep(1, formikRef.current.state.values);

  const handleFetchSiren = values => {
    startFetching = true;
    props.onFetch(sirenParser(values.siren));
  };

  const handleSirenChange = (siren: string) => {
    formikRef.current.setFieldValue('siren', siren);
    setFetched(false);
    sirenExistError = false;
    sirenNotFoundError = false;
  };

  return (
    <Formik ref={formikRef} initialValues={client} enableReinitialize validationSchema={validationSchema} onSubmit={handleFetchSiren}>
      <Form className="form-layout">
        <Row className="form-content">
          <Col md={22} sm={24} xs={24}>
            <SirenField label="N° SIREN" layout="horizontal" autoFocus onChange={handleSirenChange} />
          </Col>
        </Row>
        <div className="form-actions">
          <a onClick={handleNext}>Ignorer</a>{' '}
          <Button type="primary" htmlType="submit" loading={fetching}>
            Chercher
          </Button>
        </div>
      </Form>
    </Formik>
  );
};
