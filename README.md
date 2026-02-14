# 텍사스 홀덤 게임

React.js와 Next.js를 사용하여 만든 온라인 텍사스 홀덤 게임입니다.

## 🎮 게임 특징

- **7명 플레이**: 사용자 1명 + AI 플레이어 6명
- **실제 홀덤 룰**: 프리플랍, 플랍, 턴, 리버, 쇼다운 단계 구현
- **족보 판정**: 로얄 플러시부터 하이카드까지 모든 족보 지원
- **AI 플레이어**: 최고 수익을 위한 전략적 플레이
- **아름다운 UI**: 타원형 홀덤 테이블과 직관적인 인터페이스

## 🚀 시작하기

### 사전 요구사항

- Node.js 18 이상
- pnpm (설치: `npm install -g pnpm`)

### 설치

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 게임을 시작하세요.

### 빌드

```bash
# 프로덕션 빌드
pnpm build

# 빌드된 앱 실행
pnpm start
```

## 📖 게임 방법

1. **게임 설정**
   - 스몰 블라인드(SB) 가격 설정
   - 빅 블라인드(BB) 가격 설정
   - 1인당 시작 자본 입력

2. **게임 시작**
   - 딜러 버튼(D)이 시계방향으로 이동
   - D 다음 플레이어가 SB, 그 다음이 BB
   - 각 플레이어에게 2장의 카드 배분

3. **배팅 라운드**
   - **삥 (체크)**: 배팅하지 않고 넘어가기
   - **콜**: 현재 배팅 금액에 맞추기
   - **하프 (레이즈)**: 배팅 금액 올리기
   - **다이 (폴드)**: 게임 포기하기

4. **게임 단계**
   - **프리플랍**: 카드 배분 후 첫 배팅
   - **플랍**: 커뮤니티 카드 3장 오픈
   - **턴**: 커뮤니티 카드 1장 추가
   - **리버**: 커뮤니티 카드 1장 추가
   - **쇼다운**: 최종 카드 오픈 및 승자 결정

## 🎯 족보 순위

1. 로얄 플러시 (Royal Flush)
2. 스트레이트 플러시 (Straight Flush)
3. 포카드 (Four of a Kind)
4. 풀하우스 (Full House)
5. 플러시 (Flush)
6. 스트레이트 (Straight)
7. 트리플 (Three of a Kind)
8. 투페어 (Two Pair)
9. 원페어 (One Pair)
10. 하이카드 (High Card)

## 🛠️ 기술 스택

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: GitHub Pages

## 📁 프로젝트 구조

```
holdem/
├── app/                  # Next.js 앱 라우터
│   ├── page.tsx         # 메인 페이지
│   ├── layout.tsx       # 레이아웃
│   └── globals.css      # 전역 스타일
├── components/           # React 컴포넌트
│   ├── GameTable.tsx    # 게임 테이블
│   ├── PlayerSeat.tsx   # 플레이어 좌석
│   ├── CardDisplay.tsx  # 카드 표시
│   ├── CommunityCards.tsx # 커뮤니티 카드
│   ├── BettingControls.tsx # 배팅 컨트롤
│   └── SetupScreen.tsx  # 게임 설정 화면
├── utils/               # 유틸리티 함수
│   ├── cards.ts         # 카드 관련 로직
│   ├── handEvaluator.ts # 족보 판정
│   └── gameLogic.ts     # 게임 로직
├── types/               # TypeScript 타입
│   └── game.ts         # 게임 관련 타입
└── .github/             # GitHub Actions
    └── workflows/
        └── deploy.yml   # 배포 워크플로우
```

## 🚢 배포

이 프로젝트는 GitHub Pages를 통해 자동 배포됩니다.

1. GitHub 저장소에 코드 푸시
2. GitHub Actions가 자동으로 빌드 및 배포
3. `Settings > Pages`에서 배포 URL 확인

### 수동 배포

```bash
# 빌드
pnpm build

# out 폴더의 내용을 GitHub Pages에 배포
```

## 📝 라이선스

이 프로젝트는 개인 사용 및 학습 목적으로 자유롭게 사용할 수 있습니다.

## 🤝 기여

버그 리포트나 기능 제안은 이슈로 등록해주세요.

## 📧 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 이슈를 생성해주세요.

---

즐거운 홀덤 게임 되세요! 🎰♠️♥️♦️♣️

