import React from 'react';
import { connect } from 'react-redux';
import { Icon, Input, Tag } from 'antd';
import { PageHead } from 'app/application/common/layout/page-head/page-head';

import { changeLogLevel, getLoggers } from 'app/modules/administration/administration.reducer';
import { IRootState } from 'app/shared/reducers';

export interface ILogsPageProps extends StateProps, DispatchProps {}

export interface ILogsPageState {
  filter: string;
}

export class LogsPage extends React.Component<ILogsPageProps, ILogsPageState> {
  state: ILogsPageState = {
    filter: ''
  };

  componentDidMount() {
    this.props.getLoggers();
  }

  changeLevel = (loggerName, level) => () => {
    if (!this.props.isFetching) {
      this.props.changeLogLevel(loggerName, level);
    }
  };

  setFilter = evt => {
    this.setState({
      filter: evt.target.value
    });
  };

  getClassName = (level, check, className) => (level === check ? className : undefined);

  filterFn = l => l.name.toUpperCase().includes(this.state.filter.toUpperCase());

  render() {
    const { logs, isFetching } = this.props;
    const { filter } = this.state;
    const loggers = logs ? logs.loggers : [];
    return (
      <div className="table-layout-page">
        <div className="table-layout-head">
          <PageHead
            title="Logs"
            actions={
              <small>
                There are <b>{loggers.length.toString()}</b> loggers.
              </small>
            }
          />
          <div className="padding-1rem margin-bottom-8">
            <Input
              type="text"
              suffix={<Icon type="filter" />}
              placeholder="Filter"
              value={filter}
              onChange={this.setFilter}
              className="form-control"
              disabled={isFetching}
            />
          </div>
        </div>
        <div className="table-layout-body">
          <div className="ant-table-wrapper">
            <div className="ant-table ant-table-medium">
              <div className="ant-table-content">
                <div className="ant-table-body">
                  <table className="table table-sm table-striped table-bordered">
                    <thead className="ant-table-thead">
                      <tr title="click to order">
                        <th>
                          <small>Name</small>
                        </th>
                        <th>
                          <small>Level</small>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="ant-table-tbody">
                      {loggers.filter(this.filterFn).map((logger, i) => (
                        <tr key={`log-row-${i}`}>
                          <td style={{ maxWidth: 400, overflow: 'auto' }}>
                            <small>{logger.name}</small>
                          </td>
                          <td style={{ opacity: isFetching ? 0.5 : 1 }}>
                            <Tag onClick={this.changeLevel(logger.name, 'TRACE')} color={this.getClassName(logger.level, 'TRACE', 'blue')}>
                              TRACE
                            </Tag>
                            <Tag onClick={this.changeLevel(logger.name, 'DEBUG')} color={this.getClassName(logger.level, 'DEBUG', 'green')}>
                              DEBUG
                            </Tag>
                            <Tag onClick={this.changeLevel(logger.name, 'INFO')} color={this.getClassName(logger.level, 'INFO', 'cyan')}>
                              INFO
                            </Tag>
                            <Tag onClick={this.changeLevel(logger.name, 'WARN')} color={this.getClassName(logger.level, 'WARN', 'orange')}>
                              WARN
                            </Tag>
                            <Tag onClick={this.changeLevel(logger.name, 'ERROR')} color={this.getClassName(logger.level, 'ERROR', 'red')}>
                              ERROR
                            </Tag>
                            <Tag onClick={this.changeLevel(logger.name, 'OFF')} color={this.getClassName(logger.level, 'OFF', 'gray')}>
                              OFF
                            </Tag>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ administration }: IRootState) => ({
  logs: administration.logs,
  isFetching: administration.loading
});

const mapDispatchToProps = { getLoggers, changeLogLevel };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LogsPage);
