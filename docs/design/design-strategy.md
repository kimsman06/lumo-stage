# LumoStage 디자인 전략 문서

## 1. 디자인 철학 (Design Philosophy)

### 1.1 핵심 원칙

- **전문성과 접근성의 균형**: 영화/영상 전문가들이 신뢰할 수 있는 전문적인 느낌을 유지하면서도, 학생과 크리에이터들이 쉽게 사용할 수 있는 직관적인 인터페이스
- **몰입형 작업 환경**: 3D 뷰포트를 중심으로 한 레이아웃으로 사용자가 창작에 집중할 수 있도록 지원
- **실시간 피드백**: 모든 조작이 즉각적으로 반영되는 반응형 UI

### 1.2 디자인 컨셉

**"Digital Cinematography Studio"** - 전문 영화 스튜디오의 조명 제어실을 디지털 공간에 구현

---

## 2. 색상 시스템 (Color System)

### 2.1 메인 팔레트

```javascript
// Tailwind CSS 커스텀 색상 설정 (tailwind.config.js)
colors: {
  // Primary - 영화 제작의 전문성을 나타내는 딥 블루
  primary: {
    50: '#f0f5ff',
    100: '#e0ebff',
    500: '#3b82f6',  // 메인 액센트
    600: '#2563eb',
    700: '#1d4ed8',
    900: '#1e3a8a'
  },

  // 다크 배경 - 3D 뷰포트를 돋보이게 하는 어두운 톤
  studio: {
    950: '#0a0a0f',  // 최상위 배경
    900: '#12121a',  // 패널 배경
    800: '#1a1a24',  // 카드 배경
    700: '#24243a',  // 호버 상태
  },

  // 액센트 - 조명을 상징하는 웜 톤
  accent: {
    yellow: '#fbbf24',  // Key Light
    orange: '#f97316',  // 경고/중요
    cyan: '#06b6d4',    // Fill Light
  }
}
```

### 2.2 의미론적 색상 적용

- **Primary Blue**: 주요 액션 버튼, 선택된 상태, 링크
- **Studio Dark**: 메인 배경, 패널, 카드
- **Accent Yellow/Orange**: 조명 관련 UI 요소, 활성 조명 표시
- **Accent Cyan**: 카메라 관련 UI 요소

---

## 3. 타이포그래피 (Typography)

### 3.1 폰트 시스템

```javascript
// 영문: Inter (모던하고 가독성 높은 산세리프)
// 한글: Pretendard (Inter와 조화로운 한글 폰트)

fontFamily: {
  sans: ['Pretendard', 'Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'Consolas', 'monospace'],
}
```

### 3.2 타이포그래피 스케일

- **헤딩**:
  - H1: `text-3xl font-bold` (30px) - 앱 타이틀
  - H2: `text-xl font-semibold` (20px) - 섹션 제목
  - H3: `text-lg font-medium` (18px) - 카드 제목
- **본문**:

  - Body: `text-sm` (14px) - 기본 텍스트
  - Small: `text-xs` (12px) - 보조 정보, 레이블

- **특수**:
  - Code/Values: `font-mono text-sm` - 수치 표시

---

## 4. 레이아웃 전략 (Layout Strategy)

### 4.1 전체 구조

```
┌─────────────────────────────────────────────────┐
│  Header (h-14)                                  │
│  [Logo] [Scene Title] [Save Button]            │
├─────────────────────────────────────────────────┤
│                    │                            │
│                    │   Editor Panel (w-96)      │
│   3D Viewport      │   ┌──────────────────┐    │
│   (flex-1)         │   │ Lights Section   │    │
│                    │   │ [Add Light Btn]  │    │
│                    │   │ [Light Card 1]   │    │
│   [OrbitControls]  │   │ [Light Card 2]   │    │
│                    │   └──────────────────┘    │
│                    │   ┌──────────────────┐    │
│                    │   │ Camera Section   │    │
│                    │   └──────────────────┘    │
└─────────────────────────────────────────────────┘
```

