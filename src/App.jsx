import React, { useState, useEffect, useRef } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { evaluate } from 'mathjs';

import Display from './components/Display';
import Button from './components/Button';
import History from './components/History';
import ConfirmModal from './components/ConfirmModal';

import './App.css';

const App = () => {
  const historyRef = useRef([]);
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('calc-history');
    return saved ? JSON.parse(saved) : [];
  });

  const [isResult, setIsResult] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const buttons = [
    'AC', 'DEL', '+/-', '/',
    '^', '+', '-', '*',
    '7', '8', '9', '√',
    '4', '5', '6', '%',
    '1', '2', '3', ',',
    '0', '00', '='
  ];

  // Format angka ke format lokal (Indonesia)
  const formatNumber = (num) => {
    const number = parseFloat(num);
    if (isNaN(number)) return num;

    return number.toLocaleString('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 10
    });
  };

  // Hilangkan format lokal agar bisa diproses mathjs
  const unformatNumber = (str) =>
    str.replace(/\./g, '').replace(',', '.');

  // Format ulang ekspresi agar mudah dibaca pengguna
  const formatExpression = (raw) => {
    return raw
      .split(/([+\-*/^√])/g)
      .map((part) => {
        if (/^[\d,.]+$/.test(part)) {
          const num = parseFloat(part.replace(',', '.'));
          return isNaN(num) ? part : formatNumber(num);
        }
        return part;
      })
      .join('');
  };

  // Simpan history ke localStorage setiap kali history berubah
  useEffect(() => {
    localStorage.setItem('calc-history', JSON.stringify(history));
  }, [history]);

  // Tangani input dari keyboard
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

  // Evaluasi ekspresi matematika
  const evaluateExpression = () => {
    const raw = unformatNumber(input)
      .replace(/\^/g, '**')
      .replace(/√(\d+(\.\d+)?)/g, 'sqrt($1)');

    const isValid = /^[√\d.,+\-*/^%]+$/.test(input);
    if (!isValid) {
      setResult('Error');
      return;
    }

    try {
      const hasil = evaluate(raw);
      const rounded = Math.round((hasil + Number.EPSILON) * 1e9) / 1e9;
      const formatted = formatNumber(rounded);

      setResult(formatted);
      setIsResult(true);

      setHistory((prev) => {
        const updated = [...prev, {
          expression: input,
          result: formatted
        }];
        localStorage.setItem('calc-history', JSON.stringify(updated));
        historyRef.current = updated;
        return updated;
      });

    } catch (err) {
      console.error('Evaluation error:', err);
      setResult('Error');
      setInput('');
    }
  };

  // Tangani semua tombol kalkulator
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
          const formatted = rawResult.replace('.', ',');
          setInput(formatted + value);
        } else {
          setInput(value);
        }
        setResult('');
        setIsResult(false);
      } else {
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

  // Fungsi riwayat
  const handleClearHistory = () => setShowModal(true);
  const confirmDelete = () => {
    localStorage.removeItem('calc-history');
    setHistory([]);
    historyRef.current = [];
    setShowModal(false);
  };
  const cancelDelete = () => setShowModal(false);
  const handleDeleteHistoryItem = (index) => {
    setHistory((prev) => prev.filter((_, i) => i !== index));
  };

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
