import React, { FunctionComponent, RefObject, useEffect, useRef } from 'react';
import * as ExpenseType from 'app/entities/expense-type/expense-type.reducer';
import * as ExpenseTypeExt from 'app/application/entities/expense-type/expense-type.actions';
import { connect } from 'react-redux';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { Button, Modal } from 'antd';
import { IRootState } from 'app/shared/reducers';
import { IExpenseType } from 'app/shared/model/expense-type.model';
import NumberField from 'app/application/components/zsoft-form/generic-fields/numberField.component';
import TextField from 'app/application/components/zsoft-form/generic-fields/textField.component';

export interface IExpenseTypeModalProps extends StateProps, DispatchProps {
  showModal: boolean;
  entity: IExpenseType;
  onClose: Function;
}

const ExpenseTypeModal: FunctionComponent<IExpenseTypeModalProps> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>(null);
  const { updating, updateSuccess, errorMessage, entity, showModal } = props;
  const isNew = entity !== null && entity.id === undefined;

  useEffect(
    () => {
      if (updateSuccess) {
        handleClose();
      }
      if (errorMessage && formikRef) {
        document.getElementById('code').focus();
        formikRef.current.setFieldTouched('code');
      }
    },
    [errorMessage, updateSuccess]
  );

  const handleUpdateCode = (value: number) => {
    formikRef.current.setFieldValue('code', value);
    if (errorMessage || updateSuccess) {
      props.resetExpenseType();
    }
  };

  const handleClose = () => {
    props.onClose();
  };

  const saveEntity = values => {
    if (isNew) {
      props.createExpenseType(values);
    } else {
      const expenseType = {
        ...props.entity,
        ...values
      };
      props.updateExpenseType(expenseType);
    }
  };

  const handleSubmit = () => {
    formikRef.current.submitForm();
  };

  const validationSchema = Yup.object().shape({
    code: Yup.number()
      .label('Code')
      .min(1)
      .required()
      .test('code-unique', 'Vous avez entré un code existe déjà', () => !errorMessage),
    type: Yup.string()
      .label('Libellé')
      .required()
  });

  return (
    <Modal
      title={isNew ? "Création d'un type de note de frais" : "Modification d'un type de note de frais"}
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
      <Formik ref={formikRef} initialValues={entity} enableReinitialize validationSchema={validationSchema} onSubmit={saveEntity}>
        <Form>
          <NumberField
            label="Code"
            name="code"
            helper="Le code doit être unique"
            layout="horizontal"
            autoFocus
            step={1}
            min={1}
            onChange={handleUpdateCode}
          />
          <TextField label="Libellé" name="type" layout="horizontal" />
        </Form>
      </Formik>
    </Modal>
  );
};

const mapStateToProps = ({ expenseType }: IRootState) => ({
  updating: expenseType.updating,
  errorMessage: expenseType.errorMessage,
  updateSuccess: expenseType.updateSuccess
});

const mapDispatchToProps = {
  createExpenseType: ExpenseTypeExt.createExpenseType,
  updateExpenseType: ExpenseTypeExt.updateExpenseType,
  resetExpenseType: ExpenseType.reset
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(ExpenseTypeModal);
