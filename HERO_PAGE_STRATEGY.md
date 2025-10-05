# LumoStage Hero 페이지 디자인 전략

**작성일:** 2025년 10월 5일
**기준 문서:** `docs/DesignStargey.md`

## 1. 페이지 목표 (Page Goal)

- **첫인상 각인**: 방문자에게 LumoStage가 "전문적이고 직관적인 웹 기반 3D 조명 시뮬레이터"임을 10초 안에 각인시킨다.
- **핵심 가치 전달**: 실제 조명 테스트의 시간과 비용 문제를 해결해준다는 핵심 가치를 명확하게 전달한다.
- **행동 유도**: 사용자가 주저 없이 '에디터 시작하기' 버튼을 클릭하여 실제 제품을 경험하도록 유도한다.

## 2. 핵심 메시지 (Core Message)

### 2.1 헤드라인 (Headline)
- **H1 (대제목)**: **"디지털 공간에서 펼쳐지는 당신의 조명 연출"**
    - 감성적이면서도 제품의 핵심 기능(조명 연출)을 명확히 전달하는 문구
- **H2 (소제목)**: **"웹에서 실시간으로 조명을 설계하고, 당신의 비전을 현실로 만드세요. 복잡한 설치 없이, 아이디어만 준비하세요."**
    - 제품의 사용 환경(웹), 핵심 특징(실시간), 그리고 고객 혜택(비전 현실화, 간편함)을 구체적으로 설명

## 3. 시각적 요소 (Visual Elements)

### 3.1 배경 (Background)
- **전체 배경**: `DesignStargey.md`의 `studio-950 (#0a0a0f)` 색상을 사용하여 깊고 전문적인 느낌을 준다.
- **배경 애니메이션 (고급)**: 미세한 노이즈 텍스처 위에, `Three.js`를 활용하여 천천히 움직이는 희미한 **볼류메트릭 광선(Volumetric Light Beam)** 효과를 추가한다. 이는 사용자의 시선을 중앙으로 모으고, '조명'이라는 주제를 시각적으로 각인시키는 역할을 한다.

### 3.2 중앙 비주얼 (Centerpiece Visual)
- **핵심 콘텐츠**: LumoStage 에디터의 실제 사용 모습을 담은 **고품질의 자동 재생 비디오 또는 GIF**를 배치한다.
- **시나리오**: 
    1. 어두운 공간에 마네킹이 나타난다.
    2. 마우스 커서가 나타나 '조명 추가' 버튼을 누른다.
    3. `PointLight`가 생성되고, 마우스로 조명을 드래그하자 실시간으로 마네킹의 그림자가 부드럽게 바뀐다.
    4. 조명의 색상과 강도를 조절하는 UI가 나타나고, 값이 바뀌자 즉시 장면이 변화한다.
- **효과**: '실시간 피드백'이라는 가장 강력한 장점을 텍스트 없이 직관적으로 보여준다.

## 4. 컴포넌트 디자인 (Component Design)

### 4.1. 네비게이션 바 (Navbar)
- **스타일**: `DesignStargey.md`의 Header 스타일과 유사하게, `bg-studio-950/80`과 `backdrop-blur-sm`을 적용하여 배경과 분리된 느낌을 준다.
- **구성**:
    - **좌측**: 로고 (`Lightbulb` 아이콘 + "LumoStage" 텍스트)
    - **우측**: 주요 행동 유도(CTA) 버튼. `shadcn/ui`의 `Button` 컴포넌트 활용.
        - `<Button>에디터 시작하기</Button>` (Primary Action)

### 4.2. Hero 섹션
- **레이아웃**: 중앙 정렬. (헤드라인 -> 소제목 -> CTA 버튼 그룹 -> 중앙 비주얼 순서)
- **CTA 버튼 그룹**:
    - **Primary Button**: `<Button size="lg">에디터 시작하기</Button>`
        - `DesignStargey.md`의 `primary-600` 색상을 사용하여 가장 눈에 띄게 디자인한다.
    - **Secondary Button**: `<Button size="lg" variant="outline">기능 둘러보기</Button>`
        - `outline` 스타일을 적용하여 Primary 버튼을 보조하는 역할을 한다.

