# 🤖 Comuty - AI 커뮤니티 플랫폼

> AI 정보 공유를 중심으로 한 현대적인 커뮤니티 플랫폼

## 📋 프로젝트 개요

Comuty는 AI 관련 정보와 지식을 공유하고, 사용자들이 소통할 수 있는 커뮤니티 플랫폼입니다. 
React와 TypeScript를 기반으로 제작되었으며, Tailwind CSS와 shadcn/ui를 활용하여 현대적이고 직관적인 UI/UX를 제공합니다.

## ✨ 주요 기능 (예정)

- 🔐 **사용자 인증**: 이메일/비밀번호 및 Google 소셜 로그인
- 📝 **게시글 시스템**: 글 작성, 수정, 삭제 및 정렬 기능
- 💬 **댓글 시스템**: 실시간 댓글 작성 및 수정
- ❤️ **좋아요 & 북마크**: 게시글 좋아요 및 북마크 기능
- 💬 **1:1 채팅**: 실시간 메시지 송수신
- 🎨 **반응형 디자인**: 모바일, 태블릿, 데스크탑 최적화
- 🌙 **다크 모드**: 라이트/다크 테마 지원

## 🛠 기술 스택

### Frontend
- **React 18** - 사용자 인터페이스 라이브러리
- **TypeScript** - 정적 타입 검사
- **Tailwind CSS** - 유틸리티 퍼스트 CSS 프레임워크
- **shadcn/ui** - 재사용 가능한 UI 컴포넌트
- **Zustand** - 상태 관리 라이브러리
- **React Router** - 클라이언트 사이드 라우팅
- **Lucide React** - 아이콘 라이브러리

### Backend (예정)
- **Firebase Authentication** - 사용자 인증
- **Firestore** - NoSQL 데이터베이스
- **Firebase Realtime Database** - 실시간 채팅
- **Firebase Storage** - 파일 저장
- **Firebase Hosting** - 웹 호스팅

## 🚀 설치 및 실행

### 1. 레포지토리 클론
```bash
git clone https://github.com/your-username/comuty.git
cd comuty
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속하여 확인할 수 있습니다.

## 📁 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── ui/             # shadcn/ui 기본 컴포넌트
│   ├── layout/         # 레이아웃 컴포넌트
│   ├── posts/          # 게시글 관련 컴포넌트
│   └── common/         # 공통 컴포넌트
├── pages/              # 페이지 컴포넌트
├── lib/                # 유틸리티 및 설정
├── store/              # 상태 관리 (Zustand)
├── types/              # TypeScript 타입 정의
└── styles/             # 글로벌 스타일
```

## 🎨 현재 구현된 UI 컴포넌트

### 레이아웃
- **Header**: 로고, 검색바, 네비게이션, 프로필 메뉴
- **Sidebar**: 메뉴 네비게이션, 인기 주제, 추천 사용자
- **BottomNav**: 모바일용 하단 네비게이션

### UI 컴포넌트
- **Button**: 다양한 variant와 size 지원
- **Card**: 컨텐츠 카드 레이아웃
- **Avatar**: 사용자 프로필 이미지

### 페이지
- **HomePage**: 메인 페이지 (게시글 목록, 인기 주제, 커뮤니티 현황)
- **PostCard**: 게시글 카드 (좋아요, 댓글, 북마크, 공유 기능)

## 📱 반응형 디자인

- **Mobile**: < 768px (하단 네비게이션, 모바일 최적화)
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px (사이드바, 데스크톱 레이아웃)

## 🎯 다음 단계

1. **Firebase 연동**: 백엔드 서비스 연결
2. **라우팅 구현**: React Router를 통한 페이지 네비게이션
3. **인증 시스템**: 사용자 로그인/회원가입 기능
4. **게시글 CRUD**: 실제 데이터 처리 로직
5. **실시간 채팅**: WebSocket을 통한 실시간 통신
6. **검색 기능**: 게시글 및 사용자 검색
7. **알림 시스템**: 실시간 알림 기능

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 연락처

프로젝트에 대한 질문이나 제안사항이 있으시면 언제든 연락해 주세요!

---

**Built with ❤️ by Comuty Team**
