import React, { FunctionComponent, useEffect, useState } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import axios from 'axios';
import { EntityManagerList } from './entity-manager-list';
import { Alert, AutoComplete, Empty, Icon, Input } from 'antd';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import { getFields, getQueryStringParams } from 'app/application/modules/admin/entity-manager/entity-manager-utils';

export const dataSource = [
  'api/absence-balance-adjustments',
  'api/absence-balances',
  'api/absence-types',
  'api/absence-validators',
  'api/absences',
  'api/activity-reports',
  'api/client-contacts',
  'api/clients',
  'api/companies',
  'api/constants',
  'api/exceptional-activities',
  'api/expense-types',
  'api/expense-validators',
  'api/expenses',
  'api/holidays',
  'api/invoice-items',
  'api/invoices',
  'api/persisted-configurations',
  'api/project-contractors',
  'api/project-resource-infos',
  'api/project-resources',
  'api/project-validators',
  'api/projects',
  'api/resource-configurations',
  'api/resource-contracts',
  'api/resources',
  'api/standard-activities'
];

export const EntityManager: FunctionComponent<RouteComponentProps> = props => {
  const [source, setSource] = useState(dataSource);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const queryParams = getQueryStringParams(props.location.search);
  const apiUrl = queryParams.e;

  useEffect(
    () => {
      if (!!apiUrl) {
        loadFields();
      } else {
        setFields([]);
      }
    },
    [apiUrl]
  );

  const loadFields = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}?page=0&size=999&sort=id,desc&cacheBuster=${new Date().getTime()}`);
      if (response && response.data) {
        setFields(getFields(response.data));
      }
    } catch {
      setFields([]);
    }
    setLoading(false);
  };

  const handleSelect = (value: string) => {
    if (apiUrl !== value) props.history.push(`/app/admin/entity-manager${!!value && value !== '' ? `?e=${value}` : ''}`);
  };

  const handleSearch = value => {
    if (!!value) {
      if (dataSource.indexOf(value) === -1) {
        setSource([value, ...dataSource]);
      } else {
        setSource(dataSource);
      }
    } else {
      handleSelect('');
    }
  };

  const handleFilterOption = (inputValue, option) => option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1;

  return (
    <div className="page-layout">
      <PageHead
        title="Gestionnaire d'entités"
        actions={
          <AutoComplete
            style={{ width: 300 }}
            dataSource={source}
            placeholder="Enter un lien d'API ..."
            filterOption={handleFilterOption}
            onSelect={handleSelect}
            onSearch={handleSearch}
            autoFocus
            backfill
            loading={loading}
            defaultActiveFirstOption
            defaultValue={apiUrl}
          >
            <Input suffix={<Icon type="search" />} allowClear />
          </AutoComplete>
        }
        margin={false}
      />
      <div className="page-content">
        <div className="fullwidth">
          {!!apiUrl ? (
            fields.length > 0 || loading ? (
              <EntityManagerList fields={fields} apiUrl={apiUrl} />
            ) : (
              <div className="padding-3rem">
                <Alert
                  message="404 Not found"
                  description={<small>The requested URL /api was not found on this server !</small>}
                  type="error"
                  showIcon
                />
              </div>
            )
          ) : (
            <div className="padding-3rem">
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default withRouter(EntityManager);
