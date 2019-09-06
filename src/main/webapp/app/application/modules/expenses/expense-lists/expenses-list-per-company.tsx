import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';

import { IExpense, ValidationStatus } from 'app/shared/model/expense.model';
import { Button, Empty, Icon } from 'antd';
import List from 'app/application/components/list/list.component';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import { Avatar } from 'app/application/components/avatar/avatar.component';
import { getFullName } from 'app/application/common/utils/resource-utils';

import * as ResourceExt from 'app/application/entities/resource/resource.actions';
import * as ExpenseExt from 'app/application/entities/expense/expense.actions';
import * as ExpenseType from 'app/entities/expense-type/expense-type.reducer';

import ExpenseDetails from '../expense-details/expense-details';
import CreateExpenseModal from '../expense-create/expense-create';
import { IExpenseType } from 'app/shared/model/expense-type.model';
import { isOwner } from 'app/application/common/utils/user-utils';
import { DateFormat } from 'app/application/components/date.format.component';

export interface IExpensesListProps extends StateProps, DispatchProps, RouteComponentProps<{ expense_id }> {}

const ExpensesList: FunctionComponent<IExpensesListProps> = props => {
  const listRef = useRef<List>();
  const listGroups = [
    { title: 'En Attente', filter: rec => rec.validationStatus === ValidationStatus.PENDING },
    { title: 'Historique', filter: rec => rec.validationStatus !== ValidationStatus.PENDING }
  ];
  const isCompanyOwner: boolean = isOwner(props.account, props.currentCompany);
  const [showCreate, setShowCreate] = useState(false);
  const [expensesList, setExpensesList] = useState<IExpense[]>([]);
  const [mounted, setMounted] = useState(false);
  const { updateSuccess, expenses, pending_expenses, expenseTypes, resources } = props;

  useEffect(
    () => {
      if (!mounted) {
        props.resetExpense();
        props.getExpenseTypes();
        if (isCompanyOwner) {
          props.getAllResources();
        }
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
      listRef.current.pushData(expensesList);
    },
    [expensesList]
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

  const getResourceFullName = resourceId => {
    const resource = resources.find(rsc => rsc.id === resourceId);
    return !!resource ? getFullName(resource) : '';
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
    const resourceName = getResourceFullName(expense.resourceId);
    return (
      <div className="absence-row">
        <div className="absence-head">
          <div className="absence-type">{getExpenseType(expense, expenseTypes)}</div>
        </div>
        <div className="absence-body">
          <div className="resource-meta">
            <Avatar name={resourceName} size={28} />
            <div className="meta-content">
              <span className="meta-title">{resourceName}</span>
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
    if (isCompanyOwner) {
      props.history.push(`/app/company/expenses/${expense.id}`);
    } else {
      props.history.push(`/app/expenses/${expense.id}`);
    }
  };

  const handleFilterExpenses = (dataSource, searchText) => {
    const reg = new RegExp(searchText, 'gi');
    const matchedTypes = props.expenseTypes.filter(at => at.type.match(reg));
    return dataSource.filter(expense => {
      const resource = resources.find(res => res.id === expense.resourceId);
      const matchResource = resource && getFullName(resource).match(reg);
      const matchType = matchedTypes.some(t => t.id === expense.typeId);
      return matchResource || matchType;
    });
  };

  const { totalItems, countNotValidated, loading_list, loading_pending } = props;
  const loading = loading_list || loading_pending;
  const header = (
    <PageHead
      title="Les Notes de frais"
      margin={false}
      actions={isCompanyOwner && <Button title="Nouvelle note de frais" type="primary" icon="plus" onClick={handleShowCreate} />}
    />
  );
  return (
    <>
      <List
        ref={listRef}
        rowKey="id"
        totalItems={totalItems + countNotValidated}
        renderItem={renderExpenseRow}
        fetchData={getEntities}
        onClick={handleDetailsAction}
        onFilter={handleFilterExpenses}
        placeholder="Recherche par ressource ..."
        selectedItem={`${props.match.params.expense_id}`}
        hasSelectedItem={!props.match.isExact || !!props.match.params.expense_id}
        groups={listGroups}
        sort="date"
        header={header}
        loading={loading}
      >
        <Switch>
          {isCompanyOwner ? (
            <Route path="/app/company/expenses/:expense_id" component={ExpenseDetails} />
          ) : (
            <Route path="/app/expenses/:expense_id" component={ExpenseDetails} />
          )}
          <>
            <Empty description="Aucune sélection !" style={{ paddingTop: '5rem' }} />
          </>
        </Switch>
      </List>
      <CreateExpenseModal visible={showCreate} onClose={handleHideCreate} />
    </>
  );
};

const mapStateToProps = ({ application, resource, authentication, expense, expenseType }: IRootState) => ({
  account: authentication.account,
  currentCompany: application.company.current,
  resources: resource.entities,
  expense: expense.entity,
  expenses: application.expense.list.entities,
  pending_expenses: application.expense.pending.entities,
  totalItems: application.expense.list.totalItems,
  updating: expense.updating,
  countNotValidated: application.expense.pending.totalItems,
  updateSuccess: expense.updateSuccess,
  loading_list: application.expense.list.loading,
  loading_pending: application.expense.pending.loading,
  expenseTypes: expenseType.entities,
  currentValidator: application.expenseValidator.current
});

const mapDispatchToProps = {
  getExpenses: ExpenseExt.getExpenses,
  getExpensesNotValid: ExpenseExt.getExpensesNotValid,
  resetExpense: ExpenseExt.reset,
  getExpenseTypes: ExpenseType.getEntities,
  getAllResources: ResourceExt.getAll
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(ExpensesList);
