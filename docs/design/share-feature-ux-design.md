# LumoStage 프로젝트 공유 기능 UI/UX 설계

## 문서 메타데이터

- **작성일**: 2025-10-28
- **설계자**: UI/UX Designer Agent
- **프로젝트**: LumoStage v1.0
- **관련 문서**:
  - `/docs/design/design-strategy.md` (디자인 시스템)
  - `/docs/api/PROJECT_DASHBOARD_API.md` (API 명세)

---

## 1. 기능 개요

### 1.1 목적

프로젝트 소유자가 자신의 조명 시뮬레이션 프로젝트를 타인과 공유할 수 있도록 하여 협업과 피드백을 촉진합니다.

### 1.2 핵심 기능

1. **공유 링크 생성 및 관리**: 토큰 기반 공유 URL 생성
2. **권한 제어**: 읽기 전용 / 편집 가능 모드 선택
3. **시간 제한**: 링크 만료 시간 설정
4. **활성화/비활성화**: 언제든지 공유 중단 가능
5. **뷰어 페이지**: 공유된 프로젝트를 별도 페이지에서 조회

### 1.3 사용자 흐름 요약

```
[프로젝트 소유자]
  → 공유 버튼 클릭
  → 공유 설정 다이얼로그 열림
  → 권한/만료 설정 후 링크 생성
  → 링크 복사 → 타인에게 전달

[공유 받은 사용자]
  → 공유 링크 클릭
  → 뷰어 페이지로 이동
  → 권한에 따라 조회/편집
```

---

## 2. UI 컴포넌트 구조

### 2.1 컴포넌트 계층 구조

```
📁 client/src/components/share/
├── ShareButton.jsx                    // 공유 버튼 (ProjectCard, EditorPage에서 사용)
├── ShareDialog.jsx                    // 공유 설정 다이얼로그 (메인 컴포넌트)
│   ├── ShareLinkSection.jsx          // 공유 링크 생성/표시 영역
│   │   ├── GenerateLinkButton.jsx    // 링크 생성 버튼
│   │   ├── ShareLinkDisplay.jsx      // 링크 표시 및 복사
│   │   └── RegenerateLinkButton.jsx  // 링크 재생성 버튼
│   └── ShareSettingsSection.jsx      // 공유 설정 영역
│       ├── PermissionSelector.jsx    // 권한 선택 (RadioGroup)
│       ├── ExpirationSelector.jsx    // 만료 시간 선택 (Select)
│       └── ActiveToggle.jsx          // 활성화/비활성화 (Switch)
└── ShareStatusBadge.jsx               // 공유 상태 뱃지 (ProjectCard에 표시)

📁 client/src/pages/
└── SharedProjectViewer.jsx            // 공유된 프로젝트 뷰어 페이지
    ├── ViewerHeader.jsx               // 상단 헤더 (프로젝트 정보, 액션)
    ├── Scene.jsx (재사용)             // 3D Scene 렌더링
    ├── ViewerEditorPanel.jsx          // 권한에 따른 에디터 패널
    └── ExpiredMessage.jsx             // 만료/비활성 메시지

📁 client/src/store/
└── shareStore.js                      // 공유 관련 Zustand Store
```

### 2.2 상태 관리 전략

#### Zustand Store: `shareStore.js`

**역할**: 공유 링크 생성, 조회, 설정 관리, 공유된 프로젝트 조회

**상태 구조**:

```javascript
{
  // 현재 프로젝트의 공유 설정
  shareConfig: {
    token: null,           // 공유 토큰
    permission: 'view',    // 'view' | 'edit'
    expiresAt: null,       // ISO 날짜 또는 null (무제한)
    isActive: true,        // 활성화 상태
    createdAt: null,       // 생성 시간
  },

  // 뷰어 페이지에서 조회한 공유 프로젝트
  sharedProject: null,

  // 로딩/에러 상태
  isLoading: false,
  error: null,

  // 액션들
  actions: {
    generateShareLink,     // 공유 링크 생성
    getShareConfig,        // 공유 설정 조회
    updateShareConfig,     // 공유 설정 업데이트
    deactivateShare,       // 공유 비활성화
    regenerateToken,       // 토큰 재생성
    getSharedProject,      // 공유된 프로젝트 조회 (토큰으로)
  }
}
```

#### 로컬 상태 (컴포넌트 내부)

- `ShareDialog.jsx`: 다이얼로그 열림/닫힘 상태
- `ShareLinkDisplay.jsx`: 링크 복사 성공 피드백 상태 (2초간 체크마크 표시)
- `PermissionSelector.jsx`, `ExpirationSelector.jsx`: 임시 선택값 (확인 전까지)

---

## 3. 주요 컴포넌트 상세 설계

### 3.1 ShareButton - 공유 버튼

**위치**:
- `ProjectCard.jsx` (DropdownMenu 내부)
- `EditorPage.jsx` (헤더 우측, Save 버튼 옆)

**디자인**:

```
[ProjectCard - DropdownMenu 항목]
━━━━━━━━━━━━━━━━━━━━━━━━
  🔗 Share                 >
  📂 Open
  ✏️  Edit Details
  🗑️  Delete
━━━━━━━━━━━━━━━━━━━━━━━━

[EditorPage - Header 버튼]
┌─────────────────────────────────────────┐
│ ← Projects | Project Name    [Share] [Save] │
└─────────────────────────────────────────┘
```

**Props**:

```javascript
{
  projectId: string,      // 프로젝트 ID
  variant: 'dropdown' | 'button', // 렌더링 형태
  onOpenDialog: () => void,       // ShareDialog 열기 콜백
}
```

**접근성**:
- `aria-label="프로젝트 공유"`
- `Share2` 아이콘 (lucide-react)

---

### 3.2 ShareDialog - 공유 설정 다이얼로그

**디자인 명세**:

