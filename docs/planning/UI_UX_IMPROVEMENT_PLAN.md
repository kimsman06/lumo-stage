# LumoStage UI/UX 개선 계획

**작성일**: 2025-11-03
**기준 문서**: `docs/design/design-strategy.md`, `docs/design/ui-spacing-system.md`
**목표**: 3D 프로그램 경험이 없는 사용자도 쉽게 사용할 수 있는 전문적인 조명 시뮬레이션 툴 구축

---

## Phase 1: 튜토리얼 시스템 (최우선 - 신규 사용자 온보딩)

### 1.1 설계 철학

**목표**: 첫 사용자가 5분 이내에 핵심 기능을 이해하고 첫 번째 조명 씬을 만들 수 있도록 지원

**디자인 원칙**:
- **점진적 공개 (Progressive Disclosure)**: 한 번에 하나의 개념만 소개
- **즉각적 피드백**: 튜토리얼 단계마다 실시간 3D 변화 확인
- **비간섭적 (Non-intrusive)**: 언제든 건너뛰기 가능, 필요시 재시작 가능
- **컨텍스트 기반**: 사용자가 특정 기능을 처음 사용할 때 자동 안내

### 1.2 튜토리얼 흐름 설계

#### Step 1: 환영 및 인터페이스 소개 (Welcome)
**트리거**: 에디터 페이지 첫 방문 시 자동 실행

**UI 컴포넌트**: Dialog (Full Screen Overlay)
- 반투명 어두운 배경 (`bg-black/80`)
- 중앙에 밝은 카드 (`bg-studio-900 border-primary-500`)
- Lumo 아이콘 + "LumoStage에 오신 것을 환영합니다" 헤딩

**콘텐츠**:
```
제목: LumoStage에 오신 것을 환영합니다
설명: 웹 기반 3D 조명 시뮬레이션 툴로 영화, 영상 제작을 위한 조명 디자인을 쉽게 만들어보세요.

[시작하기] [나중에] 버튼
```

**인터랙션**:
- "시작하기" → Step 2로 이동
- "나중에" → Dialog 닫기, localStorage에 `tutorialSkipped: true` 저장
- ESC 키 → "나중에"와 동일

---

#### Step 2: 3D 뷰포트 조작 안내
**트리거**: Step 1에서 "시작하기" 선택 시

**UI 컴포넌트**: Spotlight Effect (실제 Spotlight가 아닌 UI Highlight)
- 3D 뷰포트 영역 강조 (나머지 화면 어둡게 처리)
- 우측 하단에 Popover 형태 안내 패널

**콘텐츠**:
```
제목: 1. 3D 뷰포트 조작법
설명:
- 좌클릭 드래그: 씬 회전 (OrbitControls)
- 우클릭 드래그: 카메라 이동 (Pan)
- 스크롤: 확대/축소 (Zoom)

[직접 해보기]
3D 뷰포트를 마우스로 조작해보세요 →
```

**인터랙션**:
- 사용자가 실제로 마우스 드래그/스크롤 수행 시 → 자동으로 Step 3로 전환
- 감지 로직: OrbitControls의 `change` 이벤트 리스닝
- 5초 이상 조작 없으면 "다음" 버튼 표시

---

#### Step 3: 조명 추가하기
**트리거**: Step 2 완료 시

**UI 컴포넌트**: Tooltip + Arrow Indicator
- 우측 EditorPanel의 "조명" 탭 강조
- "조명 추가" 버튼에 애니메이션 강조 효과 (펄스 효과)
- 버튼 위에 Tooltip 표시

**콘텐츠**:
```
2. 조명 추가하기
조명 탭에서 [+] 버튼을 눌러 첫 조명을 추가해보세요.
Point Light, Spot Light, Directional Light 중 선택할 수 있습니다.

→ [조명 추가 버튼 강조]
```

**인터랙션**:
- 사용자가 조명 추가 시 → 자동으로 Step 4로 전환
- 추가된 조명이 3D 씬에 실시간으로 나타남
- 감지 로직: Zustand store의 `lights` 배열 변경 감지

---

#### Step 4: 조명 속성 조정하기
**트리거**: Step 3에서 조명 추가 시

**UI 컴포넌트**: Popover (LightCard 위에 표시)
- 새로 추가된 LightCard 컴포넌트 강조
- 카드 우측에 설명 Popover

**콘텐츠**:
```
3. 조명 제어하기
- Position 슬라이더: 조명의 위치 조정 (X, Y, Z 축)
- Color: 조명 색상 선택
- Intensity: 조명 밝기 조정

슬라이더를 움직여서 조명을 조정해보세요 →
```

**인터랙션**:
- 사용자가 슬라이더를 조작하면 → 3D 씬에서 조명 위치/색상/밝기 실시간 변경
- 3회 이상 슬라이더 조작 시 → 자동으로 Step 5로 전환

---

#### Step 5: 마네킹 포즈 변경
**트리거**: Step 4 완료 시

**UI 컴포넌트**: Tab Switcher 강조 + Popover
- "마네킹" 탭에 펄스 효과
- 탭 전환 시 프리셋 버튼들 강조

**콘텐츠**:
```
4. 마네킹 포즈 조정
마네킹 탭에서 포즈 프리셋을 선택하거나, 개별 관절을 조정할 수 있습니다.

[T-pose] [A-pose] [Standing] 등 프리셋 버튼 클릭 →
```

