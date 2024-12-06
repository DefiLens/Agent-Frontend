// components/PinEntry.tsx

import React, { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../utils/keys';

interface PinEntryProps {
  onPinVerified: () => void;
}

const PinEntry: React.FC<PinEntryProps> = ({ onPinVerified }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${BASE_URL}/auth/pin/verify`, { pin });
      if (response.status === 200) {
        onPinVerified();
        localStorage.setItem('pinVerified', 'true');
      }
    } catch (error) {
      setError('Incorrect PIN. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-900">
      <div className="bg-zinc-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-white text-center">Enter PIN</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter 6-digit PIN"
            className="w-full p-2 mb-4 bg-zinc-700 text-white rounded"
            maxLength={6}
          />
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default PinEntry;