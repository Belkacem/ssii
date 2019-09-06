import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { RouteComponentProps, Switch, Route } from 'react-router-dom';

import { IExpense, ValidationStatus } from 'app/shared/model/expense.model';
import { Button, Empty, Icon } from 'antd';
import List from 'app/application/components/list/list.component';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import * as ExpenseExt from 'app/application/entities/expense/expense.actions';
import * as ExpenseType from 'app/entities/expense-type/expense-type.reducer';
import * as ResourceConfiguration from 'app/application/entities/resource-configuration/resource-configuration.actions';

import ExpenseDetails from '../expense-details/expense-details';
import CreateExpenseModal from '../expense-create/expense-create';
import { IExpenseType } from 'app/shared/model/expense-type.model';
import { AccessDenied } from 'app/application/components/errors/access-denied.component';
import { DateFormat } from 'app/application/components/date.format.component';

export interface IExpensesListPerResourceProps extends StateProps, DispatchProps, RouteComponentProps<{ expense_id }> {}

const ExpensesListPerResource: FunctionComponent<IExpensesListPerResourceProps> = props => {
  const listRef = useRef<List>();
  const listGroups = [
    { title: 'En Attente', filter: rec => rec.validationStatus === ValidationStatus.PENDING },
    { title: 'Historique', filter: rec => rec.validationStatus !== ValidationStatus.PENDING }
  ];
  const [showCreate, setShowCreate] = useState(false);
  const [expensesList, setExpensesList] = useState<IExpense[]>([]);
  const [mounted, setMounted] = useState(false);
  const { updateSuccess, expenses, pending_expenses, expenseTypes } = props;

  useEffect(
    () => {
      if (!mounted) {
        props.resetExpense();
        props.getExpenseTypes();
        setMounted(false);
      }
    },
    [mounted]
  );

  useEffect(
    () => {
      if (updateSuccess) {
        handleDetailsAction(props.expense);
        listRef.current.reload();
      }
    },
    [updateSuccess]
  );

  useEffect(
    () => {
      setExpensesList([...expenses, ...pending_expenses]);
    },
    [expenses, pending_expenses]
  );

  useEffect(
    () => {
      if (!!listRef.current) {
        listRef.current.pushData(expensesList);
      }
    },
    [expensesList]
  );

  useEffect(
    () => {
      if (!!props.currentResource && !!props.currentResource.id) {
        props.getResourceConfiguration(props.currentResource.id);
      }
    },
    [props.currentResource]
  );

  const getEntities = (activePage, itemsPerPage, sort, order) => {
    props.getExpensesNotValid(activePage - 1, 999, `${sort},${order}`);
    props.getExpenses(activePage - 1, itemsPerPage, `${sort},${order}`);
  };

  const handleShowCreate = () => {
    setShowCreate(true);
  };

  const handleHideCreate = () => {
    setShowCreate(false);
  };

  const getStatusIcon = (expense: IExpense) => {
    if (expense.validationStatus === ValidationStatus.PENDING) {
      return <Icon type="clock-circle" theme="twoTone" title="En attente" />;
    } else if (expense.validationStatus === ValidationStatus.APPROVED) {
      return <Icon type="check-circle" twoToneColor="#52c41a" theme="twoTone" title="Approuvé" />;
    } else if (expense.validationStatus === ValidationStatus.REJECTED) {
      return <Icon type="close-circle" twoToneColor="red" theme="twoTone" title="Refusé" />;
    }
  };

  const getExpenseType = (exp: IExpense, types: ReadonlyArray<IExpenseType>) => {
    if (types.length === 0) {
      return '';
    }
    const expenseType = types.find(type => type.id === exp.typeId);
    return !!expenseType ? expenseType.type : '';
  };

  const renderExpenseRow = (expense: IExpense) => {
    return (
      <div className="absence-row">
        <div className="absence-body">
          <div className="resource-meta">
            <div className="meta-content">
              <span className="meta-title">{getExpenseType(expense, expenseTypes)}</span>
              <span className="meta-description">
                <DateFormat value={expense.date} />
              </span>
            </div>
          </div>
          <div className="absence-status">{getStatusIcon(expense)}</div>
        </div>
      </div>
    );
  };

  const handleDetailsAction = (expense: IExpense) => {
    props.history.push(`/app/resource/expenses/${expense.id}`);
  };

  const handleFilterExpenses = (dataSource, searchText) => {
    const reg = new RegExp(searchText, 'gi');
    const matchedTypes = props.expenseTypes.filter(at => at.type.match(reg));
    return dataSource.filter(expense => matchedTypes.some(t => t.id === expense.typeId));
  };

  const { totalItems, totalPending, loading_list, loading_pending, resourceConfig } = props;
  if (!!resourceConfig.id && !resourceConfig.canReportExpenses) {
    return <AccessDenied />;
  }
  const loading = loading_list || loading_pending;
  const header = (
    <PageHead
      title="Mes Notes de frais"
      margin={false}
      actions={<Button title="Nouvelle note de frais" type="primary" icon="plus" onClick={handleShowCreate} />}
    />
  );
  return (
    <>
      <List
        ref={listRef}
        rowKey="id"
        totalItems={totalItems + totalPending}
        renderItem={renderExpenseRow}
        fetchData={getEntities}
        onClick={handleDetailsAction}
        onFilter={handleFilterExpenses}
        placeholder="Recherche par type ..."
        selectedItem={`${props.match.params.expense_id}`}
        hasSelectedItem={!props.match.isExact || !!props.match.params.expense_id}
        groups={listGroups}
        sort="date"
        header={header}
        loading={loading}
      >
        <Switch>
          <Route path="/app/resource/expenses/:expense_id" component={ExpenseDetails} />
          <>
            <Empty description="Aucune sélection !" style={{ paddingTop: '5rem' }} />
          </>
        </Switch>
      </List>
      <CreateExpenseModal visible={showCreate} onClose={handleHideCreate} />
    </>
  );
};

const mapStateToProps = ({ application, authentication, expense, expenseType, resourceConfiguration }: IRootState) => ({
  expense: expense.entity,
  expenses: application.expense.list.entities,
  pending_expenses: application.expense.pending.entities,
  totalItems: application.expense.list.totalItems,
  totalPending: application.expense.pending.totalItems,
  updating: expense.updating,
  updateSuccess: expense.updateSuccess,
  loading_list: application.expense.list.loading,
  loading_pending: application.expense.pending.loading,
  expenseTypes: expenseType.entities,
  currentValidator: application.expenseValidator.current,
  currentResource: application.resource.current.entity,
  resourceConfig: resourceConfiguration.entity,
  loadingResourceConfig: resourceConfiguration.loading
});

const mapDispatchToProps = {
  getExpenses: ExpenseExt.getExpensesByCurrentResource,
  getExpensesNotValid: ExpenseExt.getExpensesNotValidByCurrentResource,
  resetExpense: ExpenseExt.reset,
  getExpenseTypes: ExpenseType.getEntities,
  getResourceConfiguration: ResourceConfiguration.getByResource
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<any, any>(
  mapStateToProps,
  mapDispatchToProps
)(ExpensesListPerResource);
