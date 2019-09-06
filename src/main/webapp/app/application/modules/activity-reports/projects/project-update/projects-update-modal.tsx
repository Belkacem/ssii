import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import * as ProjectExt from 'app/application/entities/project/project.actions';
import * as Client from 'app/application/entities/client/client.actions';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { Button, Modal } from 'antd';
import ClientsModal from 'app/application/modules/invoices/clients/client-form/client-form';
import SelectField from 'app/application/components/zsoft-form/generic-fields/selectField.component';
import TextField from 'app/application/components/zsoft-form/generic-fields/textField.component';

interface IProjectsUpdateModalProps extends StateProps, DispatchProps {
  showModal: boolean;
  projectEntity: any;
  handleClose: any;
}

const validationSchema = Yup.object().shape({
  nom: Yup.string()
    .label('Nom de projet')
    .required(),
  localisation: Yup.string()
    .label('Localisation')
    .nullable(true),
  clientId: Yup.number()
    .label('Client')
    .nullable(true)
});

const ProjectsUpdateModal: FunctionComponent<IProjectsUpdateModalProps> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>(null);
  const [showCreateClient, setShowCreateClient] = useState(false);
  const [selectLastClient, setSelectLastClient] = useState(false);
  const { updating, projectEntity, handleClose, clients, showModal } = props;
  const isNew = props.projectEntity !== null && props.projectEntity.id === undefined;
  const initialValues = isNew ? {} : projectEntity;

  useEffect(
    () => {
      if (props.showModal) {
        props.getClients(0, 999, 'id,desc');
      }
    },
    [props.showModal]
  );

  useEffect(
    () => {
      if (props.clients && selectLastClient) {
        setSelectLastClient(false);
        const clientids = props.clients.map(client => client.id);
        if (clientids.length > 0) {
          const lastClient = Math.max(...clientids);
          if (lastClient && formikRef.current) {
            formikRef.current.setFieldValue('clientId', lastClient);
          }
        }
      }
    },
    [props.clients]
  );

  useEffect(
    () => {
      if (props.updateSuccess) {
        props.handleClose();
      }
    },
    [props.updateSuccess]
  );

  const saveEntity = values => {
    if (isNew) {
      const projectPayload = {
        ...values,
        companyId: props.company.id,
        clientId: values.clientId ? values.clientId : null
      };

      props.createProject(projectPayload);
    } else {
      const projectPayload = {
        ...props.projectEntity,
        ...values,
        clientId: values.clientId ? values.clientId : null
      };
      props.updateProject(projectPayload);
    }
  };

  const handleSubmit = () => formikRef.current.submitForm();

  const handleShowCreateClient = () => setShowCreateClient(true);

  const handleHideCreateClient = () => {
    setShowCreateClient(false);
    setSelectLastClient(true);
    props.getClients(0, 999, 'id,desc');
  };
  return (
    <Modal
      title={isNew ? "Création d'un nouveau projet" : "Modification d'un projet"}
      visible={showModal}
      onCancel={handleClose}
      maskClosable={false}
      destroyOnClose
      footer={[
        <Button key="cancel" onClick={handleClose} type="default">
          Annuler
        </Button>,
        <Button key="submit" onClick={handleSubmit} type="primary" disabled={updating}>
          Sauvegarder
        </Button>
      ]}
    >
      <Formik ref={formikRef} initialValues={initialValues} enableReinitialize validationSchema={validationSchema} onSubmit={saveEntity}>
        <Form>
          <TextField label="Nom de projet" name="nom" layout="horizontal" autoFocus />
          <TextField label="Localisation" name="localisation" layout="horizontal" />
          <div className="select-addon-after">
            <Button icon="plus" onClick={handleShowCreateClient} title="Ajouter un client" />
            <SelectField
              label="Client"
              name="clientId"
              options={clients.map(client => ({
                label: client.name,
                value: client.id
              }))}
              layout="horizontal"
              allowClear
            />
          </div>
        </Form>
      </Formik>
      <ClientsModal showModal={showCreateClient} handleClose={handleHideCreateClient} clientEntity={{}} />
    </Modal>
  );
};

const mapStateToProps = ({ application, client, project }: IRootState) => ({
  updating: project.updating,
  company: application.company.current,
  updateSuccess: project.updateSuccess,
  clients: client.entities
});

const mapDispatchToProps = {
  createProject: ProjectExt.createProject,
  updateProject: ProjectExt.updateProject,
  getClients: Client.getClients
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(ProjectsUpdateModal);
