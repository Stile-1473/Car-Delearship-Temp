/**
 * Finance Calculator
 * Deposit / term / rate / trade-in sliders with a live monthly repayment,
 * and a one-tap WhatsApp finance application for the chosen figures.
 */

import React, { useState } from 'react';
import { FaWhatsapp, FaCalculator, FaExchangeAlt } from 'react-icons/fa';
import { FINANCE_DEFAULTS, monthlyPayment, usd } from '../utils/finance';
import { whatsappLink, carTitle, carUrl } from '../utils/whatsapp';

const FinanceCalculator = ({ car }) => {
  const price = car.price || 0;
  const [depositPct, setDepositPct] = useState(FINANCE_DEFAULTS.depositPct);
  const [months, setMonths] = useState(FINANCE_DEFAULTS.months);
  const [rate, setRate] = useState(FINANCE_DEFAULTS.annualRate);
  const [tradeIn, setTradeIn] = useState(0);
  const [showTradeIn, setShowTradeIn] = useState(false);

  const deposit = (price * depositPct) / 100;
  const principal = Math.max(price - deposit - tradeIn, 0);
  const monthly = monthlyPayment(principal, rate, months);
  const totalPaid = monthly * months + deposit + tradeIn;
  const interest = Math.max(totalPaid - price, 0);

  const applyMessage =
    `Hi ZimCar, I'd like to apply for finance on the ${carTitle(car)} (${usd(price)}).\n` +
    `Deposit: ${usd(deposit)} (${depositPct}%)\n` +
    (tradeIn ? `Trade-in value: ${usd(tradeIn)}\n` : '') +
    `Term: ${months} months @ ${rate}%\n` +
    `Estimated repayment: ${usd(monthly)}/month\n${carUrl(car)}`;

  const tradeInMessage =
    `Hi ZimCar, I'd like a trade-in valuation towards the ${carTitle(car)}.\n` +
    `My car (make, model, year, mileage): \nCondition: \nI'll send photos here.`;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2 text-gray-900">
        <FaCalculator className="text-amber-500" />
        <h2 className="text-lg font-semibold">Finance calculator</h2>
      </div>

      <div className="mt-4 rounded-xl bg-gray-900 p-5 text-white">
        <div className="text-xs uppercase tracking-wider text-white/60">Estimated repayment</div>
        <div className="mt-1 text-4xl font-extrabold">
          {usd(monthly)}
          <span className="text-base font-medium text-white/60"> /month</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-white/70">
          <div>
            <div className="text-white/50">Financed</div>
            <div className="font-semibold text-white">{usd(principal)}</div>
          </div>
          <div>
            <div className="text-white/50">Interest</div>
            <div className="font-semibold text-white">{usd(interest)}</div>
          </div>
          <div>
            <div className="text-white/50">Total cost</div>
            <div className="font-semibold text-white">{usd(totalPaid)}</div>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        <div>
          <div className="flex justify-between text-sm">
            <label htmlFor="deposit" className="font-medium text-gray-800">Deposit</label>
            <span className="text-gray-600">
              {usd(deposit)} ({depositPct}%)
            </span>
          </div>
          <input
            id="deposit"
            type="range"
            min="10"
            max="70"
            step="5"
            value={depositPct}
            onChange={(e) => setDepositPct(Number(e.target.value))}
            className="mt-2 w-full accent-amber-500"
          />
        </div>

        <div>
          <div className="text-sm font-medium text-gray-800">Term</div>
          <div className="mt-2 grid grid-cols-6 gap-1">
            {FINANCE_DEFAULTS.terms.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setMonths(t)}
                className={`rounded-md border py-1.5 text-sm ${months === t ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-700 hover:border-gray-400'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="mt-1 text-right text-xs text-gray-500">months</div>
        </div>

        <div>
          <div className="flex justify-between text-sm">
            <label htmlFor="rate" className="font-medium text-gray-800">Interest rate</label>
            <span className="text-gray-600">{rate}% p.a.</span>
          </div>
          <input
            id="rate"
            type="range"
            min="5"
            max="30"
            step="0.5"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="mt-2 w-full accent-amber-500"
          />
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowTradeIn((v) => !v)}
            className="flex items-center gap-2 text-sm font-medium text-gray-800 hover:text-black"
          >
            <FaExchangeAlt className="text-amber-500" /> {showTradeIn ? 'Remove trade-in' : 'Add a trade-in'}
          </button>
          {showTradeIn && (
            <div className="mt-2 rounded-lg border border-dashed border-gray-300 p-3">
              <label htmlFor="tradein" className="text-xs text-gray-600">Your car&apos;s expected value (USD)</label>
              <input
                id="tradein"
                type="number"
                min="0"
                step="500"
                value={tradeIn || ''}
                placeholder="e.g. 8000"
                onChange={(e) => setTradeIn(Math.max(0, Number(e.target.value) || 0))}
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
              />
              <a
                href={whatsappLink(tradeInMessage)}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-green-700 hover:underline"
              >
                <FaWhatsapp /> Not sure? Get a free valuation on WhatsApp
              </a>
            </div>
          )}
        </div>
      </div>

      <a
        href={whatsappLink(applyMessage)}
        target="_blank"
        rel="noreferrer"
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700"
      >
        <FaWhatsapp className="text-lg" /> Apply for finance on WhatsApp
      </a>
      <p className="mt-3 text-[11px] leading-snug text-gray-500">
        Estimate only. Final rates, deposit and approval depend on the lender and your credit profile.
      </p>
    </div>
  );
};

export default FinanceCalculator;
