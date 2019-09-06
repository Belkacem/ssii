import React, { FunctionComponent } from 'react';
import { Badge, Button, Dropdown, Icon, Menu } from 'antd';

export type ResourcesListStatus = 'ALL' | 'ACTIVE' | 'INACTIVE' | 'DRAFT';

interface IResourcesListStatusFilterProps {
  status: ResourcesListStatus;
  onChange: (key: ResourcesListStatus) => void;
}

export const ResourcesListStatusFilter: FunctionComponent<IResourcesListStatusFilterProps> = props => {
  const { status } = props;

  const handleOnChange = ({ key }) => props.onChange(key);

  const StatusFilterMenu = (
    <Menu mode="vertical" selectedKeys={[status]} onClick={handleOnChange}>
      <Menu.Item key="ALL">
        <small>Toutes les ressources</small>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="ACTIVE">
        <Icon theme="twoTone" twoToneColor="#52c41a" type="check-circle" />
        <small>Active</small>
      </Menu.Item>
      <Menu.Item key="INACTIVE">
        <Icon theme="twoTone" twoToneColor="#f5222d" type="stop" />
        <small>Inactive</small>
      </Menu.Item>
      <Menu.Item key="DRAFT">
        <Icon type="exclamation-circle" />
        <small>Brouillon</small>
      </Menu.Item>
    </Menu>
  );
  return (
    <Dropdown overlay={StatusFilterMenu} placement="bottomCenter">
      <Button className="ant-btn-icon-only" title="Filtrage">
        <Badge count={status !== 'ALL' ? 1 : 0} dot>
          <Icon type="filter" />
        </Badge>
      </Button>
    </Dropdown>
  );
};
