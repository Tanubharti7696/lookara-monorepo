import { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { VD as MOCK_VD } from '../data/vendors';

export const VendorsContext = createContext({
  VD: MOCK_VD,
  loading: true,
});

export const useVendors = () => useContext(VendorsContext);

export function VendorsProvider({ children }) {
  const [VD, setVD] = useState(MOCK_VD);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/v1/vendors')
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          const liveVD = {};
          data.data.forEach(v => {
            liveVD[v.id] = {
              name: v.name,
              sub: `${v.trade_count > 0 ? 'Multi-trade' : 'Specialty'} · ${v.tier}`,
              conf: v.org_status === 'active' ? 'HIGH CONFIDENCE' : 'MODERATE',
              confCls: v.org_status === 'active' ? 'high' : 'mod',
              confSub: v.org_status === 'active' ? 'Preferred Vendor' : 'Pending Verification',
              avatarBg: 'rgba(59,130,246,.12)',
              avatarColor: '#60a5fa',
              avail: v.org_status === 'active' ? '● Available Now' : '● Offline',
              availColor: v.org_status === 'active' ? 'var(--success)' : 'var(--slate)',
              ah: 'No',
              emg: 'Not eligible',
              emgColor: 'var(--slate)',
              jobs: `${v.task_count} in progress`,
              rel: v.rating > 0 ? (v.rating * 20).toString() : '85',
              relColor: 'var(--success)',
              sla: '95%',
              resp: '30m',
              coverage: 'All Properties',
              phone: v.contact_phone || '—',
              email: v.contact_email || '—',
              region: 'Local',
              trade: 'General',
              team: '1 technicians',
              since: '2023',
              trust: v.rating > 0 ? (v.rating * 20) : 85,
              slaReliability: 95,
              acceptanceRate: 90,
              reworkRate: 2,
              avgResponseMin: 30,
              paymentDisputes: 0,
              lastTen: [1,1,1,1,1,1,1,1,1,1],
            };
          });
          
          // Merge mock data for demo visual richness, overwrite with live vendors
          setVD({ ...MOCK_VD, ...liveVD });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <VendorsContext.Provider value={{ VD, loading }}>
      {children}
    </VendorsContext.Provider>
  );
}
