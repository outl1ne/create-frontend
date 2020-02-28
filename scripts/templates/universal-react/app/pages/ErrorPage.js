import React from 'react';

export default function ErrorPage({ status }) {
  const messages = {
    '404': 'Page not found',
  };

  return (
    <h1 style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
      {messages[status] || 'Server error'}
    </h1>
  );
}
