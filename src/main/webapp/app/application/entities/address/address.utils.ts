import { IAddress } from './address.model';

export const dataToAddresses = data => {
  const features = data.features;
  if (features) {
    return features.map(feature => {
      const properties = feature.properties;
      const address: IAddress = {};
      address.addressLine1 = properties.name;
      address.addressLine2 = properties.context;
      address.city = properties.city;
      address.postalCode = properties.postcode;
      address.country = 'France';
      return address;
    });
  }
  return [] as ReadonlyArray<IAddress>;
};
