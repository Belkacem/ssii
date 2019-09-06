import React, { FunctionComponent, RefObject, useEffect, useRef } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import * as ResourceContract from 'app/application/entities/resource-contract/resource-contract.actions';
import { ContractType, IResourceContract } from 'app/shared/model/resource-contract.model';
import { formatMoney } from 'app/application/common/utils/invoice-utils';
import { getCompensationLabel } from 'app/application/common/utils/resource-utils';
import { DateFormat } from 'app/application/components/date.format.component';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
/* tslint:disable:no-submodule-imports */
import { Button, Icon, Modal, Skeleton, Table } from 'antd';
import { ColumnProps } from 'antd/lib/table';

interface IContractsProps extends StateProps, DispatchProps, RouteComponentProps {
  resource: any;
  onShowContractModal: (contract: IResourceContract) => void;
}

export const contractTypes = [
  { label: 'Salarié', value: ContractType.EMPLOYEE },
  { label: 'Free-lance', value: ContractType.FREELANCE },
  { label: 'Stagiaire', value: ContractType.INTERN },
  { label: 'Autre', value: ContractType.OTHER }
];

const Contracts: FunctionComponent<IContractsProps> = props => {
  const tableRef: RefObject<Table<IResourceContract>> = useRef<Table<IResourceContract>>(null);
  const { resource, contracts, loading } = props;

  useEffect(
    () => {
      if (props.updateSuccess) {
        loadData();
      }
    },
    [props.updateSuccess]
  );

  const loadData = () => props.getContracts(resource.id);

  const renderPeriod = (data, row) => (
    <>
      <b>{contractTypes.find(t => t.value === row.type).label}</b>
      <div>
        <small>
          <DateFormat value={row.startDate} />
          {' - '}
          {row.endDate === null ? "Jusqu'à maintenant" : <DateFormat value={row.endDate} />}
        </small>
      </div>
    </>
  );

  const renderCompensation = (compensation, row) => (
    <>
      <div>
        <small>{getCompensationLabel(row.type)}</small>
      </div>
      <b>
        {formatMoney(compensation)}
        <small>€</small>
      </b>
    </>
  );

  const renderRecordActions = (id: number, contract: IResourceContract) => {
    const handleDelete = () => handleDeleteAction(contract);
    const handleUpdate = () => props.onShowContractModal(contract);
    return (
      <Button.Group>
        <Button onClick={handleDelete} icon="delete" title="Supprimer" />
        <Button onClick={handleUpdate} icon="edit" title="Modifier" />
      </Button.Group>
    );
  };

  const handleAddContract = () =>
    props.onShowContractModal({
      compensation: 0,
      type: ContractType.EMPLOYEE
    });

  const handleDeleteAction = (record: IResourceContract) => {
    Modal.confirm({
      title: "Suppression d'un contrat",
      content: <span>Êtes-vous sûr de supprimer ce contrat ?</span>,
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => {
        props.deleteContract(record.id);
      }
    });
  };

  if (!resource || !resource.id) {
    return <Skeleton loading />;
  }
  const columns: Array<ColumnProps<IResourceContract>> = [
    { title: 'Type et période', dataIndex: 'type', render: renderPeriod },
    { title: '', dataIndex: 'compensation', width: 150, render: renderCompensation },
    { title: <Icon type="setting" title="Actions" />, dataIndex: 'id', width: 96, align: 'center', render: renderRecordActions }
  ];

  return (
    <>
      <div className="table-layout-page">
        <div className="table-layout-head">
          <PageHead
            title="Les contrats"
            margin={false}
            actions={
              <Button.Group>
                <Button onClick={loadData} icon="reload" className="ant-btn-textual">
                  Actualiser
                </Button>
                <Button onClick={handleAddContract} type="primary" icon="plus" className="ant-btn-textual">
                  Ajouter un contrat
                </Button>
              </Button.Group>
            }
          />
        </div>
        <div className="table-layout-body">
          <Table
            ref={tableRef}
            rowKey="id"
            columns={columns}
            dataSource={[...contracts]}
            pagination={false}
            loading={loading}
            size="middle"
          />
        </div>
      </div>
    </>
  );
};

const mapStateToProps = ({ resourceContract }: IRootState) => ({
  contracts: resourceContract.entities,
  loading: resourceContract.loading,
  updateSuccess: resourceContract.updateSuccess
});

const mapDispatchToProps = {
  getContracts: ResourceContract.getByResource,
  deleteContract: ResourceContract.deleteContract
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Contracts));
