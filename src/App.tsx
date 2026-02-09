import * as THREE from "three"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import { useRef } from "react"

function Sun() {
  const ref = useRef<any>()

  useFrame(() => {
    ref.current.rotation.y += 0.001
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[3, 64, 64]} />
      <meshStandardMaterial
        emissive="orange"
        emissiveIntensity={2}
        color="yellow"
      />
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
          opacity={0.7}
        />
      </mesh>
    </group>
  )
}

function Asteroids() {
  const group = useRef<any>()

  useFrame(() => {
    group.current.rotation.y += 0.0005
  })

  return (
    <group ref={group}>
      {[...Array(200)].map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 60,
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 60,
          ]}
        >
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color="gray" />
        </mesh>
      ))}
    </group>
  )
}

export default function App() {
  return (
    <Canvas camera={{ position: [0, 15, 35], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 0]} intensity={3} />

      <Stars radius={300} depth={60} count={20000} factor={7} />

      <Sun />

      <Planet size={0.5} distance={7} speed={1} color="gray" />
      <Planet size={0.7} distance={10} speed={0.8} color="orange" />
      <Planet size={0.8} distance={14} speed={0.6} color="blue" />
      <Planet size={0.6} distance={18} speed={0.5} color="red" />

      <Saturn />

      <Asteroids />

      <OrbitControls enableZoom />
    </Canvas>
  )
}
