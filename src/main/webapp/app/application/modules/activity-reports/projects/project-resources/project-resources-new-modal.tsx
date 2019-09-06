import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import * as ProjectResourceExt from 'app/application/entities/project-resource/project-resource.actions';
import * as ProjectResource from 'app/entities/project-resource/project-resource.reducer';
import * as ProjectResourceInfoExt from 'app/application/entities/project-resource-info/project-resource-info.actions';
import * as ProjectResourceInfo from 'app/entities/project-resource-info/project-resource-info.reducer';
import * as ResourceExt from 'app/application/entities/resource/resource.actions';
import { Modal, Steps } from 'antd';
import * as ResourceContract from 'app/application/entities/resource-contract/resource-contract.actions';
import { ProjectResourcesForm } from './project-resource-forms/project-resource-form';
import { ProjectResourceInfoForm } from './project-resource-forms/project-resource-info-form';
import { IProjectResourceInfo } from 'app/shared/model/project-resource-info.model';
import { Formik } from 'formik';

interface IProjectsUpdateModalProps extends StateProps, DispatchProps {
  visible: boolean;
  projectId: number;
  onClose: () => void;
}

const ProjectResourcesNewModal: FunctionComponent<IProjectsUpdateModalProps> = props => {
  const projectResourcesFormRef: RefObject<Formik> = useRef<Formik>(null);
  const projectResourceInfoFormRef: RefObject<Formik> = useRef<Formik>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [currentProjectResource, setCurrentProjectResource] = useState(null);
  const { updating, updatingInfo, visible } = props;

  useEffect(() => {
    props.resetProjectResource();
    props.resetProjectResourceInfo();
    props.getAllResources();
  }, []);

  useEffect(
    () => {
      if (visible) {
        setCurrentStep(1);
        setCurrentProjectResource(null);
      }
    },
    [visible]
  );

  useEffect(
    () => {
      if (props.updateSuccess) {
        setCurrentStep(2);
        setCurrentProjectResource(props.projectResource);
        if (!!props.projectResource.resourceId) {
          props.getContracts(props.projectResource.resourceId);
        }
      }
    },
    [props.updateSuccess]
  );

  useEffect(
    () => {
      if (props.updateInfoSuccess) {
        props.onClose();
      }
    },
    [props.updateInfoSuccess]
  );

  const saveProjectMemeber = values => {
    const projectResource = {
      ...values,
      active: true,
      projectId: props.projectId
    };

    props.createProjectResource(projectResource);
  };

  const saveProjectMemeberInfo = (values: IProjectResourceInfo, months?: string[]) => {
    const projectResourceInfo = {
      ...values,
      projectResourceId: currentProjectResource.id
    };
    props.createProjectResourceInfo(projectResourceInfo, months);
  };

  const handleSubmit = () => {
    if (currentStep === 1) {
      projectResourcesFormRef.current.submitForm();
    } else {
      projectResourceInfoFormRef.current.submitForm();
    }
  };

  return (
    <Modal
      visible={visible}
      onCancel={props.onClose}
      onOk={handleSubmit}
      okButtonProps={{ loading: updating || updatingInfo }}
      cancelText="Annuler"
      okText={currentStep === 1 ? 'Suivant' : 'Sauvegarder'}
      closable={false}
      maskClosable={false}
      centered
      destroyOnClose
      title={
        <Steps size="small" current={currentStep - 1}>
          <Steps.Step title="Ajout de membre" />
          <Steps.Step title="Informaitons supplémentaires" />
        </Steps>
      }
    >
      {currentStep === 1 ? (
        <ProjectResourcesForm
          formikRef={projectResourcesFormRef}
          projectResource={props.projectResource}
          onCreate={saveProjectMemeber}
          resources={props.resources}
          projectResources={props.projectResources}
        />
      ) : (
        <ProjectResourceInfoForm
          formikRef={projectResourceInfoFormRef}
          onCreate={saveProjectMemeberInfo}
          projectResourceInfo={{ dailyRate: 0 }}
          projectResourceInfos={[]}
          projectResource={currentProjectResource}
          contracts={props.contracts}
        />
      )}
    </Modal>
  );
};

const mapStateToProps = ({ resource, projectResource, projectResourceInfo, resourceContract }: IRootState) => ({
  projectResource: projectResource.entity,
  projectResources: projectResource.entities,
  resources: resource.entities,
  updating: projectResource.updating,
  updateSuccess: projectResource.updateSuccess,
  updatingInfo: projectResourceInfo.updating,
  updateInfoSuccess: projectResourceInfo.updateSuccess,
  contracts: resourceContract.entities
});

const mapDispatchToProps = {
  createProjectResource: ProjectResourceExt.createProjectResource,
  resetProjectResource: ProjectResource.reset,
  getAllResources: ResourceExt.getAll,
  createProjectResourceInfo: ProjectResourceInfoExt.createProjectResourceInfo,
  resetProjectResourceInfo: ProjectResourceInfo.reset,
  getContracts: ResourceContract.getByResource
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(ProjectResourcesNewModal);