```
┌─────────────────────────────────────────────────┐
│  🔗 프로젝트 공유                      [X]       │
├─────────────────────────────────────────────────┤
│                                                 │
│  [공유 링크 섹션]                               │
│  ┌───────────────────────────────────────────┐ │
│  │ 🔗 공유 링크                              │ │
│  │                                           │ │
│  │ https://lumo-stage.com/shared/abc123...   │ │
│  │                            [📋 복사됨 ✓]  │ │
│  │                                           │ │
│  │ [🔄 링크 재생성]                          │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  [공유 설정 섹션]                               │
│  ┌───────────────────────────────────────────┐ │
│  │ 권한 설정                                 │ │
│  │  ◉ 읽기 전용                              │ │
│  │    조회만 가능, 조명/카메라 조정 불가     │ │
│  │  ○ 편집 가능                              │ │
│  │    조명/카메라 조정 가능 (저장 불가)      │ │
│  │                                           │ │
│  │ ─────────────────────────────────────────│ │
│  │                                           │ │
│  │ 만료 시간                                 │ │
│  │  [무제한 ▼]                               │ │
│  │    - 무제한                               │ │
│  │    - 1일                                  │ │
│  │    - 7일                                  │ │
│  │    - 30일                                 │ │
│  │                                           │ │
│  │ ─────────────────────────────────────────│ │
│  │                                           │ │
│  │ 공유 활성화              [토글 ON/OFF]    │ │
│  │                                           │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  [취소]                            [설정 저장]  │
└─────────────────────────────────────────────────┘

너비: 540px (max-w-lg)
높이: 자동 (내용에 따라)
```

**shadcn/ui 컴포넌트**:
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`
- `RadioGroup`, `RadioGroupItem` (권한 선택)
- `Select`, `SelectContent`, `SelectItem` (만료 시간)
- `Switch` (활성화 토글)
- `Button` (복사, 재생성, 저장, 취소)
- `Input` (공유 링크 표시, 읽기 전용)
- `Label`, `Separator`

**UX 플로우**:

1. **링크가 없는 경우** (첫 공유):
   - "공유 링크 생성" 버튼만 표시
   - 클릭 시 → API 호출 → 링크 생성 → 링크 표시 영역으로 전환
   - Toast: "공유 링크가 생성되었습니다"

2. **링크가 있는 경우** (기존 공유):
   - 링크 표시 + 복사 버튼
   - 설정 변경 가능
   - "설정 저장" 클릭 시 → API 호출 → 업데이트
   - Toast: "공유 설정이 업데이트되었습니다"

3. **링크 재생성**:
   - "링크 재생성" 버튼 클릭 → 확인 다이얼로그 표시
   - "이전 링크는 더 이상 사용할 수 없습니다. 계속하시겠습니까?"
   - 확인 시 → 새 토큰 생성 → 링크 업데이트
   - Toast: "새 공유 링크가 생성되었습니다"

4. **공유 비활성화**:
   - 토글 OFF → 링크는 유지되지만 접근 불가
   - Toast: "공유가 비활성화되었습니다"

**접근성**:
- 모든 입력 요소에 `Label` 연결
- `RadioGroup`에 `aria-label="권한 설정"`
- 복사 버튼 상태 변화 시 `aria-live="polite"`로 알림
- 키보드 네비게이션: Tab/Shift+Tab으로 모든 컨트롤 접근

---

### 3.3 ShareLinkDisplay - 공유 링크 표시 및 복사

**디자인**:

```
┌─────────────────────────────────────────────┐
│ 🔗 공유 링크                                │
│                                             │
│ https://lumo-stage.com/shared/abc123def...  │
│                              [📋 복사]      │
│                                             │
│ 생성일: 2025-10-28 14:30                    │
│ 만료: 2025-11-04 14:30 (7일 후)             │
└─────────────────────────────────────────────┘

[복사 성공 시 2초간]
┌─────────────────────────────────────────────┐
│ https://lumo-stage.com/shared/abc123def...  │
│                              [✓ 복사됨]     │
└─────────────────────────────────────────────┘
```

**기능**:
- 공유 링크를 읽기 전용 Input에 표시
- 복사 버튼 클릭 시 → `navigator.clipboard.writeText()` → 버튼 아이콘 변경 (Clipboard → Check)
- 2초 후 원래 상태로 복귀
- Toast 표시: "공유 링크가 클립보드에 복사되었습니다"

**Props**:

```javascript
{
  shareUrl: string,         // 전체 공유 URL
  createdAt: Date,          // 생성 시간
  expiresAt: Date | null,   // 만료 시간 (null이면 "무제한")
}
```

---

### 3.4 PermissionSelector - 권한 선택

**디자인**:

```
권한 설정
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ◉ 읽기 전용
    조회만 가능합니다. 조명/카메라 조정이 불가능합니다.
    (권장: 피드백 받기, 포트폴리오 공유)

  ○ 편집 가능
    조명/카메라를 조정할 수 있지만 저장은 불가능합니다.
    (권장: 협업, 실시간 조명 테스트)
```

**shadcn/ui 컴포넌트**:
- `RadioGroup`, `RadioGroupItem`, `Label`

**Props**:

```javascript
{
  value: 'view' | 'edit',
  onChange: (value) => void,
}
```

**UX**:
- 각 옵션 클릭 시 즉시 선택 변경 (저장은 "설정 저장" 버튼)
- 설명 텍스트로 차이점 명확히 전달
- `text-muted-foreground` 스타일로 부가 설명 표시

---

### 3.5 ExpirationSelector - 만료 시간 선택

**디자인**:

```
만료 시간
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  [무제한 ▼]

  [드롭다운 열림]
  ┌──────────────┐
  │ ✓ 무제한     │
  │   1일        │
  │   7일        │
  │   30일       │
  └──────────────┘
```

**shadcn/ui 컴포넌트**:
- `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`

**Props**:

```javascript
{
  value: null | 1 | 7 | 30,  // null: 무제한, 숫자: 일 수
  onChange: (value) => void,
}
```

**옵션**:
- 무제한: `expiresAt = null`
- 1일: `expiresAt = now + 1일`
- 7일: `expiresAt = now + 7일`
- 30일: `expiresAt = now + 30일`

---

### 3.6 ActiveToggle - 활성화/비활성화

**디자인**:

```
공유 활성화                      [●───────] ON

