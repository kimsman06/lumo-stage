import React, { useEffect } from 'react';
import Scene from '../components/Scene';
import EditorPanel from '../components/EditorPanel';
import useStore from '../store';

function EditorPage() {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target.tagName.toLowerCase() === 'input') return;

      switch (event.key.toLowerCase()) {
        case 'escape':
          useStore.getState().setSelectedLight(null);
          break;
        case 'w':
          useStore.getState().setTransformMode('translate');
          break;
        case 'e':
          useStore.getState().setTransformMode('rotate');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="w-screen h-screen bg-black grid grid-flow-col grid-cols-[1fr_auto]">
      {/* Scene takes up the first column (all remaining space) */}
      <div className="h-full overflow-hidden">
        <Scene />
      </div>
      {/* EditorPanel takes up the second column (its own width) */}
      <EditorPanel />
    </div>
  );
}

export default EditorPage;
