import React, { FunctionComponent } from 'react';
import { IClient } from 'app/shared/model/client.model';

interface IClientDetailsSmallProps {
  client: IClient;
}

export const ClientDetailsSmall: FunctionComponent<IClientDetailsSmallProps> = props => {
  const { client } = props;
  return (
    <dl className="jh-entity-details">
      <dt>Nom</dt>
      <dd>
        {client.form} {client.name}
      </dd>
      <dt>Numéro SIREN</dt>
      <dd>{client.siren}</dd>
      <dt>Numéro de TVA</dt>
      <dd>{client.tva}</dd>
      <dt>E-mail</dt>
      <dd>{client.email}</dd>
      <dt>Délai de paiement</dt>
      <dd>
        {client.paymentDelay} <sup>jour</sup>
      </dd>
      {client.reference && (
        <>
          <dt>Référence</dt>
          <dd>{client.reference}</dd>
        </>
      )}
      <dt>Adresse</dt>
      <dd>
        <div className="meta-description">{client.addressLine1}</div>
        <div className="meta-description">{client.addressLine2}</div>
        <div className="meta-description">
          {client.city}, {client.postalCode} {client.country}
        </div>
      </dd>
    </dl>
  );
};