비활성화 시 공유 링크로 접근할 수 없습니다.
```

**shadcn/ui 컴포넌트**:
- `Switch`, `Label`

**Props**:

```javascript
{
  checked: boolean,
  onChange: (checked) => void,
}
```

**UX**:
- OFF로 전환 시 → 경고 메시지 없이 즉시 반영 (설정 저장 필요)
- ON/OFF 상태에 따라 다른 색상 표시 (ON: primary, OFF: muted)

---

### 3.7 ShareStatusBadge - 공유 상태 뱃지

**위치**: `ProjectCard.jsx` 썸네일 우측 상단 (조명 개수 뱃지 옆)

**디자인**:

```
[ProjectCard 썸네일]
┌─────────────────────────────┐
│                             │
│            📷              │
│                             │
│  [💡 3]  [🔗 공유 중]       │ ← 우측 상단
└─────────────────────────────┘
```

**Props**:

```javascript
{
  isShared: boolean,         // 공유 중 여부
  permission: 'view' | 'edit', // 권한 (툴팁에 표시)
}
```

**상태**:
- **공유 중** (`isShared && isActive`): `bg-primary/90 text-white` - "🔗 공유 중"
- **비활성** (`isShared && !isActive`): `bg-gray-500/90 text-white` - "🔗 비활성"
- **공유 안 함** (`!isShared`): 뱃지 표시 안 함

**툴팁** (hover 시):
- "읽기 전용으로 공유 중"
- "편집 가능으로 공유 중"
- "공유가 비활성화되어 있습니다"

---

### 3.8 SharedProjectViewer - 공유된 프로젝트 뷰어 페이지

**라우트**: `/shared/:token`

**페이지 구조**:

```
┌─────────────────────────────────────────────────────────────┐
│ ViewerHeader                                     [h-14]      │
│ [◀ LumoStage] | Project Name          [에디터로 열기 →]    │
├─────────────────────────────────────────────────────────────┤
│                           │                                 │
│                           │  ViewerEditorPanel              │
│   3D Scene (재사용)        │  (권한에 따라 조정)              │
│   [flex-1]                │  [w-96]                         │
│                           │                                 │
│                           │  - view: 카메라 정보만 표시      │
│   [OrbitControls]         │  - edit: 조명/카메라 조정 가능   │
│                           │         (저장 버튼 없음)         │
│                           │                                 │
└─────────────────────────────────────────────────────────────┘
```

#### ViewerHeader

**디자인**:

```
┌─────────────────────────────────────────────────────────┐
│ [◀ LumoStage]  Project Name  👁️ 읽기 전용   [에디터로 열기] │
└─────────────────────────────────────────────────────────┘
```

**요소**:
- 좌측: LumoStage 로고 + 링크 (홈페이지로)
- 중앙: 프로젝트 이름
- 우측 중앙: 권한 뱃지 (`Badge` - "👁️ 읽기 전용" 또는 "✏️ 편집 가능")
- 우측: "에디터로 열기" 버튼 (로그인 사용자만 - 복제 생성 또는 원본 열기)

**조건부 렌더링**:
- **로그인 사용자**:
  - 본인 프로젝트: "에디터로 열기" → `/editor/:id`로 이동
  - 타인 프로젝트: "복제하여 편집" → 새 프로젝트 생성 후 에디터 열기
- **비로그인 사용자**: "로그인하여 편집하기" → 로그인 페이지로 이동

#### ViewerEditorPanel

**권한별 표시**:

**읽기 전용 (view)**:
```
┌─────────────────────────┐
│ 📷 Camera               │
│                         │
│ Position                │
│ X: 5.0                  │
│ Y: 5.0                  │
│ Z: 5.0                  │
│                         │
│ FOV: 75°                │
│                         │
│ ─────────────────────── │
│                         │
│ 💡 Lights (3)           │
│                         │
│ [Light 1 정보 표시]     │
│ [Light 2 정보 표시]     │
│ [Light 3 정보 표시]     │
│                         │
│ (조정 불가, 읽기 전용)  │
└─────────────────────────┘
```

**편집 가능 (edit)**:
```
┌─────────────────────────┐
│ 📷 Camera               │
│                         │
│ Position                │
│ X: [슬라이더] 5.0       │
│ Y: [슬라이더] 5.0       │
│ Z: [슬라이더] 5.0       │
│                         │
│ FOV: [슬라이더] 75°     │
│                         │
│ ─────────────────────── │
│                         │
│ 💡 Lights               │
│                         │
│ [Light Card 1] (편집 가능) │
│ [Light Card 2] (편집 가능) │
│                         │
│ ⚠️ 변경사항은 저장되지   │
│    않습니다.            │
└─────────────────────────┘
```

**UX**:
- 편집 가능 모드에서도 "저장" 버튼 없음
- 조명/카메라 조정은 가능하지만 서버에 저장 안 됨 (로컬 상태만 변경)
- 페이지 새로고침 시 원래 상태로 복귀
- "이 프로젝트를 저장하려면 복제하세요" 안내 메시지

#### ExpiredMessage - 만료/비활성 메시지

**표시 조건**:
- 토큰 만료 (`expiresAt < now`)
- 공유 비활성화 (`isActive === false`)
- 프로젝트 삭제

**디자인**:

```
┌─────────────────────────────────────────────┐
│                                             │
│              🔗                             │
│                                             │
│        이 공유 링크는 만료되었습니다.        │
│                                             │
│   프로젝트 소유자에게 새 링크를 요청하세요.  │
│                                             │
│              [LumoStage 홈으로]             │
│                                             │
└─────────────────────────────────────────────┘
```

**중앙 정렬, 전체 화면**

---

## 4. 사용자 플로우 상세

### 4.1 Flow 1: 공유 링크 생성 (첫 공유)

```
[ProjectsDashboard 또는 EditorPage]
  ↓
사용자가 "공유" 버튼 클릭
  ↓
ShareDialog 열림 (링크 없음 상태)
  ┌─────────────────────────────────┐
  │ "공유 링크 생성" 버튼만 표시     │
  └─────────────────────────────────┘
  ↓
