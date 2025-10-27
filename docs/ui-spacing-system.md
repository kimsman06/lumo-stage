# LumoStage UI 간격 시스템 (Spacing System)

본 문서는 LumoStage 프로젝트의 일관된 UI 구현을 위한 간격(spacing) 시스템을 정의합니다.

## 기본 원칙

- **일관성**: 모든 페이지와 컴포넌트에서 동일한 간격 체계 사용
- **예측 가능성**: 개발자가 직관적으로 올바른 간격을 선택할 수 있도록 명확한 가이드 제공
- **Tailwind CSS 기반**: Tailwind의 기본 간격 단위(4px 기준) 활용

---

## 1. 간격 단위 (Spacing Units)

### Tailwind 기본 스케일
- `1` = 4px
- `2` = 8px
- `3` = 12px
- `4` = 16px
- `6` = 24px
- `8` = 32px

### 권장 사용 범위
본 프로젝트에서는 **2, 3, 4, 6**을 주로 사용합니다.

---

## 2. 수직 간격 (Vertical Spacing)

### `space-y-*` (요소 간 세로 간격)

| 클래스 | 값 | 용도 | 예시 |
|--------|-----|------|------|
| `space-y-2` | 8px | **밀집형** - Form field 내부 (Label + Input) | Login form의 Label과 Input 사이 |
| `space-y-3` | 12px | **중간** - 관련 항목 그룹 | Card 내부 정보 섹션 |
| `space-y-4` | 16px | **기본** - 일반 컴포넌트/섹션 간격 | Dialog 내부 form fields, 대시보드 섹션 |
| `space-y-6` | 24px | **넓음** - 주요 섹션 구분 | 에디터 패널의 탭 내용 섹션 |

### 선택 가이드
```
Form field (Label + Input) → space-y-2
Dialog/Card 내부 필드들 → space-y-4
주요 섹션 구분 → space-y-6
```

---

## 3. 수평 간격 (Horizontal Spacing)

### `gap-*` (Flexbox/Grid 간격)

| 클래스 | 값 | 용도 | 예시 |
|--------|-----|------|------|
| `gap-1` | 4px | **최소** - 아이콘과 텍스트, Badge 내부 | `<Lightbulb /> 3 lights` |
| `gap-2` | 8px | **밀집** - 버튼 그룹, 작은 컴포넌트 | Dialog 하단 버튼들 (취소/확인) |
| `gap-3` | 12px | **중간** - 관련 요소 그룹 | ProjectCard 정보 표시 |
| `gap-4` | 16px | **기본** - 일반 요소 간격 | Header 내 요소들, Toolbar |
| `gap-6` | 24px | **넓음** - 독립적 요소 간격 | Grid 카드 간격 |

### 선택 가이드
```
아이콘 + 텍스트 → gap-1
버튼 그룹 (취소/확인) → gap-2
Toolbar 요소들 → gap-4
Grid 카드들 → gap-6
```

---

## 4. 패딩 (Padding)

### 컨테이너 패딩 (`p-*`, `px-*`, `py-*`)

| 클래스 | 값 | 용도 | 예시 |
|--------|-----|------|------|
| `p-3` | 12px | **작음** - 에러 메시지, Toast | 에러 박스 내부 패딩 |
| `p-4` | 16px | **기본** - 일반 컨테이너, Card, Section | Card, Dashboard 섹션 |
| `p-6` | 24px | **넓음** - Dialog, Modal | Dialog 내용 영역 |
| `px-4` | 16px (좌우) | **수평 패딩** - 페이지 컨테이너 | Dashboard container |
| `py-4` | 16px (상하) | **수직 패딩** - Toolbar | Dashboard toolbar |
| `py-6` | 24px (상하) | **수직 패딩** - Header | Dashboard header |

### 선택 가이드
```
에러 메시지 박스 → p-3
Card 내부 → p-4 (CardContent 자동 적용)
Dialog 내용 → p-6
페이지 컨테이너 좌우 → px-4
Toolbar 상하 → py-4
Header 상하 → py-6
```

