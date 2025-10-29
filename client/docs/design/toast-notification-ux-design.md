# Toast 알림 시스템 UX 설계

## 개요

LumoStage 프로젝트에서 사용자 경험을 개선하기 위해 `sonner` 라이브러리 기반 Toast 알림 시스템을 도입합니다. 현재 `alert()` 및 `confirm()`을 사용하는 부분을 대체하여 비침습적이고 일관성 있는 피드백을 제공합니다.

**주요 목표:**
- 사용자 액션에 대한 즉각적이고 명확한 피드백 제공
- 인터페이스 흐름을 방해하지 않는 비모달 알림
- 시각적으로 일관된 디자인 시스템 유지
- 접근성(Accessibility) 고려

---

## 1. Toast 타입별 사용 시나리오

### 1.1 Success Toast (성공)
**시각적 특성:**
- 녹색 강조 색상 (LumoStage 디자인 시스템의 성공 색상)
- 체크 아이콘
- 부드러운 슬라이드 인 애니메이션

**사용 시나리오:**

| 상황 | 메시지 | 지속 시간 |
|------|--------|----------|
| 프로젝트 생성 성공 | "프로젝트가 생성되었습니다" | 3초 |
| 프로젝트 저장 성공 | "변경사항이 저장되었습니다" | 2초 |
| 프로젝트 삭제 성공 | "프로젝트가 삭제되었습니다" | 3초 |
| 프로젝트 정보 수정 성공 | "프로젝트 정보가 수정되었습니다" | 3초 |
| 로그인 성공 | "{사용자명}님, 환영합니다" | 3초 |
| 회원가입 성공 | "회원가입이 완료되었습니다" | 3초 |
| 로그아웃 성공 | "로그아웃되었습니다" | 2초 |
| 소셜 로그인 성공 | "{사용자명}님, 환영합니다" | 3초 |

**UX 고려사항:**
- 사용자가 수행한 액션이 성공적으로 완료되었음을 명확히 전달
- 생성/삭제 등 중요한 액션은 3초, 저장/로그아웃 등 빈번한 액션은 2초
- 사용자 이름이 있는 경우 개인화된 메시지 사용

### 1.2 Error Toast (오류)
**시각적 특성:**
- 빨간색 강조 색상
- X 또는 경고 아이콘
- 명확한 시각적 대비

**사용 시나리오:**

| 상황 | 메시지 | 지속 시간 |
|------|--------|----------|
| 프로젝트 생성 실패 | "프로젝트 생성에 실패했습니다. {에러 메시지}" | 5초 |
| 프로젝트 저장 실패 | "저장에 실패했습니다. 다시 시도해주세요." | 5초 |
| 프로젝트 삭제 실패 | "삭제에 실패했습니다. {에러 메시지}" | 5초 |
| 프로젝트 로드 실패 | "프로젝트를 불러올 수 없습니다" | 5초 |
| 로그인 실패 (인증 오류) | "이메일 또는 비밀번호가 올바르지 않습니다" | 5초 |
| 로그인 실패 (네트워크) | "서버에 연결할 수 없습니다. 네트워크를 확인해주세요." | 5초 |
| 회원가입 실패 (중복 이메일) | "이미 사용 중인 이메일입니다" | 5초 |
| 회원가입 실패 (유효성 검사) | "입력값을 확인해주세요" | 5초 |
| 세션 만료 | "로그인이 만료되었습니다. 다시 로그인해주세요." | 6초 |
| 네트워크 에러 (일반) | "네트워크 오류가 발생했습니다" | 5초 |
| 권한 없음 (403) | "접근 권한이 없습니다" | 5초 |
| 서버 에러 (500) | "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." | 6초 |

**UX 고려사항:**
- 에러 메시지는 명확하고 사용자가 이해할 수 있는 언어로 작성
- 가능한 경우 해결 방법 제시 ("다시 시도해주세요", "네트워크를 확인해주세요")
- 오류 지속 시간을 5-6초로 설정하여 사용자가 메시지를 충분히 읽을 수 있도록 함
- 서버 에러 메시지는 기술적 세부사항을 노출하지 않음

### 1.3 Info Toast (정보)
**시각적 특성:**
- 파란색 강조 색상
- 정보 아이콘 (i)
- 중립적인 톤

