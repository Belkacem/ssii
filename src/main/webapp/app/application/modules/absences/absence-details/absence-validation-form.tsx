import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { Form, Formik } from 'formik';
import { Button, Divider } from 'antd';
import * as Yup from 'yup';
import { IAbsence } from 'app/shared/model/absence.model';
import TextAreaField from 'app/application/components/zsoft-form/generic-fields/textAreaField.component';

interface IAbsenceValidationFormProps {
  absence: IAbsence;
  onApprove: (absence: IAbsence) => void;
  onReject: (absence: IAbsence) => void;
  updating: boolean;
}

const validationSchema = Yup.object().shape({
  validationComment: Yup.string().label('Commentaire')
});

export const AbsenceValidationForm: FunctionComponent<IAbsenceValidationFormProps> = props => {
  const formikRef = useRef<Formik>();
  const [submitType, setSubmitType] = useState(null);
  const { absence, updating } = props;

  useEffect(
    () => {
      if (!!submitType) {
        formikRef.current.submitForm();
      }
    },
    [submitType]
  );

  const handleSave = values => {
    const payload = {
      ...absence,
      ...values
    };
    if (submitType === 'approve') {
      props.onApprove(payload);
    } else {
      props.onReject(payload);
    }
  };

  const handleApprove = () => {
    setSubmitType('approve');
  };

  const handleReject = () => {
    setSubmitType('reject');
  };

  return (
    <Formik ref={formikRef} initialValues={{}} enableReinitialize validationSchema={validationSchema} onSubmit={handleSave}>
      <Form>
        <Divider orientation="left" style={{ margin: '2rem 0 0.5rem 0' }}>
          Souhaitez-vous valider l'absence ?
        </Divider>
        <div style={{ padding: '0 1rem' }}>
          <TextAreaField name="validationComment" placeholder="laisser un commentaire ..." />
          <div style={{ textAlign: 'center', marginTop: '-16px' }}>
            <Button key="reject" icon="close" onClick={handleReject} type="danger" loading={updating} children="Refuser" />{' '}
            <Button key="approve" icon="check" onClick={handleApprove} type="primary" loading={updating} children="Accepter" />
          </div>
        </div>
      </Form>
    </Formik>
  );
};
