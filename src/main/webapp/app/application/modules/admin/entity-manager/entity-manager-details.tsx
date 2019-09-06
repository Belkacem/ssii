import React, { FunctionComponent, useEffect, useState } from 'react';
import { Modal } from 'antd';
import { renderFieldData } from 'app/application/modules/admin/entity-manager/entity-manager-utils';

interface IEntityManagerDetailsProps {
  entity: any;
  fields: any[];
  onClose: (entity: any) => void;
}

export const EntityManagerDetails: FunctionComponent<IEntityManagerDetailsProps> = props => {
  const { entity, fields } = props;

  const handleClose = () => {
    props.onClose(null);
  };

  return (
    <Modal title="Détails" visible={!!entity} onCancel={handleClose} footer={false} destroyOnClose centered>
      {!!entity &&
        fields.map(field => (
          <dl key={field.name}>
            <dt style={{ textTransform: 'capitalize' }}>{field.name}</dt>
            <dd>{renderFieldData(field.name, field.type, entity[field.name], entity)}</dd>
          </dl>
        ))}
    </Modal>
  );
};