"공유 링크 생성" 버튼 클릭
  ↓
API 호출: POST /api/projects/:id/share
  {
    permission: 'view',    // 기본값
    expiresAt: null,       // 무제한
    isActive: true
  }
  ↓
[로딩 상태] - 버튼에 스피너 표시
  ↓
[성공]
  - shareStore에 shareConfig 저장
  - 링크 표시 영역으로 UI 전환
  - Toast: "공유 링크가 생성되었습니다"
  - 자동으로 클립보드에 복사
  - Toast: "공유 링크가 클립보드에 복사되었습니다"
  ↓
[다이얼로그 상태]
  ┌─────────────────────────────────┐
  │ 링크: https://...               │
  │ [📋 복사됨 ✓]                   │
  │                                 │
  │ 권한: ◉ 읽기 전용               │
  │ 만료: 무제한                    │
  │ 활성화: ON                      │
  └─────────────────────────────────┘
```

**예상 소요 시간**: 3-5초 (API 호출 포함)

---

### 4.2 Flow 2: 공유 설정 변경

```
[기존 공유 링크가 있는 프로젝트]
  ↓
"공유" 버튼 클릭
  ↓
ShareDialog 열림 → 기존 공유 설정 로드 (shareStore에서)
  ┌─────────────────────────────────┐
  │ 링크: https://...               │
  │ [📋 복사]                       │
  │                                 │
  │ 권한: ◉ 읽기 전용               │
  │ 만료: 7일                       │
  │ 활성화: ON                      │
  └─────────────────────────────────┘
  ↓
사용자가 설정 변경 (예: 권한 → 편집 가능)
  ↓
"설정 저장" 버튼 클릭
  ↓
API 호출: PATCH /api/projects/:id/share
  {
    permission: 'edit',
    expiresAt: '2025-11-04T14:30:00Z',
    isActive: true
  }
  ↓
[로딩] - 버튼 비활성화
  ↓
[성공]
  - shareStore 업데이트
  - Toast: "공유 설정이 업데이트되었습니다"
  - 다이얼로그는 열린 상태 유지 (사용자가 닫을 때까지)
```

---

### 4.3 Flow 3: 공유 링크로 접근 (읽기 전용)

```
[사용자가 공유 링크 클릭]
  https://lumo-stage.com/shared/abc123def456
  ↓
SharedProjectViewer 페이지로 라우팅 (/shared/:token)
  ↓
useEffect: getSharedProject(token) 호출
  ↓
API 호출: GET /api/share/:token
  ↓
[로딩 상태]
  ┌─────────────────────────────────┐
  │                                 │
  │         ⏳ 로딩 중...           │
  │                                 │
  └─────────────────────────────────┘
  ↓
[성공] - 프로젝트 데이터 수신
  {
    project: { name, sceneData, ... },
    permission: 'view',
    expiresAt: '2025-11-04T14:30:00Z',
    isActive: true
  }
  ↓
[뷰어 페이지 렌더링]
  ┌─────────────────────────────────────────┐
  │ Header: Project Name | 👁️ 읽기 전용    │
  ├─────────────────────────────────────────┤
  │ Scene (3D)    │ ViewerEditorPanel       │
  │               │ - 카메라 정보 표시       │
  │               │ - 조명 정보 표시 (편집X) │
  │               │ - OrbitControls만 가능  │
  └─────────────────────────────────────────┘
  ↓
[사용자 상호작용]
  - OrbitControls로 카메라 회전/줌 가능
  - 조명/마네킹 조정 불가 (슬라이더 비활성화)
```

**에러 케이스**:
- 토큰 만료 → `ExpiredMessage` 표시
- 공유 비활성화 → `ExpiredMessage` 표시
- 프로젝트 삭제 → 404 메시지
- 네트워크 에러 → 에러 메시지 + 재시도 버튼

---

### 4.4 Flow 4: 공유 링크로 접근 (편집 가능)

```
[사용자가 공유 링크 클릭 - permission: 'edit']
  ↓
SharedProjectViewer 페이지 렌더링
  ┌─────────────────────────────────────────┐
  │ Header: Project Name | ✏️ 편집 가능    │
  ├─────────────────────────────────────────┤
  │ Scene (3D)    │ ViewerEditorPanel       │
  │               │ - 카메라 조정 가능       │
  │               │ - 조명 조정 가능         │
  │               │ - 조명 추가/삭제 불가    │
  │               │ ⚠️ 변경사항 저장 안 됨  │
  └─────────────────────────────────────────┘
  ↓
[사용자가 조명 조정]
  - Slider로 position, intensity 변경
  - 실시간으로 Scene 업데이트 (Zustand 로컬 상태)
  - 서버에는 저장되지 않음
  ↓
[페이지 새로고침 또는 재접속]
  - 원래 상태로 복귀 (서버에서 다시 로드)
  ↓
[복제하여 저장하기]
  - "에디터로 열기" 버튼 클릭
  - 로그인 확인
    - 로그인 O: 새 프로젝트 생성 (복제) → 에디터 페이지로 이동
    - 로그인 X: 로그인 페이지로 이동
```

---

### 4.5 Flow 5: 링크 재생성

```
[ShareDialog에서 기존 링크 표시 중]
  ↓
"링크 재생성" 버튼 클릭
  ↓
[확인 다이얼로그 표시]
  ┌─────────────────────────────────┐
  │ ⚠️ 링크 재생성                  │
  │                                 │
  │ 이전 링크는 더 이상 사용할 수   │
  │ 없습니다. 계속하시겠습니까?     │
  │                                 │
  │      [취소]        [재생성]     │
  └─────────────────────────────────┘
  ↓
"재생성" 클릭
  ↓
API 호출: POST /api/projects/:id/share/regenerate
  ↓
[성공]
  - 새 토큰 생성
  - shareStore 업데이트
  - 링크 표시 영역 업데이트 (새 URL)
  - Toast: "새 공유 링크가 생성되었습니다"
  - 자동으로 클립보드에 복사
  ↓
[이전 링크로 접근 시]
  - 404 또는 "링크가 만료되었습니다" 메시지
