'use client';

import React, { Suspense } from 'react';
import AiProfileGenerator from '@/components/AiProfileGenerator';

interface EnvVariables {
  firebaseApiKey: string | undefined;
  firebaseAuthDomain: string | undefined;
  firebaseProjectId: string | undefined;
  firebaseStorageBucket: string | undefined;
  firebaseMessagingSenderId: string | undefined;
  firebaseAppId: string | undefined;
  hasReplicateToken: boolean;
}

export default function Home(): React.JSX.Element {
  // 환경변수 값들을 객체로 모음
  const envVariables: EnvVariables = {
    firebaseApiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    firebaseStorageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    firebaseMessagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    hasReplicateToken: !!process.env.REPLICATE_API_TOKEN,
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          AI 프로필 이미지 생성기
        </h1>
        
        {/* Environment Variables Display */}
        <div className="mb-8 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">환경변수 상태</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(envVariables, null, 2)}
          </pre>
        </div>

        {/* Main Component */}
        <Suspense fallback={
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        }>
          <AiProfileGenerator />
        </Suspense>
      </div>
    </main>
  );
} 