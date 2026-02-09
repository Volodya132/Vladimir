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
        <meshStandardMaterial emissive="#ff9900" emissiveIntensity={3} />
      </mesh>

      {/* glow */}
      <mesh>
        <sphereGeometry args={[4.2, 64, 64]} />
        <meshBasicMaterial
          color="#ff8800"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

function Planet({ size, distance, speed }: any) {
  const ref = useRef<any>()
  const a = useRef(Math.random() * Math.PI * 2)

  useFrame(() => {
    a.current += speed
    ref.current.position.set(
      Math.cos(a.current) * distance,
      0,
      Math.sin(a.current) * distance
    )
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial color="#7aa2ff" />
    </mesh>
  )
}

function Saturn() {
  const ref = useRef<any>()
  const a = useRef(0)

  useFrame(() => {
    a.current += 0.004
    ref.current.position.set(Math.cos(a.current) * 40, 0, Math.sin(a.current) * 40)
  })

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial color="#d6c28b" />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.5, 3.5, 64]} />
        <meshBasicMaterial side={THREE.DoubleSide} color="#c2b280" />
      </mesh>
    </group>
  )
}

function Asteroids() {
  return (
    <group>
      {Array.from({ length: 400 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 80,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 80,
          ]}
        >
          <sphereGeometry args={[0.2, 6, 6]} />
          <meshStandardMaterial color="#555" />
        </mesh>
      ))}
    </group>
  )
}

export default function App() {
  return (
    <Canvas camera={{ position: [0, 12, 45], fov: 60 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} intensity={4} />

      <Stars radius={200} depth={60} count={6000} factor={5} />

      <Sun />

      <Planet size={0.6} distance={7} speed={0.02} />
      <Planet size={0.9} distance={11} speed={0.015} />
      <Planet size={1.1} distance={15} speed={0.01} />
      <Planet size={1.4} distance={20} speed={0.008} />
      <Planet size={1.6} distance={25} speed={0.006} />
      <Planet size={1.3} distance={30} speed={0.005} />
      <Planet size={2} distance={35} speed={0.004} />

      <Saturn />
      <Asteroids />

      <OrbitControls enableZoom zoomSpeed={0.7} />
    </Canvas>
  )
}
