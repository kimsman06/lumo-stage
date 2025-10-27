# 버튼 크기 디자인 가이드 준수 체크리스트

## 디자인 가이드 기준 (DesignStargey.md)

### Editor 헤더 (라인 143-154)
- ✅ Share 버튼: `size="sm"` - **가이드 준수**
- ✅ Save 버튼: `size="sm"` - **가이드 준수**

### Editor Panel (라인 178)
- ✅ Plus 버튼 (조명 추가): `size="sm"` - **가이드 준수**

### Light Card (라인 238)
- ⚠️ 삭제 버튼: `size="sm"` with `h-8 w-8 p-0` - **실질적으로 icon 버튼**

---

## 현재 구현 상태 분석

### ✅ 가이드 준수 항목

1. **EditorPage.jsx (라인 126)**
   ```jsx
   <Button variant="ghost" size="sm" className="text-white gap-2">
     <ArrowLeft /> 프로젝트 목록
   </Button>
   ```
   - 네비게이션 링크: `size="sm"` ✅

2. **EditorPage.jsx (라인 143-151)**
   ```jsx
   <Button onClick={handleSave} disabled={isSaving} className="gap-2" size="sm">
     <Save className="w-4 h-4" />
     {isSaving ? '저장 중...' : '저장'}
   </Button>
   ```
   - 저장 버튼: `size="sm"` ✅ (디자인 가이드 준수)

3. **LightCard.jsx (라인 33)**
   ```jsx
   <Button variant="ghost" size="icon" className="h-8 w-8" onClick={...}>
     <Trash2 className="w-4 h-4" />
   </Button>
   ```
   - 삭제 버튼: `size="icon"` with `h-8 w-8` ✅
   - 디자인 가이드의 `size="sm" h-8 w-8 p-0`과 동일한 효과

4. **EmptyState.jsx**
   ```jsx
   <Button size="lg" onClick={onCreateNew} className="gap-2">
     <Plus /> 새 프로젝트 만들기
   </Button>
   ```
   - EmptyState 주요 CTA: `size="lg"` ✅

5. **ProjectCard.jsx**
   - 메뉴 버튼: `size="icon"` ✅
   - Hover 액션 버튼: `size="sm"` ✅

### ❌ 수정 필요 항목

1. **ProjectsDashboard.jsx (라인 76-84)** ❌
   ```jsx
   <Button
     size="lg"
     onClick={() => setDialogOpen(true)}
     className="gap-2"
     disabled={isLoading}
   >
     <Plus className="w-5 h-5" />
     새 프로젝트
   </Button>
   ```
   - **문제**: Dashboard 헤더의 일반 액션 버튼이 `size="lg"` 사용
   - **수정**: `size="default"` (생략)로 변경
   - **이유**:
     - Hero/Landing 페이지의 주요 CTA가 아님
     - Editor 헤더의 Save 버튼과 동일한 계층의 액션
     - 디자인 가이드에서 헤더 버튼은 `size="sm"` 또는 `default` 권장

### 🔄 검토 필요 항목

1. **NotFoundPage.jsx**
   ```jsx
   <Button className="gap-2" size="lg"> // 홈으로 돌아가기
   <Button variant="ghost" size="sm"> // 네비게이션 링크들
   ```
   - "홈으로 돌아가기"가 `size="lg"`인데, 이게 주요 CTA로 보기에는...
   - **검토 필요**: `size="default"`로 변경 고려

---

## 수정 계획

### 우선순위 1: 필수 수정
- [x] ProjectsDashboard "새 프로젝트" 버튼: `size="lg"` → 제거 (default 사용) ✅ 완료
  - 아이콘도 `w-5 h-5` → `w-4 h-4`로 조정

### 우선순위 2: 검토 후 수정
- [x] NotFoundPage "홈으로 돌아가기" 버튼: `size="lg"` 유지 ✅ 결정
  - **이유**: 404 에러 페이지의 주요 복구 액션으로, 사용자가 길을 잃었을 때 명확한 경로 제시
  - **예외 승인**: EmptyState와 동일한 맥락의 주요 CTA

---

## 수정 후 기대 효과

1. **일관성 향상**
   - Dashboard와 Editor 헤더 버튼 크기 통일
   - 페이지 전반의 버튼 계층 구조 명확화

2. **디자인 가이드 준수**
   - DesignStargey.md의 명세 반영
   - 전문적이고 통일된 UI 제공

3. **사용자 경험**
   - 버튼 크기로 액션의 중요도를 명확히 전달
   - `lg` 크기는 진정한 주요 CTA에만 사용

---

**작성일**: 2025-10-27
**상태**: 수정 진행 중
