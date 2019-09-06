import * as React from 'react';
import * as numeral from 'numeral';
import { Divider } from 'antd';

interface IDatasourceMetricsProps {
  datasourceMetrics: any;
  twoDigitAfterPointFormat: string;
}

export const DatasourceMetrics: React.FunctionComponent<IDatasourceMetricsProps> = props => {
  const { datasourceMetrics, twoDigitAfterPointFormat } = props;
  const formatNumber = (value: number, format: string = twoDigitAfterPointFormat) => numeral(value).format(format);

  return (
    <>
      <Divider orientation="left" className="margin-bottom-8">
        DataSource statistics (time in millisecond)
      </Divider>
      <div className="padding-1rem margin-bottom-8">
        <div className="ant-table ant-table-small" style={{ overflow: 'auto', maxWidth: '100%' }}>
          <div className="ant-table-content">
            <div className="ant-table-body">
              <table>
                <thead className="ant-table-thead">
                  <tr>
                    <th>
                      <small>
                        <span>Connection Pool Usage </span>
                        (active: {datasourceMetrics.active.value}, min: {datasourceMetrics.min.value}, max: {datasourceMetrics.max.value},
                        idle: {datasourceMetrics.idle.value})
                      </small>
                    </th>
                    <th>
                      <small>Count</small>
                    </th>
                    <th>
                      <small>Mean</small>
                    </th>
                    <th>
                      <small>Min</small>
                    </th>
                    <th>
                      <small>p50</small>
                    </th>
                    <th>
                      <small>p75</small>
                    </th>
                    <th>
                      <small>p95</small>
                    </th>
                    <th>
                      <small>p99</small>
                    </th>
                    <th>
                      <small>Max</small>
                    </th>
                  </tr>
                </thead>
                <tbody className="ant-table-tbody">
                  <tr>
                    <td>Acquire</td>
                    <td className="text-right">{datasourceMetrics.acquire.count}</td>
                    <td className="text-right">{formatNumber(datasourceMetrics.acquire.mean)}</td>
                    <td className="text-right">{formatNumber(datasourceMetrics.acquire['0.0'])}</td>
                    <td className="text-right">{formatNumber(datasourceMetrics.acquire['0.5'])}</td>
                    <td className="text-right">{formatNumber(datasourceMetrics.acquire['0.75'])}</td>
                    <td className="text-right">{formatNumber(datasourceMetrics.acquire['0.95'])}</td>
                    <td className="text-right">{formatNumber(datasourceMetrics.acquire['0.99'])}</td>
                    <td className="text-right">{formatNumber(datasourceMetrics.acquire.max)}</td>
                  </tr>
                  <tr>
                    <td>Creation</td>
                    <td className="text-right">{datasourceMetrics.creation.count}</td>
                    <td className="text-right">{formatNumber(datasourceMetrics.creation.mean)}</td>
                    <td className="text-right">{formatNumber(datasourceMetrics.creation['0.0'])}</td>
                    <td className="text-right">{formatNumber(datasourceMetrics.creation['0.5'])}</td>
                    <td className="text-right">{formatNumber(datasourceMetrics.creation['0.75'])}</td>
                    <td className="text-right">{formatNumber(datasourceMetrics.creation['0.95'])}</td>
                    <td className="text-right">{formatNumber(datasourceMetrics.creation['0.99'])}</td>
                    <td className="text-right">{formatNumber(datasourceMetrics.creation.max)}</td>
                  </tr>
                  <tr>
                    <td>Usage</td>
                    <td className="text-right">{datasourceMetrics.usage.count}</td>
                    <td className="text-right">{formatNumber(datasourceMetrics.usage.mean)}</td>
                    <td className="text-right">{formatNumber(datasourceMetrics.usage['0.0'])}</td>
                    <td className="text-right">{formatNumber(datasourceMetrics.usage['0.5'])}</td>
                    <td className="text-right">{formatNumber(datasourceMetrics.usage['0.75'])}</td>
                    <td className="text-right">{formatNumber(datasourceMetrics.usage['0.95'])}</td>
                    <td className="text-right">{formatNumber(datasourceMetrics.usage['0.99'])}</td>
                    <td className="text-right">{formatNumber(datasourceMetrics.usage.max)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
