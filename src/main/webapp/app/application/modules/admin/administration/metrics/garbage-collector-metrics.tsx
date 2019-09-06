import * as React from 'react';
import { Col, Divider, Progress, Row } from 'antd';
import * as numeral from 'numeral';

export interface IGarbageCollectorMetricsProps {
  garbageCollectorMetrics: any;
  wholeNumberFormat: string;
}

export const GarbageCollectorMetrics: React.FunctionComponent<IGarbageCollectorMetricsProps> = props => {
  const { garbageCollectorMetrics, wholeNumberFormat } = props;
  const formatNumber = (value: number, format: string = wholeNumberFormat) => numeral(value).format(format);
  const formatPercent = (percent: number) => percent.toFixed(0) + '%';

  return (
    <>
      <Divider orientation="left" className="margin-bottom-8">
        Garbage Collection
      </Divider>
      <div className="padding-1rem margin-bottom-8">
        <Row gutter={32} className="margin-bottom-8">
          <Col md={8}>
            <>
              <small className="text-muted">GC Live Data Size/GC Max Data Size</small>
              <div>
                {formatNumber(garbageCollectorMetrics['jvm.gc.live.data.size'] / 1048576)}
                <small>
                  <b>M</b>
                </small>
                {' / '}
                {formatNumber(garbageCollectorMetrics['jvm.gc.max.data.size'] / 1048576)}
                <small>
                  <b>M</b>
                </small>
              </div>
            </>
            <Progress
              size="small"
              format={formatPercent}
              status="active"
              strokeColor="green"
              percent={(100 * garbageCollectorMetrics['jvm.gc.live.data.size']) / garbageCollectorMetrics['jvm.gc.max.data.size']}
            />
          </Col>
          <Col md={8}>
            <>
              <small className="text-muted">GC Memory Promoted/GC Memory Allocated</small>
              <div>
                {formatNumber(garbageCollectorMetrics['jvm.gc.memory.promoted'] / 1048576)}
                <small>
                  <b>M</b>
                </small>
                {' / '}
                {formatNumber(garbageCollectorMetrics['jvm.gc.memory.allocated'] / 1048576)}
                <small>
                  <b>M</b>
                </small>
              </div>
            </>
            <Progress
              size="small"
              format={formatPercent}
              status="active"
              strokeColor="green"
              percent={(100 * garbageCollectorMetrics['jvm.gc.memory.promoted']) / garbageCollectorMetrics['jvm.gc.memory.allocated']}
            />
          </Col>
          <Col md={8}>
            <Row>
              <Col md={18}>
                <small className="text-muted">Classes loaded</small>
              </Col>
              <Col md={6}>{garbageCollectorMetrics.classesLoaded}</Col>
            </Row>
            <Row>
              <Col md={18}>
                <small className="text-muted">Classes unloaded</small>
              </Col>
              <Col md={6}>{garbageCollectorMetrics.classesUnloaded}</Col>
            </Row>
          </Col>
        </Row>
        <div className="ant-table ant-table-small" style={{ overflow: 'auto', maxWidth: '100%' }}>
          <div className="ant-table-content">
            <div className="ant-table-body">
              <table>
                <thead className="ant-table-thead">
                  <tr>
                    <th />
                    <th className="text-right">
                      <small>Count</small>
                    </th>
                    <th className="text-right">
                      <small>Mean</small>
                    </th>
                    <th className="text-right">
                      <small>Min</small>
                    </th>
                    <th className="text-right">
                      <small>p50</small>
                    </th>
                    <th className="text-right">
                      <small>p75</small>
                    </th>
                    <th className="text-right">
                      <small>p95</small>
                    </th>
                    <th className="text-right">
                      <small>p99</small>
                    </th>
                    <th className="text-right">
                      <small>Max</small>
                    </th>
                  </tr>
                </thead>
                <tbody className="ant-table-tbody">
                  <tr>
                    <td>jvm.gc.pause</td>
                    <td className="text-right">{formatNumber(garbageCollectorMetrics.count)}</td>
                    <td className="text-right">{formatNumber(garbageCollectorMetrics.mean)}</td>
                    <td className="text-right">{formatNumber(garbageCollectorMetrics['0.0'])}</td>
                    <td className="text-right">{formatNumber(garbageCollectorMetrics['0.5'])}</td>
                    <td className="text-right">{formatNumber(garbageCollectorMetrics['0.75'])}</td>
                    <td className="text-right">{formatNumber(garbageCollectorMetrics['0.95'])}</td>
                    <td className="text-right">{formatNumber(garbageCollectorMetrics['0.99'])}</td>
                    <td className="text-right">{formatNumber(garbageCollectorMetrics.max)}</td>
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