```

---

## 5. Shadcn/ui 컴포넌트 목록

### 5.1 이미 설치된 컴포넌트

(기존 프로젝트에서 확인 필요)

- ✅ `button`
- ✅ `dialog`
- ✅ `input`
- ✅ `label`
- ✅ `badge`
- ✅ `dropdown-menu`
- ✅ `card`

### 5.2 추가 설치 필요한 컴포넌트

```bash
# 공유 기능 구현에 필요한 컴포넌트
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add select
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add alert-dialog  # 링크 재생성 확인용
```

---

## 6. 접근성 및 반응형 고려사항

### 6.1 접근성 (WCAG 2.1 AA)

#### 키보드 네비게이션

- **Tab 순서**: 공유 버튼 → 다이얼로그 내 요소들 (링크, 복사, 설정, 저장/취소)
- **Enter**: 버튼 활성화, RadioGroup/Select 선택 확정
- **Esc**: 다이얼로그 닫기
- **Space**: Switch 토글, RadioGroup 선택

#### ARIA 레이블 및 역할

```jsx
// ShareButton
<Button aria-label="프로젝트 공유">
  <Share2 className="w-4 h-4" />
</Button>

// ShareDialog
<Dialog role="dialog" aria-labelledby="share-dialog-title">
  <DialogTitle id="share-dialog-title">프로젝트 공유</DialogTitle>
  ...
</Dialog>

// PermissionSelector
<RadioGroup aria-label="권한 설정">
  <RadioGroupItem value="view" aria-label="읽기 전용" />
  <RadioGroupItem value="edit" aria-label="편집 가능" />
</RadioGroup>

// ShareLinkDisplay (복사 성공 피드백)
<span role="status" aria-live="polite">
  {copied ? '복사됨' : ''}
</span>
```

#### 색상 대비

- 텍스트: `text-white` on `bg-studio-900` → 대비 15:1 (AAA)
- 링크: `text-primary-500` on `bg-studio-900` → 대비 4.5:1 이상
- 버튼: `bg-primary-600` (충분한 대비 확보)

#### 포커스 표시

- 모든 인터랙티브 요소: `focus-visible:ring-2 ring-primary-500 ring-offset-2`
- 키보드 사용자에게 명확한 포커스 표시

---

### 6.2 반응형 디자인

#### ShareDialog

**Desktop (1024px+)**:
- 너비: `max-w-lg` (512px)
- 모든 요소 한 화면에 표시

**Tablet (768px - 1023px)**:
- 너비: `max-w-md` (448px)
- 폰트 크기 유지
- 여백 약간 축소

**Mobile (767px 이하)**:
- 너비: `max-w-full` (화면 전체 - 좌우 여백 16px)
- 다이얼로그를 바닥에서 올라오는 형태 (`Dialog.Content` 변형)
- 링크 텍스트: `text-xs truncate`
- 설명 텍스트: 축약 또는 숨김

#### SharedProjectViewer

**Desktop (1024px+)**:
```
[Header (h-14)]
[Scene (flex-1) | Panel (w-96)]
```

**Tablet (768px - 1023px)**:
```
[Header (h-14)]
[Scene (full width)]
[Panel (overlay - 토글 버튼으로 열기)]
```

**Mobile (767px 이하)**:
```
[Header (h-12)]
[Scene (full screen)]
[Panel (bottom sheet - 아래에서 올라옴)]
```

---

## 7. 토스트 메시지 명세

### 7.1 추가할 메시지 (toast-messages.js)

```javascript
// 공유 관련 메시지
export const SHARE_MESSAGES = {
  // 링크 생성
  createLinkLoading: '공유 링크를 생성하는 중...',
  createLinkSuccess: '공유 링크가 생성되었습니다',
  createLinkError: '공유 링크 생성에 실패했습니다',

  // 링크 복사
  linkCopied: '공유 링크가 클립보드에 복사되었습니다',
  linkCopyError: '클립보드 복사에 실패했습니다',

  // 설정 업데이트
  updateSettingsSuccess: '공유 설정이 업데이트되었습니다',
  updateSettingsError: '공유 설정 업데이트에 실패했습니다',

  // 링크 재생성
  regenerateLinkSuccess: '새 공유 링크가 생성되었습니다',
  regenerateLinkError: '링크 재생성에 실패했습니다',

  // 공유 비활성화
  deactivateSuccess: '공유가 비활성화되었습니다',
  deactivateError: '공유 비활성화에 실패했습니다',

  // 공유 활성화
  activateSuccess: '공유가 활성화되었습니다',

  // 공유 프로젝트 조회
  loadSharedProjectError: '공유된 프로젝트를 불러올 수 없습니다',

  // 만료/비활성
  linkExpired: '이 공유 링크는 만료되었습니다',
  linkInactive: '이 공유 링크는 비활성화되었습니다',

  // 복제
  projectClonedSuccess: '프로젝트가 복제되었습니다',
  projectCloneError: '프로젝트 복제에 실패했습니다',
};
```

### 7.2 Toast 사용 예시

```javascript
// 링크 생성 (Promise 기반)
const generatePromise = shareStore.generateShareLink(projectId);
toast.promise(generatePromise, {
  loading: SHARE_MESSAGES.createLinkLoading,
  success: SHARE_MESSAGES.createLinkSuccess,
  error: SHARE_MESSAGES.createLinkError,
});

// 링크 복사 (즉시)
toast.success(SHARE_MESSAGES.linkCopied);
```

---

## 8. 상태 흐름 다이어그램

### 8.1 ShareDialog 상태 머신

```
┌─────────────┐
│   INITIAL   │ (다이얼로그 열림)
└──────┬──────┘
       │
       ├─ 링크 없음 → [NO_LINK] ──────┐
       │                              │
       └─ 링크 있음 → [HAS_LINK]      │
                                      │
                                      ▼
                            [GENERATING_LINK] (로딩)
                                      │
                                      ├─ 성공 → [HAS_LINK]
                                      │
                                      └─ 실패 → [ERROR]
                                                  │
                                                  └─ 재시도 → [GENERATING_LINK]

