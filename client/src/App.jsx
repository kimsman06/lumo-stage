import React, { useEffect } from 'react';
import Scene from './components/Scene';
import Controls from './components/Controls';
import MannequinControls from './components/MannequinControls'; // Import the new controls
import useStore from './store';

function App() {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Prevent shortcuts if typing in an input
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
    <div className="w-screen h-screen bg-black flex">
      {/* Left Panel: Mannequin Controls */}
      <MannequinControls />
      
      {/* Center Panel: 3D Scene */}
      <div className="flex-grow h-full">
        <Scene />
      </div>
      
      {/* Right Panel: Light and Camera Controls */}
      <Controls />
    </div>
  );
}

export default App;
