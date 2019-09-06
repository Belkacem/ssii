import React from 'react';
import * as numeral from 'numeral';
import { Divider } from 'antd';

interface IEndpointsRequestsMetricsProps {
  endpointsRequestsMetrics: any;
  wholeNumberFormat: string;
}

export const EndpointsRequestsMetrics: React.FunctionComponent<IEndpointsRequestsMetricsProps> = props => {
  const { endpointsRequestsMetrics, wholeNumberFormat } = props;
  const formatNumber = (value: number, format: string = wholeNumberFormat) => numeral(value).format(format);

  return (
    <>
      <Divider orientation="left" className="margin-bottom-8">
        Endpoints requests (time in milliseconds)
      </Divider>
      <div className="padding-1rem margin-bottom-8">
        <div className="ant-table ant-table-small" style={{ overflow: 'auto', maxWidth: '100%' }}>
          <div className="ant-table-content">
            <div className="ant-table-body">
              <table>
                <thead className="ant-table-thead">
                  <tr>
                    <th>
                      <small>Method</small>
                    </th>
                    <th>
                      <small>Endpoint url</small>
                    </th>
                    <th>
                      <small>Count</small>
                    </th>
                    <th>
                      <small>Mean</small>
                    </th>
                  </tr>
                </thead>
                <tbody className="ant-table-tbody">
                  {Object.entries(endpointsRequestsMetrics).map(([key, entry]) =>
                    Object.entries(entry).map(([method, methodValue]) => (
                      <tr key={key + '-' + method}>
                        <td>{method}</td>
                        <td>{key}</td>
                        <td>{methodValue.count}</td>
                        <td>{formatNumber(methodValue.mean)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
