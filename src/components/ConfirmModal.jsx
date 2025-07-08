import React from 'react';
import './ConfirmModal.css';

const ConfirmModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Konfirmasi Penghapusan</h2>
        <p>Apakah kamu yakin ingin menghapus semua riwayat?</p>
        <div className="modal-buttons">
          <button className="confirm" onClick={onConfirm}>Ya, Hapus</button>
          <button className="cancel" onClick={onCancel}>Batal</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
