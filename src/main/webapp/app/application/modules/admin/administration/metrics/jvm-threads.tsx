import React from 'react';
import { Button, Progress } from 'antd';
import ThreadsModal from './threads-modal';

interface IJvmThreadsProps {
  jvmThreads: any;
  wholeNumberFormat: string;
}

interface IJvmThreadsState {
  showModal: boolean;
  threadStats: {
    threadDumpAll: number;
    threadDumpRunnable: number;
    threadDumpTimedWaiting: number;
    threadDumpWaiting: number;
    threadDumpBlocked: number;
  };
}

export class JvmThreads extends React.Component<IJvmThreadsProps, IJvmThreadsState> {
  state: IJvmThreadsState = {
    showModal: false,
    threadStats: {
      threadDumpAll: 0,
      threadDumpRunnable: 0,
      threadDumpTimedWaiting: 0,
      threadDumpWaiting: 0,
      threadDumpBlocked: 0
    }
  };

  countThreadByState() {
    if (this.props.jvmThreads.threads) {
      this.state.threadStats = {
        threadDumpAll: 0,
        threadDumpRunnable: 0,
        threadDumpTimedWaiting: 0,
        threadDumpWaiting: 0,
        threadDumpBlocked: 0
      };

      this.props.jvmThreads.threads.forEach(thread => {
        if (thread.threadState === 'RUNNABLE') {
          this.state.threadStats.threadDumpRunnable += 1;
        } else if (thread.threadState === 'WAITING') {
          this.state.threadStats.threadDumpWaiting += 1;
        } else if (thread.threadState === 'TIMED_WAITING') {
          this.state.threadStats.threadDumpTimedWaiting += 1;
        } else if (thread.threadState === 'BLOCKED') {
          this.state.threadStats.threadDumpBlocked += 1;
        }
      });

      this.state.threadStats.threadDumpAll =
        this.state.threadStats.threadDumpRunnable +
        this.state.threadStats.threadDumpWaiting +
        this.state.threadStats.threadDumpTimedWaiting +
        this.state.threadStats.threadDumpBlocked;
    }
  }

  componentDidMount() {
    if (this.props.jvmThreads.threads) {
      this.countThreadByState();
    }
  }

  componentDidUpdate() {
    if (this.props.jvmThreads.threads) {
      this.countThreadByState();
    }
  }

  openModal = () => {
    this.setState({
      showModal: true
    });
  };

  handleClose = () => {
    this.setState({
      showModal: false
    });
  };

  formatPercent = (percent: number) => percent.toFixed(0) + '%';

  renderModal = () => <ThreadsModal handleClose={this.handleClose} showModal={this.state.showModal} threadDump={this.props.jvmThreads} />;

  render() {
    const { threadStats } = this.state;
    return (
      <div className="padding-1rem">
        <div className="margin-bottom-8">
          <b>Threads</b>
          <small>(Total: {threadStats.threadDumpAll})</small>
        </div>
        <div className="margin-bottom-8">
          <small className="text-muted">Runnable</small>
          {threadStats.threadDumpRunnable}
          <Progress
            percent={(threadStats.threadDumpAll * 100) / threadStats.threadDumpAll}
            format={this.formatPercent}
            strokeColor="green"
            status="active"
          />
        </div>
        <div className="margin-bottom-8">
          <small className="text-muted">Timed Waiting</small>({threadStats.threadDumpTimedWaiting})
          <Progress
            percent={(threadStats.threadDumpTimedWaiting * 100) / threadStats.threadDumpAll}
            format={this.formatPercent}
            strokeColor="orange"
            status="active"
          />
        </div>
        <div className="margin-bottom-8">
          <small className="text-muted">Waiting</small>({threadStats.threadDumpWaiting})
          <Progress
            percent={(threadStats.threadDumpWaiting * 100) / threadStats.threadDumpAll}
            format={this.formatPercent}
            strokeColor="orange"
            status="active"
          />
        </div>
        <div className="margin-bottom-8">
          <small className="text-muted">Blocked</small>({threadStats.threadDumpBlocked})
          <Progress
            percent={(threadStats.threadDumpBlocked * 100) / threadStats.threadDumpAll}
            format={this.formatPercent}
            strokeColor="green"
            status="active"
          />
        </div>
        {this.renderModal()}
        <Button color="primary" size="small" className="hand" onClick={this.openModal}>
          Expand
        </Button>
      </div>
    );
  }
}
