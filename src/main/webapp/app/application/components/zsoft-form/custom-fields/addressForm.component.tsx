import React, { FunctionComponent, useState, useEffect } from 'react';
import { IRootState } from 'app/shared/reducers';
import * as Address from 'app/application/entities/address/address.actions';
import { IAddress } from 'app/application/entities/address/address.model';
import { connect } from 'react-redux';
import { AutoComplete, Col, Form, Icon, Input, Row, Select } from 'antd';
import CountriesList from 'app/application/common/config/countries';
import debounce from 'lodash/debounce';
import { getFieldLayout, getHelper, getValidateStatus } from 'app/application/common/utils/form-utils';

const Option = AutoComplete.Option;

interface IAddressFormProps extends StateProps, DispatchProps {
  formProps: any;
  layout?: 'horizontal' | 'vertical';
  autoFocus?: boolean;
}

const AddressFormComponent: FunctionComponent<IAddressFormProps> = props => {
  const [dataSource, setDataSource] = useState([]);
  const { formProps, loading, layout = 'horizontal', autoFocus = false } = props;

  useEffect(
    () => {
      if (props.addresses) {
        setDataSource([...props.addresses]);
      }
    },
    [props.addresses]
  );

  useEffect(
    () => {
      if (dataSource.length === 0) {
        props.resetAddress();
      }
    },
    [dataSource]
  );

  const fetchAddress = debounce(value => props.fetchAddress(value), 500);

  const handleSearch = value => {
    props.formProps.setFieldValue('addressLine1', value);
    if (value) {
      fetchAddress(value);
    } else {
      setDataSource([]);
    }
  };

  const onSelect = index => {
    const address: IAddress = props.addresses[index];
    props.formProps.setFieldValue('addressLine1', address.addressLine1);
    props.formProps.setFieldValue('addressLine2', address.addressLine2);
    props.formProps.setFieldValue('city', address.city);
    props.formProps.setFieldValue('country', address.country);
    props.formProps.setFieldValue('postalCode', address.postalCode);
  };

  const renderOption = (address, key) => (
    <Option key={`${key}`} value={`${key}`}>
      <div>
        <Icon type="environment" style={{ width: 24 }} />
        <small>
          {address.addressLine1}, {address.city}, {address.country}
        </small>
      </div>
    </Option>
  );

  const handleChangeEvent = (name: string, e): void => {
    if (typeof e === 'string') {
      props.formProps.setFieldValue(name, e);
    } else {
      props.formProps.setFieldValue(name, e.target.value);
    }
  };

  const handleBlurEvent = (name: string): void => props.formProps.setFieldTouched(name);

  const formItemLayout = getFieldLayout(layout);
  const helper = ['addressLine1', 'addressLine2', 'city', 'country', 'postalCode']
    .map(field => getHelper(undefined, field, formProps))
    .filter(helpError => !!helpError)
    .join(', ');
  const validateStatus = ['addressLine1', 'addressLine2', 'city', 'country', 'postalCode']
    .map(field => getValidateStatus(loading, field, formProps))
    .find(helpError => !!helpError);
  return (
    <Form.Item
      className="address-form"
      label="Adresse"
      required
      {...formItemLayout}
      validateStatus={validateStatus}
      help={helper}
      hasFeedback
      htmlFor="addressLine1"
    >
      <AutoComplete
        dataSource={dataSource.map(renderOption)}
        onSelect={onSelect}
        onSearch={handleSearch}
        optionLabelProp="text"
        autoFocus={autoFocus}
        value={formProps.values.addressLine1}
      >
        <Input.TextArea id="addressLine1" placeholder="Adresse Ligne 1" name="addressLine1" autosize={{ minRows: 2, maxRows: 6 }} />
      </AutoComplete>
      <Input.TextArea
        placeholder="Adresse Ligne 2"
        name="addressLine2"
        autosize={{ minRows: 2, maxRows: 6 }}
        value={formProps.values.addressLine2}
        onChange={handleChangeEvent.bind(null, 'addressLine2')}
        onBlur={handleBlurEvent.bind(null, 'addressLine2')}
      />
      <Row gutter={16}>
        <Col sm={16}>
          <Input
            placeholder="Ville"
            name="city"
            value={formProps.values.city}
            onChange={handleChangeEvent.bind(null, 'city')}
            onBlur={handleBlurEvent.bind(null, 'city')}
          />
        </Col>
        <Col sm={8}>
          <Input
            placeholder="Code postal"
            name="postalCode"
            value={formProps.values.postalCode}
            onChange={handleChangeEvent.bind(null, 'postalCode')}
            onBlur={handleBlurEvent.bind(null, 'postalCode')}
          />
        </Col>
      </Row>
      <Select
        placeholder="Pays"
        value={formProps.values.country}
        showSearch
        allowClear
        optionFilterProp="children"
        className="fullwidth"
        onChange={handleChangeEvent.bind(null, 'country')}
        onBlur={handleBlurEvent.bind(null, 'country')}
        children={CountriesList.map(country => (
          <Select.Option key={country.code} value={country.name} children={country.name} />
        ))}
      />
    </Form.Item>
  );
};

const mapStateToProps = ({ application }: IRootState) => ({
  addresses: application.address.entities,
  loading: application.address.loading
});

const mapDispatchToProps = {
  fetchAddress: Address.fetch,
  resetAddress: Address.reset
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(AddressFormComponent);