**인터랙션**:
- 사용자가 프리셋 버튼 클릭 시 → 마네킹 포즈 즉시 변경
- 포즈 변경 감지 시 → Step 6으로 전환

---

#### Step 6: 프로젝트 저장
**트리거**: Step 5 완료 시

**UI 컴포넌트**: Header 강조 + Tooltip
- 우측 상단 "저장" 버튼에 강조 효과
- 버튼 아래 Tooltip 표시

**콘텐츠**:
```
5. 프로젝트 저장하기
작업한 조명 씬을 저장하려면 우측 상단 [저장] 버튼을 클릭하세요.
단축키: Ctrl+S (Windows) / Cmd+S (Mac)

[저장] 버튼 강조 →
```

**인터랙션**:
- 사용자가 저장 버튼 클릭 시 → Step 7로 전환
- 저장 성공 Toast 메시지 표시

---

#### Step 7: 완료 및 단축키 안내
**트리거**: Step 6 완료 시

**UI 컴포넌트**: Dialog (중앙)
- 축하 메시지 + 단축키 요약 카드

**콘텐츠**:
```
튜토리얼 완료!
축하합니다! 이제 LumoStage의 기본 기능을 모두 익히셨습니다.

주요 단축키:
- W: 이동 모드 (Translate)
- E: 회전 모드 (Rotate)
- ESC: 선택 해제
- Ctrl+S: 저장

[단축키 카드 보기] [에디터로 돌아가기]
```

**인터랙션**:
- "단축키 카드 보기" → 단축키 전체 목록 Dialog 표시 (아래 참조)
- "에디터로 돌아가기" → 튜토리얼 종료, localStorage에 `tutorialCompleted: true` 저장

---

### 1.3 컴포넌트 구조

```
components/tutorial/
├── TutorialProvider.jsx          # Context Provider (튜토리얼 상태 관리)
├── TutorialOverlay.jsx            # 전체 화면 반투명 오버레이
├── TutorialDialog.jsx             # Step 1, 7에 사용되는 중앙 Dialog
├── TutorialSpotlight.jsx          # 특정 영역 강조 (Highlight 효과)
├── TutorialTooltip.jsx            # 화살표가 있는 설명 Tooltip
├── TutorialStepIndicator.jsx     # 우측 하단 "1/7" 진행 상황 표시
└── KeyboardShortcutsCard.jsx     # 단축키 요약 카드 (재사용 가능)
```

**상태 관리**: Context API + localStorage
```javascript
// TutorialContext.js
const TutorialContext = createContext({
  currentStep: 0,              // 현재 튜토리얼 단계
  isActive: false,             // 튜토리얼 활성화 여부
  startTutorial: () => {},     // 튜토리얼 시작
  nextStep: () => {},          // 다음 단계로
  skipTutorial: () => {},      // 튜토리얼 건너뛰기
  completeTutorial: () => {},  // 튜토리얼 완료
});
```

---

### 1.4 Shadcn/ui 컴포넌트 활용

| 컴포넌트 | 용도 | 커스터마이징 |
|---------|------|-------------|
| `Dialog` | Welcome (Step 1), 완료 화면 (Step 7) | `DialogOverlay` 불투명도 증가 (`bg-black/90`) |
| `Popover` | 설명 말풍선 (Step 2, 4, 5, 6) | 화살표 위치 조정, `bg-primary-600` 배경 |
| `Tooltip` | 버튼/영역 강조 시 짧은 힌트 | 기본 스타일 유지 |
| `Badge` | 진행 상황 표시 ("1/7", "2/7" 등) | `bg-primary-500` 강조 색상 |
| `Button` | "다음", "건너뛰기", "완료" 버튼 | `variant="default"` (primary) |
| `Card` | 단축키 카드, 설명 패널 | `bg-studio-800` 어두운 배경 |

**애니메이션**: Framer Motion 활용
```javascript
// 강조 효과 (펄스 애니메이션)
<motion.div
  animate={{ scale: [1, 1.05, 1], opacity: [1, 0.8, 1] }}
  transition={{ repeat: Infinity, duration: 2 }}
>
  <Button>조명 추가</Button>
</motion.div>

// Spotlight 효과 (페이드인)
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.3 }}
>
  <TutorialSpotlight />
</motion.div>
```

---

### 1.5 단축키 시스템 확장

**기존 단축키** (EditorPage.jsx):
- `Ctrl+S` / `Cmd+S`: 저장
- `ESC`: 선택 해제
- `W`: 이동 모드
- `E`: 회전 모드

**추가 단축키**:
- `?`: 단축키 카드 표시 (KeyboardShortcutsCard Dialog)
- `H`: 튜토리얼 다시 보기
- `T`: 조명 탭으로 이동
- `M`: 마네킹 탭으로 이동
- `C`: 카메라 탭으로 이동
- `Delete` / `Backspace`: 선택된 조명 삭제

**KeyboardShortcutsCard 컴포넌트**:
- Dialog 형태로 전체 단축키 목록 표시
- 카테고리별 그룹화:
  - 일반: 저장, 단축키 보기
  - 뷰포트: 이동, 회전, 선택
  - 네비게이션: 탭 전환
  - 편집: 삭제, 복사 (추후 확장)

---

### 1.6 접근성 고려사항

**키보드 네비게이션**:
- 튜토리얼 Dialog에서 Tab 키로 버튼 간 이동 가능
- Enter 키로 "다음" 버튼 활성화
- ESC 키로 튜토리얼 건너뛰기

