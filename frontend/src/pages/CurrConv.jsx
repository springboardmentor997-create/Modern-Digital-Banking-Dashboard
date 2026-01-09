import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, RefreshCw, TrendingUp } from 'lucide-react';

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [exchangeRate, setExchangeRate] = useState(null);
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const popularCurrencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' }
  ];

  useEffect(() => {
    fetchCurrencies();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (amount && fromCurrency && toCurrency) {
        convertCurrency();
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [amount, fromCurrency, toCurrency]);

  const fetchCurrencies = async () => {
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      const currencyList = Object.keys(data.rates).sort();
      setCurrencies(currencyList);
    } catch (err) {
      console.error('Failed to fetch currencies:', err);
      setCurrencies(popularCurrencies.map(c => c.code));
    }
  };

  const convertCurrency = async () => {
    if (!amount || isNaN(amount) || amount <= 0) {
      setConvertedAmount(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
      );
      const data = await response.json();
      
      const rate = data?.rates?.[toCurrency];
      if (!rate) throw new Error("Rate not found");
      setExchangeRate(rate);
      setConvertedAmount((parseFloat(amount) * rate).toFixed(2));
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError('Failed to fetch exchange rate. Please try again.');
      console.error('Conversion error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleQuickAmount = (value) => {
    setAmount(value.toString());
  };

  const getCurrencySymbol = (code) => {
    const currency = popularCurrencies.find(c => c.code === code);
    return currency ? currency.symbol : code;
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className=" mx-auto">
        <div className=" mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold ">
              Currency Converter
            </h1>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-white/40 mb-6">

          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              From
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="flex-1 px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-lg font-semibold"
              />
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold bg-white text-sm sm:text-base"
              >
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-center mb-4 sm:mb-6">
            <button
              onClick={handleSwapCurrencies}
              className="p-3 sm:p-4 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-full hover:shadow-lg transform hover:scale-110 transition-all"
            >
              <ArrowRightLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              To
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 px-4 py-3 sm:py-4 border-2 border-blue-200 rounded-xl bg-blue-50 text-base sm:text-lg font-bold text-blue-800 flex items-center">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm sm:text-base">Converting...</span>
                  </div>
                ) : convertedAmount ? (
                  <span>{getCurrencySymbol(toCurrency)} {parseFloat(convertedAmount).toLocaleString()}</span>
                ) : (
                  <span className="text-gray-400 text-sm sm:text-base">Result will appear here</span>
                )}
              </div>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold bg-white text-sm sm:text-base"
              >
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Quick Amount
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
              {[10, 50, 100, 500, 1000].map((value) => (
                <button
                  key={value}
                  onClick={() => handleQuickAmount(value)}
                  className="px-3 sm:px-4 py-2 sm:py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-semibold transition-all text-sm sm:text-base"
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          {exchangeRate && !loading && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Exchange Rate</p>
                    <p className="text-base sm:text-lg font-bold text-blue-800">
                      1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
                    </p>
                  </div>
                </div>
                {lastUpdated && (
                  <div className="text-xs text-gray-500">
                    Updated: {lastUpdated}
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="mt-4 sm:mt-6 flex justify-center">
            <button
              onClick={convertCurrency}
              disabled={loading}
              className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Rate
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs sm:text-sm text-blue-600">
          <p>Exchange rates are updated in real-time</p>
        </div>
      </div>
    </div>
  );
}