import React, { ChangeEvent, FunctionComponent, useEffect, useState } from 'react';
import { Form, Icon, Input, Popover } from 'antd';
import { getFieldLayout, getHelper, getValidateStatus, ICommonFieldProps, isRequired } from 'app/application/common/utils/form-utils';
import { connect } from 'formik';

interface IPasswordFieldPropsType extends ICommonFieldProps {
  autoFocus?: boolean;
  onChange?: (value: string) => void;
  placeholder?: string;
  strengthBar?: boolean;
  size?: 'small' | 'default' | 'large';
  autoComplete?: 'on' | 'off' | 'current-password' | 'new-password';
}

export const hasUpperLowerCases = (value: string) => /[a-z]+/.test(value) && /[A-Z]+/.test(value);

export const hasNumber = (value: string) => /[0-9]+/.test(value);

export const hasSymbole = (value: string) => /[$-/@&:-?{-~!"^_`\[\]]/g.test(value);

export const hasMinLength = (value: string) => value.length >= 8;

const PasswordStrengthBar = ({ password }: { password: string }) => {
  const colors = ['#F00', '#F90', '#FF0', '#9F0', '#0F0'];

  const measureStrength = (p: string): number => {
    let force = 0;
    const regex = /[$-/:-?{-~!"^_`\[\]]/g;
    const flags = {
      lowerLetters: /[a-z]+/.test(p),
      upperLetters: /[A-Z]+/.test(p),
      numbers: /[0-9]+/.test(p),
      symbols: regex.test(p)
    };

    const passedMatches = Object.values(flags).filter((isMatchedFlag: boolean) => isMatchedFlag).length;

    force += 2 * p.length + (p.length >= 10 ? 1 : 0);
    force += passedMatches * 10;

    // penalty (short password)
    force = p.length <= 6 ? Math.min(force, 10) : force;

    // penalty (poor variety of characters)
    force = passedMatches === 1 ? Math.min(force, 10) : force;
    force = passedMatches === 2 ? Math.min(force, 20) : force;
    force = passedMatches === 3 ? Math.min(force, 40) : force;

    return force;
  };

  const getColor = (s: number): any => {
    let idx = 0;
    if (s <= 10) {
      idx = 0;
    } else if (s <= 20) {
      idx = 1;
    } else if (s <= 30) {
      idx = 2;
    } else if (s <= 40) {
      idx = 3;
    } else {
      idx = 4;
    }
    return { idx: idx + 1, col: colors[idx] };
  };

  const getPoints = force => {
    const pts = [];
    for (let i = 0; i < 5; i++) {
      pts.push(<li key={i} className="point" style={i < force.idx ? { backgroundColor: force.col } : { backgroundColor: '#DDD' }} />);
    }
    return pts;
  };

  const strength = getColor(measureStrength(password));
  const points = getPoints(strength);

  return (
    <div className="strength">
      <ul className="strengthBar">{points}</ul>
    </div>
  );
};

export const PasswordField: FunctionComponent<IPasswordFieldPropsType> = props => {
  const {
    name = 'password',
    label,
    autoFocus = false,
    formik,
    placeholder,
    strengthBar = false,
    size = 'default',
    autoComplete = 'off'
  } = props;

  const formItemLayout = getFieldLayout(props.layout);
  const required = isRequired(formik, name);
  const validateStatus = getValidateStatus(props.loading, name, formik);
  const helper = getHelper(props.helper, name, formik);
  const defaultValue = formik.initialValues[name] || '';
  const [password, setPassword] = useState(defaultValue);

  const handleChangeEvent = (e: ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value);
  };

  const handleBlurEvent = (): void => {
    formik.setFieldTouched(name);
  };

  useEffect(
    () => {
      if (props.onChange) {
        props.onChange(password);
      } else {
        formik.setFieldValue(name, password);
      }
    },
    [password]
  );

  const strengthRules = (
    <div className="popup-strength-rules">
      <p>Pour la force du mot de passe, vous devez avoir:</p>
      <div className={hasMinLength(password) ? 'is-passed' : 'not-passed'}>
        <Icon type="check-circle" /> 8 lettres ou plus
      </div>
      <div className={hasUpperLowerCases(password) ? 'is-passed' : 'not-passed'}>
        <Icon type="check-circle" /> Lettres majuscules et minuscules
      </div>
      <div className={hasNumber(password) ? 'is-passed' : 'not-passed'}>
        <Icon type="check-circle" /> Au moins un numéro
      </div>
      <div className={hasSymbole(password) ? 'is-passed' : 'not-passed'}>
        <Icon type="check-circle" /> Au moins un caractère spéciaux
      </div>
      <p />
      Fiabilité du mot de passe:
      <PasswordStrengthBar password={password} />
    </div>
  );

  const inputPassword = (
    <Input.Password
      name={name}
      id={name}
      defaultValue={defaultValue}
      value={password}
      placeholder={placeholder}
      autoFocus={autoFocus}
      onChange={handleChangeEvent}
      onBlur={handleBlurEvent}
      prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
      size={size}
      autoComplete={autoComplete}
    />
  );

  return (
    <Form.Item
      label={label}
      required={required}
      {...formItemLayout}
      validateStatus={validateStatus}
      help={helper}
      hasFeedback
      htmlFor={name}
    >
      {strengthBar ? <Popover content={strengthRules} placement="bottom" trigger="focus" children={inputPassword} /> : inputPassword}
    </Form.Item>
  );
};

export default connect(PasswordField);