**스크린 리더 지원**:
- 모든 튜토리얼 단계에 `aria-label` 추가
- 진행 상황 표시기에 `role="status"` 추가
- 강조 요소에 `aria-describedby` 연결

**색상 대비**:
- 강조 색상 (`border-primary-500`) 대비율 7:1 이상 유지
- 텍스트 가독성 확보 (`text-white` on `bg-studio-900`)

---

### 1.7 사용자 시나리오

**시나리오 1: 완전 신규 사용자 (3D 툴 경험 없음)**
1. 에디터 페이지 진입 → Welcome Dialog 자동 표시
2. "시작하기" 클릭 → 3D 뷰포트 조작 안내
3. 마우스로 씬 회전/확대 시도 → 자동으로 다음 단계
4. 조명 추가 → 슬라이더 조작 → 마네킹 포즈 변경 → 저장
5. 튜토리얼 완료 메시지 + 단축키 카드 확인
6. 이후 작업 시 튜토리얼 없이 자유롭게 사용

**시나리오 2: 튜토리얼 건너뛴 사용자**
1. 에디터 페이지 진입 → Welcome Dialog에서 "나중에" 클릭
2. 에디터 직접 사용 중 특정 기능 사용법 궁금 → `?` 키로 단축키 카드 열람
3. 처음부터 배우고 싶음 → `H` 키로 튜토리얼 재시작

**시나리오 3: 튜토리얼 중단 후 재시작**
1. 튜토리얼 Step 3에서 ESC 키로 건너뛰기
2. 나중에 다시 배우고 싶음 → Header 우측 "도움말" 메뉴에서 "튜토리얼 다시 보기" 클릭
3. Step 1부터 다시 시작

---

### 1.8 구현 우선순위

**Week 1: 핵심 튜토리얼 플로우**
- [ ] TutorialProvider 및 Context 구현
- [ ] Step 1 (Welcome), Step 7 (완료) Dialog 구현
- [ ] TutorialOverlay 및 Spotlight 효과
- [ ] localStorage 기반 상태 저장

**Week 2: 인터랙티브 단계**
- [ ] Step 2-6 구현 (각 단계별 감지 로직)
- [ ] TutorialTooltip, Popover 스타일링
- [ ] 단계별 애니메이션 (Framer Motion)

**Week 3: 단축키 시스템 및 접근성**
- [ ] KeyboardShortcutsCard 컴포넌트
- [ ] 전역 단축키 핸들러 확장
- [ ] ARIA 레이블 및 키보드 네비게이션 테스트
- [ ] 사용자 테스트 및 피드백 반영

---

## Phase 2: 프로페셔널 UI 시스템 (3D 프로그램 스타일)

### 2.1 설계 철학

**목표**: Cinema 4D, Blender, Unity와 같은 전문 3D 툴의 UI/UX를 웹 환경에 적용하여 전문가들에게 친숙한 경험 제공

**디자인 원칙**:
- **레이어 기반 구조**: 씬의 모든 객체를 계층 트리로 표시
- **Attribute 중심 편집**: 선택된 객체의 속성을 한 곳에서 상세히 조정
- **비파괴적 워크플로우**: 모든 변경 사항은 되돌리기 가능 (Undo/Redo)
- **모듈형 패널**: 사용자가 원하는 대로 패널 배치 조정 가능

### 2.2 UI 구조 재설계

#### 전체 레이아웃 (Revised)

```
┌─────────────────────────────────────────────────────────────┐
│  Header (h-14) - 고정                                        │
│  [Logo] [프로젝트명] [저장] [공유] [도움말]                  │
├────────────────┬───────────────────────┬─────────────────────┤
│                │                       │  Properties Panel   │
│  Outliner      │   3D Viewport         │  (w-80, 320px)      │
│  (w-64, 256px) │   (flex-1)            │  ┌────────────────┐ │
│                │                       │  │ Object Info    │ │
│  ┌──────────┐  │   [OrbitControls]     │  │ Name: Light 1  │ │
│  │ Scene    │  │                       │  │ Type: Point    │ │
│  │ ├ Lights │  │                       │  └────────────────┘ │
│  │ │ ├ L1   │  │                       │  ┌────────────────┐ │
│  │ │ └ L2   │  │                       │  │ Transform      │ │
│  │ ├ Mannq. │  │                       │  │ Position X,Y,Z │ │
│  │ └ Camera │  │                       │  │ Rotation       │ │
│  └──────────┘  │                       │  └────────────────┘ │
│                │                       │  ┌────────────────┐ │
│  [필터/검색]    │                       │  │ Light Settings │ │
│                │                       │  │ Color, Inten.. │ │
│                │                       │  └────────────────┘ │
├────────────────┴───────────────────────┴─────────────────────┤
│  Toolbar (h-10) - 고정                                       │
│  [W] [E] [Grid] [Snap] | [Play] | [Undo] [Redo]             │
└─────────────────────────────────────────────────────────────┘
```

**레이아웃 특징**:
- 3단 구조: Outliner (좌측) + Viewport (중앙) + Properties (우측)
- 하단 Toolbar: 자주 사용하는 도구 빠른 접근
- 모든 패널은 접기/펼치기 가능 (Toggle)

---

### 2.3 주요 패널 상세 설계

#### A. Outliner (씬 계층 트리)

**목적**: 씬의 모든 객체를 계층 구조로 표시하고 선택/관리

**UI 컴포넌트**: ScrollArea + Custom Tree View

