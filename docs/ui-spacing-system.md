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

## 10. 참고 링크

- [Tailwind CSS Spacing](https://tailwindcss.com/docs/customizing-spacing)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [LumoStage Design Strategy](./DesignStargey.md)

---

**최종 업데이트**: 2025-10-27
**관리자**: LumoStage Development Team
