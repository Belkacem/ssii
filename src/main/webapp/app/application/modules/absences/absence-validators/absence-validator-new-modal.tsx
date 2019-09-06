import React, { FunctionComponent, RefObject, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import * as AbsenceValidators from 'app/entities/absence-validator/absence-validator.reducer';
import * as AbsenceValidatorsExt from 'app/application/entities/absence-validator/absence-validator.actions';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { Modal } from 'antd';
import { getFullName } from 'app/application/common/utils/resource-utils';
import SelectField from 'app/application/components/zsoft-form/generic-fields/selectField.component';
import CheckboxField from 'app/application/components/zsoft-form/generic-fields/checkboxField.component';
import TextField from 'app/application/components/zsoft-form/generic-fields/textField.component';

interface IAbsenceValidatorNewModalProps extends StateProps, DispatchProps {
  showModal: boolean;
  handleClose: any;
  validator: any;
}

const validationSchema = Yup.object().shape({
  resourceIds: Yup.array()
    .label('Les Ressources')
    .min(1)
    .required(),
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

const AbsenceValidatorNewModal: FunctionComponent<IAbsenceValidatorNewModalProps> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>(null);
  const isNew = !props.validator || !props.validator.id;
  const { resources, updating, handleClose, validator, showModal } = props;

  useEffect(() => {
    if (isNew) {
      props.resetAbsenceValidator();
    }
  }, []);

  useEffect(
    () => {
      if (props.updateSuccess) {
        props.handleClose();
      }
    },
    [props.updateSuccess]
  );

  const handleSave = values => {
    const selectedResources = props.resources.filter(resource => values.resourceIds.indexOf(resource.id) !== -1);
    if (isNew) {
      const validatorPayload = {
        active: true,
        fullname: values.fullname,
        email: values.email,
        resources: selectedResources
      };
      props.createAbsenceValidator(validatorPayload);
    } else {
      const validatorPayload = {
        ...props.validator,
        active: values.active,
        fullname: values.fullname,
        email: values.email,
        resources: selectedResources
      };
      props.updateAbsenceValidator(validatorPayload);
    }
  };

  const handleSubmit = () => formikRef.current.submitForm();

  const initialValues =
    isNew || !showModal || !validator
      ? {}
      : {
          active: validator.active,
          fullname: validator.fullname,
          email: validator.email,
          resourceIds: validator.resources.map(res => res.id)
        };
  return (
    <Modal
      visible={showModal}
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
          <TextField label="Nom et Prénom" name="fullname" layout="horizontal" autoFocus />
          <TextField label="Adresse Email" name="email" layout="horizontal" />
          {!isNew && <CheckboxField label="Active" name="active" optionLabel="Oui" layout="horizontal" />}
          {/* Resource */}
          <SelectField
            label="Ressources"
            name="resourceIds"
            multiple
            options={resources.map(emp => ({
              label: getFullName(emp),
              value: emp.id
            }))}
            layout="horizontal"
          />
        </Form>
      </Formik>
    </Modal>
  );
};

const mapStateToProps = ({ resource, absenceValidator }: IRootState) => ({
  resources: resource.entities,
  updating: absenceValidator.updating,
  updateSuccess: absenceValidator.updateSuccess
});

const mapDispatchToProps = {
  createAbsenceValidator: AbsenceValidatorsExt.createEntity,
  updateAbsenceValidator: AbsenceValidatorsExt.updateEntity,
  resetAbsenceValidator: AbsenceValidators.reset
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(AbsenceValidatorNewModal);
