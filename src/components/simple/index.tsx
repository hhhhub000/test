import React from 'react';

// 基本的なボタンコンポーネント（型エラー対応版）
interface SimpleButtonProps {
  children: string;
  onClick: () => void;
  className?: string;
}

export const SimpleButton: React.FC<SimpleButtonProps> = ({ children, onClick, className = '' }) => {
  return React.createElement(
    'button',
    {
      onClick,
      className: `px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${className}`,
    },
    children
  );
};

// シンプルなプログレスバー
interface SimpleProgressProps {
  current: number;
  max: number;
  label?: string;
}

export const SimpleProgress: React.FC<SimpleProgressProps> = ({ current, max, label }) => {
  const percentage = Math.min((current / max) * 100, 100);
  
  return React.createElement(
    'div',
    { className: 'w-full' },
    label && React.createElement(
      'div',
      { className: 'text-sm text-gray-200 mb-1' },
      `${label}: ${current}/${max}`
    ),
    React.createElement(
      'div',
      { className: 'w-full bg-gray-700 rounded h-2' },
      React.createElement('div', {
        className: 'h-2 bg-blue-500 rounded',
        style: { width: `${percentage}%` }
      })
    )
  );
};