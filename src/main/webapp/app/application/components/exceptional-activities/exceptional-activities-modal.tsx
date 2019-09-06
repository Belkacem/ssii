import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import moment, { Moment } from 'moment';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { Button, Modal } from 'antd';
import { hoursToNbr } from 'app/application/common/utils/activity-utils';
import { ASTREINTE_LABELS } from './exceptional-activities-list';
import { FORMAT_DATE_SERVER } from 'app/application/common/config/constants';
import NumberField from 'app/application/components/zsoft-form/generic-fields/numberField.component';
import SelectField from 'app/application/components/zsoft-form/generic-fields/selectField.component';
import DateField from 'app/application/components/zsoft-form/generic-fields/dateField.component';
import TimeField from 'app/application/components/zsoft-form/generic-fields/timeField.component';

interface IExceptionalActivitiesModalProps {
  projects: any[];
  entity: any;
  index: any;
  month: Moment;
  visible: boolean;
  onUpdate: Function;
  onClose: Function;
}

const validationSchema = Yup.object().shape({
  activityReportId: Yup.number()
    .label('Projet')
    .required(),
  date: Yup.date()
    .label('Date')
    .required(),
  type: Yup.string()
    .label('Type')
    .required(),
  nbHours: Yup.number()
    .label("Nombre d'heures")
    .min(1)
    .max(24)
    .required(),
  start: Yup.date()
    .label('Heure début')
    .required()
});

export const ExceptionalActivitiesModal: FunctionComponent<IExceptionalActivitiesModalProps> = props => {
  const formikRef = useRef<Formik>();
  const { entity, projects, visible } = props;
  const [maxHoursField, setMaxHoursField] = useState(24 - (props.entity && props.entity.start ? hoursToNbr(props.entity.start) : 0));
  const minDate = moment(props.month).startOf('month');
  const maxDate = moment(props.month).endOf('month');

  const disabledDate = current => current.isBefore(minDate) || current.isAfter(maxDate);

  const handleStartChanged = startTime => {
    formikRef.current.setFieldValue('start', startTime);
    const maxHours = 24 - hoursToNbr(startTime);
    const values = formikRef.current.state.values;
    formikRef.current.setFieldValue('nbHours', values.nbHours > maxHours ? maxHours : values.nbHours);
    setMaxHoursField(maxHours);
  };

  const saveEntity = values => {
    props.onUpdate(
      {
        ...values,
        start: hoursToNbr(values.start),
        nbHours: parseFloat(values.nbHours),
        date: moment(values.date).format(FORMAT_DATE_SERVER)
      },
      props.index
    );
  };

  const handleSubmit = () => {
    formikRef.current.submitForm();
  };

  const handleClose = () => {
    props.onClose();
  };

  if (!entity) {
    return <React.Fragment />;
  }

  const footer = [
    <Button key="cancel" onClick={handleClose}>
      Annuler
    </Button>,
    <Button key="edit" type="primary" onClick={handleSubmit}>
      Sauvegarder
    </Button>
  ];

  return (
    <Modal title={'Ajouter ou Modifier une Astreinte'} visible={visible} destroyOnClose onCancel={handleClose} footer={footer}>
      <Formik ref={formikRef} initialValues={entity} enableReinitialize validationSchema={validationSchema} onSubmit={saveEntity}>
        <Form>
          <SelectField label="Projet" name="activityReportId" options={projects} layout="horizontal" />
          <SelectField
            label="Type"
            name="type"
            options={Object.keys(ASTREINTE_LABELS).map(k => ({
              label: ASTREINTE_LABELS[k],
              value: k
            }))}
            layout="horizontal"
          />
          <DateField label="La Date" name="date" disabledDate={disabledDate} defaultPickerValue={minDate} layout="horizontal" />
          <TimeField
            label="Heure début"
            name="start"
            layout="horizontal"
            minuteStep={15}
            allowClear={false}
            onChange={handleStartChanged}
          />
          <NumberField label="Nombre d'heures" name="nbHours" layout="horizontal" min={1} max={maxHoursField} step={1} suffix="heures" />
        </Form>
      </Formik>
    </Modal>
  );
};