**사용 시나리오:**

| 상황 | 메시지 | 지속 시간 |
|------|--------|----------|
| 프로젝트 목록 새로고침 | "프로젝트 목록이 업데이트되었습니다" | 2초 |
| 에디터 단축키 안내 | "Ctrl+S로 저장, ESC로 선택 해제" | 4초 |
| 첫 프로젝트 생성 시 | "첫 프로젝트를 만들어보세요!" | 3초 |
| 검색 결과 없음 | "검색 결과가 없습니다" | 3초 |
| 클립보드 복사 | "클립보드에 복사되었습니다" | 2초 |

**UX 고려사항:**
- 사용자에게 유용한 정보나 힌트를 제공
- 너무 빈번하게 표시되지 않도록 주의
- 첫 방문 사용자를 위한 온보딩 힌트로 활용 가능

### 1.4 Loading Toast (로딩)
**시각적 특성:**
- 회전하는 스피너 아이콘
- 중립적인 색상 (그레이)
- Promise 기반 자동 업데이트

**사용 시나리오:**

| 상황 | 로딩 메시지 | 성공 메시지 | 에러 메시지 | 지속 시간 |
|------|------------|-----------|-----------|----------|
| 프로젝트 생성 중 | "프로젝트를 생성하는 중..." | "프로젝트가 생성되었습니다" | "생성에 실패했습니다" | Promise |
| 프로젝트 삭제 중 | "프로젝트를 삭제하는 중..." | "프로젝트가 삭제되었습니다" | "삭제에 실패했습니다" | Promise |
| 파일 업로드 중 | "업로드 중... {진행률}%" | "업로드 완료" | "업로드 실패" | Promise |
| 데이터 동기화 중 | "동기화 중..." | "동기화 완료" | "동기화 실패" | Promise |

**UX 고려사항:**
- 시간이 오래 걸리는 작업(2초 이상)에만 사용
- Promise 패턴을 활용하여 로딩 → 성공/실패 자동 전환
- 진행률이 있는 경우 퍼센트 표시
- 취소 가능한 작업의 경우 취소 버튼 제공 고려

### 1.5 Warning Toast (경고)
**시각적 특성:**
- 주황색/노란색 강조 색상
- 경고 삼각형 아이콘
- 주의를 끄는 톤

**사용 시나리오:**

| 상황 | 메시지 | 지속 시간 |
|------|--------|----------|
| 저장되지 않은 변경사항 | "저장되지 않은 변경사항이 있습니다" | 5초 |
| 브라우저 지원 경고 | "일부 기능이 제한될 수 있습니다" | 5초 |
| 저장 공간 부족 경고 | "로컬 저장 공간이 부족합니다" | 6초 |

**UX 고려사항:**
- 사용자의 주의가 필요하지만 즉각적인 액션이 필수는 아닌 경우
- 경고성 메시지이므로 충분한 시간 제공 (5-6초)
- 너무 자주 표시하면 무시될 수 있으므로 중요한 경우에만 사용

---

## 2. Toast 메시지 문구 가이드라인

### 2.1 메시지 작성 원칙

**DO (좋은 예시):**
- **명확하고 구체적**: "프로젝트가 저장되었습니다" ✓
- **액션 지향적**: "다시 시도해주세요" ✓
- **긍정적 톤**: "변경사항이 저장되었습니다" ✓
- **간결함**: 25자 이내 권장, 최대 50자
- **사용자 중심**: "{사용자명}님, 환영합니다" ✓

**DON'T (피해야 할 예시):**
- **모호한 표현**: "작업 완료" ✗
- **기술 용어**: "API 호출 실패 (ERR_CONNECTION_REFUSED)" ✗
- **부정적 톤**: "프로젝트를 만들지 못했습니다" ✗
- **너무 긴 메시지**: "프로젝트 생성 작업이 성공적으로 완료되었으니..." ✗

### 2.2 에러 메시지 가이드라인

**구조:**
```
[문제 설명] + [해결 제안]
```

**예시:**
- "저장에 실패했습니다. 다시 시도해주세요."
- "네트워크에 연결할 수 없습니다. 인터넷 연결을 확인해주세요."
- "세션이 만료되었습니다. 다시 로그인해주세요."

