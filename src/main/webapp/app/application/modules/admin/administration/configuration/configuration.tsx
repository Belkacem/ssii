import React from 'react';
import { connect } from 'react-redux';
import { Col, Input, Row, Tag } from 'antd';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import { getConfigurations, getEnv } from 'app/modules/administration/administration.reducer';
import { IRootState } from 'app/shared/reducers';

export interface IConfigurationPageProps extends StateProps, DispatchProps {}

export interface IConfigurationPageState {
  filter: string;
  reversePrefix: boolean;
  reverseProperties: boolean;
}

export class ConfigurationPage extends React.Component<IConfigurationPageProps, IConfigurationPageState> {
  state: IConfigurationPageState = {
    filter: '',
    reversePrefix: false,
    reverseProperties: false
  };

  componentDidMount() {
    this.props.getConfigurations();
    this.props.getEnv();
  }

  setFilter = evt => {
    this.setState({
      filter: evt.target.value
    });
  };

  envFilterFn = configProp => configProp.toUpperCase().includes(this.state.filter.toUpperCase());
  propsFilterFn = configProp => configProp.prefix.toUpperCase().includes(this.state.filter.toUpperCase());

  reversePrefix = () => {
    this.setState({
      reversePrefix: !this.state.reversePrefix
    });
  };

  reverseProperties = () => {
    this.setState({
      reverseProperties: !this.state.reverseProperties
    });
  };

  getContextList = contexts =>
    Object.values(contexts)
      .map((v: any) => v.beans)
      .reduce((acc, e) => ({ ...acc, ...e }));

  render() {
    const { configuration } = this.props;
    const { filter } = this.state;
    const configProps = configuration && configuration.configProps ? configuration.configProps : {};
    const env = configuration && configuration.env ? configuration.env : {};
    return (
      <div>
        <PageHead title="Configuration" />
        <div className="padding-1rem margin-bottom-8">
          <span>Filter</span> <Input type="search" value={filter} onChange={this.setFilter} name="search" id="search" />
        </div>
        <div className="padding-1rem margin-bottom-8">
          <b>Spring configuration</b>
          <div className="ant-table ant-table-small" style={{ overflow: 'auto', maxWidth: '100%' }}>
            <div className="ant-table-content">
              <div className="ant-table-body">
                <table>
                  <thead className="ant-table-thead">
                    <tr>
                      <th onClick={this.reversePrefix}>
                        <small>Prefix</small>
                      </th>
                      <th onClick={this.reverseProperties}>
                        <small>Properties</small>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="ant-table-tbody">
                    {configProps.contexts
                      ? Object.values(this.getContextList(configProps.contexts))
                          .filter(this.propsFilterFn)
                          .map((property, propIndex) => (
                            <tr key={propIndex}>
                              <td>{property['prefix']}</td>
                              <td>
                                {Object.keys(property['properties']).map((propKey, index) => (
                                  <Row key={index}>
                                    <Col md={8}>{propKey}</Col>
                                    <Col md={16}>
                                      <Tag>{JSON.stringify(property['properties'][propKey])}</Tag>
                                    </Col>
                                  </Row>
                                ))}
                              </td>
                            </tr>
                          ))
                      : null}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        {env.propertySources
          ? env.propertySources.map((envKey, envIndex) => (
              <div className="padding-1rem margin-bottom-8" key={envIndex}>
                <b>{envKey.name}</b>
                <div className="ant-table ant-table-small" style={{ overflow: 'auto', maxWidth: '100%' }}>
                  <div className="ant-table-content">
                    <div className="ant-table-body">
                      <table>
                        <thead className="ant-table-thead">
                          <tr key={envIndex}>
                            <th>
                              <small>Property</small>
                            </th>
                            <th>
                              <small>Value</small>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="ant-table-tbody">
                          {Object.keys(envKey.properties)
                            .filter(this.envFilterFn)
                            .map((propKey, propIndex) => (
                              <tr key={propIndex}>
                                <td className="break">{propKey}</td>
                                <td className="break">
                                  <span className="float-right badge badge-secondary break">{envKey.properties[propKey].value}</span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            ))
          : null}
      </div>
    );
  }
}

const mapStateToProps = ({ administration }: IRootState) => ({
  configuration: administration.configuration,
  isFetching: administration.loading
});

const mapDispatchToProps = { getConfigurations, getEnv };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConfigurationPage);
