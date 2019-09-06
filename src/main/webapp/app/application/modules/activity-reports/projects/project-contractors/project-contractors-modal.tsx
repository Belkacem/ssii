import React, { FunctionComponent, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import * as ProjectContractorExt from 'app/application/entities/project-contractor/project-contractor.actions';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { Modal, Divider } from 'antd';
import CheckboxField from 'app/application/components/zsoft-form/generic-fields/checkboxField.component';
import TextField from 'app/application/components/zsoft-form/generic-fields/textField.component';
import SelectField from 'app/application/components/zsoft-form/generic-fields/selectField.component';
import { uniqBy, union } from 'lodash';
import { IProjectContractor } from 'app/shared/model/project-contractor.model';

interface IProjectContractorModalProps extends StateProps, DispatchProps {
  showModal: boolean;
  projectId: number;
  handleClose: any;
  contractor: any;
}

const validationSchema = Yup.object().shape({
  fullname: Yup.string()
    .label('Nom et Prénom')
    .matches(/^([a-zA-Z'-.]+ ([a-zA-Z'-.]+)+(?: [a-zA-Z'-.]+)?)$/, "Le nom complet n'est pas valide !")
    .required(),
  email: Yup.string()
    .label('E-mail')
    .email()
    .required(),
  active: Yup.boolean().label('Active')
});

const filterProjectContractors = (contractors: IProjectContractor[], projectId: number) =>
  uniqBy(union(contractors.filter(c => `${c.projectId}` === `${projectId}`), contractors), 'email').filter(c => c.projectId !== projectId);

const ProjectContractorModal: FunctionComponent<IProjectContractorModalProps> = props => {
  const formikRef = useRef<Formik>();
  const isNew = !!props.contractor && props.contractor.id === undefined;
  const { updating, handleClose, contractor } = props;
  const visible = props.showModal;

  useEffect(
    () => {
      if (visible) {
        props.getAllProjectContractors();
      }
    },
    [visible]
  );

  useEffect(
    () => {
      if (props.updateSuccess) {
        props.handleClose();
      }
    },
    [props.updateSuccess]
  );

  const handleSave = values => {
    if (isNew) {
      const payload = { ...values, projectId: props.projectId, active: true };
      props.createProjectContractor(payload);
    } else {
      props.updateProjectContractor({ ...contractor, ...values });
    }
  };

  const handleSubmit = () => {
    formikRef.current.submitForm();
  };

  const handleSelectContractor = (contractorId: number) => {
    const selected = props.contractors.find(c => c.id === contractorId);
    formikRef.current.setFieldValue('contractors_list', contractorId);
    if (selected) {
      formikRef.current.setFieldValue('fullname', selected.fullname);
      formikRef.current.setFieldValue('email', selected.email);
    }
  };

  const initialValues = isNew ? {} : contractor;
  const suggestionList = filterProjectContractors(props.contractors, props.projectId);
  return (
    <Modal
      visible={visible}
      onCancel={handleClose}
      onOk={handleSubmit}
      okButtonProps={{ loading: updating }}
      cancelText="Annuler"
      okText="Sauvegarder"
      title={isNew ? "Ajouter d'un intermédiare" : "Modifier d'un intermédiare"}
      maskClosable={false}
      destroyOnClose
    >
      <Formik ref={formikRef} initialValues={initialValues} enableReinitialize validationSchema={validationSchema} onSubmit={handleSave}>
        <Form>
          {isNew &&
            suggestionList.length > 0 && (
              <>
                <SelectField
                  label="intermédiares"
                  name="contractors_list"
                  layout="horizontal"
                  helper="Selectionné un intermédiare existant"
                  options={suggestionList.map(c => ({ label: c.fullname, value: c.id }))}
                  onChange={handleSelectContractor}
                />
                <Divider>
                  <div>OU</div>
                  <div>
                    <small>Crée un nouveau</small>
                  </div>
                </Divider>
              </>
            )}
          <TextField label="Nom et Prénom" name="fullname" layout="horizontal" autoFocus />
          <TextField label="Adresse email" name="email" layout="horizontal" />
          {!isNew && <CheckboxField label="Active" name="active" optionLabel="Oui" layout="horizontal" />}
        </Form>
      </Formik>
    </Modal>
  );
};

const mapStateToProps = ({ projectContractor, application }: IRootState) => ({
  contractors: application.projectContractor.entities,
  updating: projectContractor.updating,
  updateSuccess: projectContractor.updateSuccess
});

const mapDispatchToProps = {
  createProjectContractor: ProjectContractorExt.createProjectContractor,
  updateProjectContractor: ProjectContractorExt.updateProjectContractor,
  getAllProjectContractors: ProjectContractorExt.getAllProjectContractors
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectContractorModal);
