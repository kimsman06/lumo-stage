import NewEditorPanel from '../components/editor/NewEditorPanel';

// UI 개발을 위한 가짜 데이터 (Mock Data)
const mockData = {
  lights: [
    {
      id: 'light1',
      type: 'point',
      color: '#ff0000',
      intensity: 25.0,
      position: [2, 3, 4],
      castShadow: true,
    },
    {
      id: 'light2',
      type: 'spot',
      color: '#00ff00',
      intensity: 40.0,
      position: [-5, 2, 1],
      castShadow: false,
      angle: 0.5,
      penumbra: 0.6,
    },
  ],
  camera: {
    position: [10, 10, 10],
    target: [0, 0, 0],
    focalLength: 75,
  },
  mannequins: [
    {
      id: 'mannequin1',
      pose: {
        head_02: { x: 0, y: 0, z: 0 },
        waist_00: { x: 0, y: 0, z: 0 },
        l_shoulder_03: { x: 0, y: 0, z: 0 },
      }
    }
  ],
  selectedMannequinId: 'mannequin1',
};

const EditorPanelTestPage = () => {
  return (
    <div className="w-screen h-full bg-background flex justify-end">
      <NewEditorPanel className="h-full" mockData={mockData} />
    </div>
  );
};

export default EditorPanelTestPage;
