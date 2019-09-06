import React, { FunctionComponent } from 'react';
import moment, { Moment } from 'moment';
import { FORMAT_DATE } from 'app/application/common/config/constants';

interface IDateFormatProps {
  value: string | Date | Moment;
  format?: string;
  blankOnInvalid?: boolean;
}

export const DateFormat: FunctionComponent<IDateFormatProps> = props => {
  const { value, format = FORMAT_DATE, blankOnInvalid = true } = props;
  if (blankOnInvalid && !value) {
    return null;
  }
  return <span className="date-format">{moment(value).format(format)}</span>;
};
