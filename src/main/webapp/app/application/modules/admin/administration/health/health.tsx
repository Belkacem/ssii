import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { systemHealth } from 'app/modules/administration/administration.reducer';
import HealthModal from './health-modal';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
/* tslint:disable:no-submodule-imports */
import { Button, Icon, Table, Tag } from 'antd';
import { ColumnProps } from 'antd/lib/table';

interface IHealthPageProps extends StateProps, DispatchProps {}

export const HealthPage: FunctionComponent<IHealthPageProps> = props => {
  const tableRef: RefObject<Table<any>> = useRef<Table<any>>(null);
  const [healthObject, setHealthObject] = useState(null);

  useEffect(() => {
    props.systemHealth();
  }, []);

  const getSystemHealth = () => {
    if (!props.isFetching) {
      props.systemHealth();
    }
  };

  const getSystemHealthInfo = (name, value) => () => {
    setHealthObject({
      ...value,
      name
    });
  };

  const handleClose = () => setHealthObject(null);

  const renderName = (value: string) => <small>{value}</small>;

  const renderStatus = status => (
    <small>
      <Tag color={status !== 'UP' ? 'red' : 'green'}>{status}</Tag>
    </small>
  );

  const renderDetails = (details, record) =>
    details ? (
      <Button
        size="small"
        onClick={getSystemHealthInfo(record.serviceName, data[record.serviceName])}
        className="ant-btn-textual"
        icon="eye"
        children={<small>Détails</small>}
      />
    ) : null;

  const { health, isFetching } = props;
  const data = (health || {}).details || {};

  const columns: Array<ColumnProps<any>> = [
    { title: 'Nom de Service', dataIndex: 'serviceName', render: renderName },
    { title: 'Status', dataIndex: 'status', render: renderStatus },
    { title: <Icon type="setting" title="Actions" />, dataIndex: 'details', width: 96, align: 'center', render: renderDetails }
  ];

  const dataSource = Object.keys(data).map(
    (configPropKey, configPropIndex) =>
      configPropKey !== 'status'
        ? {
            id: configPropIndex,
            serviceName: configPropKey,
            status: data[configPropKey].status,
            details: data[configPropKey].details
          }
        : null
  );
  const showModal = !!healthObject;

  return (
    <div className="table-layout-page">
      <div className="table-layout-head">
        <PageHead
          title="Contrôles de santé"
          margin={false}
          actions={
            <>
              <Button
                onClick={getSystemHealth}
                type={isFetching ? 'danger' : 'default'}
                disabled={isFetching}
                icon="reload"
                className="ant-btn-textual"
                children="Actualiser"
              />
            </>
          }
        />
      </div>
      <div className="table-layout-body">
        <Table ref={tableRef} rowKey="id" columns={columns} dataSource={dataSource} pagination={false} size="middle" />
      </div>
      <HealthModal healthObject={healthObject || {}} handleClose={handleClose} showModal={showModal} />
    </div>
  );
};

const mapStateToProps = (storeState: IRootState) => ({
  health: storeState.administration.health,
  isFetching: storeState.administration.loading
});

const mapDispatchToProps = { systemHealth };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(HealthPage);
