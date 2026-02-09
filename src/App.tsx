import * as THREE from "three"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import { useRef, useEffect } from "react"

function Galaxy() {
  const ref = useRef<any>()

  useFrame(() => (ref.current.rotation.y += 0.0003))

  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[40, 80, 128]} />
      <meshBasicMaterial
        color="#4455ff"
        transparent
        opacity={0.15}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

function Comets() {
  const group = useRef<any>()

  useFrame(() => {
    group.current.children.forEach((m: any) => {
      m.position.z += 0.5
      if (m.position.z > 40) m.position.z = -200
    })
  })

  return (
    <group ref={group}>
      {[...Array(15)].map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 40,
            (Math.random() - 0.5) * 20,
            -Math.random() * 200,
          ]}
        >
          <coneGeometry args={[0.2, 2, 8]} />
          <meshStandardMaterial emissive="white" />
        </mesh>
      ))}
    </group>
  )
}

function AmbientSound() {
  useEffect(() => {
    const audio = new Audio("/space.mp3")
    audio.loop = true
    audio.volume = 0.4
    audio.play()
  }, [])

  return null
}

function CameraDrift() {
  const { camera } = useThree()

  useFrame(({ clock }) => {
    camera.position.x = Math.sin(clock.elapsedTime * 0.2) * 5
    camera.position.z = 40 + Math.cos(clock.elapsedTime * 0.2) * 2
  })

  return null
}

function Sun() {
  return (
    <mesh>
      <sphereGeometry args={[3, 64, 64]} />
      <meshStandardMaterial emissive="orange" emissiveIntensity={3} />
    </mesh>
  )
}

export default function App() {
  return (
    <Canvas camera={{ position: [0, 15, 40], fov: 60 }}>
      <fog attach="fog" args={["#02030a", 40, 160]} />

      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 0]} intensity={4} />

      <Stars radius={500} depth={100} count={40000} factor={6} />

      <AmbientSound />
      <CameraDrift />

      <Sun />
      <Galaxy />
      <Comets />

      <OrbitControls />

    </Canvas>
  )
}
