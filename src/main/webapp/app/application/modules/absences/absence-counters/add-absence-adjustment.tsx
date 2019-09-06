import React, { FunctionComponent, RefObject, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { Form, Formik } from 'formik';
import { Button, Modal } from 'antd';
import * as Yup from 'yup';
import { FORMAT_DATE_SERVER } from 'app/application/common/config/constants';
import { createAbsenceBalanceAdjustment } from 'app/application/entities/absence-balance-adjustment/absence-balance-adjustment.actions';
import * as AbsenceBalanceAdjustment from 'app/entities/absence-balance-adjustment/absence-balance-adjustment.reducer';
import NumberField from 'app/application/components/zsoft-form/generic-fields/numberField.component';
import SelectField from 'app/application/components/zsoft-form/generic-fields/selectField.component';
import DateField from 'app/application/components/zsoft-form/generic-fields/dateField.component';
import TextAreaField from 'app/application/components/zsoft-form/generic-fields/textAreaField.component';

interface IAddAbsenceAdjustmentProps extends StateProps, DispatchProps {
  adjustment: any;
  balances: any;
  onClose: Function;
}

const validationSchema = Yup.object().shape({
  date: Yup.date()
    .label('Date')
    .required(),
  comment: Yup.string()
    .label('Commentaire')
    .required(),
  absenceBalanceId: Yup.number()
    .label("Type d'absence")
    .required(),
  balance: Yup.number()
    .label('Ajustement')
    .required()
});

export const AddAbsenceAdjustment: FunctionComponent<IAddAbsenceAdjustmentProps> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>(null);

  useEffect(
    () => {
      if (props.updateSuccess) {
        handleClose();
      }
    },
    [props.updateSuccess]
  );

  const handleSave = values => {
    const payload = {
      ...values,
      manualAdjustment: true,
      date: values.date.format(FORMAT_DATE_SERVER)
    };
    props.createAbsenceBalanceAdjustment(payload);
  };

  const handleClose = () => props.onClose();

  const handleSubmit = () => formikRef.current.submitForm();

  const { updating, adjustment, balances } = props;
  const actions = [
    <Button key="cancel" onClick={handleClose} type="default">
      Annuler
    </Button>,
    <Button key="submit" onClick={handleSubmit} type="primary" loading={updating}>
      Créer
    </Button>
  ];
  return (
    <Modal
      title="Ajout d'un ajustement de solde"
      visible={adjustment !== null}
      onCancel={handleClose}
      footer={actions}
      maskClosable={false}
      destroyOnClose
    >
      <Formik ref={formikRef} initialValues={adjustment} enableReinitialize validationSchema={validationSchema} onSubmit={handleSave}>
        <Form>
          <DateField label="Période" name="date" placeholder="Date" allowClear={false} layout="horizontal" autoFocus />
          <SelectField
            label="Type"
            name="absenceBalanceId"
            options={balances.map(balance => ({ label: balance.title, value: balance.id }))}
            layout="horizontal"
          />
          <NumberField label="Ajustement" name="balance" layout="horizontal" step={0.5} min={0} max={60} suffix="jours" />
          <TextAreaField label="Commentaire" name="comment" layout="horizontal" />
        </Form>
      </Formik>
    </Modal>
  );
};

const mapStateToProps = ({ absenceBalanceAdjustment }: IRootState) => ({
  updating: absenceBalanceAdjustment.updating,
  updateSuccess: absenceBalanceAdjustment.updateSuccess
});

const mapDispatchToProps = {
  createAbsenceBalanceAdjustment,
  resetAbsenceBalanceAdjustment: AbsenceBalanceAdjustment.reset
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(AddAbsenceAdjustment);
