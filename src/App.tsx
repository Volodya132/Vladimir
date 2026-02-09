import * as THREE from "three"
import { Canvas, useFrame } from "@react-three/fiber"
import { Stars } from "@react-three/drei"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import { useRef, useMemo } from "react"

/* ☀️ SUN */

function Sun() {
  const ref = useRef<any>()

  useFrame(() => {
    ref.current.rotation.y += 0.0015
  })

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[3, 64, 64]} />
        <meshStandardMaterial emissive="#ffaa00" emissiveIntensity={8} />
      </mesh>

      <mesh>
        <sphereGeometry args={[5, 64, 64]} />
        <meshBasicMaterial
          color="#ff6600"
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[7, 64, 64]} />
        <meshBasicMaterial
          color="#ff3300"
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

/* 🪐 SATURN */

function Saturn() {
  const ref = useRef<any>()

  useFrame(() => {
    ref.current.rotation.y += 0.004
  })

  return (
    <group ref={ref} position={[12, 0, 0]}>
      <mesh>
        <sphereGeometry args={[1.6, 48, 48]} />
        <meshStandardMaterial color="#d6c38a" />
      </mesh>

      {/* Rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.2, 3.2, 64]} />
        <meshBasicMaterial
          color="#c9b27c"
          side={THREE.DoubleSide}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  )
}

/* ☄️ ASTEROIDS */

function Asteroids() {
  const group = useRef<any>()

  const asteroids = useMemo(() => {
    return Array.from({ length: 400 }).map(() => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 30
      ),
      scale: Math.random() * 0.2 + 0.05
    }))
  }, [])

  useFrame(() => {
    group.current.rotation.y += 0.0007
  })

  return (
    <group ref={group}>
      {asteroids.map((a, i) => (
        <mesh key={i} position={a.pos} scale={a.scale}>
          <sphereGeometry args={[1, 6, 6]} />
          <meshStandardMaterial color="#777" />
        </mesh>
      ))}
    </group>
  )
}

/* 🌍 ORBIT PLANET */

function Planet() {
  const ref = useRef<any>()
  let angle = 0

  useFrame(() => {
    angle += 0.002
    ref.current.position.x = Math.cos(angle) * 8
    ref.current.position.z = Math.sin(angle) * 8
    ref.current.rotation.y += 0.01
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1.2, 48, 48]} />
      <meshStandardMaterial color="#3fa9f5" />
    </mesh>
  )
}

/* 🚀 MAIN */

export default function App() {
  return (
    <Canvas camera={{ position: [0, 6, 18], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight intensity={10} position={[0, 0, 0]} />

      <Stars radius={150} depth={60} count={9000} factor={4} />

      <Sun />
      <Planet />
      <Saturn />
      <Asteroids />

      <EffectComposer>
        <Bloom intensity={2.8} mipmapBlur />
      </EffectComposer>
    </Canvas>
  )
}
