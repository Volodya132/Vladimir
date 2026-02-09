import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import { useRef, useMemo } from "react"
import * as THREE from "three"

function Planet({ size, distance, speed, color }: any) {
  const ref = useRef<any>()
  useFrame(({ clock }) => {
    ref.current.position.x = Math.sin(clock.elapsedTime * speed) * distance
    ref.current.position.z = Math.cos(clock.elapsedTime * speed) * distance
    ref.current.rotation.y += 0.01
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
      <meshStandardMaterial emissive="orange" emissiveIntensity={2} />
    </mesh>
  )
}

function SaturnRings() {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[4.2, 5.5, 64]} />
      <meshBasicMaterial color="#c2b280" side={THREE.DoubleSide} />
    </mesh>
  )
}

function Asteroids() {
  const points = useMemo(() => {
    const arr = []
    for (let i = 0; i < 2000; i++) {
      arr.push(
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 200
      )
    }
    return new Float32Array(arr)
  }, [])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={points} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.2} color="white" />
    </points>
  )
}

export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 10, 25], fov: 60 }}>
      <fog attach="fog" args={["#000", 30, 150]} />

      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 0]} intensity={4} />

      <Stars radius={300} depth={60} count={8000} factor={7} />

      <OrbitControls enableZoom enableRotate maxDistance={200} minDistance={5} />

      <Sun />

      <Planet size={0.5} distance={6} speed={1} color="gray" />
      <Planet size={0.9} distance={9} speed={0.7} color="orange" />
      <Planet size={1} distance={12} speed={0.5} color="blue" />
      <Planet size={0.8} distance={15} speed={0.4} color="red" />
      <Planet size={2} distance={20} speed={0.25} color="orange" />
      <Planet size={1.7} distance={26} speed={0.18} color="#c2b280" />
      <Planet size={1.4} distance={32} speed={0.13} color="lightblue" />
      <Planet size={1.3} distance={38} speed={0.1} color="blue" />

      <group position={[0,0,0]}>
        <mesh position={[26,0,0]}>
          <sphereGeometry args={[1.7,32,32]} />
          <meshStandardMaterial color="#c2b280" />
          <SaturnRings/>
        </mesh>
      </group>

      <Asteroids />
    </Canvas>
  )
}
