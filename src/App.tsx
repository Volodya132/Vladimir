import * as THREE from "three"
import { Canvas, useFrame } from "@react-three/fiber"
import { Stars } from "@react-three/drei"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import { useRef } from "react"

function Sun() {
  const ref = useRef<any>()

  useFrame(() => {
    ref.current.rotation.y += 0.002
  })

  return (
    <group ref={ref}>
      {/* Core */}
      <mesh>
        <sphereGeometry args={[3, 64, 64]} />
        <meshStandardMaterial
          emissive="#ffb000"
          emissiveIntensity={6}
          color="#ffcc55"
        />
      </mesh>

      {/* Corona */}
      <mesh>
        <sphereGeometry args={[4.5, 64, 64]} />
        <meshBasicMaterial
          color="#ff8800"
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Aura */}
      <mesh>
        <sphereGeometry args={[6, 64, 64]} />
        <meshBasicMaterial
          color="#ff5500"
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

function Planet() {
  const ref = useRef<any>()

  useFrame(() => {
    ref.current.rotation.y += 0.004
  })

  return (
    <mesh ref={ref} position={[10, 0, 0]}>
      <sphereGeometry args={[1.5, 48, 48]} />
      <meshStandardMaterial color="#3fa9f5" />
    </mesh>
  )
}

export default function App() {
  return (
    <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
      <ambientLight intensity={0.3} />
      <pointLight intensity={5} position={[0, 0, 0]} />

      <Stars radius={100} depth={50} count={6000} factor={4} />

      <Sun />
      <Planet />

      <EffectComposer>
        <Bloom
          intensity={2}
          mipmapBlur
          luminanceThreshold={0}
          luminanceSmoothing={0.9}
        />
      </EffectComposer>
    </Canvas>
  )
}
