import React, { useState, useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

import Display from './components/Display';
import Button from './components/Button';
import History from './components/History';
import ConfirmModal from './components/ConfirmModal';

import './App.css';

const App = () => {
  // ==========================
  // 🔢 STATE UTAMA
  // ==========================
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState([]);
  const [isResult, setIsResult] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // ==========================
  // 🔘 BUTTON GRID
  // ==========================
  const buttons = [
    'AC', 'DEL', '+/-', '/',
    '^', '+', '-', '*',
    '7', '8', '9', '√',
    '4', '5', '6', '%',
    '1', '2', '3', ',',
    '0', '00', '='
  ];

  // ==========================
  // 🔣 FORMAT ANGKA
  // ==========================
  const formatNumber = (num) => {
    const number = parseFloat(num);
    if (isNaN(number)) return num;

    // Gunakan notasi e untuk angka ekstrem
    if (Math.abs(number) >= 1e9 || (Math.abs(number) > 0 && Math.abs(number) < 1e-6)) {
      return number.toExponential(5);
    }

    return number.toLocaleString('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 10
    });
  };

  const unformatNumber = (str) => str.replace(/\./g, '').replace(',', '.');

  const formatExpression = (raw) => {
    return raw
      .split(/([+\-*/^√])/g)
      .map((part) => {
        const num = unformatNumber(part);
        return isNaN(num) || part.trim() === '' || /^[+\-*/^√]$/.test(part)
          ? part
          : formatNumber(num);
      })
      .join('');
  };

  // ==========================
  // 💾 LOAD / SAVE HISTORY
  // ==========================
  useEffect(() => {
    const savedHistory = localStorage.getItem('calc-history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('calc-history', JSON.stringify(history));
  }, [history]);

  // ==========================
  // ⌨️ KEYBOARD SUPPORT
  // ==========================
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key;
      if (/[\d+\-*/^]/.test(key)) {
        setInput((prev) => prev + key);
      } else if (key === 'Enter') {
        evaluateExpression();
      } else if (key === 'Backspace') {
        setInput((prev) => prev.slice(0, -1));
      } else if (key === 'Escape') {
        setInput('');
        setResult('');
      } else if (key === ',' || key === '.') {
        setInput((prev) => prev + ',');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [input]);

  // ==========================
  // 🧠 EVALUASI EKSPRESI
  // ==========================
  const evaluateExpression = () => {
    const raw = unformatNumber(input)
      .replace(/\^/g, '**')
      .replace(/√(\d+(\.\d+)?)/g, 'Math.sqrt($1)');

    const isValid = /^[√\d.,+\-*/^%]+$/.test(input);
    if (!isValid) {
      setResult('Error');
      return;
    }

    try {
      let hasil = eval(raw);
      hasil = Math.round((hasil + Number.EPSILON) * 1e9) / 1e9;
      const formatted = formatNumber(hasil);
      setResult(formatted);
      setIsResult(true);
      setHistory((prev) => [
        ...prev,
        {
          expression: formatExpression(input),
          result: formatted
        }
      ]);
    } catch {
      setResult('Error');
      setInput('');
    }
  };

  // ==========================
  // 📱 HANDLER TOMBOL
  // ==========================
  const handleClick = (value) => {
    if (value === 'AC') {
      setInput('');
      setResult('');
      setIsResult(false);
    } else if (value === 'DEL') {
      if (isResult) {
        setInput('');
        setResult('');
        setIsResult(false);
      } else {
        setInput((prev) => prev.slice(0, -1));
      }
    } else if (value === '+/-') {
      const match = input.match(/(-?\d+\.?\d*)$/);
      if (match) {
        const number = match[0];
        const toggled = number.startsWith('-') ? number.slice(1) : `-${number}`;
        setInput((prev) => prev.slice(0, prev.length - number.length) + toggled);
      }
    } else if (value === '%') {
      const match = input.match(/([\d.,]+)([+\-*/])([\d.,]+)$/);
      if (match) {
        const a = parseFloat(unformatNumber(match[1]));
        const b = parseFloat(unformatNumber(match[3]));
        const percentValue = (a * b) / 100;
        const before = input.slice(0, input.lastIndexOf(match[3]));
        setInput(before + formatNumber(percentValue));
      }
    } else if (value === '√') {
      setInput((prev) => prev + '√');
    } else if (value === '=') {
      evaluateExpression();
    } else {
      if (isResult) {
        if (/[+\-*/^]/.test(value)) {
          const rawResult = result.replace(/\./g, '').replace(',', '.');
          setInput(rawResult + value);
        } else {
          setInput(value);
        }
        setResult('');
        setIsResult(false);
      } else {
        // Blokir input operator pertama & ganda
        if (/[+\-*/^]/.test(value) && (input === '' || /[+\-*/^]$/.test(input))) {
          return;
        }

        if (value === ',') {
          setInput((prev) => prev + ',');
        } else {
          setInput((prev) => prev + value);
        }
      }
    }
  };

  // ==========================
  // 🗑️ MODAL & HISTORY ACTION
  // ==========================
  const handleClearHistory = () => setShowModal(true);
  const confirmDelete = () => {
    setHistory([]);
    setShowModal(false);
  };
  const cancelDelete = () => setShowModal(false);
  const handleDeleteHistoryItem = (index) => {
    setHistory((prev) => prev.filter((_, i) => i !== index));
  };

  // ==========================
  // 🧩 RENDER UI
  // ==========================
  return (
    <>
      <SignedOut>
        <div className="login-container">
          <div className="login-card">
            <h1>📱 ReKa</h1>
            <p>Silakan login terlebih dahulu untuk mulai menggunakan aplikasi.</p>
            <SignInButton mode="modal">
              <button className="login-button">Login Sekarang</button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <header style={{ padding: '10px', textAlign: 'right' }}>
          <UserButton />
        </header>

        <div className="app-container" style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <div className="calculator">
            <Display input={formatExpression(input)} result={result} />
            <div className="button-grid">
              {buttons.map((btn) => (
                <Button key={btn} value={btn} onClick={handleClick} />
              ))}
            </div>
          </div>

          <History
            history={history}
            onSelect={(item) => {
              setInput(unformatNumber(item.expression));
              setResult(item.result);
              setIsResult(true);
            }}
            onClear={handleClearHistory}
            onDeleteItem={handleDeleteHistoryItem}
          />

          {showModal && (
            <ConfirmModal onConfirm={confirmDelete} onCancel={cancelDelete} />
          )}
        </div>
      </SignedIn>
    </>
  );
};

export default App;
