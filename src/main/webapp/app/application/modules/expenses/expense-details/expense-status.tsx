import React, { FunctionComponent } from 'react';
import { IExpense, ValidationStatus } from 'app/shared/model/expense.model';
import { Steps, Icon } from 'antd';
import { IExpenseValidator } from 'app/shared/model/expense-validator.model';
import { FORMAT_DATETIME } from 'app/application/common/config/constants';
import moment from 'moment';

interface IExpenseStatusProps {
  expense: IExpense;
  validator?: IExpenseValidator;
}

export const ExpenseStatus: FunctionComponent<IExpenseStatusProps> = props => {
  const { expense, validator } = props;
  let currentStatus = 0;
  if (!!expense.submissionDate) currentStatus++;
  if (!!expense.validatorId) currentStatus++;
  return (
    <Steps direction="vertical" current={currentStatus} size="small">
      <Steps.Step title={<small>Saisie</small>} />
      <Steps.Step
        title={<small>Soumettre à validation</small>}
        description={<small>{!!expense.submissionDate && moment(expense.submissionDate).format(FORMAT_DATETIME)}</small>}
      />
      <Steps.Step
        title={<small>Validation</small>}
        description={
          <small>
            {expense.validationStatus === ValidationStatus.PENDING ? (
              <strong>
                <Icon type="clock-circle" theme="twoTone" /> En attente
              </strong>
            ) : expense.validationStatus === ValidationStatus.REJECTED ? (
              <strong style={{ color: '#E53935' }}>
                <Icon type="close-circle" theme="twoTone" twoToneColor="#E53935" /> Rejeter
              </strong>
            ) : (
              <strong style={{ color: '#43A047' }}>
                <Icon type="check-circle" theme="twoTone" twoToneColor="#52C41A" /> Apprové
              </strong>
            )}
            {!!expense.validatorId && !!validator && ` par ${validator.fullname}`}
          </small>
        }
      />
    </Steps>
  );
};