**서버 에러 처리:**
- 서버에서 받은 에러 메시지가 사용자 친화적인 경우: 그대로 표시
- 기술적인 에러 메시지인 경우: 일반화된 메시지로 대체
- 예시 코드:
```javascript
const getUserFriendlyMessage = (serverError) => {
  const friendlyMessages = {
    'VALIDATION_ERROR': '입력값을 확인해주세요',
    'DUPLICATE_EMAIL': '이미 사용 중인 이메일입니다',
    'UNAUTHORIZED': '로그인이 필요합니다',
    'FORBIDDEN': '접근 권한이 없습니다',
    'NOT_FOUND': '요청한 리소스를 찾을 수 없습니다',
    'SERVER_ERROR': '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
  };

  return friendlyMessages[serverError] || '오류가 발생했습니다';
};
```

### 2.3 다국어 준비 (향후 확장)
현재는 한국어만 지원하지만, 향후 다국어 지원을 위해 메시지 키를 미리 정의:

```javascript
// 예시: messages.ko.js
export const toastMessages = {
  project: {
    createSuccess: '프로젝트가 생성되었습니다',
    createError: '프로젝트 생성에 실패했습니다',
    saveSuccess: '변경사항이 저장되었습니다',
    saveError: '저장에 실패했습니다',
    deleteSuccess: '프로젝트가 삭제되었습니다',
    deleteError: '삭제에 실패했습니다',
  },
  auth: {
    loginSuccess: (username) => `${username}님, 환영합니다`,
    loginError: '로그인에 실패했습니다',
    logoutSuccess: '로그아웃되었습니다',
  }
};
```

---

## 3. Toast 표시 위치 및 지속 시간

### 3.1 표시 위치
**권장 위치: 화면 상단 중앙 (top-center)**

**선택 이유:**
1. **시각적 우선순위**: 사용자의 시선이 자연스럽게 향하는 위치
2. **에디터 UI 방해 최소화**:
   - 하단: EditorPanel의 컨트롤과 겹칠 수 있음
   - 우측: 에디터 패널 영역과 겹침
   - 좌측: Scene 영역의 3D 뷰 방해
3. **일관성**: 대부분의 모던 웹 앱이 사용하는 패턴

**대안 위치 (상황별):**
- **에디터 페이지 내부 작업**: 상단 우측 (에디터 헤더 아래)
- **프로젝트 대시보드**: 상단 중앙
- **로그인/회원가입 페이지**: 상단 중앙

### 3.2 지속 시간 가이드

| Toast 타입 | 기본 지속 시간 | 범위 | 비고 |
|-----------|--------------|------|------|
| Success | 3초 | 2-4초 | 짧고 긍정적인 메시지 |
| Error | 5초 | 4-6초 | 사용자가 읽고 이해할 시간 필요 |
| Info | 3초 | 2-4초 | 정보 제공, 읽기 쉬움 |
| Warning | 5초 | 5-6초 | 주의 필요, 충분한 시간 제공 |
| Loading | Promise | - | 작업 완료까지 또는 무한 |

**지속 시간 계산식 (선택적):**
```javascript
// 메시지 길이에 따른 동적 지속 시간 계산
const calculateDuration = (message, baseTime = 3000) => {
  const wordsPerSecond = 3; // 한국어 읽기 속도
  const messageLength = message.length;
  const readTime = (messageLength / wordsPerSecond) * 1000;
  return Math.max(baseTime, Math.min(readTime, 7000)); // 최소 3초, 최대 7초
};
```

### 3.3 다중 Toast 관리
**규칙:**
- 최대 3개까지만 동시 표시
- 새로운 Toast는 위에서부터 쌓임 (stack)
- 오래된 Toast는 자동으로 fade out
- 같은 메시지가 연속으로 표시되지 않도록 중복 제거

**예시:**
```javascript
// sonner의 기본 동작 활용
import { toast } from 'sonner';

// 중복 방지
let lastToastMessage = '';
const showToast = (message, type = 'info') => {
  if (message === lastToastMessage) return;
  lastToastMessage = message;
  toast[type](message);
  setTimeout(() => { lastToastMessage = ''; }, 1000);
};
```

