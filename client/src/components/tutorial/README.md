# LumoStage 튜토리얼 시스템

## 개요

신규 사용자가 5분 이내에 LumoStage의 핵심 기능을 익힐 수 있도록 돕는 7단계 인터랙티브 튜토리얼 시스템입니다.

## 파일 구조

```
client/src/components/tutorial/
├── TutorialProvider.jsx      # Context API 및 상태 관리
├── TutorialOverlay.jsx        # 메인 오케스트레이터
├── TutorialDialog.jsx         # Welcome & Complete Dialog
├── TutorialTooltip.jsx        # 단계별 안내 Tooltip
├── TutorialSpotlight.jsx      # 특정 영역 강조 효과
├── KeyboardShortcutsCard.jsx  # 단축키 목록 카드
├── index.js                   # Export 통합
└── README.md                  # 이 파일
```

## 7단계 튜토리얼 구조

### Step 0: Welcome
- **타입**: Dialog
- **내용**: 환영 메시지 및 튜토리얼 시작 안내
- **액션**: "시작하기" 또는 "나중에 할게요"

### Step 1: 3D Viewport 조작
- **타입**: Spotlight + Tooltip
- **타겟**: `canvas` 요소
- **내용**: 마우스 드래그, 줌 실습 안내
- **완료 조건**: "다음" 버튼 클릭

### Step 2: 조명 추가
- **타입**: Spotlight + Tooltip
- **타겟**: `[data-tutorial='add-light-button']`
- **내용**: 조명 추가 버튼 클릭 유도
- **완료 조건**: 조명 추가 감지 또는 "다음" 버튼 클릭

### Step 3: 조명 속성 조정
- **타입**: Spotlight + Tooltip
- **타겟**: `[data-tutorial='light-controls']`
- **내용**: 슬라이더로 조명 속성 조정 안내
- **완료 조건**: "다음" 버튼 클릭

### Step 4: 마네킹 포즈 변경
- **타입**: Spotlight + Tooltip
- **타겟**: `[data-tutorial='mannequin-tab']`
- **내용**: 마네킹 탭 클릭 및 포즈 변경 안내
- **완료 조건**: "다음" 버튼 클릭

### Step 5: 프로젝트 저장
- **타입**: Spotlight + Tooltip
- **타겟**: `[data-tutorial='save-button']`
- **내용**: 저장 버튼 클릭 안내
- **완료 조건**: "완료" 버튼 클릭

### Step 6: Complete
- **타입**: Dialog
- **내용**: 축하 메시지 + 단축키 미리보기
- **액션**: "시작하기" 버튼으로 완료

## 주요 기능

### 1. localStorage 기반 상태 저장
- `lumostage_tutorial_completed`: 튜토리얼 완료 여부
- `lumostage_tutorial_skipped`: 튜토리얼 건너뛰기 여부

### 2. 키보드 단축키
- `ESC`: 튜토리얼 건너뛰기
- `?`: 단축키 도움말 카드 열기/닫기
- `H`: 튜토리얼 다시 시작

### 3. 자동 진행
- 조명 추가 감지 시 Step 3으로 자동 이동 (2초 지연)

### 4. 반응형 Tooltip 위치 계산
- 타겟 요소의 위치에 따라 Tooltip 방향 자동 조정
- 화면 밖으로 나가지 않도록 자동 보정

### 5. Spotlight Effect
- 특정 UI 요소를 제외한 모든 영역 어둡게 처리
- 펄스 애니메이션으로 주의 집중

## 사용 방법

### EditorPage에 통합 (이미 완료됨)

```jsx
import { TutorialProvider, TutorialOverlay } from '@/components/tutorial';

function EditorPage() {
  return (
    <TutorialProvider>
      {/* 기존 에디터 컴포넌트들 */}
      <TutorialOverlay />
    </TutorialProvider>
  );
}
```

### 튜토리얼 타겟 요소 지정

컴포넌트에 `data-tutorial` 속성 추가:

```jsx
<Button data-tutorial="add-light-button">추가</Button>
<div data-tutorial="light-controls">...</div>
<TabsTrigger data-tutorial="mannequin-tab">마네킹</TabsTrigger>
<Button data-tutorial="save-button">저장</Button>
```

### 프로그래매틱 제어

```jsx
import { useTutorial } from '@/components/tutorial';

function MyComponent() {
  const { startTutorial, skipTutorial, nextStep, currentStep } = useTutorial();

  return (
    <div>
      <button onClick={startTutorial}>튜토리얼 시작</button>
      <button onClick={skipTutorial}>건너뛰기</button>
      <button onClick={nextStep}>다음 단계</button>
      <p>현재 단계: {currentStep}</p>
    </div>
  );
}
```

## API Reference

### TutorialProvider

**Props**: 없음

**Context 값**:
- `isActive: boolean` - 튜토리얼 활성화 여부
- `currentStep: number` - 현재 단계 (0-6)
- `isCompleted: boolean` - 튜토리얼 완료 여부
- `isSkipped: boolean` - 튜토리얼 건너뛰기 여부
- `showShortcuts: boolean` - 단축키 카드 표시 여부
- `TUTORIAL_STEPS: object` - 단계 상수
- `startTutorial: () => void` - 튜토리얼 시작
- `nextStep: () => void` - 다음 단계로 이동
- `goToStep: (step: number) => void` - 특정 단계로 이동
- `skipTutorial: () => void` - 튜토리얼 건너뛰기
- `completeTutorial: () => void` - 튜토리얼 완료
- `toggleShortcuts: () => void` - 단축키 카드 토글

