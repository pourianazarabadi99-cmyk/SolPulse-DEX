import React, { useState, useEffect } from 'react';
import axios from 'axios';

// لوگوی اختصاصی SolPulse
const SolPulseLogo = () => (
  <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="12" fill="url(#solpulse-grad)" />
    <path 
      d="M10 20H15L18 11L22 29L25 18L28 20H30" 
      stroke="#0A0E17" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="solpulse-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#06B6D4" />
        <stop offset="1" stopColor="#10B981" />
      </linearGradient>
    </defs>
  </svg>
);

const SolIcon = () => (
  <svg width="20" height="20" viewBox="0 0 128 128" fill="none">
    <circle cx="64" cy="64" r="64" fill="#14F195" fillOpacity="0.2"/>
    <path d="M30 40H98L85 53H17L30 40Z" fill="#14F195"/>
    <path d="M30 75H98L85 88H17L30 75Z" fill="#14F195"/>
    <path d="M98 57.5H30L43 70.5H111L98 57.5Z" fill="#9945FF"/>
  </svg>
);

const UsdcIcon = () => (
  <svg width="20" height="20" viewBox="0 0 128 128" fill="none">
    <circle cx="64" cy="64" r="64" fill="#2775CA"/>
    <text x="64" y="82" fontSize="55" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="sans-serif">$</text>
  </svg>
);

const TOKENS = {
  SOL: {
    symbol: 'SOL',
    mint: 'So11111111111111111111111111111111111111112',
    decimals: 9,
    icon: <SolIcon />,
  },
  USDC: {
    symbol: 'USDC',
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
    icon: <UsdcIcon />,
  },
};

const DEV_FEE_ACCOUNT = 'BA41shbM2qjy5G9LZQhHkhfu4GDfipMWGzgYz2cb3v3f';

export default function App() {
  const [inputAmount, setInputAmount] = useState<string>('0.1');
  const [outputAmount, setOutputAmount] = useState<string>('');
  const [quoteData, setQuoteData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchQuote = async () => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      setOutputAmount('');
      setQuoteData(null);
      return;
    }

    setLoading(true);
    try {
      const lamports = Math.floor(parseFloat(inputAmount) * Math.pow(10, TOKENS.SOL.decimals));

      const res = await axios.get('https://quote-api.jup.ag/v6/quote', {
        params: {
          inputMint: TOKENS.SOL.mint,
          outputMint: TOKENS.USDC.mint,
          amount: lamports,
          slippageBps: 50,
          platformFeeBps: 10,
        },
      });

      setQuoteData(res.data);
      const outAmountValue = (
        parseInt(res.data.outAmount) / Math.pow(10, TOKENS.USDC.decimals)
      ).toFixed(4);
      setOutputAmount(outAmountValue);
    } catch (err) {
      console.error('Error fetching quote:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuote();
    }, 500);

    return () => clearTimeout(timer);
  }, [inputAmount]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0E17] text-white p-4 font-sans">
      <div className="w-full max-w-md bg-[#131B2E] border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.15)] rounded-3xl p-6 backdrop-blur-xl">
        
        {/* هدر */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <SolPulseLogo />
            <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              SolPulse
            </span>
          </div>
        </div>

        {/* ورودی SOL */}
        <div className="bg-[#1C2640] p-4 rounded-2xl mb-2 border border-slate-700/50">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>پرداخت می‌کنید</span>
          </div>
          <div className="flex justify-between items-center">
            <input
              type="number"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              placeholder="0.0"
              className="bg-transparent text-2xl font-bold outline-none w-2/3 text-white"
            />
            <div className="bg-[#2A3756] px-3 py-1.5 rounded-xl flex items-center gap-2 text-sm font-semibold">
              {TOKENS.SOL.icon}
              SOL
            </div>
          </div>
        </div>

        {/* فلش */}
        <div className="flex justify-center -my-3 relative z-10">
          <div className="bg-[#131B2E] border border-cyan-500/30 p-2 rounded-xl text-cyan-400">
            ↓
          </div>
        </div>

        {/* ورودی USDC */}
        <div className="bg-[#1C2640] p-4 rounded-2xl mt-2 mb-4 border border-slate-700/50">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>دریافت می‌کنید</span>
          </div>
          <div className="flex justify-between items-center">
            <input
              type="text"
              readOnly
              value={loading ? 'در حال محاسبه...' : outputAmount}
              placeholder="0.0"
              className="bg-transparent text-2xl font-bold outline-none w-2/3 text-gray-300"
            />
            <div className="bg-[#2A3756] px-3 py-1.5 rounded-xl flex items-center gap-2 text-sm font-semibold">
              {TOKENS.USDC.icon}
              USDC
            </div>
          </div>
        </div>

        {/* کارمزد */}
        <div className="space-y-1 text-xs text-gray-400 px-1 mb-6">
          <div className="flex justify-between">
            <span>کارمزد توسعه‌دهنده</span>
            <span className="text-emerald-400 font-medium">0.1%</span>
          </div>
        </div>

        <button
          className="w-full py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 font-bold text-black rounded-2xl shadow-lg transition-all"
        >
          انجام سواپ (Swap)
        </button>

      </div>
    </div>
  );
}
