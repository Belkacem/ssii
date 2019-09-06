import React from 'react';
import { Divider, Progress } from 'antd';
import * as numeral from 'numeral';

interface IHttpRequestMetricsProps {
  requestMetrics: any;
  wholeNumberFormat: string;
  twoDigitAfterPointFormat: string;
}

export const HttpRequestMetrics: React.FunctionComponent<IHttpRequestMetricsProps> = props => {
  const { requestMetrics, wholeNumberFormat, twoDigitAfterPointFormat } = props;
  const filterNaN = input => (isNaN(input) ? 0 : input);
  const formatNumber = (value: number, format: string = wholeNumberFormat) => numeral(value).format(format);
  const formatPercent = (percent: number) => percent.toFixed(0) + '%';

  return (
    <>
      <Divider orientation="left" className="margin-bottom-8">
        HTTP requests (time in milliseconds)
      </Divider>
      <div className="padding-1rem margin-bottom-8">
        <p>
          <span>Total requests:</span> <b>{formatNumber(requestMetrics.all.count)}</b>
        </p>
        <div className="ant-table ant-table-small" style={{ overflow: 'auto', maxWidth: '100%' }}>
          <div className="ant-table-content">
            <div className="ant-table-body">
              <table>
                <thead className="ant-table-thead">
                  <tr>
                    <th style={{ width: 60 }}>Code</th>
                    <th>Count</th>
                    <th className="text-right">Mean</th>
                    <th className="text-right">Max</th>
                  </tr>
                </thead>
                <tbody className="ant-table-tbody">
                  {Object.keys(requestMetrics.percode).map((key, index) => (
                    <tr key={index}>
                      <td>{key}</td>
                      <td>
                        <Progress
                          percent={requestMetrics.percode[key].count}
                          strokeColor="green"
                          size="small"
                          format={formatPercent}
                          status="active"
                        />
                      </td>
                      <td>{formatNumber(filterNaN(requestMetrics.percode[key].mean), twoDigitAfterPointFormat)}</td>
                      <td>{formatNumber(filterNaN(requestMetrics.percode[key].max), twoDigitAfterPointFormat)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