---

## 4. 기존 alert() 및 confirm() 대체 전략

### 4.1 현재 사용 현황

**위치별 alert/confirm 사용:**

| 파일 | 라인 | 현재 코드 | Toast 대체 |
|------|------|-----------|-----------|
| `ProjectsDashboard.jsx` | 47 | `confirm("정말로 이 프로젝트를 삭제하시겠습니까?")` | AlertDialog + Toast |
| `ProjectsDashboard.jsx` | 52 | `alert("삭제 실패: {error}")` | Error Toast |
| `EditorPage.jsx` | 32 | `alert("프로젝트를 불러올 수 없습니다.")` | Error Toast |
| `EditorPage.jsx` | 90 | `alert("저장 실패: {error}")` | Error Toast |

### 4.2 대체 전략

#### 4.2.1 단순 alert() → Toast
**Before:**
```javascript
if (result.success) {
  console.log("프로젝트가 삭제되었습니다.");
} else {
  alert(`삭제 실패: ${result.error}`);
}
```

**After:**
```javascript
import { toast } from 'sonner';

if (result.success) {
  toast.success("프로젝트가 삭제되었습니다");
} else {
  toast.error(`삭제에 실패했습니다. ${result.error}`);
}
```

#### 4.2.2 confirm() → AlertDialog + Toast
**confirm()은 사용자의 확인이 필요한 중요한 작업이므로 Toast로 대체하지 않고, shadcn/ui의 AlertDialog를 사용합니다.**

**Before:**
```javascript
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

**After:**
```javascript
import { toast } from 'sonner';
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

// 상태로 관리
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [projectToDelete, setProjectToDelete] = useState(null);

const handleDeleteProject = (id) => {
  setProjectToDelete(id);
  setDeleteDialogOpen(true);
};

const confirmDelete = async () => {
  const result = await deleteProject(projectToDelete);
  if (result.success) {
    toast.success("프로젝트가 삭제되었습니다");
  } else {
    toast.error(`삭제에 실패했습니다. ${result.error}`);
  }
  setDeleteDialogOpen(false);
};

// JSX
<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>프로젝트 삭제</AlertDialogTitle>
      <AlertDialogDescription>
        정말로 이 프로젝트를 삭제하시겠습니까?
        이 작업은 되돌릴 수 없습니다.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>취소</AlertDialogCancel>
      <AlertDialogAction onClick={confirmDelete}>
        삭제
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**UX 개선점:**
- 모달 대화상자로 명확한 의도 확인
- 취소/확인 버튼이 명확히 구분됨
- 삭제 같은 위험한 작업은 빨간색 버튼으로 강조 가능
- 결과는 Toast로 간결하게 피드백

#### 4.2.3 로딩 상태 alert() → Loading Toast
**Before:**
```javascript
const handleSave = async () => {
  setIsSaving(true);
  const result = await updateProject(id, { sceneData });
  setIsSaving(false);

  if (result.success) {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  } else {
    alert(`저장 실패: ${result.error}`);
  }
};
```

**After:**
```javascript
import { toast } from 'sonner';

const handleSave = async () => {
  const promise = updateProject(id, { sceneData });

  toast.promise(promise, {
    loading: '저장 중...',
    success: '변경사항이 저장되었습니다',
    error: (err) => `저장에 실패했습니다. ${err.error || ''}`,
  });
};
```

**UX 개선점:**
- 로딩 → 성공/실패 자동 전환
- 별도의 상태 관리 불필요
- 사용자에게 명확한 진행 상황 전달

### 4.3 대체 우선순위

**Phase 1: 즉시 적용 (높은 우선순위)**
1. ✅ `EditorPage.jsx` - 저장 실패 alert (라인 90)
2. ✅ `EditorPage.jsx` - 프로젝트 로드 실패 alert (라인 32)
3. ✅ `ProjectsDashboard.jsx` - 삭제 실패 alert (라인 52)

**Phase 2: AlertDialog 도입 (중간 우선순위)**
4. ✅ `ProjectsDashboard.jsx` - 삭제 확인 confirm (라인 47)

**Phase 3: 추가 기능 (낮은 우선순위)**
5. 로그인/회원가입 성공 시 Toast 추가
6. 네트워크 에러 전역 핸들러 Toast
7. 자동 저장 기능 Toast

