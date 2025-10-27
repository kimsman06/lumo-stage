import React, { useRef, forwardRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import useStore from "../store/editorStore";

/**
 * Diffuser Component
 *
 * 실제 조명 작업에서 사용하는 광목천/실크 디퓨저를 시뮬레이션합니다.
 * 빛이 반투명 재질을 통과하면서 부드럽게 확산되는 효과를 구현합니다.
 */

// Custom Shader Material for Silk Diffuser
const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;

    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform vec3 diffuseColor;
  uniform float opacity;
  uniform float transmission;
  uniform float thickness;
  uniform float roughness;
  uniform vec3 attenuationColor;
  uniform float attenuationDistance;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;

  // 3D Noise function for fabric texture
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);

    // Fresnel effect - edges are more transparent
    float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 2.0);

    // Add fabric texture using noise
    float scale = 20.0;
    vec3 noiseCoord = vec3(vUv * scale, 0.0);
    float fabricNoise = snoise(noiseCoord) * 0.5 + 0.5;

    // Add fine weave pattern
    float weavePattern = sin(vUv.x * scale * 3.14159 * 2.0) * sin(vUv.y * scale * 3.14159 * 2.0);
    weavePattern = weavePattern * 0.1 + 0.9;

    // Combine textures
    float fabricTexture = fabricNoise * weavePattern;

    // Calculate final opacity with fabric texture
    float finalOpacity = opacity * (1.0 - transmission) * fabricTexture;

    // Add roughness variation
    float roughnessVariation = fabricNoise * roughness;

    // Subsurface scattering approximation
    // Light scatters through the material
    float scatter = pow(fresnel, 0.5) * transmission;

    // Mix diffuse color with scattering
    vec3 scatterColor = mix(diffuseColor, vec3(1.0), scatter * 0.5);

    // Apply attenuation based on thickness
    float attenuation = exp(-attenuationDistance / max(thickness, 0.1));
    vec3 finalColor = mix(scatterColor, attenuationColor, attenuation);

    // Brighten the material based on transmission (simulating light passing through)
    finalColor = mix(finalColor, vec3(1.0), transmission * 0.3);

    // Apply fabric texture to color
    finalColor *= (0.9 + fabricTexture * 0.1);

    // Final alpha combines opacity, fresnel, and transmission
    float finalAlpha = mix(finalOpacity, 1.0 - transmission, fresnel);

    gl_FragColor = vec4(finalColor, finalAlpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export const Diffuser = forwardRef(
  (
    {
      id,
      position = [0, 0, 0],
      rotation = [0, 0, 0],
      scale = [2, 2, 1],
      diffuseColor = "#ffffff",
      opacity = 0.5,
      transmission = 0.9,
      thickness = 0.5,
      roughness = 0.8,
      useShader = true,
      enableSecondaryLight = true, // 보조 조명 활성화 (빛 확산 효과)
      secondaryLightIntensity = 5, // 보조 조명 강도
      linkedLightIds = [], // 연결된 조명 ID 배열
      blockOriginalLight = false, // 원본 조명 차단 여부
      ...props
    },
    ref
  ) => {
    const materialRef = useRef();
    const meshRef = useRef();

    // Store에서 조명 목록 가져오기
    const lights = useStore((state) => state.lights);

    // 연결된 조명들 필터링
    const linkedLights = useMemo(() => {
      return lights.filter((light) => linkedLightIds.includes(light.id));
    }, [lights, linkedLightIds]);

    // 확산 조명 생성 로직
    const diffusedLights = useMemo(() => {
      if (linkedLights.length === 0) return [];

      const result = [];

      linkedLights.forEach((light) => {
        // roughness에 따라 그리드 크기 결정
        // roughness 0.0-0.3 → 3x3 (9개)
        // roughness 0.3-0.6 → 5x5 (25개)
        // roughness 0.6-1.0 → 7x7 (49개)
        let gridSize = 3;
        if (roughness > 0.6) gridSize = 7;
        else if (roughness > 0.3) gridSize = 5;

        const gridHalf = Math.floor(gridSize / 2);
        const spacing = (roughness * scale[0]) / gridSize; // 간격

        // 각 조명의 강도 계산
        // transmission: 빛 통과 정도
        // thickness: 두께에 따른 감쇠
        const thicknessAttenuation = Math.max(0.1, 1 - thickness * 0.5);
        const totalLights = gridSize * gridSize;
        const intensityPerLight =
          (light.intensity * transmission * thicknessAttenuation) / totalLights;

        // 그리드 포인트 생성
        for (let x = -gridHalf; x <= gridHalf; x++) {
          for (let y = -gridHalf; y <= gridHalf; y++) {
            // 디퓨저의 local space에서 오프셋 계산
            const offsetX = x * spacing;
            const offsetY = y * spacing;
            // 디퓨저 뒤쪽에 배치 (z = -0.1 ~ -0.3)
            const offsetZ = -0.2 - Math.random() * 0.1;

            result.push({
              key: `${light.id}-diffused-${x}-${y}`,
              position: [offsetX, offsetY, offsetZ],
              color: light.color,
              intensity: intensityPerLight,
              distance: scale[0] * 3, // 조명 범위
              decay: 2,
            });
          }
        }
      });

      return result;
    }, [linkedLights, roughness, transmission, thickness, scale]);

    // Shader uniforms
    const uniforms = useRef({
      diffuseColor: { value: new THREE.Color(diffuseColor) },
      opacity: { value: opacity },
      transmission: { value: transmission },
      thickness: { value: thickness },
      roughness: { value: roughness },
      attenuationColor: { value: new THREE.Color("#ffffff") },
      attenuationDistance: { value: 0.5 },
    });

    // Update uniforms when props change
    useFrame(() => {
      if (materialRef.current && materialRef.current.uniforms) {
        materialRef.current.uniforms.diffuseColor.value.set(diffuseColor);
        materialRef.current.uniforms.opacity.value = opacity;
        materialRef.current.uniforms.transmission.value = transmission;
        materialRef.current.uniforms.thickness.value = thickness;
        materialRef.current.uniforms.roughness.value = roughness;
      }
    });

    return (
      <group ref={ref} position={position} rotation={rotation}>
        {/* 디퓨저 메쉬 */}
        <mesh ref={meshRef} scale={scale} {...props}>
          <planeGeometry args={[1, 1, 32, 32]} />
          {useShader ? (
            <shaderMaterial
              ref={materialRef}
              vertexShader={vertexShader}
              fragmentShader={fragmentShader}
              uniforms={uniforms.current}
              transparent={true}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          ) : (
            // Alternative: MeshPhysicalMaterial (simpler but effective)
            <meshPhysicalMaterial
              color={diffuseColor}
              transparent={true}
              opacity={opacity}
              transmission={transmission}
              thickness={thickness}
              roughness={roughness}
              metalness={0.0}
              clearcoat={0.0}
              side={THREE.DoubleSide}
              depthWrite={false}
              // Subsurface scattering parameters
              sheenColor="#ffffff"
              sheen={0.5}
              attenuationColor="#ffffff"
              attenuationDistance={0.5}
            />
          )}
        </mesh>

        {/* 연결된 조명 기반 확산 조명 - 디퓨저를 통과한 빛을 시뮬레이션 */}
        {diffusedLights.length > 0 ? (
          <>
            {diffusedLights.map((diffusedLight) => (
              <pointLight
                key={diffusedLight.key}
                position={diffusedLight.position}
                color={diffusedLight.color}
                intensity={diffusedLight.intensity}
                distance={diffusedLight.distance}
                decay={diffusedLight.decay}
              />
            ))}
          </>
        ) : (
          // 연결된 조명이 없을 때는 기존 보조 조명 사용 (후방 호환성)
          enableSecondaryLight && (
            <>
              {/* 앞쪽 조명 (디퓨저 뒤쪽에서 빛 방출) */}
              <pointLight
                position={[0, 0, -0.5]}
                color={diffuseColor}
                intensity={secondaryLightIntensity * transmission}
                distance={scale[0] * 3}
                decay={2}
              />
              {/* 뒤쪽 조명 (디퓨저 앞쪽에서도 약간 빛 방출) */}
              <pointLight
                position={[0, 0, 0.5]}
                color={diffuseColor}
                intensity={secondaryLightIntensity * transmission * 0.5}
                distance={scale[0] * 2}
                decay={2}
              />
            </>
          )
        )}
      </group>
    );
  }
);

Diffuser.displayName = "Diffuser";

export default Diffuser;
