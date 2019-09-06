/* tslint:disable */
import React, { FunctionComponent, MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';
import * as Yup from 'yup';
import {
  calculateNumberOfDays,
  DaysNumber,
  hasAbsence,
  hasAbsenceInside,
  isHoliday,
  isWeekend
} from 'app/application/common/utils/absence-utils';
import { Form, Formik } from 'formik';
import moment, { Moment } from 'moment';
import { Button, Col, Modal, Row } from 'antd';
import { getFullName } from 'app/application/common/utils/resource-utils';
import { IResource } from 'app/shared/model/resource.model';
import { IAbsenceType } from 'app/shared/model/absence-type.model';
import { IAbsence } from 'app/shared/model/absence.model';
import { FORMAT_DATE_SERVER } from 'app/application/common/config/constants';
import { hasContract } from 'app/application/common/utils/contract-utils';
import { IHoliday } from 'app/shared/model/holiday.model';
import { IResourceContract } from 'app/shared/model/resource-contract.model';
import { IRootState } from 'src/main/webapp/app/shared/reducers/index';
import * as ResourceExt from 'app/application/entities/resource/resource.actions';
import * as AbsenceExt from 'app/application/entities/absence/absence.actions';
import * as AbsenceType from 'app/entities/absence-type/absence-type.reducer';
import * as Holiday from 'app/entities/holiday/holiday.reducer';
import * as ResourceContract from 'app/application/entities/resource-contract/resource-contract.actions';
import { getAbsenceBalancesByResource } from 'app/application/entities/absence-balance/absence-balance.actions';
import { connect } from 'react-redux';
import SelectField from 'app/application/components/zsoft-form/generic-fields/selectField.component';
import DateRangeField from 'app/application/components/zsoft-form/generic-fields/dateRangeField.component';
import CheckboxField from 'app/application/components/zsoft-form/generic-fields/checkboxField.component';

interface IAbsenceCreateProps {
  show?: boolean;
  onClose?: () => void;
  onCreate?: (absence: IAbsence) => void;
  holidays: ReadonlyArray<IHoliday>;
  loadHolidays: () => void;
  resource?: IResource;
  resources?: ReadonlyArray<IResource>;
  loadResources: () => void;
  resourceContracts?: ReadonlyArray<IResourceContract>;
  loadResourceContracts?: ReadonlyArray<IResourceContract>;
  absenceTypes?: ReadonlyArray<IAbsenceType>;
  absenceType?: IAbsenceType;
  loadAbsenceType?: () => void;
  LoadAbsenceTypes?: () => void;
  absences?: ReadonlyArray<IAbsence>;
  loadAbsences?: () => void;
  minDate?: Moment;
  maxDate?: Moment;
  // Preselected dates
  start?: Moment;
  end?: Moment;
  startHalfDay?: boolean;
  endHalfDay?: boolean;

  typeCode?: number;
  reloadData?: boolean;
  //
  submit: boolean;
  //
  excludeTypes?: number[];
  disableStartHalfDay: boolean;
  disableEndHalfDay: boolean;
}

const useTitle = (absenceType: IAbsenceType): String => {
  const defaultTitle = 'Ajouter une Absence';
  const [title, setTitle] = useState(defaultTitle);
  useEffect(
    () => {
      if (absenceType) {
        setTitle(`${defaultTitle}: (${absenceType.type})`);
      }
    },
    [absenceType]
  );
  return title;
};

const getValidationSchema = (absences: ReadonlyArray<IAbsence>) => () => {
  return Yup.object().shape({
    typeId: Yup.number()
      .label("Type d'Absence")
      .nullable(true)
      .required(),
    start: Yup.date()
      .label('Date début')
      .nullable(true)
      .required(),
    startHalfDay: Yup.boolean(),
    end: Yup.date()
      .label('Date fin')
      .nullable(true)
      .test({
        name: 'has-collision',
        message: "La période séléctionnée n'est pas valide.",
        test(end) {
          const start = this.resolve(Yup.ref('start'));
          const startHalfDay = this.resolve(Yup.ref('startHalfDay'));
          const endHalfDay = this.resolve(Yup.ref('endHalfDay'));
          if (start && end) {
            return !hasAbsenceInside(start, end, startHalfDay, endHalfDay, absences);
          }
          return false;
        },
        exclusive: false
      })
      .required(),
    endHalfDay: Yup.boolean().when(['start', 'end', 'startHalfDay'], (start, end, startHalfDay, schema) => {
      if (moment(start).isSame(end) && startHalfDay) {
        return schema.test('is-zero-hours', 'Vous pouvez pas choisir "à partir de midi" et "jusqu\'à midi" le même jour !', a =>
          Promise.resolve(!a)
        );
      }
      return schema;
    }),
    resourceId: Yup.number()
      .label('Ressource')
      .required()
  });
};

const AbsenceCreateComponent: FunctionComponent<IAbsenceCreateProps> = props => {
  const formikRef: MutableRefObject<Formik> = useRef();
  const [selectedResource, setSelectedResource] = useState(props.resource);
  const [absenceType, setAbsenceType] = useState(props.absenceTypes[0]);
  const [loading, setLoading] = useState(false);
  const [isDraft, setDraft] = useState(true);

  const submitAbsence = () => {
    setDraft(false);
    formikRef.current.submitForm();
    //.then(props.onClose);
  };
  const submitDraftAbsence = () => {
    setDraft(true);
    formikRef.current.submitForm();
    //.then(props.onClose);
  };

  const footerActions = useCallback(
    () => {
      return [
        <Button key="cancel" onClick={props.onClose} type="default">
          Annuler
        </Button>,
        <Button key="submitDraft" onClick={submitDraftAbsence} type="default" loading={loading}>
          Brouillon
        </Button>,
        <Button key="submit" onClick={submitAbsence} type="primary" loading={loading}>
          Soumettre
        </Button>
      ];
    },
    [loading]
  );

  const initialValues = {
    start: null,
    startHalfDay: null,
    end: null,
    endHalfDay: null,
    typeId: absenceType.id
  };

  const disabledDate = (minDate, maxDate, disabledAbsences, contracts, holidays) => current => {
    return (
      contracts.length === 0 ||
      !hasContract(current, contracts) ||
      (minDate && minDate.isAfter(current, 'days')) ||
      (maxDate && maxDate.isBefore(current, 'days')) ||
      hasAbsence(current, disabledAbsences) ||
      isWeekend(current) ||
      isHoliday(current, holidays)
    );
  };

  const dateRender = current => {
    const classes = ['ant-calendar-date'];
    if (isWeekend(current)) {
      classes.push('weekend');
    }
    if (isHoliday(current, props.holidays)) {
      classes.push('holiday');
    }
    props.absences.filter(ab => current.isBetween(ab.start, ab.end, 'days', '[]')).forEach(absence => {
      if (absence) {
        if (absence.validationStatus === 'PENDING') {
          classes.push('pending');
        } else {
          classes.push('approved');
        }
        if ((current.isSame(absence.start, 'days') && !absence.startHalfDay) || !current.isSame(absence.start, 'days')) {
          classes.push('am');
        }
        if ((current.isSame(absence.end, 'days') && !absence.endHalfDay) || !current.isSame(absence.end, 'days')) {
          classes.push('pm');
        }
      }
    });
    return (
      <div className={classes.join(' ')}>
        <span>{current.date()}</span>
      </div>
    );
  };

  const handleChangeResource = resource => {
    setSelectedResource(resource);
  };

  const submit = values => {
    const absence = {
      ...values,
      start: moment(values.start).format(FORMAT_DATE_SERVER),
      end: moment(values.end).format(FORMAT_DATE_SERVER),
      numberDays: calculateNumberOfDays(values, props.holidays),
      validationDate: new Date()
    };
    props.onCreate(absence);
  };

  return (
    <Modal title={useTitle(absenceType)} visible={props.show} footer={footerActions()} maskClosable={false} destroyOnClose>
      <Formik
        ref={formikRef}
        initialValues={initialValues}
        enableReinitialize
        validationSchema={getValidationSchema(props.absences)}
        onSubmit={submit}
        isInitialValid
      >
        {formProps => (
          <Form>
            {/* Resource */}
            <SelectField
              label="Ressource"
              name="resourceId"
              disabled={props.resource != null}
              autoFocus
              onChange={handleChangeResource}
              value={selectedResource ? getFullName(selectedResource) : ''}
              options={props.resources.map(emp => ({
                label: getFullName(emp),
                value: emp.id
              }))}
              layout="horizontal"
            />
            {/* Type */}
            <SelectField
              label="Type d&apos;Absence"
              name="typeId"
              disabled={props.absenceType != null}
              autoFocus={!!selectedResource}
              options={props.absenceTypes.map(lt => ({ label: lt.type, value: lt.id }))}
              layout="horizontal"
            />
            {/* From - To */}
            <DateRangeField
              label="Période"
              name={['start', 'end']}
              placeholder={['Date début', 'Date fin']}
              disabledDate={disabledDate(props.minDate, props.maxDate, props.absences, props.resourceContracts, props.holidays)}
              dropdownClassName="absence-date-picker"
              dateRender={dateRender}
              allowClear={false}
              //onChange={this.handleDateChanged.bind(this, formProps)}
              value={[formProps.values.start, formProps.values.end]}
              defaultPickerValue={props.minDate}
              layout="horizontal"
              autoFocus={absenceType === undefined}
            />
            <Row>
              <Col sm={6} />
              <Col sm={9}>
                {/* startHalfDay */}
                <CheckboxField optionLabel="à partir de midi" name="startHalfDay" disabled={props.disableStartHalfDay} />
              </Col>
              <Col sm={9}>
                {/* endHalfDay */}
                <CheckboxField optionLabel="jusqu'à midi" name="endHalfDay" disabled={props.disableEndHalfDay} />
              </Col>
            </Row>
            {this.getBalance().map(balance => (
              <Row key={balance.id}>
                <Col sm={6} className="ant-form-item-label">
                  <label>Solde</label>
                </Col>
                <Col sm={18}>
                  <div className="ant-form-item-control">
                    <div className="ant-input">
                      <b>{balance.balance.toFixed(2)}</b> jours
                    </div>
                  </div>
                </Col>
              </Row>
            ))}
            <DaysNumber {...formProps} holidays={props.holidays} />
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

const mapStateToProps = ({
  application,
  authentication,
  absence,
  holiday,
  absenceBalance,
  absenceType,
  resource,
  resourceContract
}: IRootState) => ({
  savedAbsence: absence.entity,
  currentResource: application.resource.current.entity,
  resources: resource.entities,
  holidays: holiday.entities,
  updating: absence.updating,
  updateSuccess: absence.updateSuccess,
  disabledAbsences: application.absence.disabled.entities,
  loading: application.absence.disabled.loading,
  absenceTypes: absenceType.entities,
  account: authentication.account,
  currentAbsenceValidator: application.absenceValidator.current,
  contracts: resourceContract.entities,
  balances: absenceBalance.entities
});

const mapDispatchToProps = {
  getAllResources: ResourceExt.getAll,
  createAbsence: AbsenceExt.create,
  getDisabledAbsences: AbsenceExt.getDisabledByResource,
  getMyDisabledAbsences: AbsenceExt.getDisabledByCurrentResource,
  getAbsenceTypes: AbsenceType.getEntities,
  getHolidays: Holiday.getEntities,
  getContracts: ResourceContract.getByResource,
  getAbsenceBalancesByResource
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export const AbsenceCreateModal = connect(
  mapStateToProps,
  mapDispatchToProps
)(AbsenceCreateComponent);
