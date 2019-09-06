import React, { FunctionComponent, RefObject, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import * as ConstantsReducer from 'app/entities/constant/constant.reducer';
import { IConstant } from 'app/shared/model/constant.model';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { Button, Modal } from 'antd';
import TextField from 'app/application/components/zsoft-form/generic-fields/textField.component';
import TextAreaField from 'app/application/components/zsoft-form/generic-fields/textAreaField.component';

export interface IConstantsFormModalProps extends StateProps, DispatchProps {
  visible: boolean;
  entity: IConstant;
  onClose: () => void;
}

const validationSchema = Yup.object().shape({
  key: Yup.string()
    .label('Clé')
    .required(),
  value: Yup.string()
    .label('Valeur')
    .required()
});

const ConstantsFormModal: FunctionComponent<IConstantsFormModalProps> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>(null);
  const { updating, updateSuccess, entity, visible = false } = props;
  const isNew = entity !== null && entity.id === undefined;

  useEffect(
    () => {
      if (updateSuccess) handleClose();
    },
    [updateSuccess]
  );

  const handleClose = () => props.onClose();

  const saveEntity = (values: IConstant) => {
    if (isNew) {
      props.createConstant(values);
    } else {
      const payload: IConstant = {
        ...props.entity,
        ...values
      };
      props.updateConstant(payload);
    }
  };

  const handleSubmit = () => formikRef.current.submitForm();

  return (
    <Modal
      title={
        entity && (isNew ? <small>Création d'une nouvelle configuration</small> : <small>Modification de ({<b>{entity.key}</b>})</small>)
      }
      visible={visible}
      onCancel={handleClose}
      maskClosable={false}
      destroyOnClose
      centered
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
          <TextField label="Clé" name="key" layout="horizontal" autoFocus />
          <TextAreaField label="Valeur" name="value" layout="horizontal" />
        </Form>
      </Formik>
    </Modal>
  );
};

const mapStateToProps = ({ constant }: IRootState) => ({
  updating: constant.updating,
  updateSuccess: constant.updateSuccess
});

const mapDispatchToProps = {
  createConstant: ConstantsReducer.createEntity,
  updateConstant: ConstantsReducer.updateEntity,
  resetConstant: ConstantsReducer.reset
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(ConstantsFormModal);
