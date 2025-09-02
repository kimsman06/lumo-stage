import React, { useEffect } from 'react';
import Scene from './components/Scene';
import Controls from './components/Controls';
import useStore from './store';

function App() {
  // ESC 키를 눌렀을 때 선택 해제하는 전역 이벤트 리스너 추가
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        useStore.getState().setSelectedLight(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // 컴포넌트가 언마운트될 때 이벤트 리스너 정리
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="w-screen h-screen bg-black flex">
      <div className="w-3/4 h-full">
        <Scene />
      </div>
      <Controls />
    </div>
  );
}

export default App;