**구조**:
```
Scene
├── 📷 Camera
│   └── Main Camera
├── 💡 Lights
│   ├── Point Light 1
│   ├── Spot Light 2
│   └── Directional Light 3
├── 🧍 Mannequins
│   └── Mannequin 1
└── 🟦 Diffusers
    ├── Softbox 1
    └── Reflector 2
```

**기능**:
- **클릭**: 객체 선택 → 3D 씬에서 강조 + Properties 패널에 속성 표시
- **우클릭**: 컨텍스트 메뉴 (복사, 삭제, 이름 변경)
- **드래그 앤 드롭**: 객체 순서 변경 (렌더 순서 조정)
- **눈 아이콘**: 가시성 토글 (Show/Hide)
- **자물쇠 아이콘**: 잠금 (편집 방지)

**스타일**:
```
- 배경: bg-studio-950
- 선택된 항목: bg-primary-600/20 border-l-2 border-primary-500
- 호버: bg-studio-800
- 아이콘: 16px, text-gray-400
- 폰트: text-sm, text-white
- 들여쓰기: 16px per level
```

**shadcn/ui 활용**:
- `ScrollArea`: 스크롤 가능한 트리 뷰
- `DropdownMenu`: 우클릭 컨텍스트 메뉴
- `Button` (variant="ghost", size="icon"): 가시성/잠금 토글

---

#### B. Properties Panel (속성 편집)

**목적**: 선택된 객체의 모든 속성을 상세히 편집

**UI 컴포넌트**: ScrollArea + Accordion (섹션별 접기/펼치기)

**구조** (예: Point Light 선택 시):
```
┌─────────────────────────────┐
│ Object Info                 │
│ Name: [Point Light 1]       │ ← Input (inline edit)
│ Type: Point Light           │
│ ID: #a3b2c4                 │
└─────────────────────────────┘

┌─────────────────────────────┐
│ ▼ Transform                 │ ← Accordion Item
│ Position                    │
│   X: [5.0] [슬라이더]       │
│   Y: [3.0] [슬라이더]       │
│   Z: [2.0] [슬라이더]       │
└─────────────────────────────┘

┌─────────────────────────────┐
│ ▼ Light Settings            │
│ Color: [■] #ffffff          │ ← ColorPicker
│ Intensity: [1.5] [슬라이더]  │
│ Distance: [10] [슬라이더]    │
│ Decay: [2] [슬라이더]        │
└─────────────────────────────┘

┌─────────────────────────────┐
│ ▼ Shadow                    │
│ Cast Shadow: [✓]            │ ← Checkbox
│ Shadow Bias: [0.001]        │
│ Shadow Map Size: [1024▼]   │ ← Select
└─────────────────────────────┘
```

**기능**:
- **섹션별 Accordion**: Transform, Light Settings, Shadow 등 접기/펼치기
- **인라인 편집**: 객체 이름 더블클릭으로 수정
- **숫자 입력 + 슬라이더**: 정밀 조정 + 빠른 조정 동시 지원
- **색상 피커**: Popover 형태, 최근 사용 색상 표시
- **프리셋**: 자주 사용하는 설정 저장/불러오기

**스타일**:
```
- 배경: bg-studio-900
- 섹션 헤더: text-sm font-semibold text-white
- Label: text-xs text-gray-400 uppercase
- Input: bg-studio-800 border-studio-700
- Accordion: 기본 닫힘, 첫 번째 섹션만 열림
```

**shadcn/ui 활용**:
- `Accordion`: 섹션별 접기/펼치기
- `Input`: 숫자 입력 (type="number")
- `Slider`: 범위 조정
- `Popover` + Custom ColorPicker: 색상 선택
- `Checkbox`: Boolean 속성
- `Select`: 드롭다운 선택 (예: Shadow Map Size)

---

#### C. Toolbar (하단 도구바)

**목적**: 자주 사용하는 도구 및 모드 전환 빠른 접근

**레이아웃**:
```
[W] [E] [R] | [Grid▼] [Snap] | [▶ Play] [⏸ Pause] | [↶ Undo] [↷ Redo] | [?]
```

**섹션 구분**:
1. **Transform 모드**: W (이동), E (회전), R (스케일 - 추후)
2. **뷰포트 옵션**: Grid 표시, Snap to Grid
3. **애니메이션** (추후): 재생/일시정지
4. **편집**: Undo/Redo
5. **도움말**: 단축키 카드

**스타일**:
```
- 배경: bg-studio-950 border-t border-studio-800
- 버튼: size="sm", variant="ghost"
- 활성 모드: variant="default" (bg-primary-600)
- 구분선: Separator (수직)
```

**shadcn/ui 활용**:
- `Button` (size="sm"): 모든 도구 버튼
- `Separator`: 섹션 구분선
- `DropdownMenu`: Grid 옵션 (크기, 간격)

---

### 2.4 기존 EditorPanel과의 통합 방안

**마이그레이션 전략**: 점진적 전환 (Phased Rollout)

#### Phase 2.1: Outliner 추가 (2주)
- 현재 EditorPanel (우측 탭 기반)은 유지
- 좌측에 Outliner 패널 추가 (256px 너비)
- 기능:
  - 조명, 마네킹, 카메라 목록 표시
  - 클릭 시 기존 EditorPanel 탭 자동 전환 (조명 클릭 → 조명 탭)
  - 가시성 토글만 구현 (잠금은 추후)

