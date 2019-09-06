import React, { Component, ReactNode } from 'react';
import { Button, Checkbox, Menu, Skeleton, Spin } from 'antd';
import './list.scss';
import { debounce, differenceBy, intersectionBy, union, unionBy, pull } from 'lodash';
import InfiniteScroll from 'react-infinite-scroller';
import { SearchInput } from './list-searchInput.component';
import { ListActionItem } from 'app/application/components/list/list-action-item';

export interface IListGroupProps {
  title: string | ReactNode;
  filter: Function;
}

export interface IListActionProps {
  icon?: string;
  title?: string;
  loading?: boolean;
  onClick?: (items: any[]) => void;
  visible?: (items: any[]) => boolean;
}

interface IListProps {
  rowKey?: string;
  dataSource?: any[];
  totalItems?: number;
  placeholder?: string;
  searchHelper?: string | ReactNode;
  selectedItem?: string;
  renderItem?: Function;
  onFilter?: Function;
  onClick?: Function;
  fetchData?: Function;
  groups?: IListGroupProps[];
  sort?: string;
  order?: string;
  perPage?: number;
  header?: ReactNode;
  hasSelectedItem?: boolean;
  loading?: boolean;

  selectable?: boolean;
  actions?: IListActionProps[];
  onSelect?: (selected_items: any[]) => void;
}

interface IListStates {
  data: any[];
  sort: string;
  order: string;
  activePage: number;
  perPage: number;
  hasMore: boolean;
  loading: boolean;
  initLoading: boolean;
  isMobile: boolean;
  searchText: string;
  checkedList: any[];
  indeterminate: boolean;
  checkAll: boolean;
}

class ListComponent extends Component<IListProps, IListStates> {
  mql: MediaQueryList;

  constructor(props) {
    super(props);
    this.state = {
      activePage: 1,
      sort: props.sort ? props.sort : 'id',
      order: props.order ? props.order : 'desc',
      perPage: props.perPage ? props.perPage : 15,
      hasMore: true,
      loading: false,
      initLoading: true,
      data: props.dataSource ? props.dataSource : [],
      searchText: '',
      isMobile: false,
      checkedList: [],
      indeterminate: false,
      checkAll: false
    };
    this.onSearch = debounce(this.onSearch, 200);
    this.handleSelectItem = debounce(this.handleSelectItem, 200);
    this.handleLoadMore = debounce(this.handleLoadMore, 200);
  }

  componentDidMount() {
    this.fetchData();
    this.mql = window.matchMedia('(min-width: 768px)');
    this.mql.addListener(this.mqlListener);
    this.mqlListener(this.mql);
  }

