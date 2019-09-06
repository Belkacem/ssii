import * as React from 'react';
import { Input, Modal, Tag } from 'antd';
import { ThreadItem } from './thread-item';

interface IThreadsModalProps {
  showModal: boolean;
  handleClose: Function;
  threadDump: any;
}

interface IThreadsModalState {
  badgeFilter: string;
  searchFilter: string;
}

export class ThreadsModal extends React.Component<IThreadsModalProps, IThreadsModalState> {
  state: IThreadsModalState = {
    badgeFilter: '',
    searchFilter: ''
  };

  computeFilteredList = () => {
    const { badgeFilter, searchFilter } = this.state;
    let filteredList = this.props.threadDump.threads;
    if (badgeFilter !== '') {
      filteredList = filteredList.filter(t => t.threadState === badgeFilter);
    }
    if (searchFilter !== '') {
      filteredList = filteredList.filter(t => t.lockName && t.lockName.toLowerCase().includes(searchFilter.toLowerCase()));
    }
    return filteredList;
  };

  computeCounters = () => {
    let threadDumpRunnable = 0;
    let threadDumpWaiting = 0;
    let threadDumpTimedWaiting = 0;
    let threadDumpBlocked = 0;

    this.props.threadDump.threads.forEach(t => {
      switch (t.threadState) {
        case 'RUNNABLE':
          threadDumpRunnable++;
          break;
        case 'WAITING':
          threadDumpWaiting++;
          break;
        case 'TIMED_WAITING':
          threadDumpTimedWaiting++;
          break;
        case 'BLOCKED':
          threadDumpBlocked++;
          break;
        default:
          break;
      }
    });

    const threadDumpAll = threadDumpRunnable + threadDumpWaiting + threadDumpTimedWaiting + threadDumpBlocked;
    return { threadDumpAll, threadDumpRunnable, threadDumpWaiting, threadDumpTimedWaiting, threadDumpBlocked };
  };

  getBadgeClass = threadState => {
    if (threadState === 'RUNNABLE') {
      return 'badge-success';
    } else if (threadState === 'WAITING') {
      return 'badge-info';
    } else if (threadState === 'TIMED_WAITING') {
      return 'badge-warning';
    } else if (threadState === 'BLOCKED') {
      return 'badge-danger';
    }
  };

  updateBadgeFilter = badge => () => this.setState({ badgeFilter: badge });

  updateSearchFilter = event => this.setState({ searchFilter: event.target.value });

  handleClose = () => this.props.handleClose();

  render() {
    const { showModal, threadDump } = this.props;
    let counters = {} as any;
    let filteredList = null;
    if (threadDump && threadDump.threads) {
      counters = this.computeCounters();
      filteredList = this.computeFilteredList();
    }

    return (
      <Modal visible={showModal} onCancel={this.handleClose} className="modal-lg" footer={false} title="Threads dump">
        <Tag color="blue" onClick={this.updateBadgeFilter('')}>
          All&nbsp;
          <small>{counters.threadDumpAll || 0}</small>
        </Tag>
        &nbsp;
        <Tag color="green" onClick={this.updateBadgeFilter('RUNNABLE')}>
          Runnable&nbsp;
          <small>{counters.threadDumpRunnable || 0}</small>
        </Tag>
        &nbsp;
        <Tag color="cyan" onClick={this.updateBadgeFilter('WAITING')}>
          Waiting&nbsp;
          <small>{counters.threadDumpWaiting || 0}</small>
        </Tag>
        &nbsp;
        <Tag color="orange" onClick={this.updateBadgeFilter('TIMED_WAITING')}>
          Timed Waiting&nbsp;
          <small>{counters.threadDumpTimedWaiting || 0}</small>
        </Tag>
        &nbsp;
        <Tag color="red" onClick={this.updateBadgeFilter('BLOCKED')}>
          Blocked&nbsp;
          <small>{counters.threadDumpBlocked || 0}</small>
        </Tag>
        &nbsp;
        <div className="mt-2">&nbsp;</div>
        <Input type="text" className="form-control" placeholder="Filter by Lock Name..." onChange={this.updateSearchFilter} />
        <div style={{ padding: '10px' }}>
          {filteredList
            ? filteredList.map((threadDumpInfo, i) => (
                <div key={`dump-${i}`}>
                  <h6>
                    {' '}
                    <span className={'badge ' + this.getBadgeClass(threadDumpInfo.threadState)}>{threadDumpInfo.threadState}</span>
                    &nbsp;
                    {threadDumpInfo.threadName} (ID {threadDumpInfo.threadId}
                    )&nbsp;
                  </h6>
                  <ThreadItem threadDumpInfo={threadDumpInfo} />
                  <div className="ant-table ant-table-small" style={{ overflow: 'auto', maxWidth: '100%' }}>
                    <div className="ant-table-content">
                      <div className="ant-table-body">
                        <table>
                          <thead className="ant-table-thead">
                            <tr>
                              <th>
                                <small>Blocked Time</small>
                              </th>
                              <th>
                                <small>Blocked Count</small>
                              </th>
                              <th>
                                <small>Waited Time</small>
                              </th>
                              <th>
                                <small>Waited Count</small>
                              </th>
                              <th>
                                <small>Lock Name</small>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="ant-table-tbody">
                            <tr key={threadDumpInfo.lockName}>
                              <td>{threadDumpInfo.blockedTime}</td>
                              <td>{threadDumpInfo.blockedCount}</td>
                              <td>{threadDumpInfo.waitedTime}</td>
                              <td>{threadDumpInfo.waitedCount}</td>
                              <td className="thread-dump-modal-lock" title={threadDumpInfo.lockName}>
                                <code>{threadDumpInfo.lockName}</code>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            : null}
        </div>
      </Modal>
    );
  }
}

export default ThreadsModal;