### 4.2 반응형 전략

- **Desktop (1280px+)**: 위 레이아웃 유지
- **Tablet (768px-1279px)**: Editor Panel을 오버레이 형태로 토글
- **Mobile (767px 이하)**: MVP에서는 미지원, "Desktop에서 사용하세요" 메시지 표시

---

## 5. 컴포넌트 디자인 명세

### 5.1 Header

**shadcn/ui 컴포넌트**: Custom

```jsx
<header className="h-14 border-b border-studio-800 bg-studio-950/95 backdrop-blur-sm">
  <div className="flex items-center justify-between h-full px-6">
    {/* Logo */}
    <div className="flex items-center gap-3">
      <Lightbulb className="w-6 h-6 text-accent-yellow" />
      <h1 className="text-xl font-bold text-white">LumoStage</h1>
    </div>

    {/* Scene Title */}
    <Input
      className="max-w-xs bg-studio-900 border-studio-700"
      placeholder="Untitled Scene"
    />

    {/* Actions */}
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm">
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>
      <Button size="sm">
        <Save className="w-4 h-4 mr-2" />
        Save
      </Button>
    </div>
  </div>
</header>
```

**스타일 특징**:

- 반투명 배경 + backdrop blur로 모던한 느낌
- 아이콘을 활용한 직관적인 액션 버튼
- 경계선으로 구분된 영역

### 5.2 Editor Panel

**shadcn/ui 컴포넌트**: ScrollArea, Separator

```jsx
<aside className="w-96 h-full bg-studio-900 border-l border-studio-800">
  <ScrollArea className="h-full">
    <div className="p-6 space-y-6">
      {/* Lights Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-accent-yellow" />
            Lights
          </h2>
          <Button size="sm" variant="outline">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Light Cards */}
        <div className="space-y-3">
          {lights.map((light) => (
            <LightCard key={light.id} light={light} />
          ))}
        </div>
      </section>

      <Separator className="bg-studio-700" />

      {/* Camera Section */}
      <section>
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Camera className="w-5 h-5 text-accent-cyan" />
          Camera
        </h2>
        <CameraControls />
      </section>
    </div>
  </ScrollArea>
</aside>
```

**스타일 특징**:

- 고정 너비 (384px/w-96)로 일관성 유지
- ScrollArea로 많은 조명도 수용 가능
- 섹션별 아이콘으로 시각적 구분

### 5.3 Light Card

**shadcn/ui 컴포넌트**: Card, Button, Slider, Popover (컬러 피커)

```jsx
<Card className="bg-studio-800 border-studio-700 hover:border-primary-500 transition-colors">
  <CardHeader className="pb-3">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-2">
        {/* Light Type Icon */}
        <div className="w-8 h-8 rounded-full bg-accent-yellow/20 flex items-center justify-center">
          <Lightbulb className="w-4 h-4 text-accent-yellow" />
        </div>

        {/* Light Info */}
        <div>
          <CardTitle className="text-sm font-medium text-white">
            Point Light
          </CardTitle>
          <p className="text-xs text-gray-400 font-mono">#{light.id.slice(0,8)}</p>
        </div>
      </div>

      {/* Actions */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  </CardHeader>

  <CardContent className="space-y-4">
    {/* Position Controls */}
    <div className="space-y-2">
      <Label className="text-xs text-gray-400 uppercase tracking-wide">Position</Label>
      {['x', 'y', 'z'].map(axis => (
        <div key={axis} className="flex items-center gap-3">
          <span className="text-xs font-mono text-gray-400 w-4">{axis}</span>
          <Slider
            value={[light.position[axis]]}
            min={-10}
            max={10}
            step={0.1}
            className="flex-1"
          />
          <span className="text-xs font-mono text-white w-12 text-right">
            {light.position[axis].toFixed(1)}
          </span>
        </div>
      ))}
    </div>

    {/* Color & Intensity */}
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <Label className="text-xs text-gray-400 uppercase tracking-wide">Color</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full h-10 border-studio-700"
            >
              <div
                className="w-5 h-5 rounded border border-studio-600"
                style={{ backgroundColor: light.color }}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <ColorPicker color={light.color} onChange={...} />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-gray-400 uppercase tracking-wide">
          Intensity
        </Label>
        <div className="flex items-center gap-2">
          <Slider
            value={[light.intensity]}
            min={0}
            max={2}
            step={0.1}
          />
          <span className="text-xs font-mono text-white w-8">
            {light.intensity.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  </CardContent>
</Card>
```

