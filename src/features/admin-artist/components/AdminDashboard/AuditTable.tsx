import { useState } from 'react';

interface AuditingProps {
  userRole: 'support' | 'admin';
}

interface FinancialRecord {
  id: string;
  artistName: string;
  uniqueListeners: number;
  totalStreams: number;
  rewardAmount: string;
  paymentStatus: 'pending' | 'settled';
}

export default function Auditing({ userRole }: AuditingProps) {
  const [records, setRecords] = useState<FinancialRecord[]>([
    { id: 'ART-990', artistName: 'همایون شجریان', uniqueListeners: 45000, totalStreams: 230000, rewardAmount: '۴۵,۰۰۰,۰۰۰ تومان', paymentStatus: 'pending' },
    { id: 'ART-991', artistName: 'علیرضا قربانی', uniqueListeners: 62000, totalStreams: 410000, rewardAmount: '۸۲,۰۰۰,۰۰۰ تومان', paymentStatus: 'settled' },
  ]);

  const handleSettlement = (id: string) => {
    if (userRole !== 'admin') {
      alert('خطا: دسترسی به دکمه تسویه حساب منحصراً محدود به مدیر سامانه است!');
      return;
    }
    setRecords(records.map(r => r.id === id ? { ...r, paymentStatus: 'settled' } : r));
    alert('وضعیت پرداخت به «تسویه شده» تغییر یافت.');
  };

  return (
    <div style={{ direction: 'rtl', padding: '10px' }}>
      <h3 style={{ marginBottom: '20px' }}>جدول محاسبات مالی و پاداش ماهانه هنرمندان</h3>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: '12px' }}>شناسه تخصصی</th>
            <th style={{ padding: '12px' }}>نام هنرمند</th>
            <th style={{ padding: '12px' }}>شنوندگان منحصربه‌فرد (ماه)</th>
            <th style={{ padding: '12px' }}>کل استریم‌ها</th>
            <th style={{ padding: '12px' }}>مبلغ پاداش</th>
            <th style={{ padding: '12px' }}>وضعیت پرداخت</th>
            <th style={{ padding: '12px' }}>عملیات</th>
          </tr>
        </thead>
        <tbody>
          {records.map(record => (
            <tr key={record.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}>{record.id}</td>
              <td style={{ padding: '12px' }}>{record.artistName}</td>
              <td style={{ padding: '12px' }}>{record.uniqueListeners.toLocaleString()}</td>
              <td style={{ padding: '12px' }}>{record.totalStreams.toLocaleString()}</td>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>{record.rewardAmount}</td>
              <td style={{ padding: '12px', color: record.paymentStatus === 'settled' ? 'green' : 'orange' }}>
                {record.paymentStatus === 'pending' ? 'در انتظار پرداخت' : 'تسویه شده'}
              </td>
              <td style={{ padding: '12px' }}>
                <button
                  onClick={() => handleSettlement(record.id)}
                  disabled={record.paymentStatus === 'settled'}
                  style={{
                    backgroundColor: record.paymentStatus === 'settled' ? '#ccc' : userRole === 'admin' ? '#52c41a' : '#ffafaf',
                    color: record.paymentStatus === 'settled' ? '#666' : 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: record.paymentStatus === 'settled' ? 'not-allowed' : 'pointer'
                  }}
                  title={userRole !== 'admin' ? 'مخصوص مدیر سامانه' : ''}
                >
                  {record.paymentStatus === 'settled' ? 'تسویه شده' : 'تایید تسویه حساب'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}