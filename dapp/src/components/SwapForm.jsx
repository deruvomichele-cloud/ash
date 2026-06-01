import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const SwapForm = ({ signer, ashSwap, swapType = 'buy' }) => {
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);

  const isBuy = swapType === 'buy';
  const inputLabel = isBuy ? 'USDC' : 'ASH';
  const outputLabel = isBuy ? 'ASH' : 'USDC';

  // Calcola importo output
  useEffect(() => {
    const calculateOutput = async () => {
      if (!inputAmount || !signer) return;

      try {
        const inputWei = ethers.parseUnits(
          inputAmount,
          isBuy ? 6 : 18
        );

        let result;
        if (isBuy) {
          result = await ashSwap.quoteAshForUsdc(inputWei);
        } else {
          result = await ashSwap.quoteUsdcForAsh(inputWei);
        }

        if (result) {
          const outputFormatted = ethers.formatUnits(
            result,
            isBuy ? 18 : 6
          );
          setOutputAmount(parseFloat(outputFormatted).toFixed(2));
        }
      } catch (err) {
        setError('Errore nel calcolo della quota');
      }
    };

    const timer = setTimeout(calculateOutput, 500);
    return () => clearTimeout(timer);
  }, [inputAmount, swapType, ashSwap, signer]);

  const handleSwap = async () => {
    if (!inputAmount || !signer) return;

    try {
      setLoading(true);
      setError(null);
      setTxHash(null);

      const inputWei = ethers.parseUnits(
        inputAmount,
        isBuy ? 6 : 18
      );

      let receipt;
      if (isBuy) {
        receipt = await ashSwap.swapUsdcForAsh(inputWei);
      } else {
        receipt = await ashSwap.swapAshForUsdc(inputWei);
      }

      setTxHash(receipt.transactionHash);
      setInputAmount('');
      setOutputAmount('');
    } catch (err) {
      setError(err.message || 'Errore durante lo swap');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6">
        {isBuy ? '💰 Compra ASH' : '💸 Vendi ASH'}
      </h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Importo {inputLabel}
        </label>
        <input
          type="number"
          value={inputAmount}
          onChange={(e) => setInputAmount(e.target.value)}
          placeholder="0.00"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>

      <div className="flex justify-center mb-4">
        <div className="text-2xl">↓</div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Riceverai {outputLabel}
        </label>
        <div className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-700">
          {outputAmount || '0.00'}
        </div>
      </div>

      <div className="bg-blue-50 p-3 rounded-lg mb-6 text-sm">
        <p className="text-gray-600">
          Tasso fisso: 1 USDC = 7 ASH
        </p>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {txHash && (
        <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-sm">
          ✅ Scambio completato!<br />
          <a
            href={`https://sepolia.basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Visualizza transazione
          </a>
        </div>
      )}

      <button
        onClick={handleSwap}
        disabled={loading || !inputAmount}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
      >
        {loading ? '⏳ In corso...' : `Scambia ${inputLabel}`}
      </button>
    </div>
  );
};

export default SwapForm;
