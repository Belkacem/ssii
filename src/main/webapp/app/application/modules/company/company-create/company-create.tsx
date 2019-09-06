import React, { FunctionComponent, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { ICompany } from 'app/shared/model/company.model';
import { IRootState } from 'app/shared/reducers';
import { FlexPage } from 'app/application/common/layout/flex-page/flex-page';
import * as Company from 'app/application/entities/company/company.actions';
import { Icon, Steps } from 'antd';
import { sirenFormatter } from 'app/application/components/zsoft-form/custom-fields/sirenField.component';

import { default as CompanyFormStep1 } from './company-create-step-1';
import { CompanyFormStep2 } from './company-create-step-2';
import { CompanyFormStep3 } from './company-create-step-3';
import { CompanyFormStep4 } from './company-create-step-4';

interface ICompanyCreateProps extends StateProps, DispatchProps, RouteComponentProps<{ siren }> {
  step?: number;
}

const CompanyCreate: FunctionComponent<ICompanyCreateProps> = props => {
  const [company, setCompany] = useState<ICompany>({ siren: sirenFormatter(props.match.params.siren) });
  const [currentStep, setCurrentStep] = useState(props.step ? props.step : 0);
  const { updating, companies } = props;

  useEffect(
    () => {
      if (!!props.updateSuccess) {
        handleClose();
      }
    },
    [props.updateSuccess]
  );

  const handleClose = () => {
    props.history.replace('/app/home');
  };

  const handleSave = values => {
    props.createCompany(values);
  };

  const onChangeStep = (step: number, companyEntity: ICompany = company) => {
    setCurrentStep(step);
    setCompany(companyEntity);
  };

  let content = null;
  switch (currentStep) {
    case 0:
      content = <CompanyFormStep1 company={company} onChangeStep={onChangeStep} />;
      break;
    case 1:
      content = <CompanyFormStep2 company={company} onChangeStep={onChangeStep} currentStep={currentStep} />;
      break;
    case 2:
      content = <CompanyFormStep3 company={company} onChangeStep={onChangeStep} onSave={handleSave} currentStep={currentStep} />;
      break;
    case 3:
      content = (
        <CompanyFormStep4 company={company} onChangeStep={onChangeStep} onSave={handleSave} currentStep={currentStep} updating={updating} />
      );
      break;
    default:
      content = null;
  }
  const logoutBtn = (
    <Link to="/logout" title="Déconnexion">
      <Icon type="poweroff" />
    </Link>
  );
  return (
    <FlexPage open onClose={handleClose} closable={companies.length > 0} theme="gray" addionalButtons={companies.length === 0 && logoutBtn}>
      <div className="flex-steps">
        <Steps direction="horizontal" current={currentStep} size="small">
          <Steps.Step title={<b>Chercher</b>} description={<small>Chercher par SIREN</small>} />
          <Steps.Step title={<b>Détails</b>} description={<small>Informations de Base</small>} />
          <Steps.Step title={<b>Adresse</b>} description={<small>Adresse d'entreprise</small>} />
          <Steps.Step title={<b>Autres</b>} description={<small>Informations Additionnelles</small>} />
        </Steps>
        <div className="flex-steps-body">{content}</div>
      </div>
    </FlexPage>
  );
};

const mapStateToProps = ({ application, company }: IRootState) => ({
  loading: company.loading,
  updateSuccess: company.updateSuccess,
  updating: company.updating,
  companies: company.entities,
  current: application.company.current,
  errorMessage: company.errorMessage
});

const mapDispatchToProps = {
  createCompany: Company.create
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(CompanyCreate);