---

## 5. 구현 시 UX 포인트

### 5.1 접근성 (Accessibility)

**ARIA 속성:**
```javascript
// sonner는 기본적으로 role="status" 또는 role="alert" 제공
// 추가 설정 예시:
toast.success("저장 완료", {
  duration: 3000,
  ariaLive: 'polite', // 스크린 리더에서 현재 읽기를 중단하지 않음
});

toast.error("오류 발생", {
  duration: 5000,
  ariaLive: 'assertive', // 즉시 읽음 (긴급)
});
```

**키보드 탐색:**
- Toast에 액션 버튼이 있는 경우 Tab으로 이동 가능
- ESC 키로 Toast 닫기 가능 (sonner 기본 기능)

**스크린 리더 지원:**
- 의미 있는 메시지 작성 (아이콘에만 의존하지 않음)
- 에러 메시지는 `aria-live="assertive"`로 즉시 읽힘

### 5.2 애니메이션 및 전환

**권장 설정:**
```javascript
// sonner의 기본 애니메이션 사용
import { Toaster } from 'sonner';

<Toaster
  position="top-center"
  richColors // 타입별 색상 자동 적용
  closeButton // X 버튼 표시
  duration={3000}
  theme="system" // 시스템 테마 따름 (light/dark)
/>
```

**커스텀 애니메이션 (선택적):**
- 슬라이드 인: 부드럽게 위에서 아래로
- 페이드 아웃: 투명도 감소하며 사라짐
- 스택 애니메이션: 새 Toast가 들어올 때 기존 Toast가 아래로 밀림

### 5.3 다크 모드 지원

**LumoStage 디자인 시스템 통합:**
```javascript
// Tailwind CSS 다크 모드 변수 사용
<Toaster
  theme="system" // 또는 'light' | 'dark'
  toastOptions={{
    classNames: {
      toast: 'bg-background text-foreground border-border',
      success: 'text-green-600 dark:text-green-400',
      error: 'text-red-600 dark:text-red-400',
      info: 'text-blue-600 dark:text-blue-400',
      warning: 'text-yellow-600 dark:text-yellow-400',
    }
  }}
/>
```

### 5.4 모바일 대응

**반응형 디자인:**
- 모바일: 화면 상단 중앙, 좌우 여백 16px
- 태블릿: 화면 상단 중앙, 최대 너비 500px
- 데스크톱: 화면 상단 중앙, 최대 너비 400px

**터치 인터랙션:**
- 스와이프로 닫기 (sonner 기본 지원)
- 터치 타겟 최소 44x44px

**예시:**
```javascript
<Toaster
  position="top-center"
  expand={false} // 모바일에서 확장하지 않음
  visibleToasts={3}
  toastOptions={{
    style: {
      maxWidth: '90vw', // 모바일 대응
    }
  }}
/>
```

### 5.5 성능 고려사항

**Toast 스팸 방지:**
```javascript
// 같은 메시지 중복 방지
const toastCache = new Set();

export const showToastOnce = (message, type = 'info', duration = 3000) => {
  const key = `${type}-${message}`;

  if (toastCache.has(key)) return;

  toastCache.add(key);
  toast[type](message, { duration });

  setTimeout(() => {
    toastCache.delete(key);
  }, duration);
};
```

**자동 저장 Toast 최적화:**
```javascript
// 자동 저장 Toast는 마지막 것만 표시 (debounce)
let autoSaveToastId = null;

const showAutoSaveToast = () => {
  if (autoSaveToastId) {
    toast.dismiss(autoSaveToastId);
  }

  autoSaveToastId = toast.loading('저장 중...', {
    duration: Infinity,
  });

  // 저장 완료 시
  setTimeout(() => {
    toast.success('자동 저장됨', { id: autoSaveToastId });
    autoSaveToastId = null;
  }, 1000);
};
```

### 5.6 에러 복구 액션

**Toast에 액션 버튼 추가:**
```javascript
toast.error('저장에 실패했습니다', {
  action: {
    label: '다시 시도',
    onClick: () => handleSave(),
  },
  duration: 5000,
});

toast.error('네트워크 연결이 끊어졌습니다', {
  action: {
    label: '새로고침',
    onClick: () => window.location.reload(),
  },
  duration: Infinity, // 수동으로 닫을 때까지 유지
});
```

