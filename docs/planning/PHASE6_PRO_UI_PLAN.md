# Phase 6: 전문가용 UI/UX 개선 계획

## 개요

Cinema 4D, Blender 스타일의 전문가용 3단 레이아웃으로 전환합니다.
- 좌측: Outliner (계층 구조)
- 중앙: Scene (3D 뷰포트)
- 우측: Properties Panel (속성 편집)

## 1. Outliner 패널 (Phase 6.1)

### 레이아웃
- 위치: 좌측 고정
- 너비: 256px
- 구조: 헤더 + 검색바 + TreeView + 하단 액션

### 컴포넌트 구조
```
<Outliner>
  ├─ <OutlinerHeader>
  ├─ <OutlinerSearch>
  └─ <OutlinerTree>
      ├─ <TreeNode type="light">
      ├─ <TreeNode type="mannequin">
      ├─ <TreeNode type="diffuser">
      └─ <TreeNode type="gltfModel">
```

### TreeNode 기능
- 계층적 트리 구조 (카테고리별 그룹)
- 클릭: 객체 선택 (store.setSelectedLight/Mannequin/Diffuser)
- 눈 아이콘: 가시성 토글 (store에 visibility 필드 추가)
- 우클릭: 컨텍스트 메뉴 (이름 변경, 복사, 삭제)

### 상태 관리
- editorStore에 추가:
  - `objectVisibility: { [id]: boolean }`
  - `selectedObjectId: string | null` (통합 선택 상태)
  - `setObjectVisibility(id, visible)`
  - `renameObject(id, newName)`

### shadcn 컴포넌트
- ScrollArea (트리 스크롤)
- ContextMenu (우클릭 메뉴)
- Input (검색, 이름 변경)

## 2. Properties Panel (Phase 6.2)

### 레이아웃
- 위치: 우측 고정
- 너비: 320px (기존 384px에서 축소)
- 구조: Accordion 기반 섹션

### 섹션 구조
```
<PropertiesPanel>
  ├─ <Accordion type="multiple">
      ├─ <AccordionItem value="transform">      // Transform
      ├─ <AccordionItem value="light">          // Light Settings
      ├─ <AccordionItem value="mannequin">      // Mannequin Pose
      ├─ <AccordionItem value="diffuser">       // Diffuser
      ├─ <AccordionItem value="camera">         // Camera
      └─ <AccordionItem value="material">       // Material (미래)
```

### 동적 섹션 표시
- 선택된 객체 타입에 따라 관련 섹션만 활성화
- 예: Light 선택 시 → Transform + Light Settings + Shadow
- 예: Mannequin 선택 시 → Transform + Mannequin Pose

### 입력 UI 개선
- 숫자 입력: Label + Slider + NumberInput 조합
- 색상: ColorPicker with Popover
- 벡터(position): 3개의 NumberInput (X, Y, Z)

### 기존 컴포넌트 재사용
- LightsControl → LightPropertiesSection
- MannequinControl → MannequinPropertiesSection
- CameraControl → CameraPropertiesSection
- DiffuserControl → DiffuserPropertiesSection

### shadcn 컴포넌트
- Accordion (섹션 접기/펼치기)
- Slider (범위 입력)
- Input (숫자, 텍스트)
- Popover (색상 피커)

## 3. 기존 EditorPanel 마이그레이션

### 제거 항목
- Tabs 시스템 (TabsList, TabsTrigger)
- 탭별 분리된 컨트롤

### 통합 방식
- EditorPage 레이아웃 변경:
  ```
  <div className="flex">
    <Outliner />           // 좌측 256px
    <Scene />              // 중앙 flex-1
    <PropertiesPanel />    // 우측 320px
  </div>
  ```

## 4. 파일 구조

```
client/src/components/
├─ outliner/
│   ├─ Outliner.jsx
│   ├─ OutlinerTree.jsx
│   ├─ TreeNode.jsx
│   └─ ObjectContextMenu.jsx
├─ properties/
│   ├─ PropertiesPanel.jsx
│   ├─ TransformSection.jsx
│   ├─ LightPropertiesSection.jsx (기존 LightsControl 리팩토링)
│   ├─ MannequinPropertiesSection.jsx (기존 MannequinControl 리팩토링)
│   ├─ CameraPropertiesSection.jsx (기존 CameraControl 리팩토링)
│   └─ DiffuserPropertiesSection.jsx (기존 DiffuserControl 리팩토링)
└─ EditorPanel.jsx (삭제 예정)
```

## 5. 개발 순서

### Phase 6.1 (Outliner)
1. Outliner 레이아웃 및 기본 구조
2. TreeNode 컴포넌트 개발
3. 객체 선택 연동 (store)
4. 가시성 토글 구현
5. 컨텍스트 메뉴 (이름 변경, 삭제)
6. 검색/필터링

### Phase 6.2 (Properties Panel)
1. PropertiesPanel 레이아웃
2. Accordion 섹션 구조
3. 기존 Control 컴포넌트를 Section으로 리팩토링
4. 동적 섹션 표시 로직
5. 입력 UI 개선 (인라인 편집, 슬라이더+숫자)
6. EditorPage 레이아웃 통합
7. 기존 EditorPanel 제거

## 주의사항

- 기존 파일 직접 수정 금지 (새 컴포넌트로 분리)
- 기존 Control 컴포넌트는 유지하고 PropertiesSection에서 재사용
- shadcn 컴포넌트 설치는 사용자가 직접 수행
- 점진적 마이그레이션 (Outliner → Properties → 통합)
