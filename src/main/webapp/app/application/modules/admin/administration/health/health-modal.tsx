import React from 'react';
import { Modal } from 'antd';

const formatDiskSpaceOutput = rawValue => {
  // Should display storage space in an human readable unit
  const val = rawValue / 1073741824;
  if (val > 1) {
    // Value
    return (
      <span>
        {val.toFixed(2)}
        <small>
          <b>GB</b>
        </small>
      </span>
    );
  } else {
    return (
      <span>
        {(rawValue / 1048576).toFixed(2)}
        <small>
          <b>MB</b>
        </small>
      </span>
    );
  }
};

const HealthModal = ({ handleClose, healthObject, showModal }) => {
  const data = healthObject.details || {};
  return (
    <Modal visible={showModal} onCancel={handleClose} title={healthObject.name} footer={false} bodyStyle={{ padding: 0 }}>
      <div className="ant-table ant-table-middle">
        <div className="ant-table-content">
          <div className="ant-table-body">
            <table>
              <thead className="ant-table-thead">
                <tr>
                  <th>Nom</th>
                  <th>Valeur</th>
                </tr>
              </thead>
              <tbody className="ant-table-tbody">
                {Object.keys(data).map((key, index) => (
                  <tr key={index}>
                    <td>{key}</td>
                    <td>{healthObject.name === 'diskSpace' ? formatDiskSpaceOutput(data[key]) : JSON.stringify(data[key])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default HealthModal;
