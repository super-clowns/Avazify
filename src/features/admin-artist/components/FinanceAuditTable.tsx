import { useState } from 'react';
import { mockFinanceRecords } from '../data/mockFinance';
import { formatCompactNumber, formatToman } from '../utils/catalogPresentation';
import type { ArtistFinanceRecord } from '../types';

interface FinanceAuditTableProps {
  canSettle: boolean;
}

export default function FinanceAuditTable({ canSettle }: FinanceAuditTableProps) {
  const [records, setRecords] = useState<ArtistFinanceRecord[]>(mockFinanceRecords);

  const settle = (id: string) => {
    if (!canSettle) return;
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, settlementStatus: 'settled' } : r)),
    );
  };

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>هنرمند</th>
          <th>شنوندگان منحصربه‌فرد</th>
          <th>کل استریم‌ها</th>
          <th>پاداش</th>
          <th>وضعیت پرداخت</th>
          <th>عملیات</th>
        </tr>
      </thead>
      <tbody>
        {records.map((record) => (
          <tr key={record.id}>
            <td>
              {record.artistName}
              <br />
              <small dir="ltr">{record.artistId}</small>
            </td>
            <td>{formatCompactNumber(record.uniqueListeners)}</td>
            <td>{formatCompactNumber(record.totalStreams)}</td>
            <td>{formatToman(record.rewardAmount)}</td>
            <td>
              <span className={`status-pill status-pill-${record.settlementStatus}`}>
                {record.settlementStatus === 'pending' ? 'در انتظار پرداخت' : 'تسویه شده'}
              </span>
            </td>
            <td>
              <button
                type="button"
                disabled={record.settlementStatus === 'settled' || !canSettle}
                onClick={() => settle(record.id)}
              >
                تایید تسویه حساب
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}