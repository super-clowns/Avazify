import React, { useState } from 'react';
import TicketsAndAuth from './TicketsAndAuth';
import Auditing from './Auditing';
import SubscriptionManagement from './SubscriptionManagement';

type Role = 'support' | 'admin';
type SubSection = 'tickets' | 'auditing' | 'subscriptions';

export default function DashboardLayout() {
  const [userRole, setUserRole] = useState<Role>('admin');
  const [currentSection, setCurrentSection] = useState<SubSection>('tickets');

  const handleRoleChange = (role: Role) => {
    setUserRole(role);
    if (role === 'support') {
      setCurrentSection('tickets');
    }
  };

  return (
    <div style={{ direction: 'rtl', fontFamily: 'Tahoma, sans-serif', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      
      <div style={{ backgroundColor: '#001529', color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '18px' }}>داشبورد جامع مدیریت Avazify</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: '#aaa' }}>نقش فرضی شبیه‌سازی (برای تست فاز اول):</span>
          <select 
            value={userRole} 
            onChange={(e) => handleRoleChange(e.target.value as Role)}
            style={{ padding: '6px', borderRadius: '4px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            <option value="admin">مدیر سامانه (دسترسی کامل)</option>
            <option value="support">پشتیبان سامانه (دسترسی محدود)</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 62px)' }}>
        
        <div style={{ width: '240px', backgroundColor: '#ffffff', borderLeft: '1px solid #e8e8e8', padding: '15px 0' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li 
              onClick={() => setCurrentSection('tickets')}
              style={{ padding: '12px 24px', cursor: 'pointer', backgroundColor: currentSection === 'tickets' ? '#e6f7ff' : 'transparent', color: currentSection === 'tickets' ? '#1890ff' : '#333', fontWeight: currentSection === 'tickets' ? 'bold' : 'normal', borderLeft: currentSection === 'tickets' ? '4px solid #1890ff' : 'none' }}
            >
              تیکت‌ها و احراز هویت
            </li>
            
            {userRole === 'admin' && (
              <>
                <li 
                  onClick={() => setCurrentSection('auditing')}
                  style={{ padding: '12px 24px', cursor: 'pointer', backgroundColor: currentSection === 'auditing' ? '#e6f7ff' : 'transparent', color: currentSection === 'auditing' ? '#1890ff' : '#333', fontWeight: currentSection === 'auditing' ? 'bold' : 'normal', borderLeft: currentSection === 'auditing' ? '4px solid #1890ff' : 'none' }}
                >
                  امور حسابرسی و پاداش‌ها
                </li>
                <li 
                  onClick={() => setCurrentSection('subscriptions')}
                  style={{ padding: '12px 24px', cursor: 'pointer', backgroundColor: currentSection === 'subscriptions' ? '#e6f7ff' : 'transparent', color: currentSection === 'subscriptions' ? '#1890ff' : '#333', fontWeight: currentSection === 'subscriptions' ? 'bold' : 'normal', borderLeft: currentSection === 'subscriptions' ? '4px solid #1890ff' : 'none' }}
                >
                  مدیریت اشتراک‌ها و گزارشات
                </li>
              </>
            )}
          </ul>
        </div>

        <div style={{ flex: 1, padding: '24px', backgroundColor: '#ffffff', margin: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          {currentSection === 'tickets' && <TicketsAndAuth />}
          {currentSection === 'auditing' && <Auditing userRole={userRole} />}
          {currentSection === 'subscriptions' && <SubscriptionManagement />}
        </div>

      </div>
    </div>
  );
}