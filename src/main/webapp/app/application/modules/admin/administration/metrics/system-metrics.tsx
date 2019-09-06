import React, { FunctionComponent } from 'react';
import { Col, Progress, Row } from 'antd';
import * as numeral from 'numeral';
import moment from 'moment';

interface ISystemMetricsProps {
  systemMetrics: any;
  wholeNumberFormat: string;
  timestampFormat: string;
}

export const SystemMetrics: FunctionComponent<ISystemMetricsProps> = props => {
  const { systemMetrics, wholeNumberFormat, timestampFormat } = props;
  const convertMillisecondsToDuration = ms => {
    const times = {
      year: 31557600000,
      month: 2629746000,
      day: 86400000,
      hour: 3600000,
      minute: 60000,
      second: 1000
    };
    let time_string = '';
    let plural = '';
    for (const key in times) {
      if (Math.floor(ms / times[key]) > 0) {
        plural = Math.floor(ms / times[key]) > 1 ? 's' : '';
        time_string += Math.floor(ms / times[key]).toString() + ' ' + key.toString() + plural + ' ';
        ms = ms - times[key] * Math.floor(ms / times[key]);
      }
    }
    return time_string;
  };

  const formatNumber = (value: number, format: string = wholeNumberFormat) => numeral(value).format(format);
  const formatTime = (value: number, format: string = timestampFormat) => moment(value).format(format);
  const formatPercent = (percent: number) => percent.toFixed(0) + '%';
  return (
    <div className="padding-1rem">
      <div className="margin-bottom-8">
        <b>System</b>
      </div>
      <Row className="margin-bottom-8">
        <Col md={8}>
          <small className="text-muted">Uptime</small>
        </Col>
        <Col md={16} className="text-right">
          {convertMillisecondsToDuration(systemMetrics['process.uptime'])}
        </Col>
      </Row>
      <Row className="margin-bottom-8">
        <Col md={8}>
          <small className="text-muted">Start time</small>
        </Col>
        <Col md={16} className="text-right">
          {formatTime(systemMetrics['process.start.time'])}
        </Col>
      </Row>
      <Row className="margin-bottom-8">
        <Col md={18}>
          <small className="text-muted">Process CPU usage</small>
        </Col>
        <Col md={6} className="text-right">
          {formatNumber(100 * systemMetrics['process.cpu.usage'])} %
        </Col>
        <Progress
          percent={100 * systemMetrics['process.cpu.usage']}
          strokeColor="green"
          size="small"
          format={formatPercent}
          status="active"
        />
      </Row>
      <Row className="margin-bottom-8">
        <Col md={18}>
          <small className="text-muted">System CPU usage</small>
        </Col>
        <Col md={6} className="text-right">
          {formatNumber(100 * systemMetrics['system.cpu.usage'])} %
        </Col>
        <Progress
          percent={100 * systemMetrics['system.cpu.usage']}
          strokeColor="green"
          size="small"
          format={formatPercent}
          status="active"
        />
      </Row>
      <Row className="margin-bottom-8">
        <Col md={18}>
          <small className="text-muted">System CPU count</small>
        </Col>
        <Col md={6} className="text-right">
          {systemMetrics['system.cpu.count']}
        </Col>
      </Row>
      <Row className="margin-bottom-8">
        <Col md={18}>
          <small className="text-muted">System 1m Load average</small>
        </Col>
        <Col md={6} className="text-right">
          {formatNumber(systemMetrics['system.load.average.1m'])}
        </Col>
      </Row>
      <Row className="margin-bottom-8">
        <Col md={14}>
          <small className="text-muted">Process files max</small>
        </Col>
        <Col md={10} className="text-right">
          {formatNumber(systemMetrics['process.files.max'])}
        </Col>
      </Row>
      <Row className="margin-bottom-8">
        <Col md={8}>
          <small className="text-muted">Process files open</small>
        </Col>
        <Col md={16} className="text-right">
          {formatNumber(systemMetrics['process.files.open'])}
        </Col>
      </Row>
    </div>
  );
};