**UX 개선점:**
- 사용자가 즉시 문제를 해결할 수 있는 옵션 제공
- 재시도 버튼으로 작업 흐름 유지
- 긴급하지 않은 에러는 자동으로 사라지지만, 중요한 에러는 수동 닫기 필요

---

## 6. 구현 우선순위 및 단계별 계획

### Phase 1: 기본 Toast 시스템 구축 (1일)

**목표:** sonner 설치 및 기본 설정, 핵심 기능 대체

**작업 항목:**
1. ✅ `sonner` 패키지 설치
   ```bash
   npm install sonner
   ```

2. ✅ `App.jsx`에 Toaster 컴포넌트 추가
   ```javascript
   import { Toaster } from 'sonner';

   function App() {
     return (
       <>
         <Toaster position="top-center" richColors closeButton />
         {/* 기존 라우팅 */}
       </>
     );
   }
   ```

3. ✅ Toast 유틸리티 함수 작성
   - 파일: `client/src/lib/toast.js`
   - 메시지 표준화, 중복 방지, 타입별 래퍼 함수

4. ✅ 에디터 페이지 alert() 대체
   - `EditorPage.jsx` 라인 32, 90 수정
   - 저장 성공/실패 Toast

5. ✅ 프로젝트 대시보드 alert() 대체
   - `ProjectsDashboard.jsx` 라인 52 수정
   - 삭제 실패 Toast

**검증:**
- 에디터에서 저장 성공/실패 시 Toast 표시
- 프로젝트 삭제 실패 시 Toast 표시
- Toast 위치, 색상, 애니메이션 확인

---

### Phase 2: AlertDialog 도입 (1일)

**목표:** confirm() 대체 및 사용자 확인 UI 개선

**작업 항목:**
1. ✅ shadcn/ui AlertDialog 설치 (이미 설치되어 있을 가능성 높음)
   ```bash
   npx shadcn@latest add alert-dialog
   ```

2. ✅ 프로젝트 삭제 confirm() → AlertDialog 변경
   - `ProjectsDashboard.jsx` 수정
   - 삭제 확인 다이얼로그 상태 관리
   - 삭제 성공 시 Toast 표시

3. ✅ 재사용 가능한 ConfirmDialog 컴포넌트 작성
   - 파일: `client/src/components/ui/confirm-dialog.jsx`
   - Props: title, description, confirmText, onConfirm

**검증:**
- 프로젝트 삭제 시 AlertDialog 표시
- 확인 클릭 시 삭제 + Toast
- 취소 클릭 시 다이얼로그만 닫힘

---

### Phase 3: 프로젝트 CRUD Toast 완성 (1일)

**목표:** 모든 프로젝트 생성/수정/삭제 작업에 Toast 적용

**작업 항목:**
1. ✅ 프로젝트 생성 Toast
   - `NewProjectDialog.jsx` 수정
   - 생성 성공: toast.promise 사용
   - 생성 실패: Error Toast

2. ✅ 프로젝트 정보 수정 Toast
   - `EditProjectDialog.jsx` 수정 (있는 경우)
   - 수정 성공/실패 Toast

3. ✅ 프로젝트 삭제 Toast (Phase 2에서 이미 완료)

**검증:**
- 프로젝트 생성 시 로딩 → 성공 Toast
- 프로젝트 정보 수정 시 성공 Toast
- 모든 에러 케이스에서 Error Toast

---

### Phase 4: 인증 Toast (1일)

**목표:** 로그인/회원가입/로그아웃 Toast 추가

**작업 항목:**
1. ✅ 로그인 성공 Toast
   - `LoginPage.jsx` 수정
   - 개인화 메시지: "{username}님, 환영합니다"

2. ✅ 회원가입 성공 Toast
   - `RegisterPage.jsx` 수정
   - "회원가입이 완료되었습니다"

3. ✅ 로그아웃 Toast
   - `AuthNavbar.jsx` 또는 로그아웃 핸들러 수정
   - "로그아웃되었습니다"

4. ✅ 소셜 로그인 성공 Toast
   - OAuth 콜백에서 Toast 표시

