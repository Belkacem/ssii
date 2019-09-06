import React, { ChangeEvent, FunctionComponent, ReactNode } from 'react';
import { Input, Icon, Tooltip } from 'antd';

interface ISearchInputProps {
  placeholder?: string;
  helper?: string | ReactNode;
  onChange?: (ev: ChangeEvent<HTMLInputElement>) => void;
}

export const SearchInput: FunctionComponent<ISearchInputProps> = props => {
  const { placeholder = 'Recherche ...', helper, onChange } = props;
  if (!!helper) {
    return (
      <Tooltip trigger="focus" title={helper}>
        <Input prefix={<Icon type="search" />} placeholder={placeholder} onChange={onChange} allowClear className="z-list-search-bar" />
      </Tooltip>
    );
  }
  return <Input prefix={<Icon type="search" />} placeholder={placeholder} onChange={onChange} allowClear className="z-list-search-bar" />;
};
