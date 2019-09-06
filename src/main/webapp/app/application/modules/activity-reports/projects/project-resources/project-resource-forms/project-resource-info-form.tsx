import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { Form, Formik } from 'formik';
import { Checkbox, Form as FormAntd } from 'antd';
import * as Yup from 'yup';
import { FORMAT_DATE_SERVER } from 'app/application/common/config/constants';
import { hasContract } from 'app/application/common/utils/contract-utils';
import moment, { Moment } from 'moment';
import { debounce } from 'lodash';
import MoneyField from 'app/application/components/zsoft-form/custom-fields/moneyField.component';
import NumberField from 'app/application/components/zsoft-form/generic-fields/numberField.component';
import DateField from 'app/application/components/zsoft-form/generic-fields/dateField.component';
import TextField from 'app/application/components/zsoft-form/generic-fields/textField.component';
import { IProjectResourceInfo } from 'app/shared/model/project-resource-info.model';
import { IResourceContract } from 'app/shared/model/resource-contract.model';
import { IProjectResource } from 'app/shared/model/project-resource.model';

interface IProjectResourceInfoFormProps {
  formikRef?: RefObject<Formik>;
  projectResourceInfo: IProjectResourceInfo;
  projectResourceInfos?: ReadonlyArray<IProjectResourceInfo>;
  contracts?: ReadonlyArray<IResourceContract>;
  projectResource?: IProjectResource;
  onUpdate?: (values: IProjectResourceInfo, months?: string[]) => void;
  onCreate?: (values: IProjectResourceInfo, months?: string[]) => void;
}

const validationSchema = Yup.object().shape({
  startDate: Yup.date()
    .label('Date début')
    .required(),
  dailyRate: Yup.number()
    .label('Taux journalier')
    .required(),
  paymentDelay: Yup.number()
    .label('Délai de paiement')
    .nullable(true),
  reference: Yup.string()
    .label('Référence')
    .nullable(true),
  selectedMonths: Yup.array(Yup.date().label("Rapport d'activité"))
});

export const ProjectResourceInfoForm: FunctionComponent<IProjectResourceInfoFormProps> = props => {
  const formikRef: RefObject<Formik> = props.formikRef || useRef<Formik>(null);
  const [months, setMonths] = useState([]);
  const { projectResourceInfo, projectResource } = props;
  const [minDate, setMinDate] = useState<Moment>();
  const [maxDate, setMaxDate] = useState<Moment>();

  useEffect(
    () => {
      if (!!projectResource) {
        if (projectResource.startDate) {
          setMinDate(moment(projectResource.startDate));
        }
        if (projectResource.endDate) {
          setMaxDate(moment(projectResource.endDate));
        }
      }
    },
    [projectResource]
  );

  useEffect(
    () => {
      if (!!projectResourceInfo) {
        setMonths([]);
      }
    },
    [projectResourceInfo]
  );

  const disabledDate = current => {
    const projectResourceInfos = props.projectResourceInfos.filter(
      contract => !projectResourceInfo.id || contract.id !== projectResourceInfo.id
    );
    const collisionContract = projectResourceInfos.some(contract => {
      return current.isSame(contract.startDate, 'days');
    });
    return (
      props.contracts.length === 0 ||
      (minDate && minDate.isAfter(current, 'days')) ||
      (maxDate && maxDate.isBefore(current, 'days')) ||
      !hasContract(current, props.contracts) ||
      collisionContract
    );
  };

  const getLastProjectContract = () => {
    const { projectResourceInfos } = props;
    const maxStartDate = projectResourceInfos.reduce(
      (acc, contract) => moment.max(acc, moment(contract.startDate)),
      projectResourceInfos.length > 0 ? moment(projectResourceInfos[0].startDate) : moment()
    );
    return projectResourceInfos.find(contract => maxStartDate.isSame(contract.startDate, 'days'));
  };

  const defaultPickerValue = () => {
    const lastProjectContract = getLastProjectContract();
    return lastProjectContract ? moment(lastProjectContract.startDate).add(1, 'days') : null;
  };

  const handleSave = values => {
    const { selectedMonths, ...payload } = values;
    if (typeof values.startDate === 'object') {
      payload.startDate = values.startDate.format(FORMAT_DATE_SERVER);
    }
    if (payload.paymentDelay === 0) {
      payload.paymentDelay = null;
    }
    if (!projectResourceInfo.id) {
      payload.projectResourceId = projectResource.id;
      props.onCreate(payload, selectedMonths);
    } else {
      props.onUpdate(payload, selectedMonths);
    }
  };

  const handleStartDateChange = (startDate: Moment) => {
    formikRef.current.setFieldValue('startDate', startDate);
    formikRef.current.setFieldValue('endDate', null);
    setPeriodMonths();
  };

  const toggleMonths = checkedValues => formikRef.current.setFieldValue('selectedMonths', checkedValues);

  const handleChangePeriodMonths = () => {
    if (!formikRef.current) {
      return;
    }
    const formikValues = formikRef.current.state.values;
    const startDate = moment(formikValues.startDate);
    const checkboxes = [];
    if (startDate.isSameOrBefore(moment(), 'months')) {
      const endDate = moment();
      const day = startDate.clone().date(1);
      while (day.isSameOrBefore(endDate, 'months')) {
        checkboxes.push({ value: day.format('YYYY-MM-DD'), label: day.format('MMMM YYYY') });
        day.add(1, 'months');
      }
      const values = checkboxes.map(cb => cb.value);
      if (JSON.stringify(checkboxes) !== JSON.stringify(months)) {
        formikRef.current.setFieldValue('months', values);
      }
    }
    setMonths(checkboxes);
  };
  const setPeriodMonths = debounce(handleChangePeriodMonths, 100);

  const initialValues = projectResourceInfo;
  if (!!initialValues && initialValues.startDate && typeof initialValues.startDate === 'string') {
    initialValues.startDate = moment(initialValues.startDate);
  }
  return (
    <Formik ref={formikRef} initialValues={initialValues} enableReinitialize validationSchema={validationSchema} onSubmit={handleSave}>
      {formProps => (
        <Form>
          <DateField
            label="Période"
            name="startDate"
            placeholder="Date début"
            allowClear={false}
            disabledDate={disabledDate}
            defaultPickerValue={defaultPickerValue()}
            onChange={handleStartDateChange}
            layout="horizontal"
            autoFocus
          />
          <MoneyField name="dailyRate" label="Taux journalier" layout="horizontal" />
          <NumberField
            label="Délai de paiement"
            name="paymentDelay"
            helper="Ce délai remplacera le délai de paiement du client, entrez 0 (zéro) pour obtenir le délai de paiement du client."
            layout="horizontal"
            step={1}
            min={0}
            max={60}
            suffix="jours"
          />
          <TextField label="Référence" layout="horizontal" name="reference" />
          {months.length > 0 && (
            <FormAntd.Item
              label={
                <>
                  Rapport d'activité <b className="required-start">*</b>
                </>
              }
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
            >
              <Checkbox.Group options={months} value={formProps.values.selectedMonths} onChange={toggleMonths} />
            </FormAntd.Item>
          )}
        </Form>
      )}
    </Formik>
  );
};
