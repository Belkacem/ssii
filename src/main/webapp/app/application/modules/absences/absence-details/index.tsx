import React, { FunctionComponent, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import * as Absence from 'app/entities/absence/absence.reducer';
import * as AbsenceExt from 'app/application/entities/absence/absence.actions';
import * as AbsenceType from 'app/entities/absence-type/absence-type.reducer';
import * as AbsenceValidators from 'app/entities/absence-validator/absence-validator.reducer';
import * as AbsenceJustificationExt from 'app/application/entities/absence-justification/absence-justification.actions';
import { Button, Divider, Modal, Skeleton } from 'antd';
import { IAbsence, ValidationStatus } from 'app/shared/model/absence.model';
import { RouteComponentProps } from 'react-router-dom';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import { getAbsenceBalancesByResource } from 'app/application/entities/absence-balance/absence-balance.actions';
import { Attachment } from 'app/application/components/attachment.component';
import { AbsenceValidationForm } from './absence-validation-form';
import { AbsenceComponent } from './absence.component';

interface IAbsenceDetailsProps extends StateProps, DispatchProps, RouteComponentProps<{ absence_id }> {}

export const AbsenceDetails: FunctionComponent<IAbsenceDetailsProps> = props => {
  const { absence, loading, absenceType, balances, updating, validator, updateSuccess, currentAbsenceValidator, justifications } = props;
  const [formType, setFormType] = useState('details');
  const [submitting, setSubmitting] = useState(false);
  const title = absence.id ? (
    'Détails ' + (absenceType.code === 1 ? 'de congé' : "d'absence")
  ) : (
    <Skeleton paragraph={false} title={{ width: '40%' }} active />
  );

  const initData = () => {
    setFormType('details');
    setSubmitting(false);
    props.getAbsence(props.match.params.absence_id);
    props.getAbsenceJustifications(props.match.params.absence_id);
  };

  useEffect(
    () => {
      initData();
    },
    [props.match.params.absence_id]
  );

  useEffect(
    () => {
      if (updateSuccess && submitting) {
        initData();
      }
    },
    [updateSuccess]
  );

  useEffect(
    () => {
      if (!!absence && !!absence.id) {
        props.getAbsenceType(absence.typeId);
        props.getAbsenceBalancesByResource(absence.resourceId);
        if (absence.validationStatus === ValidationStatus.PENDING) {
          if (!!currentAbsenceValidator) {
            setFormType('validation');
          } else {
            setFormType('cancel');
          }
        } else {
          if (!validator || validator.id !== absence.validatorId) {
            props.getAbsenceValidator(absence.validatorId);
          }
        }
      }
    },
    [absence]
  );

  const handleClose = () => {
    props.history.goBack();
  };

  const handleApprove = (payload: IAbsence) => {
    setSubmitting(true);
    props.approveAbsence(payload);
  };

  const handleReject = (payload: IAbsence) => {
    setSubmitting(true);
    props.rejectAbsence(payload);
  };

  const handleDelete = () => {
    Modal.confirm({
      title,
      content: 'Voulez-vous vraiment annuler la demande de congé ?',
      okText: 'Annuler la demande',
      okType: 'danger',
      cancelText: 'Ne pas annuler',
      onOk: () => {
        props.deleteAbsence(absence.id);
      }
    });
  };

  const onApprove = () => handleApprove(absence);

  const onReject = () => handleReject(absence);

  const pageHeadActions = [];
  if (formType === 'validation') {
    pageHeadActions.push([
      <small key="question">Souhaitez-vous valider l'absence ?</small>,
      <Button key="reject" icon="close" onClick={onReject} type="danger" loading={updating} title="Refuser" />,
      <Button key="approve" icon="check" onClick={onApprove} type="primary" loading={updating} title="Accepter" />
    ]);
  } else if (formType === 'cancel') {
    pageHeadActions.push([
      <Button key="cancel" icon="delete" onClick={handleDelete} type="danger" loading={updating} title="Annuler la demande" />
    ]);
  }

  return (
    <div>
      <PageHead title={title} onBack={handleClose} backOnlyMobile margin={false} actions={pageHeadActions} />
      <div className="padding-bottom-1rem">
        <AbsenceComponent absence={absence} absenceType={absenceType} loading={loading} balances={balances} validator={validator} />
        {absence.id &&
          justifications.length > 0 &&
          typeof title === 'string' && (
            <>
              <Divider orientation="left" style={{ margin: '1rem 0 0.5rem 0' }}>
                les pièces jointes
              </Divider>
              {justifications.map((justification, index) => (
                <Attachment
                  key={justification.id}
                  file={justification.file}
                  contentType={justification.fileContentType}
                  fileName={`${index + 1} - ${title}`}
                />
              ))}
            </>
          )}
        {absence.id &&
          formType === 'validation' && (
            <AbsenceValidationForm absence={absence} updating={updating} onApprove={handleApprove} onReject={handleReject} />
          )}
      </div>
    </div>
  );
};

const mapStateToProps = ({
  authentication,
  application,
  absence,
  absenceBalance,
  absenceType,
  absenceValidator,
  absenceJustification
}: IRootState) => ({
  account: authentication.account,
  absenceType: absenceType.entity,
  absence: absence.entity,
  updating: absence.updating,
  loading: absence.loading,
  updateSuccess: absence.updateSuccess,
  validator: absenceValidator.entity,
  currentAbsenceValidator: application.absenceValidator.current,
  balances: absenceBalance.entities,
  justifications: absenceJustification.entities
});

const mapDispatchToProps = {
  approveAbsence: AbsenceExt.approve,
  rejectAbsence: AbsenceExt.reject,
  deleteAbsence: AbsenceExt.deleteAbsence,
  getAbsence: Absence.getEntity,
  getAbsenceType: AbsenceType.getEntity,
  getAbsenceValidator: AbsenceValidators.getEntity,
  getAbsenceJustifications: AbsenceJustificationExt.getByAbsenceId,
  getAbsenceBalancesByResource
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(AbsenceDetails);