[HAS_LINK]
   │
   ├─ 설정 변경 → [UNSAVED_CHANGES]
   │                 │
   │                 └─ 저장 → [UPDATING] → 성공 → [HAS_LINK]
   │
   ├─ 링크 재생성 → [CONFIRM_REGENERATE]
   │                     │
   │                     └─ 확인 → [REGENERATING] → 성공 → [HAS_LINK]
   │
   └─ 링크 복사 → [COPY_SUCCESS] (2초 후 → [HAS_LINK])
```

### 8.2 SharedProjectViewer 상태 머신

```
┌─────────────┐
│   LOADING   │ (초기 로드)
└──────┬──────┘
       │
       ├─ API 성공 → [LOADED]
       │               │
       │               ├─ permission: 'view' → [VIEW_MODE]
       │               │                          │
       │               │                          └─ OrbitControls만 가능
       │               │
       │               └─ permission: 'edit' → [EDIT_MODE]
       │                                          │
       │                                          ├─ 조명/카메라 조정 가능
       │                                          │
       │                                          └─ 저장 불가
       │
       └─ API 실패 → [ERROR]
                      │
                      ├─ 만료 → [EXPIRED]
                      │
                      ├─ 비활성 → [INACTIVE]
                      │
                      └─ 404 → [NOT_FOUND]
```

---

## 9. 컴포넌트 Props 인터페이스 (TypeScript-style 명세)

### ShareButton

```typescript
interface ShareButtonProps {
  projectId: string;
  variant?: 'dropdown' | 'button';
  className?: string;
  onOpenDialog?: () => void;
}
```

### ShareDialog

```typescript
interface ShareDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

### ShareLinkDisplay

```typescript
interface ShareLinkDisplayProps {
  shareUrl: string;
  createdAt: Date;
  expiresAt: Date | null;
  onCopy?: () => void;
}
```

### PermissionSelector

```typescript
type Permission = 'view' | 'edit';

interface PermissionSelectorProps {
  value: Permission;
  onChange: (value: Permission) => void;
  disabled?: boolean;
}
```

### ExpirationSelector

```typescript
type ExpirationDays = null | 1 | 7 | 30;

interface ExpirationSelectorProps {
  value: ExpirationDays;
  onChange: (value: ExpirationDays) => void;
  disabled?: boolean;
}
```

### ActiveToggle

```typescript
interface ActiveToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}
```

### ShareStatusBadge

```typescript
interface ShareStatusBadgeProps {
  isShared: boolean;
  isActive: boolean;
  permission: Permission;
}
```

### SharedProjectViewer

```typescript
interface SharedProjectViewerProps {
  token: string; // URL 파라미터에서 추출
}

interface ViewerHeaderProps {
  projectName: string;
  permission: Permission;
  isOwner: boolean;
  isAuthenticated: boolean;
  onOpenEditor: () => void;
}

interface ViewerEditorPanelProps {
  permission: Permission;
  sceneData: SceneData;
}

interface ExpiredMessageProps {
  reason: 'expired' | 'inactive' | 'not-found';
}
```

---

## 10. 성능 및 최적화 고려사항

### 10.1 렌더링 최적화

- **React.memo**: ShareLinkDisplay, PermissionSelector 등 자주 리렌더링되지 않는 컴포넌트
- **useCallback**: onChange 핸들러 메모이제이션
- **useMemo**: 공유 URL 생성 로직 (token 변경 시만 재계산)

### 10.2 API 호출 최적화

- **Debounce**: 설정 변경 시 즉시 API 호출하지 않고 "설정 저장" 버튼으로만 제어
- **캐싱**: 공유 설정 조회 후 shareStore에 캐싱, 다시 열 때 재사용

### 10.3 클립보드 API 폴백

```javascript
// 최신 브라우저: navigator.clipboard.writeText()
// 구형 브라우저: document.execCommand('copy') 폴백
async function copyToClipboard(text) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}
```

---

## 11. 에러 처리 전략

### 11.1 API 에러 케이스

| 에러 상황 | HTTP 상태 | UI 처리 |
|----------|-----------|---------|
| 토큰 만료 | 410 Gone | ExpiredMessage 표시 |
| 공유 비활성화 | 403 Forbidden | ExpiredMessage 표시 |
| 프로젝트 삭제 | 404 Not Found | "프로젝트를 찾을 수 없습니다" |
| 권한 없음 (본인 프로젝트 아님) | 403 Forbidden | "공유 링크 생성 권한이 없습니다" |
| 네트워크 에러 | - | "네트워크 오류가 발생했습니다" + 재시도 버튼 |
| 서버 에러 | 500 Internal Server Error | "일시적인 오류입니다. 잠시 후 다시 시도하세요" |

### 11.2 클립보드 복사 실패

```javascript
try {
  await copyToClipboard(shareUrl);
  toast.success(SHARE_MESSAGES.linkCopied);
  setCopied(true);
} catch (error) {
  toast.error(SHARE_MESSAGES.linkCopyError);
  // 대체 UI: 링크를 선택하여 수동 복사하도록 안내
  inputRef.current.select();
}
```

---

## 12. 테스트 시나리오

### 12.1 단위 테스트 (컴포넌트)

- [ ] ShareButton 클릭 시 onOpenDialog 호출
- [ ] ShareLinkDisplay 복사 버튼 클릭 시 클립보드에 복사
- [ ] PermissionSelector 선택 변경 시 onChange 호출
- [ ] ExpirationSelector 옵션 선택 시 올바른 값 전달
- [ ] ActiveToggle 토글 시 onChange 호출

### 12.2 통합 테스트 (플로우)

- [x] 공유 링크 생성 → API 호출 → 링크 표시
- [x] 설정 변경 → 저장 → API 호출 → Toast 표시
- [x] 링크 재생성 → 확인 다이얼로그 → API 호출 → 새 링크 표시
- [x] 공유 링크 접근 → 프로젝트 로드 → 권한에 따른 UI 표시

### 12.3 접근성 테스트