**검증:**
- 로그인 성공 시 개인화 Toast
- 로그아웃 시 Toast
- 에러 발생 시 Error Toast (기존 인라인 에러는 유지)

---

### Phase 5: 네트워크 에러 전역 핸들러 (1일)

**목표:** API 요청 실패 시 일관된 Toast 표시

**작업 항목:**
1. ✅ Axios 인터셉터 설정
   - 파일: `client/src/lib/api.js` 수정
   - 401 (인증 실패): "로그인이 필요합니다" Toast + 로그인 페이지 이동
   - 403 (권한 없음): "접근 권한이 없습니다" Toast
   - 500 (서버 에러): "서버 오류가 발생했습니다" Toast
   - 네트워크 에러: "네트워크 연결을 확인해주세요" Toast

2. ✅ 에러 타입별 Toast 메시지 매핑

**검증:**
- 토큰 만료 시 인증 Toast + 리디렉션
- 서버 에러 시 일반화된 Toast
- 네트워크 끊김 시 Toast

---

### Phase 6: 고급 기능 (선택적, 1-2일)

**목표:** 사용자 경험을 더욱 향상시키는 고급 Toast 기능

**작업 항목:**
1. ✅ 자동 저장 Toast
   - 에디터에서 일정 시간 후 자동 저장
   - Debounce 적용하여 Toast 스팸 방지
   - "자동 저장 중..." → "자동 저장됨"

2. ✅ 복구 액션이 있는 Error Toast
   - 저장 실패 시 "다시 시도" 버튼
   - 네트워크 에러 시 "새로고침" 버튼

3. ✅ 진행률이 있는 Loading Toast (파일 업로드 등)
   - 향후 썸네일 업로드 기능 추가 시 사용

4. ✅ 온보딩 Toast
   - 첫 방문 사용자를 위한 힌트 Toast
   - 에디터 단축키 안내 등

**검증:**
- 자동 저장이 부드럽게 작동
- 에러 복구 버튼 클릭 시 재시도
- 첫 방문 시 힌트 Toast 표시

---

### Phase 7: 테스트 및 최적화 (1일)

**목표:** Toast 시스템 안정화 및 성능 최적화

**작업 항목:**
1. ✅ 단위 테스트 작성 (선택적)
   - `toast.js` 유틸리티 함수 테스트
   - 중복 방지 로직 테스트

2. ✅ E2E 테스트 (선택적)
   - Playwright 또는 Cypress로 Toast 표시 검증

3. ✅ 접근성 검사
   - 스크린 리더 테스트
   - 키보드 탐색 테스트

4. ✅ 성능 프로파일링
   - Toast가 렌더링 성능에 영향을 주지 않는지 확인
   - 메모리 누수 체크

5. ✅ 사용자 피드백 수집 및 개선

**검증:**
- 모든 Toast 시나리오가 정상 작동
- 접근성 기준 충족
- 성능 저하 없음

---

## 7. 예상 소요 시간

| Phase | 작업 | 예상 시간 |
|-------|------|----------|
| 1 | 기본 Toast 시스템 구축 | 1일 (4-6시간) |
| 2 | AlertDialog 도입 | 1일 (4-6시간) |
| 3 | 프로젝트 CRUD Toast | 1일 (4-6시간) |
| 4 | 인증 Toast | 1일 (3-5시간) |
| 5 | 네트워크 에러 핸들러 | 1일 (3-5시간) |
| 6 | 고급 기능 (선택적) | 1-2일 (6-12시간) |
| 7 | 테스트 및 최적화 | 1일 (4-6시간) |
| **총계** | **전체 구현** | **5-8일** |

**우선순위별 단축 버전:**
- **필수 (Phase 1-3)**: 3일 - 기본 Toast 및 alert() 대체
- **권장 (Phase 1-5)**: 5일 - 인증 및 에러 핸들링 포함
- **완성 (Phase 1-7)**: 7-8일 - 모든 기능 및 테스트 포함

---

## 8. 참고 자료

