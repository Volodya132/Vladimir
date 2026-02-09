import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useRef, useMemo } from "react"

/* ---------- PLANET ---------- */

function Planet({ size, dist, speed, color }: any) {
  const ref = useRef<any>()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed
    ref.current.position.set(Math.cos(t) * dist, 0, Math.sin(t) * dist)
    ref.current.rotation.y += 0.01
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 48, 48]} />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} />
    </mesh>
  )
}

/* ---------- SATURN WITH REAL RINGS ---------- */

function Saturn() {
  const group = useRef<any>()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.15
    group.current.position.set(Math.cos(t) * 32, 0, Math.sin(t) * 32)
    group.current.rotation.y += 0.002
  })

  return (
    <group ref={group}>
      {/* planet */}
      <mesh>
        <sphereGeometry args={[2, 48, 48]} />
        <meshStandardMaterial color="#ffbb55" />
      </mesh>

      {/* rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.8, 4.5, 128]} />
        <meshStandardMaterial
          color="#ccccaa"
          side={THREE.DoubleSide}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  )
}

/* ---------- ASTEROID BELT (REAL ROCKS) ---------- */

function Asteroids() {
  const mesh = useRef<any>()

  const positions = useMemo(() => {
    const arr = []
    for (let i = 0; i < 4000; i++) {
      const r = 35 + Math.random() * 40
      const a = Math.random() * Math.PI * 2
      arr.push(
        Math.cos(a) * r,
        (Math.random() - 0.5) * 4,
        Math.sin(a) * r
      )
    }
    return new Float32Array(arr)
  }, [])

  useFrame(() => {
    mesh.current.rotation.y += 0.0005
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>

      <pointsMaterial size={0.25} color="white" />
    </points>
  )
}

/* ---------- BLACK HOLE ---------- */

function BlackHole() {
  const ref = useRef<any>()

  useFrame(() => {
    ref.current.rotation.y += 0.01
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[3.5, 64, 64]} />
      <meshStandardMaterial
        color="black"
        emissive="#5500ff"
        emissiveIntensity={3}
      />
    </mesh>
  )
}

/* ---------- MAIN SCENE ---------- */

export default function Scene() {
  return (
    <>
      {/* SUN */}
      <mesh>
        <sphereGeometry args={[4, 64, 64]} />
        <meshStandardMaterial emissive="orange" emissiveIntensity={4} color="yellow" />
      </mesh>

      {/* PLANETS */}
      <Planet size={1} dist={8} speed={1} color="#4faaff" />
      <Planet size={1.2} dist={12} speed={0.8} color="#ff4444" />
      <Planet size={1.1} dist={16} speed={0.6} color="#33ff66" />
      <Planet size={1.4} dist={20} speed={0.45} color="#aa66ff" />
      <Planet size={1.6} dist={24} speed={0.35} color="#44ffee" />

      <Saturn />

      <Planet size={2} dist={40} speed={0.15} color="#ff77cc" />
      <Planet size={2.2} dist={48} speed={0.1} color="white" />

      {/* BLACK HOLE FAR AWAY */}
      <group position={[0, 0, -80]}>
        <BlackHole />
      </group>

      <Asteroids />
    </>
  )
}
