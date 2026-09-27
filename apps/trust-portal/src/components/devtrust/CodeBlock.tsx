// src/components/devtrust/CodeBlock.tsx
import { useCopy } from '../../hooks/useCopy';

export default function CodeBlock({ lang, children }: { lang: string; children: string }) {
  const { copied, copy } = useCopy();
  return (
    <div className="dt-code">
      <div className="dt-code__head">
        <span className="dt-code__lang">{lang}</span>
        <button
          type="button"
          className={`dt-code__copy${copied ? ' is-copied' : ''}`}
          onClick={() => copy(children)}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="dt-code__body"><code>{children}</code></pre>
    </div>
  );
}