---

## 5. 마진 (Margin)

### 개별 요소 마진 (`mb-*`, `mt-*`)

| 클래스 | 값 | 용도 | 예시 |
|--------|-----|------|------|
| `mb-1` | 4px | **최소** - 밀집 정보 | CardTitle 하단 |
| `mb-2` | 8px | **작음** - 관련 정보 | 제목 아래 설명 |
| `mb-4` | 16px | **기본** - 섹션 제목 | Dashboard "내 프로젝트" 제목 |
| `mb-6` | 24px | **넓음** - 독립 섹션 | 에러 메시지 블록 |

### 선택 가이드
```
제목 - 설명 간격 → mb-2
섹션 제목 아래 → mb-4
독립 블록 구분 → mb-6
```

---

## 6. 컴포넌트별 적용 예시

### Dialog (NewProjectDialog, EditProjectDialog)
```jsx
<DialogContent>
  <DialogHeader className="space-y-1">
    {/* 제목과 설명 사이 밀집 간격 */}
  </DialogHeader>

  <div className="space-y-4 p-6">
    {/* 필드 간 기본 간격, Dialog 패딩 */}
    <div className="space-y-2">
      {/* Label과 Input 사이 밀집 간격 */}
    </div>
  </div>

  <div className="flex justify-end gap-2 p-6 pt-0">
    {/* 버튼 간 밀집 간격 */}
  </div>
</DialogContent>
```

### Card (ProjectCard)
```jsx
<Card>
  <CardHeader className="pb-3">
    {/* CardHeader 기본 padding 활용 */}
  </CardHeader>
  <CardContent>
    {/* CardContent 기본 padding 활용 */}
    <div className="flex items-center gap-1">
      {/* 아이콘 + 텍스트 최소 간격 */}
    </div>
  </CardContent>
</Card>
```

### Form (Login/Register)
```jsx
<form className="space-y-4">
  {/* 필드 간 기본 간격 */}
  <div className="space-y-2">
    {/* Label과 Input 밀집 간격 */}
    <Label />
    <Input />
  </div>
</form>
```

### Dashboard Layout
```jsx
<div className="container mx-auto px-4 py-6">
  {/* 페이지 컨테이너: 좌우 기본 패딩, 상하 넓은 패딩 */}
</div>

<div className="container mx-auto px-4 py-4">
  {/* Toolbar: 상하 기본 패딩 */}
</div>

<div className="grid grid-cols-3 gap-6">
  {/* Grid 카드 간 넓은 간격 */}
</div>
```

---

## 7. 적용 체크리스트

### Dialog/Modal
- [ ] DialogHeader: `space-y-1`
- [ ] DialogContent 내부: `space-y-4 p-6`
- [ ] Form field 내부: `space-y-2`
- [ ] 버튼 그룹: `gap-2`

### Form
- [ ] Form 전체: `space-y-4`
- [ ] Field 내부 (Label + Input): `space-y-2`
- [ ] 에러 메시지: `p-3`

### Card
- [ ] shadcn/ui Card 컴포넌트 사용 (자동 패딩)
- [ ] Card 내부 정보: `gap-1` (아이콘+텍스트), `gap-3` (관련 정보)

### Dashboard/Layout
- [ ] 페이지 컨테이너: `px-4`
- [ ] Header: `py-6`
- [ ] Toolbar: `py-4`
- [ ] 섹션 간격: `space-y-6` 또는 `mb-6`
- [ ] Grid: `gap-6`

### Editor
- [ ] Panel 섹션: `space-y-6`
- [ ] Control 그룹: `space-y-4`
- [ ] 버튼/입력 그룹: `gap-2` 또는 `gap-4`

---

## 8. 마이그레이션 가이드

기존 코드를 수정할 때 다음 순서로 진행:

