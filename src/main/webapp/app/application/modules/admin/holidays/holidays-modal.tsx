import React, { Component, RefObject, useEffect, useRef, FunctionComponent } from 'react';
import { connect } from 'react-redux';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import moment from 'moment';
import { APP_LOCAL_DATETIME_FORMAT } from 'app/config/constants';
import { Button, Modal } from 'antd';
import { IRootState } from 'app/shared/reducers';
import { IHoliday } from 'app/shared/model/holiday.model';
import * as Holiday from 'app/entities/holiday/holiday.reducer';
import * as HolidayExt from 'app/application/entities/holiday/holiday.actions';
import DateField from 'app/application/components/zsoft-form/generic-fields/dateField.component';
import TextAreaField from 'app/application/components/zsoft-form/generic-fields/textAreaField.component';
import TextField from 'app/application/components/zsoft-form/generic-fields/textField.component';

export interface IHolidaysModalProps extends StateProps, DispatchProps {
  showModal: boolean;
  entity: IHoliday;
  onClose: Function;
}

const HolidaysModal: FunctionComponent<IHolidaysModalProps> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>(null);
  const { updating, updateSuccess, entity, showModal } = props;
  const isNew = entity !== null && entity.id === undefined;

  useEffect(
    () => {
      if (updateSuccess) {
        handleClose();
      }
    },
    [updateSuccess]
  );

  const handleClose = () => {
    props.onClose();
  };

  const saveEntity = values => {
    const holiday = {
      ...props.entity,
      description: '',
      ...values,
      date: moment(values.date).format(APP_LOCAL_DATETIME_FORMAT)
    };
    if (isNew) {
      props.createHoliday(holiday);
    } else {
      props.updateHoliday(holiday);
    }
  };

  const handleSubmit = () => {
    formikRef.current.submitForm();
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .label('Nom')
      .required(),
    date: Yup.date()
      .label('Date')
      .required(),
    descirption: Yup.string().label('Description')
  });

  return (
    <Modal
      title={isNew ? "Création d'une férié" : "Modification d'une férié"}
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
          <TextField label="Nom" name="name" layout="horizontal" autoFocus />
          <DateField label="Date" name="date" layout="horizontal" />
          <TextAreaField label="Description" name="description" rows={3} layout="horizontal" />
        </Form>
      </Formik>
    </Modal>
  );
};

const mapStateToProps = ({ holiday }: IRootState) => ({
  updating: holiday.updating,
  updateSuccess: holiday.updateSuccess
});

const mapDispatchToProps = {
  createHoliday: HolidayExt.createHoliday,
  updateHoliday: HolidayExt.updateHoliday,
  resetHoliday: Holiday.reset
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(HolidaysModal);
