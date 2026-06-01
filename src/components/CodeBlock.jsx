import { useState } from 'react';

export default function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div style={{ position: 'relative' }}>
      <pre className="code-block">{code}</pre>
      <button
        onClick={copy}
        style={{
          position: 'absolute', top: 6, right: 6,
          background: copied ? '#16a34a' : '#374151',
          color: 'white', border: 'none', borderRadius: 4,
          padding: '2px 8px', fontSize: '0.68rem', cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}
