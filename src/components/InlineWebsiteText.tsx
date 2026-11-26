'use client';
import { useEffect, useRef, useState } from 'react';
import './inline-website-text.css';

type Props = { as?: 'h1' | 'h2' | 'p' | 'div'; value: string; label: string; className?: string; multiline?: boolean; maxLength?: number; placeholder?: string; onChange?: (text: string) => void };
function plainText(element: HTMLElement): string {
  function read(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent || '';
    if (node.nodeName === 'BR') return '\n';
    let text = '';
    for (const child of Array.from(node.childNodes)) {
      const block = child.nodeName === 'DIV' || child.nodeName === 'P';
      if (block && text && !text.endsWith('\n')) text += '\n';
      text += read(child);
      if (block && child.nextSibling && !text.endsWith('\n')) text += '\n';
    }
    return text;
  }
  return read(element);
}
export default function InlineWebsiteText({ as: Tag = 'p', value, label, className = '', multiline = false, maxLength = 2500, placeholder = 'Click to add text', onChange }: Props) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const ref = useRef<HTMLElement>(null);
  const before = useRef(value);
  const initial = useRef(value);
  useEffect(() => {
    const element = ref.current;
    if (element && document.activeElement !== element && element.textContent !== value) element.textContent = value;
  }, [value, onChange]);
  if (!onChange || !hydrated) return <Tag className={className}>{value}</Tag>;
  return <Tag ref={ref as React.Ref<never>} className={className + ' inline-website-text'} contentEditable="plaintext-only" suppressContentEditableWarning
    role="textbox" aria-label={label} aria-multiline={multiline} tabIndex={0} data-placeholder={placeholder} title={'Edit ' + label}
    onFocus={() => { before.current = value; }}
    onInput={event => { const text = plainText(event.currentTarget).replace(/\r/g, '').slice(0, maxLength); onChange(multiline ? text : text.replace(/\n/g, ' ')); }}
    onBlur={event => { const text = plainText(event.currentTarget).replace(/\r/g, '').slice(0, maxLength).trim(); event.currentTarget.textContent = text; onChange(text); }}
    onKeyDown={event => {
      if (event.key === 'Enter' && !multiline) { event.preventDefault(); event.currentTarget.blur(); }
      if (event.key === 'Escape') { event.preventDefault(); event.currentTarget.textContent = before.current; onChange(before.current); event.currentTarget.blur(); }
    }}>{initial.current}</Tag>;
}
