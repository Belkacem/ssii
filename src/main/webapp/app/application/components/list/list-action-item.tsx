import React, { FunctionComponent } from 'react';
import { Button } from 'antd';
import { IListActionProps } from 'app/application/components/list/list.component';

export interface IListActionItemProps extends IListActionProps {
  checkedList: any[];
  dataSource: any[];
  rowKey: string;
}

export const ListActionItem: FunctionComponent<IListActionItemProps> = props => {
  const { title, icon, loading, checkedList, dataSource, rowKey } = props;

  const checkedRows = dataSource.filter(record => checkedList.indexOf(record[rowKey]) !== -1);
  const isVisble = (!!props.visible && props.visible(checkedRows)) || !props.visible;

  const handleClick = () => {
    if (!!props.onClick) {
      props.onClick(checkedRows);
    }
  };

  return (
    isVisble && <Button type="link" icon={icon} onClick={handleClick} title={title} size="small" loading={loading} disabled={loading} />
  );
};
