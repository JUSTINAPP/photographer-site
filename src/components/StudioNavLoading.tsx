'use client';

import { LoaderCircle } from 'lucide-react';
import { useLinkStatus } from 'next/link';

export default function StudioNavLoading() {
  const { pending } = useLinkStatus();

  return <span className="studio-nav-loading" role="status">
    {pending && <LoaderCircle className="account-spinner" size={16} aria-hidden="true" />}
    {pending && <span className="studio-nav-loading-label">Loading page</span>}
  </span>;
}
