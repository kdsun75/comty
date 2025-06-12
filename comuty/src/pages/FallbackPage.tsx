import React from 'react';
import { AlertCircle, Settings, ExternalLink } from 'lucide-react';

export const FallbackPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-10 h-10 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔧 초기 설정이 필요합니다
          </h1>
          <p className="text-gray-600">
            Cumputy 애플리케이션을 사용하기 위해 Firebase 설정을 완료해주세요.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                현재 상태: Firebase 미설정
              </h3>
              <p className="text-blue-800 text-sm">
                애플리케이션이 정상적으로 동작하려면 Firebase 프로젝트와 환경 변수 설정이 필요합니다.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center text-gray-700">
            <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
              1
            </span>
            <span>Firebase Console에서 새 프로젝트 생성</span>
          </div>
          <div className="flex items-center text-gray-700">
            <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
              2
            </span>
            <span>웹 앱 추가 및 설정 정보 복사</span>
          </div>
          <div className="flex items-center text-gray-700">
            <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
              3
            </span>
            <span>프로젝트 폴더에 .env 파일 생성</span>
          </div>
          <div className="flex items-center text-gray-700">
            <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
              4
            </span>
            <span>Authentication, Firestore, Storage 활성화</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="https://console.firebase.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium text-center hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            Firebase Console 열기
          </a>
          <button
            onClick={() => window.location.href = '/test'}
            className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium text-center hover:bg-gray-300 transition-colors"
          >
            시스템 상태 확인
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">💡 빠른 팁</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• SETUP.md 파일에서 자세한 설정 가이드를 확인하세요</li>
            <li>• .env 파일의 모든 VITE_FIREBASE_ 변수를 설정해야 합니다</li>
            <li>• 설정 완료 후 개발 서버를 재시작해주세요</li>
          </ul>
        </div>
      </div>
    </div>
  );
}; 