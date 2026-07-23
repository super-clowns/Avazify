import { useState } from 'react';
import { mockPricing, mockRevenueSummary } from '../data/mockFinance';
import { formatToman } from '../utils/catalogPresentation';

export default function PriceControlPanel() {
  const [silver, setSilver] = useState(mockPricing.silver);
  const [gold, setGold] = useState(mockPricing.gold);

  const updatePrices = () => {
    window.alert(`قیمت‌ها به‌روزرسانی شد.\nنقره‌ای: ${silver}\nطلایی: ${gold}`);
  };

  return (
    <div className="price-control-panel">
      <div className="content-card">
        <h3>قیمت‌گذاری پویا</h3>
        <div className="form-row">
          <label>
            قیمت اشتراک نقره‌ای (تومان)
            <input type="number" value={silver} onChange={(e) => setSilver(Number(e.target.value))} />
          </label>
          <label>
            قیمت اشتراک طلایی (تومان)
            <input type="number" value={gold} onChange={(e) => setGold(Number(e.target.value))} />
          </label>
          <button type="button" onClick={updatePrices}>
            به‌روزرسانی قیمت‌ها
          </button>
        </div>
      </div>

      <div className="content-card">
        <h3>گزارش درآمدی سامانه</h3>
        <div className="artist-stat-row">
          <article>
            <span>درآمد نقره‌ای</span>
            <strong>{formatToman(mockRevenueSummary.silverRevenue)}</strong>
          </article>
          <article>
            <span>درآمد طلایی</span>
            <strong>{formatToman(mockRevenueSummary.goldRevenue)}</strong>
          </article>
          <article>
            <span>مجموع درآمد</span>
            <strong>{formatToman(mockRevenueSummary.totalRevenue)}</strong>
          </article>
        </div>

        <ul className="distribution-list">
          {mockRevenueSummary.distribution.map((item) => (
            <li key={item.tier}>
              {item.tier} — {item.percentage}٪
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}