#### Phase 2.2: Properties Panel 전환 (3주)
- 우측 EditorPanel을 Properties Panel로 교체
- 기존 탭 시스템 제거
- Accordion 기반 섹션별 편집 UI 적용
- 모든 기존 기능 (슬라이더, 색상 피커 등) 유지하며 레이아웃만 변경

#### Phase 2.3: Toolbar 추가 (1주)
- 하단에 Toolbar 추가
- 기존 단축키 시스템과 통합
- Undo/Redo 기능 구현 (Zustand middleware)

#### Phase 2.4: 패널 접기/펼치기 (1주)
- Outliner, Properties 패널에 토글 버튼 추가
- 사용자가 뷰포트를 넓게 사용할 수 있도록 지원
- localStorage에 패널 상태 저장

---

### 2.5 반응형 레이아웃

**Desktop (1920px+)**: 기본 3단 레이아웃
- Outliner: 256px
- Viewport: flex-1
- Properties: 320px

**Laptop (1280px-1919px)**: 패널 축소
- Outliner: 200px
- Properties: 280px

**Tablet (768px-1279px)**: 패널 오버레이
- Outliner, Properties를 Drawer 형태로 전환
- 기본적으로 숨김, 버튼 클릭 시 슬라이드 인
- Viewport 최대 활용

**Mobile (767px 이하)**: MVP에서 미지원
- "Desktop 환경에서 사용하세요" 메시지 표시

---

### 2.6 다크 모드 전용 최적화

**색상 조정**:
- 배경: 더 어두운 톤 (`bg-studio-950`, `bg-black`)
- 텍스트: 높은 대비 (`text-white`, `text-gray-200`)
- 강조: Primary 색상 밝기 증가 (`text-primary-400`)

**뷰포트 배경**:
- 3D 씬 배경: 완전히 검은색 (`#000000`)
- Grid 색상: 매우 어두운 회색 (`#1a1a1a`)

---

### 2.7 애니메이션 및 전환 효과

**패널 접기/펼치기**:
```javascript
// Framer Motion
<motion.aside
  initial={{ width: 256 }}
  animate={{ width: isCollapsed ? 48 : 256 }}
  transition={{ duration: 0.2, ease: 'easeInOut' }}
>
  <Outliner />
</motion.aside>
```

**객체 선택 피드백**:
- Outliner 항목 선택 시: `bg-primary-600/20` 배경 + 좌측 강조선 애니메이션
- 3D 씬에서 선택된 객체: Outline 글로우 효과 (Three.js OutlinePass)

**속성 변경 애니메이션**:
- 슬라이더 조작 시: 3D 씬에서 부드러운 전환 (Tween)
- 색상 변경 시: 조명 색상 Fade 전환

---

### 2.8 사용자 시나리오

**시나리오 1: 전문가 워크플로우**
1. Outliner에서 "Lights" 폴더 확장
2. "Point Light 2" 클릭 → Properties Panel에 속성 표시
3. Transform 섹션에서 Position 슬라이더 조정 → 3D 씬에서 실시간 변경
4. Light Settings에서 Color 변경 → ColorPicker Popover에서 정밀 선택
5. 우클릭 → "Duplicate" → 새 조명 복사 생성
6. Toolbar에서 Undo 클릭 → 복사 취소

**시나리오 2: 빠른 편집**
1. 3D Viewport에서 조명 직접 클릭 → Outliner에서 자동 선택
2. Properties Panel이 자동으로 해당 조명 속성 표시
3. 키보드 단축키 `W` → 이동 모드 활성화 → 마우스로 드래그하여 위치 변경
4. `Ctrl+Z` → 위치 되돌리기

**시나리오 3: 복잡한 씬 관리**
1. Outliner에서 검색창에 "Spot" 입력 → Spot Light만 필터링
2. 여러 조명의 눈 아이콘 클릭 → 불필요한 조명 숨김
3. 남은 조명들만으로 씬 조정
4. 완료 후 눈 아이콘 다시 클릭 → 모든 조명 표시

---

### 2.9 구현 우선순위

**Week 1-2: Outliner 구현**
- [ ] 좌측 Outliner 패널 레이아웃
- [ ] 계층 트리 뷰 (Custom TreeView 컴포넌트)
- [ ] 객체 선택 기능 (Zustand store 연동)
- [ ] 가시성 토글 아이콘

**Week 3-5: Properties Panel 전환**
- [ ] 우측 Properties Panel 레이아웃
- [ ] Accordion 기반 섹션 구조
- [ ] Transform, Light Settings 섹션 구현
- [ ] 인라인 편집 (객체 이름)

**Week 6: Toolbar 및 Undo/Redo**
- [ ] 하단 Toolbar 레이아웃
- [ ] Transform 모드 버튼 (W, E)
- [ ] Undo/Redo 미들웨어 (Zustand temporal)
- [ ] 단축키 통합

**Week 7: 반응형 및 패널 토글**
- [ ] 패널 접기/펼치기 버튼
- [ ] localStorage 기반 상태 저장
- [ ] 태블릿 반응형 Drawer
- [ ] 애니메이션 최적화

---

## Phase 3: 전체 UX 플로우 개선

### 3.1 현재 문제점 분석

#### 문제점 1: 정보 피드백 부족
**증상**:
- 저장 중 상태가 명확하지 않음 (버튼 텍스트만 변경)
- 프로젝트 로딩 시 어떤 데이터를 불러오는지 불명확
- 에러 발생 시 사용자가 다음 행동을 모름

**영향**:
- 사용자 불안감 증가 ("저장이 제대로 되었나?")
- 에러 복구 방법 불명확

