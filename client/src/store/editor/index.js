import { createLightsSlice } from './lightsSlice';
import { createSceneSlice } from './sceneSlice';
import { createMannequinSlice } from './mannequinSlice';
import { createDiffuserSlice } from './diffuserSlice';
import { createPersistenceSlice } from './persistenceSlice';

// 이 파일은 추후 editorStore.js에서 모든 slice를 통합하는 역할을 합니다.
const editorSlices = (set, get) => ({
  ...createLightsSlice(set, get),
  ...createSceneSlice(set, get),
  ...createMannequinSlice(set, get),
  ...createDiffuserSlice(set, get),
  ...createPersistenceSlice(set, get),
});

export default editorSlices;