**스타일 특징**:

- 호버 시 테두리 색상 변경으로 상호작용 피드백
- 컴팩트하면서도 정보가 명확한 레이아웃
- Monospace 폰트로 수치 정렬 향상
- 색상 프리뷰와 슬라이더의 조화

### 5.4 Camera Controls

**shadcn/ui 컴포넌트**: Label, Slider

```jsx
<div className="space-y-4">
  {/* Position */}
  <div className="space-y-3">
    <Label className="text-sm font-medium text-white">Position</Label>
    {["x", "y", "z"].map((axis) => (
      <div key={axis} className="flex items-center gap-3">
        <span className="text-xs font-mono text-gray-400 w-4 uppercase">
          {axis}
        </span>
        <Slider
          value={[camera.position[axis]]}
          min={-20}
          max={20}
          step={0.5}
          className="flex-1"
        />
        <span className="text-xs font-mono text-white w-12 text-right">
          {camera.position[axis].toFixed(1)}
        </span>
      </div>
    ))}
  </div>

  {/* FOV */}
  <div className="space-y-2">
    <Label className="text-sm font-medium text-white">Field of View</Label>
    <div className="flex items-center gap-3">
      <Slider
        value={[camera.fov]}
        min={30}
        max={120}
        step={1}
        className="flex-1"
      />
      <span className="text-sm font-mono text-white w-12 text-right">
        {camera.fov}°
      </span>
    </div>
  </div>
</div>
```

### 5.5 3D Viewport

**스타일**: 순수한 3D 공간, UI 오버레이 최소화

```jsx
<div className="flex-1 relative bg-studio-950">
  <Canvas camera={{ position: [5, 5, 5], fov: 75 }} className="w-full h-full">
    <Scene />
  </Canvas>

  {/* Viewport Overlay - 최소한의 정보만 표시 */}
  <div className="absolute bottom-4 left-4 flex gap-2">
    <Badge variant="secondary" className="bg-studio-900/80 backdrop-blur-sm">
      <Grid3x3 className="w-3 h-3 mr-1" />
      Grid
    </Badge>
    <Badge variant="secondary" className="bg-studio-900/80 backdrop-blur-sm">
      {lights.length} Lights
    </Badge>
  </div>
</div>
```

---

## 6. 인터랙션 디자인

### 6.1 마이크로 인터랙션

```css
/* Tailwind 클래스로 구현 */
.button-primary {
  @apply transition-all duration-200 
         hover:scale-105 hover:shadow-lg 
         active:scale-95;
}

.card-interactive {
  @apply transition-colors duration-200
         hover:border-primary-500;
}

.slider-thumb {
  @apply transition-transform duration-150
         hover:scale-110 active:scale-95;
}
```

### 6.2 피드백 시스템

- **성공**: 녹색 토스트 메시지 (shadcn/ui Toast)
- **오류**: 빨간색 토스트 메시지
- **로딩**: 버튼 내 스피너 표시

---

## 7. Shadcn/ui 컴포넌트 활용 계획

### 7.1 설치할 컴포넌트

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add slider
npx shadcn-ui@latest add scroll-area
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add dialog
```

### 7.2 커스터마이징

```javascript
// components/ui 내부의 컴포넌트들을 프로젝트 색상 시스템에 맞게 수정
// 예: button.tsx의 variant 확장