#### 문제점 2: 기능 접근성 저하
**증상**:
- 자주 사용하는 기능 (카메라 리셋, 조명 복사)이 깊은 메뉴에 숨겨짐
- 단축키가 있어도 사용자가 모름
- 탭 전환이 번거로움 (조명 추가 후 카메라 조정하려면 2번 클릭)

**영향**:
- 워크플로우 속도 저하
- 전문가 사용자 불편

#### 문제점 3: 시각적 일관성 부족
**증상**:
- Toast 메시지 스타일이 에디터와 다른 느낌 (너무 밝음)
- 로딩 스피너가 3D 씬과 어울리지 않음
- 버튼 크기, 간격이 페이지별로 다름

**영향**:
- 비전문적으로 보임
- 브랜드 일관성 저하

---

### 3.2 개선 방안

#### 개선 1: 강화된 상태 피드백 시스템

**A. 저장 프로세스 시각화**

**현재**:
```
[저장] 버튼 → 클릭 → [저장 중...] (버튼 텍스트 변경) → Toast "저장 완료"
```

**개선 후**:
```
[저장] 버튼 → 클릭 → Progress Bar (Header에 표시, 0% → 100%)
→ Toast "저장 완료" (checkmark 아이콘)
→ Header 우측에 "마지막 저장: 방금 전" 표시
```

**구현**:
- Header에 Progress Bar 컴포넌트 추가 (shadcn/ui Progress)
- 저장 중에는 전체 화면에 반투명 오버레이 (클릭 방지)
- 저장 완료 후 2초간 "✓ 저장됨" 배지 표시

**B. 로딩 상태 개선**

**현재**:
```
검은 화면 + 중앙 스피너 + "프로젝트를 불러오는 중..."
```

**개선 후**:
```
Skeleton UI + 단계별 로딩 메시지
1. "프로젝트 메타데이터 불러오는 중..."
2. "3D 모델 로딩 중..."
3. "조명 설정 적용 중..."
→ 페이드 인 전환
```

**구현**:
- Skeleton 컴포넌트로 레이아웃 미리 표시
- 각 단계별 로딩 메시지 순차 표시
- Framer Motion으로 부드러운 전환

**C. 에러 핸들링 강화**

**현재**:
```
Toast "프로젝트를 불러올 수 없습니다." (빨간색)
→ 사용자가 다음 행동을 모름
```

**개선 후**:
```
Dialog (중앙)
제목: "프로젝트를 불러올 수 없습니다"
설명: "서버와의 연결이 끊어졌습니다. 네트워크를 확인해주세요."
버튼: [다시 시도] [프로젝트 목록으로]
```

**구현**:
- 에러 타입별 맞춤 메시지 (네트워크, 권한, 데이터 손상 등)
- 복구 액션 버튼 제공
- 에러 로그를 localStorage에 저장 (디버깅 용)

---

#### 개선 2: 자주 사용하는 기능 빠른 접근

**A. Quick Actions Menu**

**위치**: 3D Viewport 우측 하단 (Floating Button)

**UI**:
```
[⚡] 버튼 (Floating Action Button)
→ 클릭 시 Radial Menu 또는 DropdownMenu 표시

- 카메라 리셋 (Ctrl+0)
- 조명 추가 (Ctrl+L)
- 프리셋 적용 (Ctrl+P)
- 렌더링 (Ctrl+R) [추후]
```

**스타일**:
- 버튼: `bg-primary-600 hover:bg-primary-700`, 원형, 48px
- 메뉴: `bg-studio-900 border-primary-500`, 아이콘 + 텍스트 + 단축키
- 애니메이션: Scale up on hover

**shadcn/ui 활용**:
- `DropdownMenu`: Quick Actions 목록
- `Button` (size="icon"): Floating Action Button

**B. 컨텍스트 메뉴 (우클릭 메뉴)**

**트리거**: 3D Viewport에서 조명/마네킹 우클릭

**메뉴 항목**:
```
- 복제 (Duplicate)
- 삭제 (Delete)
- 이름 변경 (Rename)
- ───────────
- 선택 해제 (Deselect)
- 카메라에서 보기 (Focus)
```

**구현**:
- Three.js Raycasting으로 객체 감지
- 우클릭 시 마우스 위치에 ContextMenu 표시
- 메뉴 선택 시 해당 액션 실행 (Zustand store 연동)

**C. 키보드 단축키 확장 (우선순위)**

| 단축키 | 기능 | 카테고리 |
|--------|------|---------|
| `Ctrl+S` | 저장 | 일반 |
| `Ctrl+Z` | 되돌리기 | 편집 |
| `Ctrl+Shift+Z` | 다시 실행 | 편집 |
| `Ctrl+L` | 조명 추가 | 조명 |
| `Delete` | 선택 삭제 | 편집 |
| `Ctrl+D` | 복제 | 편집 |
| `Ctrl+0` | 카메라 리셋 | 카메라 |
| `Spacebar` | 뷰포트 최대화 | 뷰포트 |
| `F` | 선택 객체에 포커스 | 뷰포트 |
| `?` | 단축키 카드 | 도움말 |

---

#### 개선 3: 시각적 일관성 및 브랜딩

**A. Toast 시스템 재디자인**

**현재 문제**:
- 기본 shadcn/ui Toast는 라이트 모드 기준
- 에디터의 어두운 배경과 대비가 너무 강함

