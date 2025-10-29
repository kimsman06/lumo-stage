# Toast 알림 시스템 구현 가이드

## 개요

이 문서는 개발자가 Toast 알림 시스템을 실제로 구현하기 위한 단계별 가이드입니다.

**관련 문서:**
- UX 설계: `/docs/design/toast-notification-ux-design.md`
- Toast 유틸리티: `/src/lib/toast.js`
- 메시지 가이드: `/src/lib/toast-messages.js`

---

## 1. 사전 준비

### 1.1 패키지 설치

```bash
# LumoStage client 디렉토리에서 실행
cd client
npm install sonner
```

**sonner 선택 이유:**
- 경량 라이브러리 (gzip 압축 시 ~3KB)
- React 18 호환
- 접근성 기본 지원 (ARIA)
- Promise 기반 Toast 지원
- 커스터마이징 용이

### 1.2 파일 구조 확인

구현 후 파일 구조:
```
client/src/
├── lib/
│   ├── toast.js              # Toast 유틸리티 함수 (새로 생성)
│   └── toast-messages.js     # Toast 메시지 상수 (새로 생성)
├── App.jsx                    # Toaster 컴포넌트 추가 (수정)
├── components/
│   ├── projects/
│   │   └── ProjectsDashboard.jsx  # alert() 대체 (수정)
│   └── editor/
│       └── EditorPage.jsx         # alert() 대체 (수정)
└── pages/
    ├── LoginPage.jsx          # 로그인 Toast 추가 (수정)
    └── RegisterPage.jsx       # 회원가입 Toast 추가 (수정)
```

---

## 2. Phase 1: 기본 Toast 시스템 구축

### 2.1 Toaster 컴포넌트 추가

**파일: `client/src/App.jsx`**

```javascript
import { Toaster } from 'sonner';

function App() {
  return (
    <>
      {/* Toast 컴포넌트 추가 - 모든 페이지에서 사용 가능 */}
      <Toaster
        position="top-center"
        richColors
        closeButton
        expand={false}
        visibleToasts={3}
        duration={3000}
        theme="system"
      />

      {/* 기존 라우팅 */}
      <Router>
        <Routes>
          {/* ... */}
        </Routes>
      </Router>
    </>
  );
}
```

**Toaster Props 설명:**
- `position`: Toast 표시 위치 (top-center 권장)
- `richColors`: 타입별 색상 자동 적용 (success=녹색, error=빨간색 등)
- `closeButton`: X 버튼 표시
- `expand`: false로 설정하여 모바일 대응
- `visibleToasts`: 최대 동시 표시 개수
- `duration`: 기본 지속 시간 (밀리초)
- `theme`: 'system' | 'light' | 'dark'

### 2.2 에디터 페이지 alert() 대체

**파일: `client/src/pages/EditorPage.jsx`**

**Before:**
```javascript
// 라인 32
alert('프로젝트를 불러올 수 없습니다.');

// 라인 90
alert(`저장 실패: ${result.error}`);
```

**After:**
```javascript
import toast from '@/lib/toast';

// 라인 32 - 프로젝트 로드 실패
const loadProject = async () => {
  if (!id) {
    navigate('/projects');
    return;
  }

  const result = await getProjectById(id);
  if (result.success && result.project) {
    loadSceneData(result.project.sceneData);
  } else {
    toast.error('프로젝트를 불러올 수 없습니다');
    navigate('/projects');
  }
};

// 라인 74-92 - 프로젝트 저장 (Promise Toast 사용)
const handleSave = async () => {
  if (!id || isSaving) return;

  const sceneData = getSceneData();

  // Promise Toast로 로딩 → 성공/실패 자동 전환
  toast.project.save(updateProject(id, { sceneData }));
};
```

**개선점:**
1. `alert()`가 Toast로 대체되어 UI가 차단되지 않음
2. `toast.promise`를 사용하여 로딩 → 성공/실패 자동 전환
3. 별도의 `isSaving`, `saveSuccess` 상태 관리 불필요
4. 일관된 메시지 표시

### 2.3 프로젝트 대시보드 alert() 대체

**파일: `client/src/components/projects/ProjectsDashboard.jsx`**

**Before:**
```javascript
// 라인 47-54
const handleDeleteProject = async (id) => {
  if (window.confirm("정말로 이 프로젝트를 삭제하시겠습니까?")) {
    const result = await deleteProject(id);
    if (result.success) {
      console.log("프로젝트가 삭제되었습니다.");
    } else {
      alert(`삭제 실패: ${result.error}`);
    }
  }
};
```

