import React, { FunctionComponent, RefObject, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import * as ExpenseValidators from 'app/entities/expense-validator/expense-validator.reducer';
import * as ExpenseValidatorsExt from 'app/application/entities/expense-validator/expense-validator.actions';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { Modal } from 'antd';
import CheckboxField from 'app/application/components/zsoft-form/generic-fields/checkboxField.component';
import TextField from 'app/application/components/zsoft-form/generic-fields/textField.component';

interface IExpenseValidatorNewModalProps extends StateProps, DispatchProps {
  showModal: boolean;
  handleClose: any;
  validator: any;
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

const ExpenseValidatorNewModal: FunctionComponent<IExpenseValidatorNewModalProps> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>(null);
  const isNew = !props.validator || !props.validator.id;
  const { updating, handleClose, validator, showModal } = props;

  useEffect(() => {
    if (isNew) {
      props.resetExpenseValidator();
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
    if (isNew) {
      const validatorPayload = {
        active: true,
        fullname: values.fullname,
        email: values.email
      };
      props.createExpenseValidator(validatorPayload);
    } else {
      const validatorPayload = {
        ...props.validator,
        active: values.active,
        fullname: values.fullname,
        email: values.email
      };
      props.updateExpenseValidator(validatorPayload);
    }
  };

  const handleSubmit = () => formikRef.current.submitForm();

  const initialValues =
    isNew || !showModal || !validator
      ? {}
      : {
          active: validator.active,
          fullname: validator.fullname,
          email: validator.email
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
        </Form>
      </Formik>
    </Modal>
  );
};

const mapStateToProps = ({ expenseValidator }: IRootState) => ({
  updating: expenseValidator.updating,
  updateSuccess: expenseValidator.updateSuccess
});

const mapDispatchToProps = {
  createExpenseValidator: ExpenseValidatorsExt.createEntity,
  updateExpenseValidator: ExpenseValidatorsExt.updateEntity,
  resetExpenseValidator: ExpenseValidators.reset
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(ExpenseValidatorNewModal);
