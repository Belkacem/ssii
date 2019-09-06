import React, { RefObject, useEffect, useRef, FunctionComponent } from 'react';
import * as AbsenceType from 'app/entities/absence-type/absence-type.reducer';
import * as AbsenceTypeExt from 'app/application/entities/absence-type/absence-type.actions';
import { Gender, IAbsenceType } from 'app/shared/model/absence-type.model';
import { connect } from 'react-redux';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { Button, Modal, Radio } from 'antd';
import { IRootState } from 'app/shared/reducers';
import NumberField from 'app/application/components/zsoft-form/generic-fields/numberField.component';
import CheckboxField from 'app/application/components/zsoft-form/generic-fields/checkboxField.component';
import TextField from 'app/application/components/zsoft-form/generic-fields/textField.component';
import RadioFields from 'app/application/components/zsoft-form/generic-fields/radioFields.component';

export interface IAbsenceTypeModalProps extends StateProps, DispatchProps {
  showModal: boolean;
  entity: IAbsenceType;
  onClose: () => void;
}

const AbsenceTypeModal: FunctionComponent<IAbsenceTypeModalProps> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>(null);
  const { updating, updateSuccess, errorMessage, entity, showModal } = props;
  const isNew = entity !== null && entity.id === undefined;
  const initialValues = isNew ? { code: 1, gender: null, hasBalance: false } : entity;

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
      props.resetAbsenceType();
    }
  };

  const handleChangeGender = (value: Gender) => {
    formikRef.current.setFieldValue('gender', !!value ? value : null);
  };

  const handleClose = () => {
    props.onClose();
  };

  const saveEntity = values => {
    const payload = { ...initialValues, ...values };
    if (isNew) {
      props.createAbsenceType(payload);
    } else {
      const absenceType = {
        ...props.entity,
        ...payload
      };
      props.updateAbsenceType(absenceType);
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
      .label("Type d'Absence")
      .required(),
    hasBalance: Yup.boolean().label('Compteur'),
    gender: Yup.string()
      .label('Sexe')
      .nullable(true)
  });

  return (
    <Modal
      title={isNew ? "Création d'un type de congé" : "Modification d'un type de congé"}
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
          <TextField label="Type d&apos;Absence" name="type" layout="horizontal" />
          <CheckboxField label="Compteur" name="hasBalance" optionLabel="Oui" layout="horizontal" />
          <RadioFields label="Sexe" name="gender" layout="horizontal" onChange={handleChangeGender}>
            <Radio key="gender_ALL" children="Tous" />
            <Radio key="gender_MALE" value={Gender.MALE} children="Masculin" />
            <Radio key="gender_FEMALE" value={Gender.FEMALE} children="Féminin" />
            <Radio key="gender_OTHER" value={Gender.OTHER} children="Autre" />
          </RadioFields>
        </Form>
      </Formik>
    </Modal>
  );
};

const mapStateToProps = ({ absenceType }: IRootState) => ({
  updating: absenceType.updating,
  errorMessage: absenceType.errorMessage,
  updateSuccess: absenceType.updateSuccess
});

const mapDispatchToProps = {
  createAbsenceType: AbsenceTypeExt.createAbsenceType,
  updateAbsenceType: AbsenceTypeExt.updateAbsenceType,
  resetAbsenceType: AbsenceType.reset
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(AbsenceTypeModal);