const buttonVariants = cva("...", {
  variants: {
    variant: {
      default: "bg-primary-600 text-white hover:bg-primary-700",
      destructive: "bg-red-600 text-white hover:bg-red-700",
      outline: "border border-studio-700 bg-transparent hover:bg-studio-800",
      // ... 기존 variants
      studio: "bg-studio-800 text-white hover:bg-studio-700", // 새로운 variant
    },
  },
});
```

---

## 8. 아이콘 시스템

**라이브러리**: lucide-react (shadcn/ui 기본)

### 8.1 주요 아이콘 매핑

- **조명**: `Lightbulb`, `Zap`, `Sun`
- **카메라**: `Camera`, `Focus`
- **액션**: `Plus`, `Trash2`, `Save`, `Share2`, `Download`
- **네비게이션**: `ChevronDown`, `ChevronRight`
- **상태**: `Eye`, `EyeOff`, `Lock`, `Unlock`
- **유틸리티**: `Grid3x3`, `Move`, `RotateCcw`

---

## 9. 다크 모드 전략

**MVP 단계**: 다크 모드 전용으로 개발 (조명 작업 특성상 어두운 배경 필수)

**추후 확장**: Light 모드 추가 시

- Studio 배경 → 밝은 회색 (#f5f5f7)
- Primary 색상은 유지
- 대비 조정 필요

---

## 10. 애니메이션 가이드

### 10.1 기본 원칙

- **빠르고 명확하게**: 200ms 이하의 짧은 전환
- **자연스럽게**: ease-out 곡선 사용
- **의미 있게**: 목적 없는 애니메이션 지양

### 10.2 주요 애니메이션

```javascript
// Framer Motion을 사용한 리스트 애니메이션
const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
};
```

---

## 11. 접근성 (Accessibility)

### 11.1 WCAG 2.1 준수

- **색상 대비**: 최소 4.5:1 (텍스트), 3:1 (UI 요소)
- **키보드 네비게이션**: 모든 인터랙티브 요소 Tab 접근 가능
- **포커스 표시**: `focus-visible:ring-2 ring-primary-500` 적용
- **ARIA 레이블**: 아이콘 버튼에 `aria-label` 추가

### 11.2 시맨틱 HTML

```jsx
<main role="main">
  <section aria-label="3D Viewport">...</section>
  <aside aria-label="Lighting Controls">...</aside>
</main>
```

---

## 12. 성능 최적화

### 12.1 렌더링 최적화

- **React.memo**: Light Card 컴포넌트 메모이제이션
- **useCallback**: 슬라이더 핸들러 최적화
- **Lazy Loading**: 3D 모델 동적 로딩

### 12.2 스타일 최적화

- **Tailwind JIT**: 사용된 클래스만 번들에 포함
- **CSS Purge**: 프로덕션 빌드 시 미사용 스타일 제거

---

## 13. 구현 우선순위

### Phase 1: 핵심 UI (1-2주)

1. ✅ Header 컴포넌트
2. ✅ Editor Panel 레이아웃
3. ✅ Light Card 기본 구조
4. ✅ Camera Controls

### Phase 2: 인터랙션 (1주)

5. ✅ 슬라이더 연동
6. ✅ 컬러 피커 연동
7. ✅ 조명 추가/삭제
8. ✅ 토스트 알림

### Phase 3: 고급 기능 (1주)

9. Scene 저장 UI
10. 공유 다이얼로그
11. 로딩 상태
12. 에러 핸들링

---

## 14. 디자인 자산 (Design Assets)

### 14.1 로고

- **스타일**: Lightbulb 아이콘 + "LumoStage" 워드마크
- **색상**: Gradient (Yellow → Orange)

### 14.2 일러스트레이션

- **Empty State**: 조명이 없을 때 "Add your first light" 일러스트
- **404 Page**: 스튜디오 조명이 꺼진 이미지

---
