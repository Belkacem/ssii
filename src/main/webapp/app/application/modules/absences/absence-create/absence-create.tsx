import React, { Component, RefObject } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import * as ResourceExt from 'app/application/entities/resource/resource.actions';
import * as AbsenceExt from 'app/application/entities/absence/absence.actions';
import * as AbsenceType from 'app/entities/absence-type/absence-type.reducer';
import * as Holiday from 'app/entities/holiday/holiday.reducer';
import * as ResourceContract from 'app/application/entities/resource-contract/resource-contract.actions';
import { getAbsenceBalancesByResource } from 'app/application/entities/absence-balance/absence-balance.actions';
import * as ResourceConfiguration from 'app/application/entities/resource-configuration/resource-configuration.actions';
import { IResource } from 'app/shared/model/resource.model';
import {
  calculateNumberOfDays,
  DaysNumber,
  getValidatorResources,
  hasAbsence,
  hasAbsenceInside,
  isHoliday,
  isWeekend
} from 'app/application/common/utils/absence-utils';
import { getFullName } from 'app/application/common/utils/resource-utils';
import { hasContract } from 'app/application/common/utils/contract-utils';
import { isOwner } from 'app/application/common/utils/user-utils';
import { FORMAT_DATE_SERVER, RTT_CODE } from 'app/application/common/config/constants';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import moment, { Moment } from 'moment';
import { Alert, Button, Col, Modal, Row } from 'antd';
import SelectField from 'app/application/components/zsoft-form/generic-fields/selectField.component';
import DateRangeField from 'app/application/components/zsoft-form/generic-fields/dateRangeField.component';
import CheckboxField from 'app/application/components/zsoft-form/generic-fields/checkboxField.component';
import TextField from 'app/application/components/zsoft-form/generic-fields/textField.component';
import FileBase64Field from 'app/application/components/zsoft-form/generic-fields/file64Field.component';
import TextAreaField from 'app/application/components/zsoft-form/generic-fields/textAreaField.component';

interface IAbsenceRequestProps extends StateProps, DispatchProps, RouteComponentProps {
  show?: boolean;
  onClose?: Function;
  selectedResource?: IResource;
  typeCode?: number;
  excludeTypes?: number[];
  reloadData?: boolean;
  minDate?: Moment;
  maxDate?: Moment;
  start?: Moment;
  end?: Moment;
  startHalfDay?: boolean;
  endHalfDay?: boolean;
}

interface IAbsenceRequestStates {
  disableStartHalfDay: boolean;
  disableEndHalfDay: boolean;
}

class AbsenceRequest extends Component<IAbsenceRequestProps, IAbsenceRequestStates> {
  formikRef: RefObject<Formik>;
  isCompanyOwner;
  isResource;

  constructor(props) {
    super(props);
    this.formikRef = React.createRef<Formik>();
    this.isCompanyOwner = isOwner(props.account, props.currentCompany);
    this.isResource = !!props.currentResource.id;
    this.state = {
      disableStartHalfDay: false,
      disableEndHalfDay: false
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.show !== this.props.show && this.props.show) {
      this.initData();
    }
    if (prevProps.updateSuccess !== this.props.updateSuccess && this.props.updateSuccess) {
      this.handleClose();
    }
  }

  initData = () => {
    const { reloadData = true } = this.props;
    this.setState({
      disableStartHalfDay: false,
      disableEndHalfDay: false
    });
    if (this.props.absenceTypes.length === 0 || reloadData) {
      this.props.getAbsenceTypes();
    }
    if (!this.props.holidays || reloadData) {
      this.props.getHolidays(0, 999, 'date,asc');
    }
    if (this.isResource) {
      if (!this.props.disabledAbsences || reloadData) {
        this.props.getMyDisabledAbsences();
      }
      if (this.props.contracts.length === 0 || reloadData) {
        this.props.getContracts(this.props.currentResource.id);
      }
      this.props.getAbsenceBalancesByResource(this.props.currentResource.id);
      this.props.getResourceConfiguration(this.props.currentResource.id);
    } else {
      if (this.props.selectedResource) {
        this.props.getDisabledAbsences(this.props.selectedResource.id);
        this.props.getAbsenceBalancesByResource(this.props.selectedResource.id);
      } else {
        if (this.isCompanyOwner) {
          this.props.getAllResources();
        }
      }
    }
  };

