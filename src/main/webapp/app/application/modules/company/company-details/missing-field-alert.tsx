import React, { FunctionComponent } from 'react';
import { ICompany } from 'app/shared/model/company.model';
import { Link } from 'react-router-dom';
import { Alert } from 'antd';

interface IMissingFieldsAlertProps {
  company: ICompany;
}

export const getMissedFields = (company: ICompany) => {
  const fields = [
    { name: 'tva', message: 'Numéro TVA' },
    { name: 'capital', message: 'Capital Social' },
    { name: 'email', message: 'Adresse Email' },
    { name: 'domainName', message: 'Nom de domain' },
    { name: 'bic', message: 'Coordonnées bancaires "BIC"' },
    { name: 'iban', message: 'Coordonnées bancaires "IBAN"' }
  ];
  if (!!company && !!company.id) {
    return fields.filter(field => company[field.name] === '' || !company[field.name]);
  }
  return [];
};

export const MissingFieldsAlert: FunctionComponent<IMissingFieldsAlertProps> = props => {
  const { company } = props;
  const missingFields = getMissedFields(company);
  if (missingFields.length > 0) {
    return (
      <Link replace to={`/app/company/update?f=${missingFields[0].name}`}>
        <Alert
          message={
            <small>
              le profil de "{company.form} {company.name}" non complété: <b>{missingFields.map(f => f.message).join(', ')}</b> manquantes !
            </small>
          }
          type="warning"
          banner
        />
      </Link>
    );
  }
  return null;
};
