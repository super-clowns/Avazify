import React, { useState } from 'react';
import RevenueWidget from '../../components/dashboard/RevenueWidget';

export default function SubscriptionManagement() {
  const [silverPrice, setSilverPrice] = useState<number>(49000);
  const [goldPrice, setGoldPrice] = useState<number>(89000);

  const handleUpdatePrices = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`قیمت‌ها با موفقیت در سیستم به‌روزرسانی شدند!\nاشتراک نقره‌ای: ${silverPrice} تومان\nاشتراک طلایی: ${goldPrice} تومان`);
  };

  return (
    <div style={{ direction: 'rtl', padding: '10px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fafafa' }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px' }}>پنل کنترل پویای قیمت‌ها (ویژه مدیر)</h3>
        <form onSubmit={handleUpdatePrices} style={{ display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>قیمت اشتراک نقره‌ای (تومان):</label>
            <input 
              type="number" 
              value={silverPrice} 
              onChange={(e) => setSilverPrice(Number(e.target.value))}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>قیمت اشتراک طلایی (تومان):</label>
            <input 
              type="number" 
              value={goldPrice} 
              onChange={(e) => setGoldPrice(Number(e.target.value))}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', outline: 'none' }}
            />
          </div>
          <button type="submit" style={{ backgroundColor: '#0070f3', color: 'white', border: 'none', padding: '9px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            به‌روزرسانی قیمت‌ها
          </button>
        </form>
      </div>

      <div>
        <h3 style={{ marginBottom: '15px' }}>نمودارها و گزارش‌های درآمدی سامانه</h3>
        
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <RevenueWidget 
            title="درآمد حاصل از اشتراک نقره‌ای (ماه جاری)"
            amount="۲۴,۵۰۰,۰۰۰ تومان"
            borderColor="#1890ff"
            backgroundColor="#e6f7ff"
            textColor="#1890ff"
          />
          <RevenueWidget 
            title="درآمد حاصل از اشتراک طلایی (ماه جاری)"
            amount="۶۱,۸۰۰,۰۰۰ تومان"
            borderColor="#fadb14"
            backgroundColor="#feffe6"
            textColor="#d4b106"
          />
          <RevenueWidget 
            title="مجموع درآمدهای ناخالص پلتفرم"
            amount="۸۶,۳۰۰,۰۰۰ تومان"
            borderColor="#52c41a"
            backgroundColor="#f6ffed"
            textColor="#52c41a"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '40px', padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
          <div style={{ width: '150px', height: '150px' }}>
            <svg viewBox="0 0 32 32" style={{ transform: 'rotate(-90deg)', borderRadius: '50%' }}>
              <circle r="16" cx="16" cy="16" fill="transparent" stroke="#ccc" strokeWidth="32" strokeDasharray="50 100" strokeDashoffset="0" />
              <circle r="16" cx="16" cy="16" fill="transparent" stroke="#1890ff" strokeWidth="32" strokeDasharray="30 100" strokeDashoffset="-50" />
              <circle r="16" cx="16" cy="16" fill="transparent" stroke="#fadb14" strokeWidth="32" strokeDasharray="20 100" strokeDashoffset="-80" />
            </svg>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ margin: '0 0 5px 0' }}>توزیع کاربران سامانه بر اساس سطح اشتراک:</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <span style={{ width: '12px', height: '12px', backgroundColor: '#ccc', borderRadius: '50%' }}></span>
              <span>اشتراک پایه (رایگان): ۵۰٪</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <span style={{ width: '12px', height: '12px', backgroundColor: '#1890ff', borderRadius: '50%' }}></span>
              <span>اشتراک نقره‌ای: ۳۰٪</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <span style={{ width: '12px', height: '12px', backgroundColor: '#fadb14', borderRadius: '50%' }}></span>
              <span>اشتراک طلایی: ۲۰٪</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}