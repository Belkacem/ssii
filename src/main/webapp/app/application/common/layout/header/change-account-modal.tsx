import React, { FunctionComponent, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import * as Company from 'app/application/entities/company/company.actions';
import * as AccountTypeReducer from 'app/application/common/reducers/account/account-type.reducer';
import { AUTHORITIES } from 'app/application/common/config/constants';
import { hasAnyAuthority, isOwner } from 'app/application/common/utils/user-utils';
import { Col, Modal, Row } from 'antd';
import { Avatar } from 'app/application/components/avatar/avatar.component';

interface IChangeAccountTypeModalProps extends StateProps, DispatchProps, RouteComponentProps {
  visible: boolean;
  onClose: Function;
}

interface IAccountType {
  type: number;
  label: string;
}

const SESSION_ACCOUNT_TYPE_KEY = (userId: number) => `user.${userId}.account_type`;

export const ACCOUNT_TYPES = {
  ADMIN: 1,
  COMPANY_OWNER: 2,
  RESOURCE: 3,
  ABSENCE_VALIDATOR: 4,
  PROJECT_VALIDATOR: 5,
  EXPENSE_VALIDATOR: 6,
  PROJECT_CONTRACTOR: 7
};

export const getCurrentAccountType = (userId: number): number => parseInt(localStorage.getItem(SESSION_ACCOUNT_TYPE_KEY(userId)), 10);

export const setCurrentAccountType = (userId: number, accountType: number) =>
  localStorage.setItem(SESSION_ACCOUNT_TYPE_KEY(userId), `${accountType}`);

const getAccount = (props: IChangeAccountTypeModalProps): [IAccountType[], number] => {
  const { currentCompany, account } = props;
  const isAdmin = hasAnyAuthority(account.authorities, [AUTHORITIES.ADMIN]);
  const isCompanyOwner: boolean = isOwner(account, currentCompany);
  const isResource = !!props.currentResource.id;
  const isAbsenceValidator = !!props.currentAbsenceValidator && !isCompanyOwner;
  const isProjectValidator = props.currentProjectValidators.length > 0 && !isCompanyOwner;
  const isExpenseValidator = !!props.currentExpenseValidator && !isCompanyOwner;
  const isProjectContractor = props.currentProjectContractors.length > 0 && !isCompanyOwner;

  const accountTypes: IAccountType[] = [];
  if (isAdmin) accountTypes.push({ type: ACCOUNT_TYPES.ADMIN, label: 'Administrateur' });
  if (isCompanyOwner) accountTypes.push({ type: ACCOUNT_TYPES.COMPANY_OWNER, label: "Propriétaire d'entreprise" });
  if (isResource) accountTypes.push({ type: ACCOUNT_TYPES.RESOURCE, label: 'Ressource' });
  if (isAbsenceValidator) accountTypes.push({ type: ACCOUNT_TYPES.ABSENCE_VALIDATOR, label: 'Validateur des absences' });
  if (isProjectValidator) accountTypes.push({ type: ACCOUNT_TYPES.PROJECT_VALIDATOR, label: 'Validateur des projets' });
  if (isExpenseValidator) accountTypes.push({ type: ACCOUNT_TYPES.EXPENSE_VALIDATOR, label: 'Validateur des notes de frais' });
  if (isProjectContractor) accountTypes.push({ type: ACCOUNT_TYPES.PROJECT_CONTRACTOR, label: 'Intermédiare des projets' });
  if (!account.id) {
    return [[], undefined];
  }
  if (!getCurrentAccountType(account.id) && accountTypes.length === 1) {
    setCurrentAccountType(account.id, accountTypes[0].type);
    return [accountTypes, accountTypes[0].type];
  }
  if (!getCurrentAccountType(account.id)) {
    return [accountTypes, undefined];
  }
  return [accountTypes, getCurrentAccountType(account.id)];
};

const ChangeAccountTypeModal: FunctionComponent<IChangeAccountTypeModalProps> = props => {
  const [accountTypes, currentAccountType] = getAccount(props);
  const [visible, setVisible] = useState(props.visible);

  useEffect(
    () => {
      setVisible(props.visible);
    },
    [props.visible]
  );

  useEffect(
    () => {
      if (currentAccountType !== props.currentAccountType) {
        props.setAccountType(currentAccountType);
        if (!!props.currentAccountType) {
          props.history.replace('/app/home');
        }
      }
      if (accountTypes.length > 1 && !currentAccountType) {
        setVisible(true);
      }
    },
    [accountTypes, currentAccountType]
  );

  useEffect(
    () => {
      if (!visible) {
        props.onClose();
      }
    },
    [visible]
  );

  const connectToAccount = (accountType: number) => {
    if (currentAccountType !== accountType) {
      setCurrentAccountType(props.account.id, accountType);
      handleClose();
    }
  };

  const handleClose = () => {
    if (!!getCurrentAccountType(props.account.id)) {
      setVisible(false);
    }
  };

  const renderAccountType = (accountTypeItem: IAccountType) => {
    const handleClick = () => connectToAccount(accountTypeItem.type);
    return (
      <div className={`card-item ${currentAccountType === accountTypeItem.type ? 'selected' : ''}`} onClick={handleClick}>
        <Avatar name={accountTypeItem.label} size={100} borderRadius={0} />
        <span>{accountTypeItem.label}</span>
      </div>
    );
  };

  return (
    <Modal
      title={false}
      footer={false}
      visible={visible}
      className="card-items-modal"
      onCancel={handleClose}
      closable={!!currentAccountType}
      maskClosable={!!currentAccountType}
      centered
    >
      <p>
        <b>Commutateur de compte</b>
        <br />
        <small>Se connecter à un autre compte</small>
      </p>
      <Row type="flex">
        {accountTypes.map(accountType => (
          <Col key={accountType.type}>{renderAccountType(accountType)}</Col>
        ))}
      </Row>
    </Modal>
  );
};

const mapStateToProps = ({ application, authentication }: IRootState) => ({
  account: authentication.account,
  currentCompany: application.company.current,
  currentResource: application.resource.current.entity,
  currentAbsenceValidator: application.absenceValidator.current,
  currentProjectValidators: application.projectValidator.currents,
  currentExpenseValidator: application.expenseValidator.current,
  currentProjectContractors: application.projectContractor.currents,
  currentAccountType: application.accountType.type
});

const mapDispatchToProps = {
  getMyCompanies: Company.getMyCompanies,
  setAccountType: AccountTypeReducer.setAccountType,
  connectAs: Company.connect
};

type DispatchProps = typeof mapDispatchToProps;
type StateProps = ReturnType<typeof mapStateToProps>;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ChangeAccountTypeModal));