**After (Phase 1: alert만 대체):**
```javascript
import toast from '@/lib/toast';

const handleDeleteProject = async (id) => {
  if (window.confirm("정말로 이 프로젝트를 삭제하시겠습니까?")) {
    const result = await deleteProject(id);
    if (result.success) {
      toast.success("프로젝트가 삭제되었습니다");
    } else {
      toast.error(`삭제에 실패했습니다. ${result.error}`);
    }
  }
};
```

**Note:** `confirm()`은 Phase 2에서 AlertDialog로 대체합니다.

---

## 3. Phase 2: AlertDialog로 confirm() 대체

### 3.1 shadcn/ui AlertDialog 설치

```bash
# client 디렉토리에서 실행
npx shadcn@latest add alert-dialog
```

이미 설치되어 있을 가능성이 높습니다. 확인:
```bash
ls client/src/components/ui/alert-dialog.jsx
```

### 3.2 프로젝트 삭제 confirm() 대체

**파일: `client/src/components/projects/ProjectsDashboard.jsx`**

```javascript
import { useState } from 'react';
import toast from '@/lib/toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ProjectsDashboard() {
  // 기존 상태
  const { projects, deleteProject } = useProjectStore();

  // 삭제 다이얼로그 상태 추가
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  // 삭제 버튼 클릭 시 다이얼로그 열기
  const handleDeleteClick = (id) => {
    setProjectToDelete(id);
    setDeleteDialogOpen(true);
  };

  // 삭제 확인 시 실제 삭제 수행
  const confirmDelete = async () => {
    if (!projectToDelete) return;

    // Promise Toast 사용
    const deletePromise = deleteProject(projectToDelete);

    toast.project.delete(deletePromise);

    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  return (
    <>
      {/* 기존 UI */}
      <div className="...">
        {projects.map((project) => (
          <ProjectCard
            key={project._id}
            project={project}
            onDelete={handleDeleteClick} // confirm() 대신 다이얼로그 열기
          />
        ))}
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>프로젝트 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 프로젝트를 삭제하시겠습니까?
              <br />
              이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

**개선점:**
1. `confirm()`이 모달 다이얼로그로 대체
2. 삭제 버튼이 빨간색으로 강조되어 위험한 작업임을 명확히 전달
3. Toast로 삭제 진행 상황 표시 (로딩 → 성공/실패)
4. 접근성 개선 (ARIA 속성 자동 포함)

### 3.3 재사용 가능한 ConfirmDialog 컴포넌트 (선택적)

여러 곳에서 확인 다이얼로그가 필요한 경우:

**파일: `client/src/components/ui/confirm-dialog.jsx`**

```javascript
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "확인",
  cancelText = "취소",
  onConfirm,
  variant = "default", // 'default' | 'destructive'
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              variant === "destructive"
                ? "bg-red-600 hover:bg-red-700"
                : ""
            }
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

**사용 예시:**
```javascript
<ConfirmDialog
  open={deleteDialogOpen}
  onOpenChange={setDeleteDialogOpen}
  title="프로젝트 삭제"
  description="정말로 이 프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
  confirmText="삭제"
  onConfirm={confirmDelete}
  variant="destructive"
/>
```

---

## 4. Phase 3: 프로젝트 생성/수정 Toast

### 4.1 프로젝트 생성 Toast

**파일: `client/src/components/projects/NewProjectDialog.jsx`**

**Before:**
```javascript
const handleCreate = async () => {
  if (!name.trim()) {
    setError("프로젝트 이름을 입력해주세요.");
    return;
  }

  const result = await createProject({ name, description, sceneData });

  if (result.success) {
    setName("");
    setDescription("");
    onOpenChange(false);
    navigate(`/editor/${result.project._id}`);
  } else {
    setError(result.error || "프로젝트 생성에 실패했습니다.");
  }
};
```

**After:**
```javascript
import toast from '@/lib/toast';

const handleCreate = async () => {
  if (!name.trim()) {
    setError("프로젝트 이름을 입력해주세요.");
    return;
  }

  setError("");
  onOpenChange(false); // 다이얼로그 먼저 닫기

  // Promise Toast 사용
  const createPromise = createProject({ name, description, sceneData });

  toast.project.create(createPromise);

  // 생성 성공 시 에디터로 이동
  try {
    const result = await createPromise;
    if (result.success) {
      setName("");
      setDescription("");
      navigate(`/editor/${result.project._id}`);
    }
  } catch (err) {
    // Toast에서 이미 에러 표시
    console.error('프로젝트 생성 실패:', err);
  }
};
```

