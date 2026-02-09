import * as THREE from "three"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import { useRef } from "react"

function CameraShake() {
  const { camera } = useThree()

  useFrame(({ clock }) => {
    camera.position.x += Math.sin(clock.elapsedTime) * 0.002
    camera.position.y += Math.cos(clock.elapsedTime) * 0.002
  })

  return null
}

function Sun() {
  const ref = useRef<any>()

  useFrame(() => (ref.current.rotation.y += 0.001))

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[3, 64, 64]} />
      <meshStandardMaterial emissive="orange" emissiveIntensity={3} />
    </mesh>
  )
}

function Planet({ size, distance, speed, color }: any) {
  const ref = useRef<any>()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed
    ref.current.position.x = Math.sin(t) * distance
    ref.current.position.z = Math.cos(t) * distance
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

function Saturn() {
  const ref = useRef<any>()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.3
    ref.current.position.x = Math.sin(t) * 22
    ref.current.position.z = Math.cos(t) * 22
    ref.current.rotation.y += 0.002
  })

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial color="gold" />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 2.5, 64]} />
        <meshStandardMaterial
          color="#c2b280"
          side={THREE.DoubleSide}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  )
}

function Asteroids() {
  const g = useRef<any>()

  useFrame(() => (g.current.rotation.y += 0.0004))

  return (
    <group ref={g}>
      {[...Array(300)].map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 80,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 80,
          ]}
        >
          <sphereGeometry args={[0.12, 6, 6]} />
          <meshStandardMaterial color="gray" />
        </mesh>
      ))}
    </group>
  )
}

export default function App() {
  return (
    <Canvas camera={{ position: [0, 18, 40], fov: 60 }}>
      <fog attach="fog" args={["#02030a", 30, 120]} />

      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 0]} intensity={4} />

      <Stars radius={400} depth={80} count={30000} factor={6} />

      <CameraShake />

      <Sun />

      <Planet size={0.5} distance={7} speed={1} color="#aaa" />
      <Planet size={0.7} distance={10} speed={0.8} color="#ff9933" />
      <Planet size={0.8} distance={14} speed={0.6} color="#3399ff" />
      <Planet size={0.6} distance={18} speed={0.5} color="#ff4444" />

      <Saturn />

      <Asteroids />

      <OrbitControls />
    </Canvas>
  )
}
