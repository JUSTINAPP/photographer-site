import Link from 'next/link';
import FresnelMark from '@/components/FresnelMark';
import { ActionLink, SubmitButton } from '@/components/ActionFeedback';
import { requirePlatformAdmin } from '@/lib/platform-admin';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Fresnel Studios admin', robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requirePlatformAdmin();
  return <div className="studio-shell platform-admin">
    <aside className="studio-sidebar">
      <Link className="studio-identity" href="/admin"><FresnelMark /> Fresnel Studios</Link>
      <span className="studio-owner">Platform admin</span>
      <nav aria-label="Admin navigation">
        <ActionLink className="studio-nav" href="/admin">Studios</ActionLink>
        <ActionLink className="studio-nav" href="/admin/prospects">Prospects</ActionLink>
        <ActionLink className="studio-nav" href="/admin/pricing">Pricing</ActionLink>
        <ActionLink className="studio-nav" href="/admin/support">Support activity</ActionLink>
      </nav>
      <div className="sidebar-bottom studio-sidebar-footer">
        <ActionLink href="/studio">My studio →</ActionLink>
        <Link href="/" target="_blank">Public website ↗</Link>
        <span>{user.email}</span>
        <form action="/auth/signout" method="post"><SubmitButton>Sign out</SubmitButton></form>
      </div>
    </aside>
    <div className="studio-body"><main className="studio-main">{children}</main></div>
  </div>;
}