**개선안**:
```
- 배경: bg-studio-900 (어두운 회색)
- 테두리: border-primary-500 (파란색 강조)
- 텍스트: text-white (높은 대비)
- 아이콘: Success (Check), Error (X), Loading (Spinner)
```

**구현**:
- `components/ui/toast.tsx` 커스터마이징
- Variant별 색상 조정:
  - Success: `border-green-500`
  - Error: `border-red-500`
  - Info: `border-primary-500`

**B. 로딩 스피너 통일**

**현재 문제**:
- 여러 곳에서 서로 다른 스피너 사용

**개선안**:
- 공통 `LoadingSpinner.jsx` 컴포넌트 생성
- 3가지 크기: `sm` (16px), `md` (24px), `lg` (48px)
- 색상: `text-primary-500` (회전 애니메이션)

**C. 버튼 크기 및 간격 표준화**

**가이드라인 준수**:
- `docs/design/ui-spacing-system.md` 기준 엄격히 적용
- 모든 버튼에 `size="sm"` (에디터 Header) 또는 `size="default"` (일반) 명시
- 버튼 그룹 간격: `gap-2` 고정

**검사 도구**:
- ESLint 커스텀 룰로 `space-y-*`, `gap-*` 사용 검사
- 개발 중 시각적 Grid 오버레이 (디버그 모드)

---

### 3.3 새로운 기능: 뷰포트 컨트롤러

**목적**: 3D Viewport를 더욱 효율적으로 제어

**위치**: 3D Viewport 우측 상단 (Floating)

**UI 컴포넌트**:
```
┌─────────────────┐
│ [그리드] [스냅]  │ ← Toggle Buttons
│ [직교] [원근]    │ ← Camera Mode
│ [🔄] [🏠]       │ ← Rotate, Home
└─────────────────┘
```

**기능**:
- **Grid 토글**: 격자 표시/숨김
- **Snap**: 객체를 격자에 스냅
- **Camera Mode**: 직교/원근 투영 전환
- **Rotate**: 90도 회전 (Top, Front, Side 뷰)
- **Home**: 카메라 초기 위치로 리셋

**스타일**:
- 배경: `bg-studio-900/80 backdrop-blur-sm`
- 버튼: `size="icon"`, `variant="ghost"`
- 활성 상태: `variant="default"`

---

### 3.4 성능 최적화

**A. 3D 렌더링 최적화**
- Three.js 렌더 루프를 requestAnimationFrame으로 최적화
- 조명 개수가 많을 때 자동으로 Shadow Map 품질 조정
- Frustum Culling 활성화 (보이지 않는 객체 렌더링 스킵)

**B. React 리렌더링 최적화**
- Zustand selector로 필요한 상태만 구독
- React.memo로 LightCard, CameraControl 메모이제이션
- useCallback으로 슬라이더 핸들러 최적화

**C. 네트워크 최적화**
- 저장 시 Debounce 적용 (연속 저장 방지)
- 프로젝트 목록 Pagination (한 번에 20개씩)
- 썸네일 Lazy Loading

---

### 3.5 사용자 온보딩 개선

**첫 방문 시 플로우**:
1. Hero 페이지 → "시작하기" 버튼
2. 회원가입/로그인 → 간편 소셜 로그인 강조
3. 프로젝트 대시보드 → EmptyState "첫 프로젝트 만들기" CTA
4. 에디터 페이지 → 튜토리얼 자동 시작 (Phase 1)

**재방문 시 플로우**:
1. 직접 로그인 페이지 진입 가능 (Hero 건너뛰기)
2. 프로젝트 대시보드 → 최근 프로젝트 강조 ("계속하기")
3. 에디터 페이지 → 튜토리얼 없이 바로 작업

---

### 3.6 접근성 강화

**키보드 전용 사용**:
- 모든 기능을 키보드로 접근 가능 (단축키)
- Tab 키로 모든 컨트롤 순회 가능
- 포커스 인디케이터 명확히 표시 (`ring-2 ring-primary-500`)

**스크린 리더 지원**:
- 3D Viewport에 `aria-label="조명 씬 뷰포트"` 추가
- 슬라이더에 현재 값 읽어주기 (`aria-valuetext`)
- 로딩/저장 상태 `role="status"` + `aria-live="polite"`

**고대비 모드**:
- 다크 모드 기본이지만 대비 더 높은 옵션 제공
- 색상에만 의존하지 않는 UI (아이콘 + 텍스트 병행)

---

### 3.7 사용자 시나리오

**시나리오 1: 빠른 조명 조정**
1. 에디터 페이지 진입 → 기존 프로젝트 로드 (Skeleton UI)
2. 3D Viewport에서 조명 클릭 → Properties Panel 자동 업데이트
3. 키보드 `W` → 이동 모드 → 마우스 드래그로 위치 조정
4. Quick Actions Button → "프리셋 적용" → "Rembrandt Lighting" 선택
5. `Ctrl+S` → Progress Bar → "저장 완료" Toast

**시나리오 2: 에러 복구**
1. 저장 중 네트워크 끊김 → Dialog "저장 실패" + "다시 시도" 버튼
2. "다시 시도" 클릭 → 자동으로 재시도
3. 여전히 실패 → "오프라인 저장" 옵션 제공 (localStorage)
4. 네트워크 복구 후 → 자동으로 서버에 동기화