**개선점:**
1. 다이얼로그가 닫힌 후 Toast로 진행 상황 표시
2. 로딩 → 성공/실패 자동 전환
3. 에러가 발생해도 UI가 차단되지 않음

### 4.2 프로젝트 정보 수정 Toast

**파일: `client/src/components/projects/EditProjectDialog.jsx`** (있는 경우)

```javascript
import toast from '@/lib/toast';

const handleUpdate = async () => {
  const updatePromise = updateProject(project._id, { name, description });

  toast.promise(updatePromise, {
    loading: '저장 중...',
    success: '프로젝트 정보가 수정되었습니다',
    error: '수정에 실패했습니다',
  });

  try {
    await updatePromise;
    onOpenChange(false);
  } catch (err) {
    console.error('프로젝트 수정 실패:', err);
  }
};
```

---

## 5. Phase 4: 인증 Toast

### 5.1 로그인 성공 Toast

**파일: `client/src/pages/LoginPage.jsx`**

```javascript
import toast from '@/lib/toast';

const handleSubmit = async (e) => {
  e.preventDefault();
  setLocalError("");

  // 유효성 검사...

  // 로그인 시도
  const result = await login({ email, password });

  if (result.success) {
    // 개인화된 성공 메시지
    toast.auth.loginSuccess(result.user.username);
    navigate("/projects");
  } else {
    // 에러는 인라인으로 표시 (기존 방식 유지)
    setLocalError(result.error);
  }
};
```

**Note:** 로그인 에러는 폼 내부에 인라인으로 표시하는 것이 UX상 더 좋습니다. Toast는 성공 시에만 사용합니다.

### 5.2 회원가입 성공 Toast

**파일: `client/src/pages/RegisterPage.jsx`**

```javascript
import toast from '@/lib/toast';

const handleSubmit = async (e) => {
  e.preventDefault();
  setLocalError("");

  // 유효성 검사...

  // 회원가입 시도
  const result = await register({ username, email, password });

  if (result.success) {
    toast.auth.registerSuccess();
    navigate("/projects");
  } else {
    setLocalError(result.error);
  }
};
```

### 5.3 로그아웃 Toast

**파일: `client/src/components/layout/AuthNavbar.jsx`** (또는 로그아웃 핸들러 위치)

```javascript
import toast from '@/lib/toast';

const handleLogout = async () => {
  const result = await logout();

  if (result.success) {
    toast.auth.logoutSuccess();
    navigate('/');
  } else {
    toast.error('로그아웃에 실패했습니다');
  }
};
```

---

## 6. Phase 5: 네트워크 에러 전역 핸들러

### 6.1 Axios 인터셉터 설정

**파일: `client/src/lib/api.js`**

```javascript
import axios from 'axios';
import toast from './toast';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 네트워크 에러
    if (!error.response) {
      toast.network.error(() => {
        // 재시도 함수
        window.location.reload();
      });
      return Promise.reject(error);
    }

    const { status } = error.response;

    // 401 - 인증 필요
    if (status === 401) {
      toast.auth.sessionExpired();
      // 로그인 페이지로 리디렉션
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // 403 - 권한 없음
    if (status === 403) {
      toast.auth.forbidden();
      return Promise.reject(error);
    }

    // 500 - 서버 에러
    if (status >= 500) {
      toast.network.serverError();
      return Promise.reject(error);
    }

    // 나머지 에러는 각 컴포넌트에서 처리
    return Promise.reject(error);
  }
);

export default api;
```

**개선점:**
1. 401 에러 시 세션 만료 Toast + 로그인 페이지로 자동 리디렉션
2. 네트워크 끊김 시 Toast + 재시도 버튼
3. 서버 에러 시 일관된 Toast 표시
4. 각 컴포넌트에서 개별 에러 처리 불필요

---

## 7. 고급 기능 (Phase 6)

### 7.1 자동 저장 Toast

**파일: `client/src/pages/EditorPage.jsx`**