**라이브러리 문서:**
- [Sonner 공식 문서](https://sonner.emilkowal.ski/)
- [shadcn/ui AlertDialog](https://ui.shadcn.com/docs/components/alert-dialog)

**UX 모범 사례:**
- [Material Design - Snackbars](https://m3.material.io/components/snackbar/overview)
- [Apple Human Interface Guidelines - Alerts](https://developer.apple.com/design/human-interface-guidelines/alerts)

**접근성 참고:**
- [WAI-ARIA: role="status"](https://www.w3.org/TR/wai-aria-1.2/#status)
- [WAI-ARIA: aria-live](https://www.w3.org/TR/wai-aria-1.2/#aria-live)

---

## 9. 체크리스트

구현 시 확인해야 할 항목들:

### 기능 체크리스트
- [ ] sonner 설치 및 Toaster 컴포넌트 추가
- [ ] Toast 유틸리티 함수 작성 (`lib/toast.js`)
- [ ] 에디터 alert() 대체 완료
- [ ] 프로젝트 대시보드 alert() 대체 완료
- [ ] AlertDialog로 confirm() 대체
- [ ] 프로젝트 생성/수정/삭제 Toast 완성
- [ ] 로그인/회원가입/로그아웃 Toast 추가
- [ ] 네트워크 에러 전역 핸들러 구현

### UX 체크리스트
- [ ] 모든 Toast 메시지가 한국어로 작성됨
- [ ] 메시지가 25자 이내로 간결함
- [ ] 에러 메시지에 해결 방법 포함
- [ ] 색상이 디자인 시스템과 일치함
- [ ] 애니메이션이 부드러움
- [ ] 다크 모드에서도 가독성 확보

### 접근성 체크리스트
- [ ] 스크린 리더에서 Toast 내용이 읽힘
- [ ] 키보드로 Toast 닫기 가능 (ESC)
- [ ] 액션 버튼이 있는 경우 Tab으로 접근 가능
- [ ] 색상에만 의존하지 않고 아이콘/텍스트 제공

### 성능 체크리스트
- [ ] Toast 중복 방지 로직 작동
- [ ] 최대 3개까지만 동시 표시
- [ ] 렌더링 성능 저하 없음
- [ ] 메모리 누수 없음

### 테스트 체크리스트
- [ ] 모든 성공 케이스에서 Success Toast 표시
- [ ] 모든 에러 케이스에서 Error Toast 표시
- [ ] AlertDialog에서 취소/확인 동작 확인
- [ ] 모바일에서 Toast 정상 표시
- [ ] 다크 모드 Toast 정상 표시

---

## 10. 향후 개선 방향

1. **Toast 분석 (Analytics)**
   - 어떤 Toast가 가장 자주 표시되는지 추적
   - 에러 Toast 빈도 분석하여 UX 개선

2. **사용자 설정**
   - Toast 표시 위치 선택 (상단/하단)
   - Toast 지속 시간 커스터마이징
   - Toast 알림 끄기 옵션 (중요한 것만 표시)

3. **다국어 지원**
   - `i18next` 통합
   - 메시지 키 기반 다국어 Toast

4. **고급 Toast 타입**
   - Progress Toast (진행률 바 포함)
   - Rich Toast (이미지, 링크 포함)
   - Interactive Toast (복잡한 액션)

5. **Toast 히스토리**
   - 지나간 Toast를 다시 볼 수 있는 히스토리 패널
   - 중요한 알림 저장 기능

---

## 결론

Toast 알림 시스템 도입을 통해 LumoStage의 사용자 경험을 다음과 같이 개선할 수 있습니다:

1. **비침습적 피드백**: `alert()`/`confirm()`을 대체하여 작업 흐름 유지
2. **일관된 디자인**: 모든 알림이 통일된 스타일로 표시
3. **명확한 커뮤니케이션**: 타입별 색상과 아이콘으로 직관적인 정보 전달
4. **접근성 향상**: 스크린 리더 및 키보드 사용자 지원
5. **확장 가능성**: 향후 기능 추가 시 쉽게 통합

**권장 구현 순서:**
1. Phase 1-3 (3일): 필수 기능 구현
2. Phase 4-5 (2일): 인증 및 에러 핸들링
3. Phase 6-7 (2-3일): 고급 기능 및 최적화

총 5-8일의 작업으로 완성도 높은 Toast 시스템을 구축할 수 있습니다.
