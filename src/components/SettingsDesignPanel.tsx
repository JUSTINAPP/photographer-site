'use client';

import { useEffect, useRef, type ReactNode } from 'react';

export default function SettingsDesignPanel({ children }: { children: ReactNode }) {
  const panel = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    function followLink() {
      if (panel.current && ['#design', '#page-editor', '#website-preview'].includes(window.location.hash)) {
        panel.current.open = true;
        requestAnimationFrame(() => document.getElementById(window.location.hash.slice(1))?.scrollIntoView());
      }
    }
    followLink();
    window.addEventListener('hashchange', followLink);
    return () => window.removeEventListener('hashchange', followLink);
  }, []);
  return <details id="design" ref={panel} className="studio-panel settings-design">
    <summary><span><h2>Website design</h2><p>Choose a template and adjust the typography, layout and content with a live preview.</p></span><span className="primary-button">Open the design editor</span></summary>
    {children}
  </details>;
}