```javascript
import { useEffect, useRef } from 'react';
import toast from '@/lib/toast';
import { debounce } from 'lodash'; // 또는 직접 구현

function EditorPage() {
  const autoSaveTimeoutRef = useRef(null);

  // 자동 저장 함수 (debounce 적용)
  const autoSave = useRef(
    debounce(async () => {
      if (!id) return;

      const sceneData = getSceneData();
      const savePromise = updateProject(id, { sceneData });

      // 자동 저장 Toast (기존 것 업데이트)
      toast.editor.autoSave(savePromise);
    }, 3000) // 3초 대기 후 저장
  ).current;

  // Scene 변경 감지
  useEffect(() => {
    // lights, mannequins 등이 변경될 때마다 자동 저장
    autoSave();

    return () => {
      autoSave.cancel(); // 컴포넌트 언마운트 시 취소
    };
  }, [lights, mannequins, cameraState]); // 의존성 배열

  // ...
}
```

**개선점:**
1. 사용자가 수동으로 저장하지 않아도 자동 저장
2. Debounce로 저장 요청 최소화
3. 자동 저장 Toast는 짧게 표시 (2초)
4. 에디터 UX 개선

### 7.2 에러 Toast with 재시도 버튼

**예시: 프로젝트 로드 실패 시**

```javascript
const loadProject = async () => {
  try {
    const result = await getProjectById(id);
    if (result.success) {
      loadSceneData(result.project.sceneData);
    } else {
      throw new Error(result.error);
    }
  } catch (err) {
    toast.errorWithRetry(
      '프로젝트를 불러오는데 실패했습니다',
      () => loadProject(), // 재시도 함수
      { duration: 6000 }
    );
  }
};
```

### 7.3 온보딩 Toast (첫 방문 사용자)

**파일: `client/src/pages/EditorPage.jsx`**

```javascript
import { useEffect } from 'react';
import toast from '@/lib/toast';

function EditorPage() {
  useEffect(() => {
    // 첫 방문 확인 (localStorage 사용)
    const hasSeenEditorHint = localStorage.getItem('hasSeenEditorHint');

    if (!hasSeenEditorHint) {
      // 3초 후 힌트 Toast 표시
      setTimeout(() => {
        toast.editor.shortcutHint();
        localStorage.setItem('hasSeenEditorHint', 'true');
      }, 3000);
    }
  }, []);

  // ...
}
```

---

## 8. 테스트 및 검증

### 8.1 수동 테스트 체크리스트

**프로젝트 관련:**
- [ ] 프로젝트 생성 시 로딩 → 성공 Toast
- [ ] 프로젝트 생성 실패 시 에러 Toast
- [ ] 프로젝트 저장 시 성공 Toast
- [ ] 프로젝트 저장 실패 시 에러 Toast
- [ ] 프로젝트 삭제 시 AlertDialog → Toast
- [ ] 프로젝트 정보 수정 시 Toast

**인증 관련:**
- [ ] 로그인 성공 시 개인화 Toast
- [ ] 회원가입 성공 시 Toast
- [ ] 로그아웃 시 Toast
- [ ] 세션 만료 시 경고 Toast + 리디렉션

**네트워크 관련:**
- [ ] 네트워크 끊김 시 Toast + 재시도 버튼
- [ ] 서버 에러 시 Toast
- [ ] 권한 없음 시 Toast

**UI/UX:**
- [ ] Toast 위치가 화면 상단 중앙
- [ ] 색상이 타입에 맞게 표시 (녹색/빨간색/파란색)
- [ ] 애니메이션이 부드러움
- [ ] 최대 3개까지만 동시 표시
- [ ] 같은 메시지 중복 표시 안 됨
- [ ] 다크 모드에서도 가독성 확보

### 8.2 접근성 테스트

**스크린 리더:**
```bash
# macOS VoiceOver
Cmd + F5

# Windows Narrator
Ctrl + Win + Enter
```

**확인 사항:**
- [ ] Success Toast가 "성공" 또는 내용이 읽힘
- [ ] Error Toast가 "오류" 또는 내용이 즉시 읽힘
- [ ] Toast가 `role="status"` 또는 `role="alert"` 가짐

**키보드 탐색:**
- [ ] Tab으로 Toast 액션 버튼 접근 가능
- [ ] ESC로 Toast 닫기 가능
- [ ] Enter로 액션 버튼 클릭 가능

### 8.3 성능 테스트

**React DevTools Profiler:**
```bash
# 개발 모드에서 React DevTools 사용
# Profiler 탭에서 Toast 표시 시 렌더링 시간 확인
```

**확인 사항:**
- [ ] Toast 표시 시 렌더링 시간 < 16ms (60fps)
- [ ] 메모리 누수 없음 (장시간 사용 후 확인)
- [ ] Toast가 Scene 렌더링에 영향 없음

