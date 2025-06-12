import React from 'react';

export const TestPage: React.FC = () => {
  const checkEnvironment = () => {
    const envVars = {
      'VITE_FIREBASE_API_KEY': import.meta.env.VITE_FIREBASE_API_KEY,
      'VITE_FIREBASE_AUTH_DOMAIN': import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      'VITE_FIREBASE_PROJECT_ID': import.meta.env.VITE_FIREBASE_PROJECT_ID,
      'VITE_FIREBASE_STORAGE_BUCKET': import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      'VITE_FIREBASE_MESSAGING_SENDER_ID': import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      'VITE_FIREBASE_APP_ID': import.meta.env.VITE_FIREBASE_APP_ID,
    };

    return envVars;
  };

  const envVars = checkEnvironment();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">시스템 상태 확인</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Firebase 환경 변수</h2>
          <div className="space-y-3">
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between border-b pb-2">
                <span className="font-mono text-sm text-gray-600">{key}</span>
                <span className={`text-sm px-2 py-1 rounded ${
                  value && !value.includes('your_') 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {value && !value.includes('your_') ? '✅ 설정됨' : '❌ 미설정'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">React 정보</h2>
          <div className="space-y-2">
            <p><strong>React 버전:</strong> {React.version}</p>
            <p><strong>개발 모드:</strong> {import.meta.env.DEV ? '예' : '아니오'}</p>
            <p><strong>모드:</strong> {import.meta.env.MODE}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">브라우저 콘솔 로그</h2>
          <p className="text-gray-600">
            개발자 도구(F12)를 열어서 Console 탭에서 오류를 확인해주세요.
          </p>
          <button
            onClick={() => {
              console.log('🔍 테스트 로그:', {
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href,
                env: import.meta.env
              });
            }}
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            콘솔에 테스트 로그 출력
          </button>
        </div>
      </div>
    </div>
  );
}; 