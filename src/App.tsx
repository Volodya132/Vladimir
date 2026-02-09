import * as THREE from "three"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import { useRef } from "react"

function Sun() {
  const ref = useRef<any>()

  useFrame(() => {
    ref.current.rotation.y += 0.002
  })

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[3, 64, 64]} />
        <meshStandardMaterial
          emissive="#ff8800"
          emissiveIntensity={4}
          color="#ffaa33"
        />
      </mesh>

      {/* GLOW */}
      <mesh>
        <sphereGeometry args={[3.8, 64, 64]} />
        <meshBasicMaterial
          color="#ff9900"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

function Planet({ size, distance, speed }: any) {
  const ref = useRef<any>()
  const angle = useRef(Math.random() * Math.PI * 2)

  useFrame(() => {
    angle.current += speed
    ref.current.position.x = Math.cos(angle.current) * distance
    ref.current.position.z = Math.sin(angle.current) * distance
    ref.current.rotation.y += 0.01
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial color="#8888ff" />
    </mesh>
  )
}

function Saturn() {
  const ref = useRef<any>()
  const angle = useRef(0)

  useFrame(() => {
    angle.current += 0.003
    ref.current.position.x = Math.cos(angle.current) * 42
    ref.current.position.z = Math.sin(angle.current) * 42
  })

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[1.8, 32, 32]} />
        <meshStandardMaterial color="#d2c295" />
      </mesh>

      {/* rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.2, 3.2, 64]} />
        <meshBasicMaterial color="#c2b280" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function Asteroids() {
  return (
    <>
      {Array.from({ length: 300 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 120,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 120,
          ]}
        >
          <sphereGeometry args={[0.15, 6, 6]} />
          <meshStandardMaterial color="#555" />
        </mesh>
      ))}
    </>
  )
}

export default function App() {
  return (
    <Canvas camera={{ position: [0, 15, 60], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 0]} intensity={3} />

      <Stars radius={300} depth={60} count={8000} factor={7} />

      <Sun />

      {/* 7 планет */}
      <Planet size={0.6} distance={6} speed={0.02} />
      <Planet size={0.8} distance={9} speed={0.015} />
      <Planet size={1} distance={13} speed={0.01} />
      <Planet size={1.2} distance={17} speed={0.008} />
      <Planet size={1.5} distance={22} speed={0.006} />
      <Planet size={1.3} distance={27} speed={0.005} />
      <Planet size={2} distance={34} speed={0.004} />

      {/* САТУРН */}
      <Saturn />

      <Asteroids />

      <OrbitControls enableZoom enablePan zoomSpeed={0.6} />
    </Canvas>
  )
}
