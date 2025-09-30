import React, { useState } from 'react';
import { ClipboardIcon, CheckIcon } from './icons';

interface CodePreviewProps {
  title: string;
  code: string;
  language?: string;
}

const CodePreview: React.FC<CodePreviewProps> = ({ title, code, language = 'html' }) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-md border border-gray-200">
      <div className="flex justify-between items-center p-3 border-b bg-gray-50 rounded-t-md">
        <h3 className="text-base font-medium text-gray-800">{title}</h3>
        <button
          onClick={copyToClipboard}
          className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 text-gray-600 flex items-center text-xs transition-colors"
          aria-label="Copy code to clipboard"
        >
          {isCopied ? <CheckIcon /> : <ClipboardIcon />}
          <span className="ml-2">{isCopied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <div className="p-4 bg-slate-900 text-white rounded-b-md">
        <pre className="text-sm overflow-auto whitespace-pre-wrap"><code className={`language-${language}`}>{code}</code></pre>
      </div>
    </div>
  );
};

export default CodePreview;
