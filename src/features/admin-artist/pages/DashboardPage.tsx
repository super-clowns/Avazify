import { useState } from 'react';
import { useAuth } from '../../auth-profile/hooks/useAuth';

import ArtistRequestsTable from '../components/ArtistRequestsTable';
import SupportTicketsPanel from '../components/SupportTicketsPanel';
import FinanceAuditTable from '../components/FinanceAuditTable';
import PriceControlPanel from '../components/PriceControlPanel';

type Section = 'requests' | 'tickets' | 'audit' | 'pricing';

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const [section, setSection] = useState<Section>('requests');

  const isAdmin = currentUser?.role === 'admin';

  return (
    <section className="phase-page dashboard-page">
      <div className="page-heading">
        <div>
          <p className="page-eyebrow">Support / Admin Module</p>
          <h1>داشبورد {isAdmin ? 'مدیر سامانه' : 'پشتیبان'}</h1>
        </div>
      </div>

      <div className="dashboard-layout">
        <nav className="dashboard-sidebar">
          <button className={section === 'requests' ? 'active' : ''} onClick={() => setSection('requests')}>
            درخواست‌های تایید هنرمندان
          </button>
          <button className={section === 'tickets' ? 'active' : ''} onClick={() => setSection('tickets')}>
            تیکت‌های پشتیبانی
          </button>

          {isAdmin ? (
            <>
              <button className={section === 'audit' ? 'active' : ''} onClick={() => setSection('audit')}>
                حسابرسی و پاداش‌ها
              </button>
              <button className={section === 'pricing' ? 'active' : ''} onClick={() => setSection('pricing')}>
                قیمت‌گذاری و گزارش درآمد
              </button>
            </>
          ) : null}
        </nav>

        <div className="dashboard-content">
          {section === 'requests' && <ArtistRequestsTable />}
          {section === 'tickets' && <SupportTicketsPanel />}
          {section === 'audit' && isAdmin && <FinanceAuditTable canSettle={isAdmin} />}
          {section === 'pricing' && isAdmin && <PriceControlPanel />}
        </div>
      </div>
    </section>
  );
}