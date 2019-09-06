import React from 'react';
import * as numeral from 'numeral';
import { Divider } from 'antd';

interface ICacheMetricsProps {
  cacheMetrics: any;
  twoDigitAfterPointFormat: string;
}

export const CacheMetrics: React.FunctionComponent<ICacheMetricsProps> = props => {
  const { cacheMetrics, twoDigitAfterPointFormat } = props;
  const filterNaN = input => (isNaN(input) ? 0 : input);
  const formatNumber = (value: number, format: string = twoDigitAfterPointFormat) => numeral(value).format(format);

  return (
    <>
      <Divider orientation="left" className="margin-bottom-8">
        Ehcache statistics
      </Divider>
      <div className="padding-1rem margin-bottom-8">
        <div className="ant-table ant-table-small" style={{ overflow: 'auto', maxWidth: '100%' }}>
          <div className="ant-table-content">
            <div className="ant-table-body">
              <table>
                <thead className="ant-table-thead">
                  <tr>
                    <th>
                      <small>Cache Name</small>
                    </th>
                    <th>
                      <small>Cache Hits</small>
                    </th>
                    <th>
                      <small>Cache Misses</small>
                    </th>
                    <th>
                      <small>Cache Gets</small>
                    </th>
                    <th>
                      <small>Cache Hit %</small>
                    </th>
                    <th>
                      <small>Cache Miss %</small>
                    </th>
                  </tr>
                </thead>
                <tbody className="ant-table-tbody">
                  {Object.keys(cacheMetrics).map(key => (
                    <tr key={key}>
                      <td>{key}</td>
                      <td>{cacheMetrics[key]['cache.gets.hit']}</td>
                      <td>{cacheMetrics[key]['cache.gets.miss']}</td>
                      <td>{cacheMetrics[key]['cache.gets.miss'] + cacheMetrics[key]['cache.gets.hit']}</td>
                      <td>
                        {formatNumber(
                          filterNaN(
                            (100 * cacheMetrics[key]['cache.gets.hit']) /
                              (cacheMetrics[key]['cache.gets.hit'] + cacheMetrics[key]['cache.gets.miss'])
                          )
                        )}
                      </td>
                      <td>
                        {formatNumber(
                          filterNaN(
                            (100 * cacheMetrics[key]['cache.gets.miss']) /
                              (cacheMetrics[key]['cache.gets.hit'] + cacheMetrics[key]['cache.gets.miss'])
                          )
                        )}
                      </td>
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
