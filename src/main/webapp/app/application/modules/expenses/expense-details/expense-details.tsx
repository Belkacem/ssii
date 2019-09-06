import React, { FunctionComponent, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { RouteComponentProps } from 'react-router-dom';

import * as Expense from 'app/entities/expense/expense.reducer';
import * as ExpenseExt from 'app/application/entities/expense/expense.actions';
import * as ExpenseType from 'app/entities/expense-type/expense-type.reducer';
import * as ExpenseValidators from 'app/entities/expense-validator/expense-validator.reducer';
import * as Project from 'app/entities/project/project.reducer';
import * as ProjectResource from 'app/entities/project-resource/project-resource.reducer';
import * as ExpenseJustificationExt from 'app/application/entities/expense-justification/expense-justification.actions';

import { Button, Col, Divider, Modal, Row, Skeleton, Spin } from 'antd';
import ResourceName from 'app/application/common/entities/resource-name';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import { ExpenseStatus } from './expense-status';
import { formatMoney } from 'app/application/common/utils/invoice-utils';
import { Attachment } from 'app/application/components/attachment.component';
import { ValidationStatus } from 'app/shared/model/expense.model';
import { isOwner } from 'app/application/common/utils/user-utils';
import { DateFormat } from 'app/application/components/date.format.component';

interface IExpenseDetailsProps extends StateProps, DispatchProps, RouteComponentProps<{ expense_id: string }> {}

const ExpenseDetails: FunctionComponent<IExpenseDetailsProps> = props => {
  const { expense, expenseType, validator, currentValidator, updating, loading, justifications } = props;
  const isCompanyOwner: boolean = isOwner(props.account, props.currentCompany);
  const isResource: boolean = !!props.currentResource.id;

  useEffect(
    () => {
      const expense_id = parseInt(props.match.params.expense_id, 10);
      if (!!expense_id) {
        props.getExpense(expense_id);
        props.getExpenseJustifications(expense_id);
      }
    },
    [props.match.params.expense_id]
  );

  useEffect(
    () => {
      if (expense && !!expense.id) {
        if (!!expense.validatorId) {
          props.getExpenseValidator(expense.validatorId);
        }
        if (!!expense.typeId) {
          props.getExpenseType(expense.typeId);
        }
        if (!!expense.projectResourceId) {
          props.getProjectResource(expense.projectResourceId);
        }
      }
    },
    [expense.id]
  );

  useEffect(
    () => {
      if (!!props.projectResource.id) {
        props.getProject(props.projectResource.projectId);
      }
    },
    [props.projectResource]
  );

  const handleClose = () => {
    props.history.goBack();
  };

  const handleApprove = () => {
    if (!updating) {
      props.validateExpense({ ...expense, validationStatus: ValidationStatus.APPROVED });
    }
  };

  const handleReject = () => {
    if (!updating) {
      props.validateExpense({ ...expense, validationStatus: ValidationStatus.REJECTED });
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: `Note de frais N°${('00000' + expense.id).slice(-5)}`,
      content: 'Voulez-vous vraiment annuler cette note de frais ?',
      okText: 'Annuler la note',
      okType: 'danger',
      cancelText: 'Ne pas annuler',
      onOk: () => {
        props.deleteExpense(expense.id);
      }
    });
  };

  if (loading || !expense.id) {
    return (
      <div style={{ padding: '1rem' }}>
        <Skeleton avatar active />
      </div>
    );
  }

  return (
    <div>
      <PageHead
        title={`Note de frais N°${('00000' + expense.id).slice(-5)}`}
        onBack={handleClose}
        backOnlyMobile
        margin={false}
        actions={
          expense.validationStatus === ValidationStatus.PENDING && (
            <>
              {!!currentValidator &&
                !!currentValidator.id && (
                  <>
                    <small key="question" style={{ flex: 4 }}>
                      Souhaitez-vous valider ?
                    </small>
                    <Button key="approve" icon="check" onClick={handleApprove} type="primary" loading={updating} title="Accepter" />
                    <Button key="reject" icon="close" onClick={handleReject} type="danger" loading={updating} title="Refuser" />
                  </>
                )}
              {(isCompanyOwner || isResource) && (
                <Button key="delete" icon="delete" onClick={handleDelete} type="danger" loading={updating} title="Annuler" />
              )}
            </>
          )
        }
      />
      <Spin spinning={loading}>
        <Row style={{ padding: '1rem' }} gutter={32}>
          <Col md={14}>
            <div className="resource-meta top-flex">
              <div className="meta-content">
                <dl>
                  <dt>Demandeur</dt>
                  <dd>
                    <ResourceName resourceId={expense.resourceId} isMeta={false} />
                  </dd>
                  <dt>Type</dt>
                  <dd>{expenseType.type}</dd>
                  <dt>Description</dt>
                  <dd>{expense.description}</dd>
                  <dt>Date</dt>
                  <dd>
                    <DateFormat value={expense.date} />
                  </dd>
                  <dt>Projet</dt>
                  <dd>{!!expense.projectResourceId ? !!props.project.id && props.project.nom : 'Interne'}</dd>
                  {!!validator &&
                    !!validator.id && (
                      <>
                        <dt>Validé par</dt>
                        <dd>{validator.fullname}</dd>
                      </>
                    )}
                  <dt>
                    Montant <sup>HT</sup>
                  </dt>
                  <dd>{formatMoney(expense.amount)} €</dd>
                  <dt>TVA</dt>
                  <dd>{expense.vat} %</dd>
                  <dt>
                    Total <sup>TTC</sup>
                  </dt>
                  <dd>{formatMoney(expense.amount + expense.amount * (expense.vat / 100))} €</dd>
                </dl>
              </div>
            </div>
          </Col>
          <Col md={10}>
            <ExpenseStatus expense={expense} validator={validator} />
          </Col>
        </Row>
        {expense.id &&
          justifications.length > 0 && (
            <>
              <Divider orientation="left" style={{ margin: '1rem 0 0.5rem 0' }}>
                les pièces jointes
              </Divider>
              {justifications.map((justification, index) => (
                <Attachment
                  key={justification.id}
                  file={justification.file}
                  contentType={justification.fileContentType}
                  fileName={`${index + 1} - Note de frais N°${('00000' + expense.id).slice(-5)}`}
                />
              ))}
            </>
          )}
      </Spin>
    </div>
  );
};

const mapStateToProps = ({
  authentication,
  application,
  expense,
  expenseType,
  expenseValidator,
  expenseJustification,
  projectResource,
  project
}: IRootState) => ({
  account: authentication.account,
  currentCompany: application.company.current,
  expenseType: expenseType.entity,
  expense: expense.entity,
  updating: expense.updating,
  loading: expense.loading,
  updateSuccess: expense.updateSuccess,
  validator: expenseValidator.entity,
  currentResource: application.resource.current.entity,
  currentValidator: application.expenseValidator.current,
  projectResource: projectResource.entity,
  project: project.entity,
  justifications: expenseJustification.entities
});

const mapDispatchToProps = {
  validateExpense: ExpenseExt.validateExpense,
  deleteExpense: ExpenseExt.deleteExpense,
  getExpense: Expense.getEntity,
  getExpenseType: ExpenseType.getEntity,
  getExpenseValidator: ExpenseValidators.getEntity,
  getProjectResource: ProjectResource.getEntity,
  getProject: Project.getEntity,
  getExpenseJustifications: ExpenseJustificationExt.getByExpenseId
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ExpenseDetails);
