// apps/public-portal/src/components/PublicLayout/PublicLayout.tsx
import { Outlet } from 'react-router-dom';
import PublicNav from '../PublicNav/PublicNav';
import PublicFooter from '../PublicFooter/PublicFooter';

export default function PublicLayout() {
  return (
    <div className="pp-shell">
      <PublicNav />
      <main className="pp-main">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}