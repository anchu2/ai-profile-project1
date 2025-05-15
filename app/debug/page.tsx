'use client';
import React from 'react';

const DebugPage: React.FC = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>🔍 Debug Info</h1>
      <pre>
        {JSON.stringify(
          {
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          },
          null,
          2
        )}
      </pre>
    </div>
  );
};

export default DebugPage;