  componentWillUnmount() {
    this.mql.removeListener(this.mqlListener);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.loading !== this.props.loading && !this.props.loading) {
      this.setState({ loading: false });
    } else if (prevState === this.state) {
      if (!this.state.initLoading && this.state.hasMore && !this.props.loading && this.getVisibleData().length < this.state.perPage) {
        this.handleLoadMore();
      }
    }
  }

  mqlListener = ev => {
    if (ev.matches) {
      this.setState({ isMobile: false, initLoading: false });
    } else {
      this.setState({ isMobile: true, initLoading: false });
    }
  };

  pushData = data => {
    this.setState(
      (state, props) => {
        const { rowKey = 'key' } = this.props;
        let newData = [];
        if (state.activePage === 1) {
          newData = data;
        } else {
          const intersection = intersectionBy(data, state.data, rowKey);
          newData = unionBy(intersection, state.data, rowKey);
          const difference = differenceBy(data, intersection, rowKey);
          newData = union(newData, difference);
        }
        return {
          hasMore: newData.length < props.totalItems,
          data: newData,
          loading: false
        };
      },
      () => this.selectFirst()
    );
  };

  clearData = () => {
    this.setState({ data: [], loading: false, hasMore: false });
  };

  selectFirst = () => {
    const { isMobile, checkedList } = this.state;
    const { rowKey = 'key', hasSelectedItem, selectedItem } = this.props;
    const filteredData = this.props.onFilter ? this.props.onFilter(this.state.data) : this.state.data;
    const itemExist = hasSelectedItem && filteredData.some(record => `${record[rowKey]}` === selectedItem);
    if (filteredData.length > 0 && !isMobile && (!hasSelectedItem || !itemExist) && checkedList.length === 0) {
      this.handleSelectItem(filteredData[0], 0);
    }
  };

  reload = () => {
    this.setState({ activePage: 1 }, () => {
      this.fetchData();
    });
  };

  setPage = activePage => {
    this.setState({ activePage, loading: true }, () => this.fetchData());
  };

  fetchData = () => {
    const { activePage, perPage, sort, order } = this.state;
    this.setState({ loading: true }, () => {
      this.props.fetchData(activePage, perPage, sort, order, '');
    });
  };

  getVisibleData = () => {
    const { searchText, data } = this.state;
    return this.handleFilterData(data, searchText);
  };

  handleClickMenuItem = selectParam => {
    if (!!selectParam && !!selectParam.domEvent) {
      const ev = selectParam.domEvent;
      if (ev.target.className === 'ant-checkbox-input') {
        return false;
      }
    }
    const { rowKey = 'key' } = this.props;
    this.getVisibleData().map((record, index) => {
      if (`${record[rowKey]}` === selectParam.key) {
        if (this.state.checkedList.length > 0) {
          const key = record[rowKey];
          let checkedList = this.state.checkedList;
          if (this.state.checkedList.includes(key)) {
            checkedList = pull(checkedList, key);
          } else {
            checkedList.push(key);
          }
          this.handleToggleItemChanged(checkedList);
        } else {
          this.handleSelectItem(record, index);
        }
      }
    });
  };

  handleSelectItem = (record, index) => {
    if (this.props.onClick) {
      this.props.onClick(record, index);
    }
  };

  handleToggleItemChanged = items => {
    const visibleData = this.getVisibleData();
    this.setState(
      {
        checkedList: items,
        indeterminate: !!items.length && items.length < visibleData.length,
        checkAll: items.length === visibleData.length
      },
      () => {
        if (!!this.props.onSelect) {
          const { rowKey = 'key' } = this.props;
          const data = this.state.data;
          const selectedData = this.state.checkedList.map(key => data.find(item => item[rowKey] === key));
          if (!this.state.isMobile) {
            this.props.onSelect(selectedData);
          }
        }
      }
    );
  };

  handleCheckAllChange = e => {
    const { rowKey = 'key' } = this.props;
    const visibleData = this.getVisibleData().map(item => item[rowKey]);
    this.handleToggleItemChanged(e.target.checked ? visibleData : []);
  };

  handleSearch = ev => {
    this.onSearch(ev.target.value);
  };

  onSearch = searchText => {
    this.setState({ activePage: 1, searchText });
  };

  handleLoadMore = () => {
    const { activePage, loading, hasMore } = this.state;
    if (!loading && hasMore) {
      this.setPage(activePage + 1);
    }
  };

  renderItem = (record, index) => {
    if (this.props.renderItem) {
      return this.props.renderItem(record, index);
    } else if (typeof record === 'string') {
      return record;
    }
    return record.toString();
  };

  renderListItems = (dataSource, rowKey) => {
    const { selectable = false, actions = [] } = this.props;
    const isSelectable = selectable && actions.length > 0;
    return dataSource.map((record, index) => {
      const value = record[rowKey];
      const checked = this.state.checkedList.indexOf(value) !== -1;
      return (
        <Menu.Item key={record[rowKey]}>
          {isSelectable && <Checkbox className="z-list-checkbox" name="z-list-checkbox" value={value} checked={checked} />}
          {this.renderItem(record, index)}
        </Menu.Item>
      );
    });
  };

  renderGroupListItems = (group, dataSource, rowKey) => {
    const data = dataSource.filter((record, index) => group.filter(record, index));
    if (data.length === 0) {
      return null;
    }
    const title = (
      <>
        {group.title}
        <span className="counter">{data.length}</span>
      </>
    );
    return (
      <Menu.ItemGroup title={title} key={group.title}>
        {this.renderListItems(data, rowKey)}
      </Menu.ItemGroup>
    );
  };

  handleFilterData = (dataSource, searchText) => {
    const search = searchText.replace(/([.?*+^$[\]\\(){}-])/g, '\\$1');
    return this.props.onFilter ? this.props.onFilter(dataSource, search) : dataSource;
  };

  render() {
    const { header, hasSelectedItem = false, rowKey = 'key', groups, selectedItem } = this.props;
    const { actions = [], selectable = false } = this.props;
    const { hasMore, loading, initLoading } = this.state;
    const { checkedList, checkAll, indeterminate } = this.state;
    const filteredData = this.getVisibleData();
    const selectedKeys = checkedList.length > 0 ? checkedList.map(i => `${i}`) : selectedItem ? [selectedItem] : [];
    const isSelectable = selectable && actions.length > 0;
    const loadMore =
      !initLoading && hasMore ? (
        <div className="z-list-footer">
          <Button onClick={this.handleLoadMore} type="ghost" loading={loading}>
            <small>Chargement plus ...</small>
          </Button>
        </div>
      ) : null;
    return (
      <div className={`z-list ${hasSelectedItem && 'has-selected-item'}`}>
        <div className="z-list-sidebar">
          <div className="z-list-header">{header}</div>
          {!isSelectable || checkedList.length === 0 ? (
            <SearchInput onChange={this.handleSearch} placeholder={this.props.placeholder} helper={this.props.searchHelper} />
          ) : (
            <div className="z-list-search-bar">
              <div>
                <Checkbox onChange={this.handleCheckAllChange} indeterminate={indeterminate} checked={checkAll}>
                  <b>
                    <small>{checkedList.length}</small>
                  </b>
                </Checkbox>
              </div>
              <div className="z-list-header-actions">
                {!!actions &&
                  actions.map((action, index) => (
                    <ListActionItem
                      key={'list_action_' + index}
                      rowKey={rowKey}
                      icon={action.icon}
                      title={action.title}
                      loading={action.loading}
                      visible={action.visible}
                      checkedList={checkedList}
                      dataSource={filteredData}
                      onClick={action.onClick}
                    />
                  ))}
              </div>
            </div>
          )}
          {initLoading ? (
            <Spin />
          ) : (
            <InfiniteScroll
              initialLoad={false}
              pageStart={0}
              loadMore={this.handleLoadMore}
              hasMore={!loading && hasMore}
              className="z-list-body"
            >
              <Checkbox.Group onChange={this.handleToggleItemChanged} value={checkedList}>
                <Menu
                  selectedKeys={selectedKeys}
                  mode="inline"
                  inlineIndent={5}
                  focusable
                  selectable
                  onClick={this.handleClickMenuItem}
                  className={isSelectable && 'ant-menu-selectable'}
                  children={
                    groups
                      ? groups.map(group => this.renderGroupListItems(group, filteredData, rowKey))
                      : this.renderListItems(filteredData, rowKey)
                  }
                />
              </Checkbox.Group>
              {loading &&
                hasMore && (
                  <Menu mode="inline" inlineIndent={5} className="loading-list">
                    <Menu.Item>
                      <Skeleton active avatar paragraph={{ rows: 1 }} />
                    </Menu.Item>
                    <Menu.Item>
                      <Skeleton active avatar paragraph={{ rows: 1 }} />
                    </Menu.Item>
                    <Menu.Item>
                      <Skeleton active avatar paragraph={{ rows: 1 }} />
                    </Menu.Item>
                  </Menu>
                )}
            </InfiniteScroll>
          )}
          {loadMore}
        </div>
        <div className="z-list-content">{this.props.children}</div>
      </div>
    );
  }
}

export default ListComponent;
