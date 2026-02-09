import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import * as THREE from "three"
import { useRef, useState, useEffect } from "react"

function Planet({ size, distance, speed, color }: any) {
  const ref = useRef<any>()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed
    ref.current.position.x = Math.sin(t) * distance
    ref.current.position.z = Math.cos(t) * distance
    ref.current.rotation.y += 0.003
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

function Sun() {
  return (
    <mesh>
      <sphereGeometry args={[3, 64, 64]} />
      <meshStandardMaterial emissive="orange" emissiveIntensity={3} />
    </mesh>
  )
}

function Asteroids() {
  return (
    <>
      {Array.from({ length: 300 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 80,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 80,
          ]}
        >
          <sphereGeometry args={[0.15, 6, 6]} />
          <meshStandardMaterial color="gray" />
        </mesh>
      ))}
    </>
  )
}

export default function App() {
  return (
    <Canvas camera={{ position: [0, 10, 25], fov: 60 }}>
      <color attach="background" args={["black"]} />

      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 0]} intensity={4} />

      <Stars radius={200} depth={60} count={8000} factor={4} />

      <Sun />

      <Planet size={0.4} distance={6} speed={1.6} color="#aaa" />
      <Planet size={0.7} distance={8} speed={1.3} color="orange" />
      <Planet size={0.8} distance={11} speed={1.1} color="blue" />
      <Planet size={0.6} distance={14} speed={0.9} color="red" />
      <Planet size={1.2} distance={18} speed={0.6} color="brown" />
      <Planet size={1} distance={22} speed={0.4} color="gold" />
      <Planet size={0.9} distance={26} speed={0.3} color="lightblue" />
      <Planet size={0.9} distance={30} speed={0.2} color="blue" />

      <Asteroids />

      <OrbitControls enablePan={false} minDistance={6} maxDistance={80} />

      <EffectComposer>
        <Bloom intensity={1.8} luminanceThreshold={0} />
      </EffectComposer>
    </Canvas>
  )
}
