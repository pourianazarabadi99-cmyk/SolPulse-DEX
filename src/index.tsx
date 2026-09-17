import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { VersionedTransaction } from '@solana/web3.js';
import axios from 'axios';

// لیست توکن‌های استاندارد
const TOKENS = {
  SOL: {
    symbol: 'SOL',
    mint: 'So11111111111111111111111111111111111111112',
    decimals: 9,
    icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
  },
  USDC: {
    symbol: 'USDC',
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
    icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
  },
};

// آدرس کیف پول شما جهت دریافت کارمزد توسعه‌دهنده (0.1%)
const DEV_FEE_ACCOUNT = 'BA41shbM2qjy5G9LZQhHkhfu4GDfipMWGzgYz2cb3v3f';

export default function SolPulseSwap() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [inputAmount, setInputAmount] = useState<string>('0.1');
  const [outputAmount, setOutputAmount] = useState<string>('');
  const [quoteData, setQuoteData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [swapping, setSwapping] = useState<boolean>(false);

  // ۱. دریافت Quote با کارمزد 10 BPS (معادل ۰.۱ درصد)
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
          slippageBps: 50, // 0.5% Slippage
          platformFeeBps: 10, // 0.1% Developer Fee
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

  // ۲. انجام سواپ و واریز مستقیم کارمزد به ولت شما
  const handleSwap = async () => {
    if (!publicKey) {
      alert('لطفاً ابتدا کیف پول خود را وصل کنید.');
      return;
    }
    if (!quoteData) {
      alert('لطفاً منتظر دریافت قیمت بمانید.');
      return;
    }

    setSwapping(true);
    try {
      const swapRes = await axios.post('https://quote-api.jup.ag/v6/swap', {
        quoteResponse: quoteData,
        userPublicKey: publicKey.toBase58(),
        wrapAndUnwrapSol: true,
        feeAccount: DEV_FEE_ACCOUNT,
      });

      const { swapTransaction } = swapRes.data;
      const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

      const txid = await sendTransaction(transaction, connection);
      alert(`تراکنش با موفقیت انجام شد!\nکد پیگیری: ${txid}`);
    } catch (err: any) {
      console.error('Swap execution error:', err);
      alert('خطا در انجام سواپ: ' + (err.message || 'مشکل در شبکه'));
    } finally {
      setSwapping(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0E17] text-white p-4 font-sans">
      <div className="w-full max-w-md bg-[#131B2E] border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.15)] rounded-3xl p-6 backdrop-blur-xl">
        
        {/* هدر برند SolPulse */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              SolPulse
            </span>
          </div>
          <WalletMultiButton className="!bg-cyan-500/10 !border !border-cyan-500/30 !rounded-xl !h-9 !text-xs" />
        </div>

        {/* بخش ورودی توکن مبدا (SOL) */}
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
              <img src={TOKENS.SOL.icon} className="w-5 h-5 rounded-full" alt="SOL" />
              SOL
            </div>
          </div>
        </div>

        {/* آیکون فلش */}
        <div className="flex justify-center -my-3 relative z-10">
          <div className="bg-[#131B2E] border border-cyan-500/30 p-2 rounded-xl text-cyan-400">
            ↓
          </div>
        </div>

        {/* بخش ورودی توکن مقصد (USDC) */}
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
              <img src={TOKENS.USDC.icon} className="w-5 h-5 rounded-full" alt="USDC" />
              USDC
            </div>
          </div>
        </div>

        {/* جزئیات کارمزد */}
        <div className="space-y-1 text-xs text-gray-400 px-1 mb-6">
          <div className="flex justify-between">
            <span>Developer Fee</span>
            <span className="text-emerald-400 font-medium">0.1%</span>
          </div>
        </div>

        {/* دکمه اصلی سواپ */}
        <button
          onClick={handleSwap}
          disabled={swapping || loading || !publicKey}
          className="w-full py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 font-bold text-black rounded-2xl shadow-lg transition-all transform active:scale-95 disabled:opacity-50"
        >
          {!publicKey
            ? 'ابتدا کیف پول را وصل کنید'
            : swapping
            ? 'در حال انجام تراکنش...'
            : 'انجام سواپ (Swap)'}
        </button>

      </div>
    </div>
  );
}