1. **컴포넌트 타입 식별**: Dialog, Form, Card, Layout 등
2. **위 가이드 참조**: 해당 컴포넌트의 권장 간격 확인
3. **기존 간격 교체**:
   - `space-y-3` → `space-y-2` (밀집) 또는 `space-y-4` (기본)
   - `gap-3` → `gap-2` (밀집) 또는 `gap-4` (기본)
   - `p-5` → `p-4` (기본) 또는 `p-6` (넓음)
4. **시각적 검증**: 브라우저에서 확인 후 필요시 조정

---

## 9. 예외 상황

다음 경우 예외적으로 다른 간격 사용 가능:
- **디자인 요구사항**: 특정 디자인 시안이 있는 경우
- **3D 뷰포트**: Scene/Canvas 영역은 별도 레이아웃 적용
- **미세 조정**: 시각적 균형을 위해 `mt-1`, `mb-1` 등 사용 가능

단, 예외 사용 시 주석으로 이유 명시:
```jsx
<div className="mt-1"> {/* 시각적 균형을 위한 미세 조정 */}
```

---

## 10. 버튼 크기 시스템 (Button Sizes)

### shadcn/ui Button 크기

Button 컴포넌트는 4가지 크기를 제공합니다:

| size | 높이 | 패딩 | 텍스트 | 용도 |
|------|------|------|--------|------|
| `sm` | h-8 (32px) | px-3 | text-xs | **작은 버튼** - 부가 액션, 네비게이션 링크 |
| `default` | h-9 (36px) | px-4 py-2 | text-sm | **기본 버튼** - 일반 액션, Form 제출, Dialog 버튼 |
| `lg` | h-10 (40px) | px-8 | text-sm | **큰 버튼** - 주요 CTA, Hero 섹션, 중요 액션 |
| `icon` | h-9 w-9 | - | - | **아이콘 전용** - 메뉴, 삭제, 토글 등 |

### 사용 가이드

#### `size="lg"` - 주요 액션
주목을 끌어야 하는 주요 CTA (Call-to-Action)에 사용:
- Hero 섹션 버튼 ("시작하기", "더 알아보기")
- EmptyState 주요 액션 ("새 프로젝트 만들기")
- CTA 섹션 버튼
- 페이지 단위 주요 액션

```jsx
// Hero 섹션
<Button size="lg" className="gap-2">
  시작하기
  <ArrowRight />
</Button>

// EmptyState
<Button size="lg" onClick={onCreateNew} className="gap-2">
  <Plus /> 새 프로젝트 만들기
</Button>
```

#### `size="default"` - 일반 액션 (생략 가능)
대부분의 일반적인 버튼에 사용. `size` prop을 생략하면 자동 적용:
- Form 제출 버튼 (로그인, 회원가입, 프로젝트 생성)
- Dialog 하단 버튼 (취소, 확인, 저장)
- Dashboard 주요 버튼 ("새 프로젝트")
- 일반 페이지 액션

```jsx
// Form 제출 (size 생략 가능)
<Button type="submit" disabled={isLoading}>
  로그인
</Button>

// Dialog 버튼
<div className="flex justify-end gap-2">
  <Button variant="outline">취소</Button>
  <Button>저장</Button>
</div>

// Dashboard 헤더
<Button onClick={() => setDialogOpen(true)} className="gap-2">
  <Plus /> 새 프로젝트
</Button>
```

#### `size="sm"` - 부가 액션
덜 중요한 보조 액션이나 공간이 제한된 곳에 사용:
- 네비게이션 링크
- 에디터 헤더 버튼 ("프로젝트 목록", "저장")
- NotFound 페이지 링크
- Card 내부 작은 버튼

```jsx
// 에디터 헤더
<Button variant="ghost" size="sm" className="gap-2">
  <ArrowLeft /> 프로젝트 목록
</Button>

<Button size="sm" className="gap-2">
  <Save /> 저장
</Button>

// NotFound 링크
<Button variant="ghost" size="sm">
  홈으로
</Button>
```

