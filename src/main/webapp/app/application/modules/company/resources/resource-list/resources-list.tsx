import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { Route, RouteComponentProps, Switch, withRouter } from 'react-router-dom';
import * as ResourceExt from 'app/application/entities/resource/resource.actions';
import * as ResourceContract from 'app/application/entities/resource-contract/resource-contract.actions';
import * as ResourceConfiguration from 'app/application/entities/resource-configuration/resource-configuration.actions';
import { Button, Empty } from 'antd';
import { getFullName } from 'app/application/common/utils/resource-utils';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import List from 'app/application/components/list/list.component';
import { IResource } from 'app/shared/model/resource.model';
import { unionBy } from 'lodash';

import ResourcesForm from 'app/application/modules/company/resources/resource-form/resources-form';
import ResourcesDetails from 'app/application/modules/company/resources/resource-details/resources-details';
import InviteModal from 'app/application/modules/company/resources/resource-form/resources-invite';
import {
  ResourcesListStatus,
  ResourcesListStatusFilter
} from 'app/application/modules/company/resources/resource-list/resources-list-status-filter';
import { ResourcesListItem } from 'app/application/modules/company/resources/resource-list/resources-list-item';

interface IResourcesListProps extends StateProps, DispatchProps, RouteComponentProps<{ resource_id }> {}

const ResourcesList: FunctionComponent<IResourcesListProps> = props => {
  const listRef: RefObject<List> = useRef<List>(null);
  const [inviteModal, setInviteModal] = useState(false);
  const [resourceConfigurations, setResourceConfigurations] = useState([]);
  const [statusFilter, setStatusFilter] = useState<ResourcesListStatus>('ACTIVE');
  const { totalItems, loading } = props;

  useEffect(() => {
    props.getAllContracts();
  }, []);

  useEffect(
    () => {
      if (props.updateSuccess) {
        if (props.location.pathname !== '/app/company/resources/new') {
          listRef.current.reload();
        }
      }
    },
    [props.updateSuccess]
  );

  useEffect(
    () => {
      if (props.resourceList.length > 0) {
        listRef.current.pushData(props.resourceList);
        const resourceIds = props.resourceList.map(resource => resource.id);
        if (resourceIds.length > 0) {
          props.getAllResourceConfigurations(resourceIds);
        }
      }
    },
    [props.resourceList]
  );

  useEffect(
    () => {
      if (props.resourceConfigurations.length > 0) {
        setResourceConfigurations(unionBy(props.resourceConfigurations, resourceConfigurations, 'id'));
      }
    },
    [props.resourceConfigurations]
  );

  useEffect(
    () => {
      if (props.updatedResourceConfiguration) {
        setResourceConfigurations(unionBy([props.resourceConfiguration], resourceConfigurations, 'id'));
      }
    },
    [props.updatedResourceConfiguration]
  );

  useEffect(
    () => {
      if (!props.match.params.resource_id) {
        if (props.location.pathname !== '/app/company/resources/new') {
          listRef.current.selectFirst();
        }
      }
    },
    [resourceConfigurations]
  );

  useEffect(
    () => {
      if (props.updatedContracts) {
        if (props.location.pathname === '/app/company/resources/new') {
          listRef.current.reload();
        } else {
          props.getAllContracts();
        }
      }
    },
    [props.updatedContracts]
  );

  useEffect(
    () => {
      listRef.current.selectFirst();
    },
    [statusFilter]
  );

  const getEntities = () => props.getResources();

  const handleAddAction = () => props.history.replace('/app/company/resources/new');

  const handleShowInviteModal = () => setInviteModal(true);

  const handleHideInviteModal = () => setInviteModal(false);

  const renderResource = (resource: IResource) => {
    const configuration = resourceConfigurations.find(config => config.resourceId === resource.id);
    const contracts = props.contracts.filter(contract => contract.resourceId === resource.id);
    return (
      <ResourcesListItem
        resource={resource}
        configuration={configuration}
        contracts={contracts}
        loadingContracts={props.loadingContracts}
      />
    );
  };

  const handleSelectResource = resource => props.history.push(`/app/company/resources/${resource.id}/profile`);

  const handleFilterResources = (dataSource, searchText) => {
    const reg = new RegExp(searchText, 'gi');
    return dataSource
      .filter(resource => {
        const configuration = resourceConfigurations.find(config => config.resourceId === resource.id);
        switch (statusFilter) {
          case 'ALL':
            return true;
          case 'ACTIVE':
            return !!configuration && configuration.active;
          case 'INACTIVE':
            return !!configuration && !configuration.active;
          case 'DRAFT':
            return resource.draft;
          default:
            return true;
        }
      })
      .filter(resource => getFullName(resource).match(reg));
  };

  const header = (
    <PageHead
      title="Ressources"
      margin={false}
      actions={
        <>
          <ResourcesListStatusFilter status={statusFilter} onChange={setStatusFilter} />
          <Button title="Ajouter une ressource" type="primary" icon="plus" onClick={handleAddAction} />
          <Button title="Inviter une ressource" icon="mail" onClick={handleShowInviteModal} />
        </>
      }
    />
  );
  return (
    <>
      <List
        ref={listRef}
        rowKey="id"
        totalItems={totalItems}
        renderItem={renderResource}
        fetchData={getEntities}
        loading={loading}
        placeholder="Rechercher par nom ..."
        onClick={handleSelectResource}
        onFilter={handleFilterResources}
        selectedItem={props.match.params.resource_id}
        hasSelectedItem={!props.match.isExact || !!props.match.params.resource_id}
        header={header}
      >
        <Switch>
          <Route path="/app/company/resources/new" component={ResourcesForm} />
          <Route path="/app/company/resources/:resource_id(\d+)/update" component={ResourcesForm} />
          <Route path="/app/company/resources/:resource_id(\d+)/profile" component={ResourcesDetails} />
          <>
            <Empty description="Aucune ressource trouvée !" style={{ paddingTop: '5rem' }}>
              <Button type="primary" icon="plus" onClick={handleAddAction}>
                Ajouter une ressource
              </Button>
            </Empty>
          </>
        </Switch>
      </List>
      <InviteModal show={inviteModal} onClose={handleHideInviteModal} />
    </>
  );
};

const mapStateToProps = ({ application, resource, resourceContract, resourceConfiguration }: IRootState) => ({
  resourceList: resource.entities,
  totalItems: resource.totalItems,
  updateSuccess: resource.updateSuccess,
  loading: resource.loading,
  contracts: application.resourceContract.resourcesContracts,
  loadingContracts: application.resourceContract.loading,
  updatedContracts: resourceContract.updateSuccess,
  resourceConfigurations: resourceConfiguration.entities,
  resourceConfiguration: resourceConfiguration.entity,
  updatedResourceConfiguration: resourceConfiguration.updateSuccess
});

const mapDispatchToProps = {
  deleteResources: ResourceExt.deleteBulk,
  getResources: ResourceExt.getAll,
  getAllContracts: ResourceContract.getAllContracts,
  getAllResourceConfigurations: ResourceConfiguration.getAllByResources
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ResourcesList));