- [ ] 키보드만으로 모든 기능 사용 가능
- [ ] 스크린 리더로 모든 요소 읽기 가능
- [ ] 색상 대비 4.5:1 이상 (WCAG AA)
- [ ] 포커스 표시 명확함

### 12.4 반응형 테스트

- [ ] Desktop (1920px): 모든 요소 정상 표시
- [ ] Tablet (768px): 다이얼로그 너비 축소, 기능 정상
- [ ] Mobile (375px): 다이얼로그 전체 화면, 터치 친화적

---

## 13. 구현 우선순위

### Phase 1: 핵심 기능 (1주)

- [x] ShareButton 컴포넌트
- [x] ShareDialog 기본 구조
- [x] ShareLinkDisplay (링크 생성 + 복사)
- [x] shareStore 기본 액션 (generateShareLink, getShareConfig)
- [x] Toast 메시지 통합

### Phase 2: 설정 기능 (1주)

- [ ] PermissionSelector
- [ ] ExpirationSelector
- [ ] ActiveToggle
- [ ] shareStore 업데이트 액션 (updateShareConfig)
- [ ] 링크 재생성 기능

### Phase 3: 뷰어 페이지 (1-2주)

- [ ] SharedProjectViewer 라우트 설정
- [ ] ViewerHeader
- [ ] ViewerEditorPanel (권한별 UI)
- [ ] ExpiredMessage
- [ ] shareStore getSharedProject 액션

### Phase 4: 개선 및 폴리시 (1주)

- [ ] ShareStatusBadge (ProjectCard에 통합)
- [ ] 접근성 개선 (ARIA, 키보드 네비게이션)
- [ ] 반응형 최적화
- [ ] 에러 처리 강화
- [ ] 테스트 작성

---

## 14. 디자인 토큰 (Tailwind CSS)

### 14.1 색상

```javascript
// 공유 관련 색상 추가 (tailwind.config.js)
colors: {
  share: {
    active: '#10b981',    // 공유 활성화 (green-500)
    inactive: '#6b7280',  // 공유 비활성화 (gray-500)
    view: '#3b82f6',      // 읽기 전용 (blue-500)
    edit: '#f59e0b',      // 편집 가능 (amber-500)
  }
}
```

### 14.2 간격

```javascript
// ShareDialog 내부 간격
space-y-6  // 섹션 간 간격
space-y-4  // 설정 항목 간 간격
space-y-2  // 레이블-입력 간격
px-6 py-4  // DialogContent 패딩
```

### 14.3 폰트

```javascript
// 링크 표시
font-mono text-sm  // 공유 URL

// 설명 텍스트
text-xs text-muted-foreground

// 제목
text-lg font-semibold
```

---

## 15. 사용자 피드백 수집 계획

### 15.1 베타 테스트 시나리오

1. **시나리오 1**: 포트폴리오 공유
   - 크리에이터가 자신의 조명 작업을 읽기 전용으로 공유
   - 피드백: 링크 복사가 직관적인가? 권한 설명이 명확한가?

2. **시나리오 2**: 협업 작업
   - 팀원에게 편집 가능 링크 공유
   - 피드백: 편집 모드에서 저장 불가 안내가 충분한가?

3. **시나리오 3**: 일시적 공유
   - 클라이언트에게 7일 제한 링크 공유
   - 피드백: 만료 시간 설정이 쉬운가? 만료 안내가 명확한가?

### 15.2 수집할 메트릭

- 공유 링크 생성 완료율
- 링크 복사 성공률
- 설정 변경 후 저장 완료율
- 뷰어 페이지 평균 체류 시간
- 공유 링크 접근 오류율 (만료/비활성)

---

## 16. 향후 개선 아이디어 (Post-MVP)

### 16.1 고급 권한 관리

- **특정 사용자만 접근**: 이메일 기반 접근 제어
- **비밀번호 보호**: 링크에 비밀번호 추가
- **워터마크**: 공유 뷰어에 소유자 정보 표시

### 16.2 공유 통계

- 링크 조회 수
- 조회한 사용자 정보 (익명/로그인)
- 조회 시간 분포

### 16.3 임베드 기능

- iframe 임베드 코드 제공
- 포트폴리오 사이트에 삽입 가능

### 16.4 소셜 공유

- Twitter/Facebook 공유 버튼
- OG 메타 태그로 공유 미리보기 개선

---

## 17. 참고 파일 목록

### 17.1 기존 파일 (수정 필요)

- `/client/src/components/projects/ProjectCard.jsx`
  - ShareButton 추가 (DropdownMenu 항목)
  - ShareStatusBadge 추가 (썸네일 우측 상단)

- `/client/src/pages/EditorPage.jsx`
  - ShareButton 추가 (헤더 우측)

- `/client/src/App.jsx`
  - `/shared/:token` 라우트 추가

- `/client/src/lib/toast-messages.js`
  - `SHARE_MESSAGES` 추가

### 17.2 신규 파일 (생성 필요)

- `/client/src/components/share/ShareButton.jsx`
- `/client/src/components/share/ShareDialog.jsx`
- `/client/src/components/share/ShareLinkSection.jsx`
- `/client/src/components/share/ShareLinkDisplay.jsx`
- `/client/src/components/share/ShareSettingsSection.jsx`
- `/client/src/components/share/PermissionSelector.jsx`
- `/client/src/components/share/ExpirationSelector.jsx`
- `/client/src/components/share/ActiveToggle.jsx`
- `/client/src/components/share/ShareStatusBadge.jsx`
- `/client/src/pages/SharedProjectViewer.jsx`
- `/client/src/pages/SharedProjectViewer/ViewerHeader.jsx`
- `/client/src/pages/SharedProjectViewer/ViewerEditorPanel.jsx`
- `/client/src/pages/SharedProjectViewer/ExpiredMessage.jsx`
- `/client/src/store/shareStore.js`

---

## 18. 최종 체크리스트

### 18.1 디자인 명세 완료

- [x] 컴포넌트 구조 정의
- [x] UI 와이어프레임 (텍스트 설명)
- [x] 사용자 플로우 5개 정의
- [x] Shadcn/ui 컴포넌트 목록
- [x] 접근성 요구사항
- [x] 반응형 전략
- [x] 상태 관리 구조

