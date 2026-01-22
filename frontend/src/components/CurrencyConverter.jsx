import React, { useState, useEffect } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import axiosClient from '../api/client';

const CurrencyConverter = () => {
  const [fromCurrency, setFromCurrency] = useState('INR');
  const [toCurrency, setToCurrency] = useState('USD');
  const [amount, setAmount] = useState('');
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState({
    'USD': 'US Dollar',
    'EUR': 'Euro', 
    'INR': 'Indian Rupee',
    'GBP': 'British Pound'
  });

  useEffect(() => {
    // Fetch supported currencies from API
    const fetchCurrencies = async () => {
      try {
        const response = await axiosClient.get('/api/currency/supported');
        const supportedCurrencies = {};
        response.data.currencies.forEach(code => {
          const names = {
            'USD': 'US Dollar',
            'EUR': 'Euro',
            'INR': 'Indian Rupee',
            'GBP': 'British Pound'
          };
          supportedCurrencies[code] = names[code] || code;
        });
        setCurrencies(supportedCurrencies);
      } catch (error) {
        console.error('Failed to fetch currencies:', error);
      }
    };
    
    fetchCurrencies();
    setFromCurrency('INR');
    setToCurrency('USD');
  }, []);

  const handleConvert = async () => {
    if (!amount || amount <= 0) return;
    
    setLoading(true);
    try {
      const response = await axiosClient.get('/api/currency/convert', {
        params: {
          from_currency: fromCurrency,
          to_currency: toCurrency,
          amount: parseFloat(amount)
        }
      });
      setConvertedAmount(response.data.result);
    } catch (error) {
      console.error('Conversion failed:', error);
      // Fallback to simple conversion for demo
      const rates = { 'USD': { 'EUR': 0.85, 'INR': 83.0 }, 'EUR': { 'USD': 1.18, 'INR': 97.6 }, 'INR': { 'USD': 0.012, 'EUR': 0.010 } };
      if (rates[fromCurrency] && rates[fromCurrency][toCurrency]) {
        setConvertedAmount(parseFloat(amount) * rates[fromCurrency][toCurrency]);
      }
    } finally {
      setLoading(false);
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setConvertedAmount(null);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Currency Converter</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {Object.entries(currencies).map(([code, name]) => (
                <option key={code} value={code}>{code} - {name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {Object.entries(currencies).map(([code, name]) => (
                <option key={code} value={code}>{code} - {name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={swapCurrencies}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <ArrowRightLeft size={20} />
          </button>
        </div>

        <button
          onClick={handleConvert}
          disabled={loading || !amount}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Converting...' : 'Convert'}
        </button>

        {convertedAmount !== null && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-semibold">
              {amount} {fromCurrency} = {convertedAmount.toFixed(2)} {toCurrency}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrencyConverter;