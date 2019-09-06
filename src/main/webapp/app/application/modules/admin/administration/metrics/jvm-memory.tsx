import React, { FunctionComponent } from 'react';
import { Progress } from 'antd';
import * as numeral from 'numeral';

interface IJvmMemoryProps {
  jvmMetrics: any;
  wholeNumberFormat: string;
}

export const JvmMemory: FunctionComponent<IJvmMemoryProps> = props => {
  const { jvmMetrics, wholeNumberFormat } = props;

  const formatNumber = (value: number, format: string = wholeNumberFormat) => numeral(value).format(format);
  const formatPercent = (percent: number) => percent.toFixed(0) + '%';
  return (
    <div className="padding-1rem">
      <div className="margin-bottom-8">
        <b>Memory</b>
      </div>
      {Object.keys(jvmMetrics).map(key => (
        <div key={key} className="margin-bottom-8">
          {jvmMetrics[key].max !== -1 ? (
            <>
              <small className="text-muted">{key}</small>
              {' : '}
              {formatNumber(jvmMetrics[key].used / 1048576)}
              <small>
                <b>M</b>
              </small>
              {' / '}
              {formatNumber(jvmMetrics[key].max / 1048576)}
              <small>
                <b>M</b>
              </small>
            </>
          ) : (
            <>
              <small className="text-muted">{key}</small>
              {' : '}
              {formatNumber(jvmMetrics[key].used / 1048576)}
              <small>
                <b>M</b>
              </small>
            </>
          )}
          <div>
            <small className="text-muted">Committed</small>
            {' : '}
            {formatNumber(jvmMetrics[key].committed / 1048576)}
            <small>
              <b>M</b>
            </small>
          </div>
          {jvmMetrics[key].max !== -1 && (
            <Progress
              percent={(jvmMetrics[key].used * 100) / jvmMetrics[key].max}
              showInfo
              strokeColor="green"
              size="small"
              format={formatPercent}
              status="active"
            />
          )}
        </div>
      ))}
    </div>
  );
};