### 4.3. 주요 기능 소개 섹션 (Feature Highlight Section)
- **목표**: Hero 섹션 아래에 위치하여, 사용자가 스크롤 시 LumoStage의 핵심 기능을 요약하여 보여준다.
- **레이아웃**: 3단 그리드 레이아웃.
- **컴포넌트**: `shadcn/ui`의 `Card` 컴포넌트를 변형하여 사용.
    - 각 카드는 `bg-studio-900`, `border-studio-800` 스타일을 적용한다.

| 아이콘 (`lucide-react`) | 기능명                 | 설명                                                     |
| ----------------------- | ---------------------- | -------------------------------------------------------- |
| `Lightbulb`             | **직관적인 조명 설계** | 원하는 곳에 조명을 추가하고, 슬라이더로 즉시 제어하세요.   |
| `Camera`                | **자유로운 카메라 워크** | 다양한 앵글과 렌즈(FOV)를 테스트하며 완벽한 샷을 찾으세요. |
| `Save` / `Link`         | **저장 및 공유**       | 작업한 장면을 저장하고, 팀원과 URL 하나로 공유하세요.      |

### 4.4. 푸터 (Footer)
- **스타일**: `bg-studio-950` 배경에 `border-t border-studio-800`으로 상단에 구분선을 추가하여 페이지의 다른 콘텐츠와 분리한다.
- **레이아웃**: 좌우 양 끝 정렬.
- **구성**:
    - **좌측**: 저작권 정보. `text-sm text-gray-400` 스타일 적용.
        - `© 2025 LumoStage. All Rights Reserved.`
    - **우측**: 소셜 미디어 링크 아이콘 그룹. `lucide-react` 아이콘 활용.
        - `Github`, `Twitter` 아이콘 등을 배치. 각 아이콘은 `hover:text-primary-500` 효과를 적용한다.

## 5. 인터랙션 및 애니메이션 (Interaction & Animation)

- **라이브러리**: `Framer Motion`을 적극 활용하여 동적이고 세련된 경험을 제공한다.
- **페이지 로드**: 헤드라인, 소제목, CTA 버튼들이 순차적으로 Fade-in + Slide-up 되도록 `staggerChildren` 효과를 적용한다.
- **버튼 호버**: `DesignStargey.md`에 명시된 대로 `hover:scale-105`와 같은 미세한 인터랙션을 추가한다.
- **스크롤 애니메이션**: 사용자가 스크롤하여 '주요 기능 소개 섹션'에 도달했을 때, 각 기능 카드가 아래에서 위로 떠오르며 나타나도록 애니메이션을 적용한다.

## 6. 파일 구조 제안 (Proposed File Structure)

```
client/src/
├── pages/
│   └── HomePage.jsx         # Hero 페이지의 전체 레이아웃
└── components/
    └── hero/                # Hero 페이지 전용 컴포넌트 폴더
        ├── Navbar.jsx
        ├── HeroSection.jsx
        ├── FeatureSection.jsx
        └── Footer.jsx
```

## 7. 구현을 위한 라이브러리 (Libraries for Implementation)

Hero 페이지 구현을 위해 다음 라이브러리들의 설치가 필요합니다.

1.  **UI 프레임워크 & 스타일링**
    - `tailwindcss`: 유틸리티 우선 CSS 프레임워크 (이미 설정됨)
    - `shadcn-ui`: 재사용 가능한 컴포넌트 모음. (필요시 컴포넌트별로 추가)
        ```bash
        # shadcn/ui 초기화 (최초 1회)
        npx shadcn-ui@latest init
        
        # 필요한 컴포넌트 추가
        npx shadcn-ui@latest add button
        npx shadcn-ui@latest add card
        ```

2.  **애니메이션**
    - `framer-motion`: 리액트 애니메이션 라이브러리
        ```bash
        npm install framer-motion
        ```

3.  **아이콘**
    - `lucide-react`: `shadcn/ui`의 기본 아이콘 라이브러리
        ```bash
        npm install lucide-react
        ```

4.  **3D 배경 (선택 사항)**
    - `three`, `@react-three/fiber`, `@react-three/drei`: 3D 배경 애니메이션 구현 시 필요 (이미 설치됨)

## 8. 최종 목표

이 전략을 바탕으로 Hero 페이지를 구현하면, 방문자에게 LumoStage의 가치를 효과적으로 전달하고 자연스럽게 서비스 사용으로 유도할 수 있을 것입니다.