### 18.2 구현 준비

- [x] Props 인터페이스 정의
- [x] 상태 흐름 다이어그램
- [x] 에러 처리 전략
- [x] 토스트 메시지 명세
- [x] 테스트 시나리오
- [x] 구현 우선순위

### 18.3 문서화

- [x] 설계 문서 작성 (본 문서)
- [x] API 명세 문서 참조 (별도 문서)
- [ ] 개발자 가이드 (구현 시 작성)

---

## 부록 A: 와이어프레임 상세 (ASCII Art)

### A.1 ShareDialog (링크 없음 상태)

```
┌───────────────────────────────────────────────────────────┐
│  🔗 프로젝트 공유                                   [X]   │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  이 프로젝트를 다른 사람과 공유하세요.                    │
│  조회 권한과 만료 시간을 설정할 수 있습니다.              │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │                                                     │ │
│  │                 🔗                                  │ │
│  │                                                     │ │
│  │          공유 링크가 아직 생성되지 않았습니다.       │ │
│  │                                                     │ │
│  │           [공유 링크 생성]                          │ │
│  │                                                     │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  [닫기]                                                   │
└───────────────────────────────────────────────────────────┘
```

### A.2 ShareDialog (링크 있음 상태)

```
┌───────────────────────────────────────────────────────────┐
│  🔗 프로젝트 공유                                   [X]   │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  🔗 공유 링크                                             │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ https://lumo-stage.com/shared/abc123def456...       │ │
│  │                                       [📋 복사]     │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  생성일: 2025-10-28 14:30                                 │
│  만료: 2025-11-04 14:30 (7일 후)                          │
│                                                           │
│  [🔄 링크 재생성]                                         │
│                                                           │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  권한 설정                                                │
│                                                           │
│  ◉ 읽기 전용                                              │
│    조회만 가능합니다. 조명/카메라 조정이 불가능합니다.    │
│    권장: 피드백 받기, 포트폴리오 공유                     │
│                                                           │
│  ○ 편집 가능                                              │
│    조명/카메라를 조정할 수 있지만 저장은 불가능합니다.    │
│    권장: 협업, 실시간 조명 테스트                         │
│                                                           │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  만료 시간                                                │
│  [7일 ▼]                                                  │
│                                                           │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  공유 활성화                            [●─────────] ON   │
│                                                           │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  [취소]                                      [설정 저장]  │
└───────────────────────────────────────────────────────────┘
```

### A.3 SharedProjectViewer (읽기 전용)

```
┌─────────────────────────────────────────────────────────────┐
│ [◀ LumoStage]   Product Shoot   👁️ 읽기 전용  [에디터로 열기] │
├──────────────────────────────────┬──────────────────────────┤
│                                  │  📷 Camera               │
│                                  │                          │
│                                  │  Position                │
│         3D Scene                 │  X: 5.0                  │
│         (OrbitControls)          │  Y: 5.0                  │
│                                  │  Z: 8.0                  │
│                                  │                          │
│         🌟                       │  Field of View           │
│            💡                    │  75°                     │
│                                  │                          │
│                                  │  ───────────────────────│
│         🧍                       │                          │
│                                  │  💡 Lights (3)           │
│                                  │                          │
│                                  │  ┌─────────────────────┐│
│                                  │  │ Key Light           ││
│                                  │  │ Position: 5,5,5     ││
│                                  │  │ Color: #ffffff      ││
│                                  │  │ Intensity: 1.5      ││
│                                  │  └─────────────────────┘│
│                                  │                          │
│                                  │  ┌─────────────────────┐│
│                                  │  │ Fill Light          ││
│                                  │  │ ...                 ││
│  [Grid: ON]  [3 Lights]          │  └─────────────────────┘│
└──────────────────────────────────┴──────────────────────────┘
```

### A.4 SharedProjectViewer (편집 가능)

```
┌─────────────────────────────────────────────────────────────┐
│ [◀ LumoStage]   Product Shoot   ✏️ 편집 가능  [복제하여 저장] │
├──────────────────────────────────┬──────────────────────────┤
│                                  │  📷 Camera               │
│                                  │                          │
│                                  │  Position                │
│         3D Scene                 │  X: [━━●━━━━━] 5.0       │
│         (OrbitControls)          │  Y: [━━●━━━━━] 5.0       │
│                                  │  Z: [━━━━●━━━] 8.0       │
│                                  │                          │
│         🌟                       │  FOV: [━━━●━━━] 75°      │
│            💡                    │                          │
│                                  │  ───────────────────────│
│                                  │                          │
│         🧍                       │  💡 Lights               │
│                                  │                          │
│                                  │  ┌─────────────────────┐│
│                                  │  │ Key Light           ││
│                                  │  │ X: [━●━━━━━] 5.0    ││
│                                  │  │ Y: [━●━━━━━] 5.0    ││
│                                  │  │ Z: [━●━━━━━] 5.0    ││
│                                  │  │ Color: [⬜]          ││
│                                  │  │ Intensity: [━━●━]   ││
│  [Grid: ON]  [3 Lights]          │  └─────────────────────┘│
│                                  │                          │
│                                  │  ⚠️ 변경사항은 저장되지  │
│                                  │     않습니다.            │
└──────────────────────────────────┴──────────────────────────┘
```

### A.5 ExpiredMessage

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                                                         │
│                        🔗                               │
│                                                         │
│                                                         │
│              이 공유 링크는 만료되었습니다.              │
│                                                         │
│       프로젝트 소유자에게 새 링크를 요청하세요.          │
│                                                         │
│                                                         │
│                [LumoStage 홈으로]                       │
│                                                         │
│                                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 문서 변경 이력

- **2025-10-28**: 초안 작성 (UI/UX Designer Agent)
- **향후 업데이트**: 베타 테스트 피드백 반영 예정

---

**설계 완료**. 구현은 frontend-developer Agent에게 위임하거나, 본 명세를 참고하여 직접 개발을 진행하세요.