  disabledDate = (current: Moment) => {
    const { minDate, maxDate, contracts } = this.props;
    return (
      contracts.length === 0 ||
      !hasContract(current, contracts) ||
      (minDate && minDate.isAfter(current, 'days')) ||
      (maxDate && maxDate.isBefore(current, 'days')) ||
      hasAbsence(current, this.props.disabledAbsences) ||
      isWeekend(current) ||
      isHoliday(current, this.props.holidays)
    );
  };

  dateRender = current => {
    const classes = ['ant-calendar-date'];
    if (isWeekend(current)) {
      classes.push('weekend');
    }
    if (isHoliday(current, this.props.holidays)) {
      classes.push('holiday');
    }
    this.props.disabledAbsences.filter(ab => current.isBetween(ab.start, ab.end, 'days', '[]')).forEach(absence => {
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

  handleDateChanged = (startDate: Moment, endDate: Moment) => {
    this.formikRef.current.setFieldValue('start', startDate);
    this.formikRef.current.setFieldValue('end', endDate);
    let absence = this.props.disabledAbsences.find(ab => startDate.isBetween(ab.start, ab.end, 'days', '[]'));
    if (absence && startDate.isSame(absence.end, 'days') && absence.endHalfDay) {
      this.formikRef.current.setFieldValue('startHalfDay', true);
      this.setState({ disableStartHalfDay: true });
    } else {
      this.formikRef.current.setFieldValue('startHalfDay', false);
      this.setState({ disableStartHalfDay: false });
    }
    absence = this.props.disabledAbsences.find(ab => endDate.isBetween(ab.start, ab.end, 'days', '[]'));
    if (absence && endDate.isSame(absence.start, 'days') && absence.startHalfDay) {
      this.formikRef.current.setFieldValue('endHalfDay', true);
      this.setState({ disableEndHalfDay: true });
    } else {
      this.formikRef.current.setFieldValue('endHalfDay', false);
      this.setState({ disableEndHalfDay: false });
    }
  };

  getValidationSchema = () => {
    let fields: any = {
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
          test: end => {
            if (this.formikRef.current) {
              const { start, startHalfDay, endHalfDay } = this.formikRef.current.state.values;
              if (start && end) {
                return !hasAbsenceInside(start, end, startHalfDay, endHalfDay, this.props.disabledAbsences);
              }
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
      files: Yup.array().of(
        Yup.object().shape({
          file: Yup.mixed(),
          fileContentType: Yup.string()
        })
      ),
      description: Yup.string().label('Description')
    };
    if (!this.isResource) {
      fields = {
        resourceId: Yup.number()
          .label('Ressource')
          .required(),
        ...fields
      };
    }
    return Yup.object().shape(fields);
  };

  getExcludeTypes = () => {
    const { excludeTypes = [] } = this.props;
    if (this.formikRef.current) {
      const resource = this.isResource
        ? this.props.currentResource
        : this.props.resources.find(r => r.id === this.formikRef.current.state.values.resourceId);
      if (!!resource && resource.gender !== null) {
        this.props.absenceTypes
          .filter(absenceType => absenceType.gender !== null)
          .filter(absenceType => absenceType.gender.valueOf() !== resource.gender.valueOf())
          .map(absenceType => absenceType.code)
          .forEach(code => excludeTypes.push(code));
      }
    }
    const config = this.props.resourceConfig;
    if (!!config.id && !config.hasRTT) {
      excludeTypes.push(RTT_CODE);
    }
    return excludeTypes;
  };

  getFilteredAbsenceTypes = () => {
    const excludeTypes = this.getExcludeTypes();
    return this.props.absenceTypes.filter(type => excludeTypes.indexOf(type.code) === -1);
  };

  handleResourceChange = value => {
    this.formikRef.current.setFieldValue('resourceId', value);
    this.formikRef.current.setFieldValue('typeId', undefined);
    this.props.getDisabledAbsences(value);
    this.props.getContracts(value);
    this.props.getAbsenceBalancesByResource(value);
    this.props.getResourceConfiguration(value);
    document.getElementById('typeId').focus();
  };

  saveEntity = absenceValues => {
    const { files, ...values } = absenceValues;
    const absence = {
      ...values,
      start: moment(values.start).format(FORMAT_DATE_SERVER),
      end: moment(values.end).format(FORMAT_DATE_SERVER),
      numberDays: calculateNumberOfDays(values, this.props.holidays),
      submissionDate: moment()
    };
    if (this.isResource) {
      absence.resourceId = this.props.currentResource.id;
      absence.validationStatus = 'PENDING';
    } else {
      absence.validationDate = moment();
      absence.validationStatus = 'APPROVED';
    }
    this.props.createAbsence(absence, files);
  };

  handleClose = () => {
    if (this.props.onClose) {
      this.props.onClose();
    }
  };

  handleSubmit = () => {
    this.formikRef.current.submitForm();
  };

  renderTitle = absenceType => {
    if (this.isResource) {
      return absenceType ? `Demander une "${absenceType.type}"` : 'Demander un congé';
    }
    return absenceType ? `Crée une demande de "${absenceType.type}" valide` : 'Crée une demande de congé valide';
  };

  renderActions = () => {
    const { updating } = this.props;
    if (this.isResource) {
      return [
        <Button key="cancel" onClick={this.handleClose} type="default">
          Annuler
        </Button>,
        <Button key="submit" onClick={this.handleSubmit} type="primary" loading={updating}>
          Déposer
        </Button>
      ];
    }
    return [
      <Button key="cancel" onClick={this.handleClose} type="default">
        Annuler
      </Button>,
      <Button key="submit" onClick={this.handleSubmit} type="primary" loading={updating}>
        Sauvegarder
      </Button>
    ];
  };

  getBalance = () => {
    const result = [];
    if (this.formikRef.current !== null) {
      const { balances } = this.props;
      const values = this.formikRef.current.state.values;
      const typeId = values.typeId;
      const resourceId = values.resourceId;
      const date = values.start ? moment(values.start) : moment();
      const balance = balances.find(b => b.typeId === typeId && b.resourceId === resourceId && date.isSame(b.date, 'year'));
      if (balance) {
        result.push(balance);
      }
    }
    return result;
  };

  render() {
    const { currentResource, resourceConfig, show, loading, currentAbsenceValidator, selectedResource, typeCode } = this.props;
    const { start = null, end = null, startHalfDay = false, endHalfDay = false } = this.props;
    const { disableStartHalfDay, disableEndHalfDay } = this.state;
    const absenceTypes = this.getFilteredAbsenceTypes();
    const absenceType = typeCode && absenceTypes.find(type => type.code === typeCode);
    const typeId = absenceType ? absenceType.id : absenceTypes.length > 0 && absenceTypes[0].id;
    const initialValues = { end, endHalfDay, start, startHalfDay, typeId };
    let resources = this.props.resources;
    if (!currentResource.id) {
      resources = this.isCompanyOwner ? this.props.resources : getValidatorResources(currentAbsenceValidator);
      if (selectedResource) {
        initialValues['resourceId'] = selectedResource.id;
      }
    }
    return (
      <Modal
        title={this.renderTitle(absenceType)}
        visible={show}
        onCancel={this.handleClose}
        footer={this.renderActions()}
        maskClosable={false}
        destroyOnClose
        centered
      >
        <Formik
          ref={this.formikRef}
          initialValues={initialValues}
          enableReinitialize
          validationSchema={this.getValidationSchema}
          onSubmit={this.saveEntity}
          isInitialValid
        >
          {formProps => (
            <Form>
              {/* Resource */}
              {!currentResource.id &&
                (selectedResource ? (
                  <TextField label="Ressource" name="resource" readOnly value={getFullName(selectedResource)} layout="horizontal" />
                ) : (
                  <SelectField
                    label="Ressource"
                    name="resourceId"
                    autoFocus
                    onChange={this.handleResourceChange}
                    options={resources.map(emp => ({
                      label: getFullName(emp),
                      value: emp.id
                    }))}
                    layout="horizontal"
                  />
                ))}
              {!!resourceConfig.id &&
                !resourceConfig.active && (
                  <Alert
                    message={<small>Cette ressource est désactivée</small>}
                    type="warning"
                    banner
                    style={{ margin: '0 -24px 24px -24px' }}
                  />
                )}
              {/* Type */}
              {!absenceType && (
                <SelectField
                  label="Type d&apos;Absence"
                  name="typeId"
                  autoFocus={!!selectedResource}
                  options={absenceTypes.map(lt => ({ label: lt.type, value: lt.id }))}
                  layout="horizontal"
                />
              )}
              {/* From - To */}
              <DateRangeField
                label="Période"
                name={['start', 'end']}
                placeholder={['Date début', 'Date fin']}
                disabledDate={this.disabledDate}
                dropdownClassName="absence-date-picker"
                dateRender={this.dateRender}
                allowClear={false}
                onChange={this.handleDateChanged}
                value={[formProps.values.start, formProps.values.end]}
                defaultPickerValue={this.props.minDate}
                layout="horizontal"
                autoFocus={absenceType === undefined}
                disabled={loading || (!formProps.values.resourceId && !this.isResource)}
              />
              <Row>
                <Col sm={6} />
                <Col sm={9}>
                  {/* startHalfDay */}
                  <CheckboxField optionLabel="à partir de midi" name="startHalfDay" disabled={disableStartHalfDay} />
                </Col>
                <Col sm={9}>
                  {/* endHalfDay */}
                  <CheckboxField optionLabel="jusqu'à midi" name="endHalfDay" disabled={disableEndHalfDay} />
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
              <DaysNumber {...formProps} holidays={this.props.holidays} />
              <TextAreaField name="description" label="Description" layout="horizontal" placeholder="Ajouter une description ..." />
              <FileBase64Field name="file" placeholder="Ajouter une justification" accept=".jpeg,.jpg,.pdf" max={6} multiple />
            </Form>
          )}
        </Formik>
      </Modal>
    );
  }
}

const mapStateToProps = ({
  application,
  authentication,
  absence,
  holiday,
  absenceBalance,
  absenceType,
  resource,
  resourceContract,
  resourceConfiguration
}: IRootState) => ({
  account: authentication.account,
  currentCompany: application.company.current,
  savedAbsence: absence.entity,
  currentResource: application.resource.current.entity,
  resources: resource.entities,
  holidays: holiday.entities,
  updating: absence.updating,
  updateSuccess: absence.updateSuccess,
  disabledAbsences: application.absence.disabled.entities,
  loading: application.absence.disabled.loading,
  absenceTypes: absenceType.entities,
  currentAbsenceValidator: application.absenceValidator.current,
  contracts: resourceContract.entities,
  balances: absenceBalance.entities,
  resourceConfig: resourceConfiguration.entity
});

const mapDispatchToProps = {
  getAllResources: ResourceExt.getAll,
  createAbsence: AbsenceExt.create,
  getDisabledAbsences: AbsenceExt.getDisabledByResource,
  getMyDisabledAbsences: AbsenceExt.getDisabledByCurrentResource,
  getAbsenceTypes: AbsenceType.getEntities,
  getHolidays: Holiday.getEntities,
  getContracts: ResourceContract.getByResource,
  getAbsenceBalancesByResource,
  getResourceConfiguration: ResourceConfiguration.getByResource
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AbsenceRequest);
