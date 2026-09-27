// apps/owner-portal/src/pages/Dashboard/Dashboard.tsx
import { useState } from 'react';
import type { Approval } from '../../context/OwnerContext';
import StatusRow from './components/StatusRow';
import FinancialPanel from './components/FinancialPanel';
import UrgentApprovals from './components/UrgentApprovals';
import PropertyStrip from './components/PropertyStrip';
import UpdatesFeed from './components/UpdatesFeed';
import PMServiceHealth from './components/PMServiceHealth';
import DashboardModals, { type DashboardModal } from './components/DashboardModals';
import './Dashboard.css';

export default function Dashboard() {
  const [modal, setModal] = useState<DashboardModal>(null);
  const [declineTarget, setDeclineTarget] = useState<Approval | null>(null);
  const [detailTarget, setDetailTarget] = useState<Approval | null>(null);

  return (
    <div className="page-body">
      <StatusRow />

      <div className="middle-row">
        <FinancialPanel />
        <UrgentApprovals
          onDecline={setDeclineTarget}
          onViewDetail={setDetailTarget}
        />
      </div>

      <PropertyStrip
        onInvitePM={() => setModal('invite-pm')}
        onRequestAccess={() => setModal('request-access')}
      />

      <div className="bottom-row">
        <UpdatesFeed />
        <PMServiceHealth />
      </div>

      <DashboardModals
        modal={modal}
        onCloseModal={() => setModal(null)}
        declineTarget={declineTarget}
        onCloseDecline={() => setDeclineTarget(null)}
        detailTarget={detailTarget}
        onCloseDetail={() => setDetailTarget(null)}
      />
    </div>
  );
}