### TutorialSpotlight

**Props**:
- `targetSelector: string` - CSS 선택자
- `isActive: boolean` - 활성화 여부
- `padding: number` - 강조 영역 여백 (기본값: 8)
- `borderRadius: number` - 모서리 둥글기 (기본값: 8)

### TutorialTooltip

**Props**:
- `targetSelector: string` - CSS 선택자
- `title: string` - 제목
- `description: string` - 설명
- `position: 'top' | 'bottom' | 'left' | 'right'` - 위치 (기본값: 'right')
- `isActive: boolean` - 활성화 여부
- `onNext: () => void` - 다음 버튼 핸들러
- `onSkip: () => void` - 건너뛰기 버튼 핸들러
- `nextLabel: string` - 다음 버튼 레이블 (기본값: '다음')
- `showSkip: boolean` - 건너뛰기 버튼 표시 여부 (기본값: true)

### TutorialDialog

**Props**:
- `open: boolean` - Dialog 열림 여부
- `onOpenChange: (open: boolean) => void` - 상태 변경 핸들러
- `type: 'welcome' | 'complete'` - Dialog 타입
- `onStart: () => void` - 시작하기 핸들러 (welcome)
- `onSkip: () => void` - 나중에 핸들러 (welcome)
- `onClose: () => void` - 닫기 핸들러 (complete)

### KeyboardShortcutsCard

**Props**:
- `isOpen: boolean` - 카드 표시 여부
- `onClose: () => void` - 닫기 핸들러

## 테스트 방법

### 1. 첫 방문 시나리오 테스트

```bash
# localStorage 초기화
localStorage.removeItem('lumostage_tutorial_completed');
localStorage.removeItem('lumostage_tutorial_skipped');

# 에디터 페이지 새로고침
# 자동으로 Welcome Dialog 표시되어야 함
```

### 2. 튜토리얼 진행 테스트

1. Welcome Dialog에서 "시작하기" 클릭
2. Step 1: 캔버스 드래그 후 "다음" 클릭
3. Step 2: "조명 추가" 버튼 클릭 (자동 진행)
4. Step 3: 슬라이더 조작 후 "다음" 클릭
5. Step 4: "마네킹" 탭 클릭 후 "다음" 클릭
6. Step 5: "저장" 버튼 위치 확인 후 "완료" 클릭
7. Complete Dialog에서 "시작하기" 클릭

### 3. 건너뛰기 테스트

- 튜토리얼 중 `ESC` 키 입력
- localStorage에 `lumostage_tutorial_skipped` 저장 확인
- 새로고침 시 튜토리얼 미표시 확인

### 4. 단축키 테스트

- `?` 키로 단축키 카드 열기/닫기
- `H` 키로 튜토리얼 재시작
- localStorage 초기화 확인

### 5. 반응형 테스트

- 윈도우 리사이즈 시 Tooltip 위치 재계산 확인
- Spotlight가 올바른 요소를 강조하는지 확인

## 알려진 이슈 및 개선 사항

### 현재 구현됨
- ✅ 7단계 튜토리얼 플로우
- ✅ localStorage 기반 상태 저장
- ✅ 키보드 단축키 (`ESC`, `?`, `H`)
- ✅ 반응형 Tooltip 위치 계산
- ✅ Spotlight 효과
- ✅ 조명 추가 자동 감지

### 추후 개선 가능
- ⏳ 마네킹 포즈 변경 자동 감지
- ⏳ 프로젝트 저장 자동 감지
- ⏳ 튜토리얼 진행률 표시 (Step X/7)
- ⏳ 애니메이션 성능 최적화 (will-change CSS)
- ⏳ 모바일/태블릿 대응 (현재는 데스크톱 전용)

## 성능 고려사항

### 최적화 적용 사항
1. **MutationObserver 사용**: DOM 변화 감지로 동적 요소 위치 추적
2. **조건부 렌더링**: isActive 체크로 불필요한 컴포넌트 렌더링 방지
3. **Framer Motion**: GPU 가속 애니메이션
4. **CSS transform**: 위치 변경 시 reflow 방지

### 주의사항
- Spotlight는 `position: fixed`와 `box-shadow`를 사용하므로 성능에 영향 가능
- 복잡한 씬에서는 MutationObserver가 빈번하게 호출될 수 있음

## 접근성 (Accessibility)

### 구현된 기능
- ✅ 키보드 네비게이션 (ESC로 건너뛰기)
- ✅ ARIA 레이블 (`aria-label` on buttons)
- ✅ 시맨틱 HTML (Dialog, Button 컴포넌트)
- ✅ 충분한 색상 대비 (Gray-900 배경, White 텍스트)

### 추가 개선 가능
- ⏳ 스크린 리더 지원 (`aria-describedby`)
- ⏳ Focus trap (Dialog 내부)
- ⏳ 단계 진행 상황 읽어주기

## 참고 문서

- PRD: `/Users/kimsman/project/2025/ajou-pwd-2025/lumo-stage/docs/PRD.md` (Phase 4 섹션)
- 아키텍처: `/Users/kimsman/project/2025/ajou-pwd-2025/lumo-stage/docs/architecture/LumoStage-Architecture.md`
- Zustand Store: `/Users/kimsman/project/2025/ajou-pwd-2025/lumo-stage/client/src/store/editorStore.js`
