import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import * as ProjectResourceExt from 'app/application/entities/project-resource/project-resource.actions';
import { IProjectResource } from 'app/shared/model/project-resource.model';
import { Modal } from 'antd';
import { ProjectResourcesForm } from './project-resource-forms/project-resource-form';
import { Formik } from 'formik';

interface IProjectResourcesUpdateModalProps extends StateProps, DispatchProps {
  projectResource: IProjectResource;
  handleClose: () => void;
  visible: boolean;
}

const ProjectResourcesUpdateModal: FunctionComponent<IProjectResourcesUpdateModalProps> = props => {
  const formRef: RefObject<Formik> = useRef<Formik>(null);
  const { updateSuccess, updating, handleClose, projectResource, visible = false } = props;

  useEffect(
    () => {
      if (updateSuccess) {
        props.handleClose();
      }
    },
    [updateSuccess]
  );

  const handleUpdate = (payload: IProjectResource) => {
    props.updateProjectResource(payload);
  };

  const handleSubmit = () => {
    formRef.current.submitForm();
  };

  return (
    <Modal
      visible={visible}
      onCancel={handleClose}
      onOk={handleSubmit}
      okButtonProps={{ loading: updating }}
      cancelText="Annuler"
      okText="Sauvegarder"
      title="Modifier membre"
      maskClosable={false}
      destroyOnClose
      centered
    >
      <ProjectResourcesForm formikRef={formRef} projectResource={projectResource} onUpdate={handleUpdate} />
    </Modal>
  );
};

const mapStateToProps = ({ projectResource }) => ({
  updating: projectResource.updating,
  updateSuccess: projectResource.updateSuccess
});

const mapDispatchToProps = {
  updateProjectResource: ProjectResourceExt.updateProjectResource
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(ProjectResourcesUpdateModal);
