import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import * as ProjectResourceInfoExt from 'app/application/entities/project-resource-info/project-resource-info.actions';
import { IProjectResource } from 'app/shared/model/project-resource.model';
import { IProjectResourceInfo } from 'app/shared/model/project-resource-info.model';
import { Moment } from 'moment';
import ProjectResourceInfoModal from './project-resource-info';
import { formatMoney } from 'app/application/common/utils/invoice-utils';
import { DateFormat } from 'app/application/components/date.format.component';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
/* tslint:disable:no-submodule-imports */
import { Button, Icon, Modal, Skeleton, Table } from 'antd';
import { ColumnProps } from 'antd/lib/table';

interface IProjectResourceInfoListProps extends StateProps, DispatchProps, RouteComponentProps {
  projectResource: IProjectResource;
}

const ProjectResourceInfoList: FunctionComponent<IProjectResourceInfoListProps> = props => {
  const tableRef: RefObject<Table<IProjectResourceInfo>> = useRef<Table<IProjectResourceInfo>>(null);
  const [projectResourceInfo, setProjectResourceInfo] = useState(null);
  const { projectResource, infoList, loading } = props;

  useEffect(
    () => {
      loadData();
    },
    [projectResource]
  );

  useEffect(
    () => {
      if (props.updateSuccess) {
        loadData();
      }
    },
    [props.updateSuccess]
  );

  const loadData = () => projectResource.id && props.getProjectResourceInfos(projectResource.id);

  const renderStartDate = (startDate: Moment) => (
    <small>
      <DateFormat value={startDate} />
    </small>
  );

  const renderDailyRate = (dailyRate: number) => (
    <>
      {formatMoney(dailyRate)}
      &nbsp;
      <small>€ / jour</small>
    </>
  );

  const renderReference = (reference: string) => <small>{reference ? reference : '#'}</small>;

  const renderPaymentDelay = paymentDelay =>
    paymentDelay !== null ? (
      <>
        {paymentDelay}
        &nbsp;
        <small>jours</small>
      </>
    ) : (
      <small>Par défaut</small>
    );

  const renderRecordActions = (id: number, record: IProjectResourceInfo) => {
    const handleDelete = () => handleDeleteAction(record);
    const handleUpdate = () => setProjectResourceInfo(record);
    return (
      <Button.Group>
        {projectResource.active && <Button onClick={handleDelete} icon="delete" title="Supprimer" />}
        {projectResource.active && <Button onClick={handleUpdate} icon="edit" title="Modifier" />}
      </Button.Group>
    );
  };

  const handleAddAction = () => setProjectResourceInfo({ dailyRate: 1 });

  const handleDeleteAction = (record: IProjectResourceInfo) => {
    Modal.confirm({
      title: "Suppression d'une contrat",
      content: <span>Êtes-vous sûr de supprimer cette contrat ?</span>,
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => {
        props.deleteProjectResourceInfo(record.id);
      }
    });
  };

  const handleCloseModal = () => setProjectResourceInfo(null);

  const handleRefreshAction = () => loadData();

  if (!projectResource || !projectResource.id) {
    return <Skeleton loading />;
  }

  const columns: Array<ColumnProps<IProjectResourceInfo>> = [
    { title: 'Référence', dataIndex: 'reference', render: renderReference },
    { title: 'Date début', dataIndex: 'startDate', render: renderStartDate },
    { title: 'Taux journalier', dataIndex: 'dailyRate', render: renderDailyRate },
    { title: 'Délai de paiement', dataIndex: 'paymentDelay', render: renderPaymentDelay },
    { title: <Icon type="setting" title="Actions" />, dataIndex: 'id', width: 96, align: 'center', render: renderRecordActions }
  ];

  return (
    <div className="table-layout-page">
      <div className="table-layout-head">
        <PageHead
          title="Les contrats"
          margin={false}
          actions={
            <Button.Group>
              <Button onClick={handleRefreshAction} icon="reload" className="ant-btn-textual">
                Actualiser
              </Button>
              {projectResource.active && (
                <Button onClick={handleAddAction} type="primary" icon="plus" className="ant-btn-textual">
                  Ajouter
                </Button>
              )}
            </Button.Group>
          }
        />
      </div>
      <div className="table-layout-body">
        <Table ref={tableRef} rowKey="id" columns={columns} dataSource={[...infoList]} pagination={false} loading={loading} size="middle" />
      </div>
      {projectResource.active && (
        <ProjectResourceInfoModal projectResource={projectResource} projectResourceInfo={projectResourceInfo} onClose={handleCloseModal} />
      )}
    </div>
  );
};

const mapStateToProps = ({ projectResourceInfo }: IRootState) => ({
  infoList: projectResourceInfo.entities,
  loading: projectResourceInfo.loading,
  updateSuccess: projectResourceInfo.updateSuccess
});

const mapDispatchToProps = {
  getProjectResourceInfos: ProjectResourceInfoExt.getByProjectResource,
  deleteProjectResourceInfo: ProjectResourceInfoExt.deleteProjectResourceInfo
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ProjectResourceInfoList));
