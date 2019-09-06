import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { Button, Col, Row, Divider } from 'antd';
import { PageHead } from 'app/application/common/layout/page-head/page-head';

import { APP_TIMESTAMP_FORMAT, APP_TWO_DIGITS_AFTER_POINT_NUMBER_FORMAT, APP_WHOLE_NUMBER_FORMAT } from 'app/config/constants';
import { systemMetrics, systemThreadDump } from 'app/modules/administration/administration.reducer';
import { IRootState } from 'app/shared/reducers';
import { JvmMemory } from './jvm-memory';
import { JvmThreads } from './jvm-threads';
import { SystemMetrics } from './system-metrics';
import { GarbageCollectorMetrics } from './garbage-collector-metrics';
import { HttpRequestMetrics } from './http-request-metrics';
import { EndpointsRequestsMetrics } from './endpoints-requests-metrics';
import { CacheMetrics } from './cache-metrics';
import { DatasourceMetrics } from './datasource-metrics';

interface IMetricsPageProps extends StateProps, DispatchProps {}

export const MetricsPage: FunctionComponent<IMetricsPageProps> = props => {
  useEffect(() => {
    props.systemMetrics();
    props.systemThreadDump();
  }, []);

  const getMetrics = () => {
    if (!props.isFetching) {
      props.systemMetrics();
      props.systemThreadDump();
    }
  };

  const { metrics, threadDump, isFetching } = props;
  return (
    <div>
      <PageHead
        title="Métriques d'application"
        margin={false}
        actions={
          <>
            <Button
              onClick={getMetrics}
              type={isFetching ? 'danger' : 'default'}
              disabled={isFetching}
              icon="reload"
              className="ant-btn-textual"
              children="Actualiser"
            />
          </>
        }
      />

      <Divider orientation="left" className="margin-bottom-8">
        JVM Metrics
      </Divider>
      <Row gutter={32} className="margin-bottom-8">
        <Col md={8} className="margin-bottom-8">
          {metrics && metrics.jvm ? <JvmMemory jvmMetrics={metrics.jvm} wholeNumberFormat={APP_WHOLE_NUMBER_FORMAT} /> : ''}
        </Col>
        <Col md={8} className="margin-bottom-8">
          {threadDump ? <JvmThreads jvmThreads={threadDump} wholeNumberFormat={APP_WHOLE_NUMBER_FORMAT} /> : ''}
        </Col>
        <Col md={8} className="margin-bottom-8">
          {metrics &&
            metrics.processMetrics && (
              <SystemMetrics
                systemMetrics={metrics.processMetrics}
                wholeNumberFormat={APP_WHOLE_NUMBER_FORMAT}
                timestampFormat={APP_TIMESTAMP_FORMAT}
              />
            )}
        </Col>
      </Row>

      {metrics &&
        metrics.garbageCollector && (
          <GarbageCollectorMetrics garbageCollectorMetrics={metrics.garbageCollector} wholeNumberFormat={APP_WHOLE_NUMBER_FORMAT} />
        )}
      {metrics &&
        metrics['http.server.requests'] && (
          <HttpRequestMetrics
            requestMetrics={metrics['http.server.requests']}
            twoDigitAfterPointFormat={APP_TWO_DIGITS_AFTER_POINT_NUMBER_FORMAT}
            wholeNumberFormat={APP_WHOLE_NUMBER_FORMAT}
          />
        )}
      {metrics &&
        metrics.endpointsRequests && (
          <EndpointsRequestsMetrics endpointsRequestsMetrics={metrics.endpointsRequests} wholeNumberFormat={APP_WHOLE_NUMBER_FORMAT} />
        )}

      {metrics.cache && <CacheMetrics cacheMetrics={metrics.cache} twoDigitAfterPointFormat={APP_TWO_DIGITS_AFTER_POINT_NUMBER_FORMAT} />}

      {metrics.databases &&
        JSON.stringify(metrics.databases) !== '{}' && (
          <DatasourceMetrics datasourceMetrics={metrics.databases} twoDigitAfterPointFormat={APP_TWO_DIGITS_AFTER_POINT_NUMBER_FORMAT} />
        )}
    </div>
  );
};

const mapStateToProps = (storeState: IRootState) => ({
  metrics: storeState.administration.metrics,
  isFetching: storeState.administration.loading,
  threadDump: storeState.administration.threadDump
});

const mapDispatchToProps = { systemMetrics, systemThreadDump };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(MetricsPage);
