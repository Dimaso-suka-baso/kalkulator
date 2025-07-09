import React, { useState } from 'react';
import './History.css';

// Komponen untuk menampilkan riwayat perhitungan
const History = ({ history, onSelect, onClear, onDeleteItem }) => {
  const [showNoHistoryMsg, setShowNoHistoryMsg] = useState(false);

  // Menangani klik tombol "Hapus Semua"
  const handleClear = () => {
    if (history.length === 0) {
      // Tampilkan pesan jika riwayat kosong
      setShowNoHistoryMsg(true);
      setTimeout(() => setShowNoHistoryMsg(false), 2000);
    } else {
      // Jika ada riwayat, panggil fungsi hapus
      onClear();
    }
  };

  return (
    <div className="history-container">
      {/* Header Riwayat */}
      <div className="history-header">
        <h3>Riwayat</h3>
        <button className="clear-button" onClick={handleClear}>
          Hapus Semua
        </button>
      </div>

      {/* Pesan jika tidak ada riwayat untuk dihapus */}
      {showNoHistoryMsg && (
        <p className="no-history-msg">Tidak ada riwayat untuk dihapus.</p>
      )}

      {/* Tampilkan pesan jika belum ada riwayat */}
      {history.length === 0 && !showNoHistoryMsg && (
        <p className="empty">Belum ada riwayat.</p>
      )}

      {/* Daftar riwayat */}
      <ul>
        {history.map((item, index) => (
          <li key={index}>
            <div
              className="history-entry"
              onClick={() => onSelect(item)}
              title="Klik untuk gunakan ulang"
            >
              <span>{item.expression}</span>
              <strong>= {item.result}</strong>
            </div>
            <button
              className="delete-item-button"
              onClick={() => onDeleteItem(index)}
              title="Hapus item"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default History;
