import React, { FunctionComponent, RefObject, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import * as ProjectResourceInfoExt from 'app/application/entities/project-resource-info/project-resource-info.actions';
import { Button, Modal } from 'antd';
import * as ResourceContract from 'app/application/entities/resource-contract/resource-contract.actions';
import { IProjectResourceInfo } from 'app/shared/model/project-resource-info.model';
import { ProjectResourceInfoForm } from '../project-resource-forms/project-resource-info-form';
import { Formik } from 'formik';
import { IProjectResource } from 'app/shared/model/project-resource.model';

interface IProjectResourceInfoModalProps extends StateProps, DispatchProps {
  projectResourceInfo: IProjectResourceInfo;
  projectResource: IProjectResource;
  onClose: () => void;
}

const ProjectResourceInfoModal: FunctionComponent<IProjectResourceInfoModalProps> = props => {
  const projectResourceInfoFormRef: RefObject<Formik> = useRef<Formik>(null);
  const { updating, projectResourceInfo, projectResource, contracts, projectResourceInfos } = props;
  const isNew = !projectResourceInfo || !projectResourceInfo.id;

  useEffect(
    () => {
      if (projectResource.resourceId) {
        props.getContracts(projectResource.resourceId);
      }
    },
    [projectResource.resourceId]
  );

  useEffect(
    () => {
      if (props.updateSuccess) {
        handleClose();
      }
    },
    [props.updateSuccess]
  );

  const handleClose = () => props.onClose();

  const handleSubmit = () => projectResourceInfoFormRef.current.submitForm();

  const handleCreate = (values: IProjectResourceInfo, months?: string[]) => props.createProjectResourceInfo(values, months);

  const handleUpdate = (values: IProjectResourceInfo, months?: string[]) => props.updateProjectResourceInfo(values, months);

  const handleDelete = () => props.deleteProjectResourceInfo(projectResourceInfo.id);

  const actions = [
    <Button key="cancel" onClick={handleClose} type="default">
      Annuler
    </Button>
  ];
  if (!isNew) {
    actions.push(
      <Button key="delete" onClick={handleDelete} type="danger" disabled={updating}>
        Supprimer
      </Button>
    );
    actions.push(
      <Button key="submit" onClick={handleSubmit} type="primary" disabled={updating}>
        Modifier
      </Button>
    );
  } else {
    actions.push(
      <Button key="submit" onClick={handleSubmit} type="primary" disabled={updating}>
        Créer
      </Button>
    );
  }
  return (
    <Modal
      title={isNew ? 'Créer un contrat' : 'Modifier le contrat'}
      visible={projectResourceInfo !== null}
      onCancel={handleClose}
      footer={actions}
      maskClosable={false}
      destroyOnClose
      centered
    >
      <ProjectResourceInfoForm
        formikRef={projectResourceInfoFormRef}
        onUpdate={handleUpdate}
        onCreate={handleCreate}
        projectResourceInfo={projectResourceInfo}
        projectResourceInfos={projectResourceInfos}
        projectResource={projectResource}
        contracts={contracts}
      />
    </Modal>
  );
};

const mapStateToProps = ({ resource, projectResource, projectResourceInfo, resourceContract }: IRootState) => ({
  projectResourceInfos: projectResourceInfo.entities,
  updating: projectResourceInfo.updating,
  updateSuccess: projectResourceInfo.updateSuccess,
  // projectResource: projectResource.entity,
  resource: resource.entity,
  contracts: resourceContract.entities
});

const mapDispatchToProps = {
  createProjectResourceInfo: ProjectResourceInfoExt.createProjectResourceInfo,
  updateProjectResourceInfo: ProjectResourceInfoExt.updateProjectResourceInfo,
  deleteProjectResourceInfo: ProjectResourceInfoExt.deleteProjectResourceInfo,
  getContracts: ResourceContract.getByResource
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(ProjectResourceInfoModal);
