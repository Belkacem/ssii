import React, { FunctionComponent } from 'react';
import { Collapse, Card, Row } from 'antd';

interface IThreadItemProps {
  threadDumpInfo: any;
}

export const ThreadItem: FunctionComponent<IThreadItemProps> = props => {
  const { threadDumpInfo } = props;

  return (
    <div className="margin-bottom-8">
      <Collapse defaultActiveKey={[]}>
        <Collapse.Panel key={`panel_1`} header="StackTrace">
          <div style={{ overflowX: 'scroll' }}>
            {Object.entries(threadDumpInfo.stackTrace).map(([stK, stV]: [string, any]) => (
              <samp key={`detail-${stK}`}>
                {stV.className}.{stV.methodName}
                <code>
                  ({stV.fileName}:{stV.lineNumber})
                </code>
              </samp>
            ))}
            <div className="margin-bottom-8" />
          </div>
        </Collapse.Panel>
      </Collapse>
    </div>
  );
};
