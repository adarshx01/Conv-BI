import React from 'react';
import { Modal } from 'antd';

const ErrorModal = ({ isVisible, onClose, message }) => {
  return (
    <Modal
      title="Error"
      open={isVisible}
      onOk={onClose}
      onCancel={onClose}
      footer={null}
    >
      <p>{message}</p>
    </Modal>
  );
};

export default ErrorModal;