#### `size="icon"` - 아이콘 전용
아이콘만 표시하는 정사각형 버튼. **반드시 `aria-label` 추가 필수**:
- 메뉴 버튼 (ProjectCard, Dropdown)
- 삭제 버튼 (LightCard)
- 뷰 전환 토글 (Grid/List)
- 기타 아이콘 액션

```jsx
// 메뉴 버튼 (접근성 필수)
<Button
  variant="ghost"
  size="icon"
  aria-label="프로젝트 메뉴 열기"
>
  <MoreVertical className="w-4 h-4" />
</Button>

// 삭제 버튼
<Button
  variant="ghost"
  size="icon"
  onClick={onDelete}
  aria-label="조명 삭제"
>
  <Trash2 className="w-4 h-4" />
</Button>

// 뷰 토글
<Button
  variant={viewMode === "grid" ? "secondary" : "ghost"}
  size="icon"
  onClick={() => setViewMode("grid")}
  aria-label="그리드 뷰로 전환"
>
  <Grid3x3 className="w-4 h-4" />
</Button>
```

### 버튼 내부 아이콘 간격

버튼 내부에 아이콘과 텍스트를 함께 사용할 때:
- **아이콘 크기**: `w-4 h-4` (16px) 또는 `w-5 h-5` (20px, lg 버튼)
- **간격**: `gap-2` 클래스 사용 (Button 컴포넌트 기본 지원)

```jsx
// 자동 간격 (Button에 gap-2 기본 포함)
<Button size="lg">
  <Plus /> 새 프로젝트
</Button>

// 명시적 간격 (필요 시)
<Button className="gap-2">
  <Save className="w-4 h-4" /> 저장
</Button>
```

### 버튼 그룹 간격

여러 버튼을 나란히 배치할 때:
- **주요 액션 그룹**: `gap-2` (Dialog 하단, Form 하단)
- **툴바 버튼**: `gap-1` (아이콘 버튼) 또는 `gap-2` (일반 버튼)

```jsx
// Dialog 하단 버튼 그룹
<div className="flex justify-end gap-2 p-6 pt-0">
  <Button variant="outline">취소</Button>
  <Button>확인</Button>
</div>

// 아이콘 버튼 그룹 (뷰 토글)
<div className="flex items-center gap-1">
  <Button size="icon" variant="secondary">
    <Grid3x3 />
  </Button>
  <Button size="icon" variant="ghost">
    <List />
  </Button>
</div>
```

### 버튼 크기 선택 플로우차트

```
주요 CTA / Hero 섹션 / EmptyState
  → size="lg"

일반 액션 / Form 제출 / Dialog 버튼
  → size="default" (또는 생략)

부가 액션 / 네비게이션 / 에디터 헤더
  → size="sm"

아이콘만 표시 / 메뉴 / 삭제 / 토글
  → size="icon" + aria-label 필수
```

### 접근성 주의사항

**아이콘 전용 버튼 (`size="icon"`)을 사용할 때**:
- ✅ **필수**: `aria-label` 속성으로 버튼의 목적 명시
- ✅ **권장**: 툴팁 추가 (HoverCard 또는 Tooltip 컴포넌트 사용)
- ❌ **금지**: 텍스트 없이 아이콘만 사용하면서 aria-label 생략

```jsx
// ✅ 올바른 예시
<Button size="icon" aria-label="프로젝트 삭제">
  <Trash2 />
</Button>

// ❌ 잘못된 예시
<Button size="icon">
  <Trash2 />
</Button>
```

---

## 11. 참고 링크

- [Tailwind CSS Spacing](https://tailwindcss.com/docs/customizing-spacing)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [shadcn/ui Button](https://ui.shadcn.com/docs/components/button)
- [LumoStage Design Strategy](./DesignStargey.md)

---

**최종 업데이트**: 2025-10-27
**관리자**: LumoStage Development Team
