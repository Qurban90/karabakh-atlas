import { type ReactNode } from 'react';

/** Bottom sheet with backdrop — the mobile-native way to preview map pins. */
export function Sheet({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true">
        <div className="sheet__grab" />
        {children}
      </div>
    </>
  );
}