**시나리오 3: 전문가 워크플로우**
1. 단축키 `Ctrl+L` → 조명 추가 Dialog
2. Outliner에서 조명 선택 → 우클릭 → "복제" 3번 반복
3. 각 조명을 Viewport에서 드래그하여 배치
4. Toolbar에서 Grid 토글 → Snap 활성화 → 정렬
5. `Ctrl+Z` 여러 번 → 되돌리기로 최적 배치 찾기
6. `Spacebar` → Viewport 최대화 → 전체 씬 확인

---

### 3.8 구현 우선순위

**Week 1: 상태 피드백 강화**
- [ ] Progress Bar 컴포넌트 (저장 프로세스)
- [ ] Skeleton Loading UI
- [ ] 에러 Dialog 시스템

**Week 2: Quick Actions 및 단축키**
- [ ] Floating Action Button + Quick Menu
- [ ] 컨텍스트 메뉴 (우클릭)
- [ ] 단축키 확장 (Ctrl+L, Ctrl+D 등)

**Week 3: 시각적 일관성**
- [ ] Toast 재디자인
- [ ] LoadingSpinner 통일
- [ ] 버튼 크기/간격 표준화 검사

**Week 4: Viewport Controller**
- [ ] Floating 컨트롤러 UI
- [ ] Grid, Snap, Camera Mode 기능
- [ ] 카메라 Rotate, Home 기능

---

## 종합 로드맵

### Timeline Overview

| Phase | 기간 | 우선순위 | 의존성 |
|-------|------|---------|-------|
| **Phase 1: 튜토리얼 시스템** | 3주 | P0 (최우선) | 없음 |
| **Phase 3: UX 플로우 개선** | 4주 | P1 (높음) | Phase 1 일부 완료 후 |
| **Phase 2: 프로페셔널 UI** | 7주 | P2 (중간) | Phase 1, 3 완료 후 |

### Milestone Checklist

#### Milestone 1: 신규 사용자 온보딩 완성 (4주 후)
- [x] 튜토리얼 시스템 구현 완료
- [x] 단축키 카드 구현
- [x] Quick Actions Menu 구현
- [x] 상태 피드백 강화

**성공 지표**:
- 신규 사용자의 80% 이상이 튜토리얼 완료
- 첫 프로젝트 저장까지 평균 10분 이내

#### Milestone 2: 전문가 워크플로우 지원 (8주 후)
- [x] Outliner 패널 구현
- [x] Properties Panel 전환
- [x] Toolbar 구현
- [x] Undo/Redo 기능

**성공 지표**:
- 전문가 사용자 만족도 90% 이상
- 조명 조정 속도 50% 향상

#### Milestone 3: 안정화 및 최적화 (11주 후)
- [x] 모든 기능 통합 테스트
- [x] 성능 최적화 완료
- [x] 접근성 검사 통과
- [x] 사용자 피드백 반영

**성공 지표**:
- 페이지 로드 시간 3초 이내
- WCAG 2.1 AA 준수
- 버그 리포트 주당 5건 이하

---

## 디자인 자산 및 리소스

### 필요한 Shadcn/ui 컴포넌트

**이미 설치됨**:
- Button, Card, Input, Label, Slider, ScrollArea, Separator, Popover, Toast, Badge, Dialog, Tabs

**추가 설치 필요**:
```bash
# Phase 1: 튜토리얼
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add progress

# Phase 2: 프로페셔널 UI
npx shadcn-ui@latest add accordion
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add select
npx shadcn-ui@latest add context-menu

# Phase 3: UX 개선
npx shadcn-ui@latest add drawer
npx shadcn-ui@latest add hover-card
```

### 애니메이션 라이브러리
- **Framer Motion**: 이미 설치됨 (package.json 확인 필요)
- 추가 설치: `npm install framer-motion` (필요 시)

### 아이콘 (lucide-react)
- 이미 사용 중: `Lightbulb`, `Camera`, `Save`, `Share2`, `ArrowLeft` 등
- 추가 필요:
  - `Grid3x3`, `Layers`, `Eye`, `EyeOff`, `Lock`, `Unlock`
  - `RotateCw`, `Home`, `ZoomIn`, `ZoomOut`
  - `Copy`, `Trash2`, `Edit`, `ChevronRight`, `ChevronDown`

---

## 다음 단계

### 즉시 시작 가능한 작업 (Phase 1)

1. **TutorialProvider Context 생성**
   - 파일: `client/src/contexts/TutorialContext.jsx`
   - localStorage 기반 상태 관리

2. **TutorialOverlay 컴포넌트**
   - 파일: `client/src/components/tutorial/TutorialOverlay.jsx`
   - 반투명 배경 + Spotlight 효과

3. **Welcome Dialog (Step 1)**
   - 파일: `client/src/components/tutorial/WelcomeDialog.jsx`
   - shadcn/ui Dialog 사용

4. **EditorPage에 TutorialProvider 통합**
   - 파일: `client/src/pages/EditorPage.jsx`
   - 첫 방문 시 자동 실행 로직

### 병렬 작업 가능 (Phase 3)

1. **LoadingSpinner 컴포넌트 통일**
   - 파일: `client/src/components/ui/loading-spinner.jsx`
   - 3가지 크기 variant

2. **Toast 재디자인**
   - 파일: `client/src/components/ui/toast.tsx`
   - 색상 시스템 적용

3. **Quick Actions Menu**
   - 파일: `client/src/components/editor/QuickActionsMenu.jsx`
   - Floating Action Button + DropdownMenu

---

**문서 버전**: 1.0
**마지막 업데이트**: 2025-11-03
**작성자**: UI/UX Designer Agent
**검토 필요**: Frontend Developer, Backend Architect
