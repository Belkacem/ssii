import React, { FunctionComponent, useEffect } from 'react';
import InvoicesList from './invoice-lists/invoices-list-per-company';
import { Button, notification } from 'antd';
import { Route, RouteComponentProps, withRouter } from 'react-router-dom';
import { ICompany } from 'app/shared/model/company.model';

const isEmpty = data => data === undefined || data === null || data.length === 0;

interface IInvoicesRouteProps extends RouteComponentProps {
  company: ICompany;
}

const InvoicesRoute: FunctionComponent<IInvoicesRouteProps> = props => {
  const { company } = props;
  useEffect(() => {
    if (company && (isEmpty(company.bic) || isEmpty(company.iban))) {
      notification.warning({
        key: 'missing-iban',
        duration: 0,
        message: 'Informations manquantes',
        description: 'Certaines informations sur votre entreprise sont manquantes, veuillez les compléter SVP.',
        btn: <Button block type="primary" children="Modifier" onClick={handleOpenCompanyUpdate} />
      });
    }
    return () => {
      notification.close('missing-iban');
    };
  }, []);

  const handleOpenCompanyUpdate = () => {
    props.history.push(`/app/company/update?f=${isEmpty(company.iban) ? 'iban' : 'bic'}`);
  };

  return <Route path="/app/company/invoices/:invoice_id(\d+)?" component={InvoicesList} />;
};

export default withRouter(InvoicesRoute);