---

## 9. 문제 해결 (Troubleshooting)

### 9.1 Toast가 표시되지 않는 경우

**원인 1: Toaster 컴포넌트가 추가되지 않음**

```javascript
// App.jsx 확인
import { Toaster } from 'sonner';

function App() {
  return (
    <>
      <Toaster position="top-center" />  {/* 이것이 있는지 확인 */}
      {/* ... */}
    </>
  );
}
```

**원인 2: Z-index 문제**

```css
/* Toaster의 z-index가 다른 요소보다 낮은 경우 */
/* global.css 또는 Tailwind에서 조정 */
.sonner-toast {
  z-index: 9999 !important;
}
```

### 9.2 Toast가 중복으로 표시되는 경우

**원인: 중복 방지 로직이 작동하지 않음**

```javascript
// toast.js의 중복 방지 로직 확인
// 또는 toast.dismiss()로 수동 닫기
import toast from '@/lib/toast';

// 기존 Toast 닫고 새로 표시
toast.dismiss();
toast.success('새 메시지');
```

### 9.3 다크 모드에서 Toast가 보이지 않는 경우

**해결:**
```javascript
// App.jsx에서 theme 설정 확인
<Toaster
  theme="system"  // 'light' | 'dark' | 'system'
  toastOptions={{
    classNames: {
      toast: 'bg-background text-foreground',
      success: 'text-green-600 dark:text-green-400',
      error: 'text-red-600 dark:text-red-400',
    }
  }}
/>
```

### 9.4 Toast 메시지가 너무 길어서 잘리는 경우

**해결:**
```javascript
// toast.js에서 메시지 길이 제한
function truncateMessage(message, maxLength = 100) {
  if (message.length <= maxLength) return message;
  return message.slice(0, maxLength) + '...';
}

export function error(message, options = {}) {
  return sonnerToast.error(truncateMessage(message), options);
}
```

---

## 10. 배포 전 체크리스트

- [ ] 모든 alert() 및 confirm() 대체 완료
- [ ] Toast 메시지가 모두 한국어로 작성됨
- [ ] 에러 메시지가 사용자 친화적임 (기술 용어 없음)
- [ ] 다크 모드 테스트 완료
- [ ] 모바일 반응형 테스트 완료
- [ ] 접근성 테스트 완료 (스크린 리더, 키보드)
- [ ] 성능 테스트 완료 (렌더링, 메모리)
- [ ] 네트워크 에러 핸들러 테스트 완료
- [ ] 코드 리뷰 완료
- [ ] 문서 업데이트 완료

---

## 11. 참고 자료

**프로젝트 내부:**
- UX 설계: `/docs/design/toast-notification-ux-design.md`
- Toast 유틸리티: `/src/lib/toast.js`
- 메시지 가이드: `/src/lib/toast-messages.js`

**외부 문서:**
- [Sonner 공식 문서](https://sonner.emilkowal.ski/)
- [shadcn/ui AlertDialog](https://ui.shadcn.com/docs/components/alert-dialog)
- [React Toast Best Practices](https://www.smashingmagazine.com/2021/12/toast-notifications-best-practices/)

**예제 코드:**
- [Sonner Examples](https://github.com/emilkowalski/sonner/tree/main/website/src/examples)

---

## 12. 다음 단계

Toast 시스템 구현 완료 후:

1. **사용자 피드백 수집**
   - Toast 표시 위치가 적절한가?
   - 지속 시간이 충분한가?
   - 메시지가 명확한가?

2. **분석 데이터 수집** (선택적)
   - 어떤 Toast가 가장 자주 표시되는가?
   - 에러 Toast 빈도가 높은 부분은?
   - 사용자가 Toast를 수동으로 닫는 비율은?

3. **추가 기능 구현** (선택적)
   - Toast 히스토리 패널
   - 사용자 설정 (위치, 지속 시간)
   - 다국어 지원 (i18next)

---

## 요약

이 가이드를 따라 구현하면:

1. **Phase 1-2 (2일)**: 기본 Toast 및 AlertDialog 구현 완료
2. **Phase 3-4 (2일)**: 프로젝트 CRUD 및 인증 Toast 완료
3. **Phase 5 (1일)**: 네트워크 에러 전역 핸들러 완료
4. **Phase 6-7 (2-3일)**: 고급 기능 및 테스트 완료

**총 소요 시간: 5-8일**

구현 중 문제가 발생하면 이 문서의 "문제 해결" 섹션을 참고하세요.
