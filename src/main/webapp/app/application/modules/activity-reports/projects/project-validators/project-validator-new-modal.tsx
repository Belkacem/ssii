import React, { FunctionComponent, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import * as ProjectValidatorExt from 'app/application/entities/project-validator/project-validator.actions';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { Divider, Modal } from 'antd';
import CheckboxField from 'app/application/components/zsoft-form/generic-fields/checkboxField.component';
import TextField from 'app/application/components/zsoft-form/generic-fields/textField.component';
import SelectField from 'app/application/components/zsoft-form/generic-fields/selectField.component';
import { union, uniqBy } from 'lodash';
import { IProjectValidator } from 'app/shared/model/project-validator.model';

export interface IProjectValidatorNewModalProps extends StateProps, DispatchProps {
  showModal: boolean;
  projectId: number;
  handleClose: any;
  validator: any;
}

const filterProjectValidators = (validators: IProjectValidator[], projectId: number) =>
  uniqBy(union(validators.filter(c => `${c.projectId}` === `${projectId}`), validators), 'email').filter(c => c.projectId !== projectId);

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

const ProjectValidatorNewModal: FunctionComponent<IProjectValidatorNewModalProps> = props => {
  const formikRef = useRef<Formik>();
  const isNew = !!props.validator && props.validator.id === undefined;
  const { updating, handleClose, validator } = props;
  const visible = props.showModal;

  useEffect(
    () => {
      if (visible) {
        props.getAllProjectValidators();
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
      props.createProjectValidator(payload);
    } else {
      const payload = { ...validator, ...values };
      props.updateProjectValidator(payload);
    }
  };

  const handleSubmit = () => {
    formikRef.current.submitForm();
  };

  const handleSelectValidator = (validatorId: number) => {
    const selected = props.validators.find(c => c.id === validatorId);
    formikRef.current.setFieldValue('validators_list', validatorId);
    if (selected) {
      formikRef.current.setFieldValue('fullname', selected.fullname);
      formikRef.current.setFieldValue('email', selected.email);
    }
  };

  const initialValues = isNew ? {} : validator;
  const suggestionList = filterProjectValidators(props.validators, props.projectId);

  return (
    <Modal
      visible={visible}
      onCancel={handleClose}
      onOk={handleSubmit}
      okButtonProps={{ loading: updating }}
      cancelText="Annuler"
      okText="Sauvegarder"
      title={isNew ? 'Ajouter un validateur' : 'Modifier un validateur'}
      maskClosable={false}
      destroyOnClose
    >
      <Formik ref={formikRef} initialValues={initialValues} enableReinitialize validationSchema={validationSchema} onSubmit={handleSave}>
        <Form>
          {isNew &&
            suggestionList.length > 0 && (
              <>
                <SelectField
                  label="Validateurs"
                  name="validators_list"
                  layout="horizontal"
                  helper="Selectionné un validateur existant"
                  options={suggestionList.map(c => ({ label: c.fullname, value: c.id }))}
                  onChange={handleSelectValidator}
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
          <TextField label="Adresse Email" name="email" layout="horizontal" />
          {!isNew && <CheckboxField label="Active" name="active" optionLabel="Oui" layout="horizontal" />}
        </Form>
      </Formik>
    </Modal>
  );
};

const mapStateToProps = ({ projectValidator, application }: IRootState) => ({
  validators: application.projectValidator.entities,
  updating: projectValidator.updating,
  updateSuccess: projectValidator.updateSuccess
});

const mapDispatchToProps = {
  createProjectValidator: ProjectValidatorExt.createProjectValidator,
  updateProjectValidator: ProjectValidatorExt.updateProjectValidator,
  getAllProjectValidators: ProjectValidatorExt.getAllProjectValidators
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectValidatorNewModal);
