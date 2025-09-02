import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, Plane } from '@react-three/drei';

function App() {
  return (
    <div className="w-screen h-screen bg-black">
      <Canvas shadows camera={{ position: [0, 2, 5], fov: 75 }}>
        {/* 전체적으로 은은한 빛 */}
        <ambientLight intensity={0.5} />

        {/* 특정 방향에서 비추는 강한 빛 (그림자 생성) */}
        <directionalLight
          castShadow
          position={[10, 10, 5]}
          intensity={1.5}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* 중앙에 위치한 반짝이는 구 (그림자를 생성함) */}
        <Sphere args={[1, 32, 32]} position={[0, 0, 0]} castShadow>
          <meshStandardMaterial color="white" metalness={0.7} roughness={0.2} />
        </Sphere>

        {/* 바닥 (그림자를 받음) */}
        <Plane
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -1.5, 0]}
          args={[100, 100]}
        >
          <meshStandardMaterial color="grey" />
        </Plane>

        {/* 마우스로 Scene을 컨트롤할 수 있게 해주는 OrbitControls */}
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default App;