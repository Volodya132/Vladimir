import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import { OrbitControls, Stars, Sparkles, Html } from "@react-three/drei"
import { EffectComposer, Bloom, GodRays } from "@react-three/postprocessing"
import { useRef, Suspense, forwardRef, useMemo } from "react"
import * as THREE from "three"

// Пояс астероидов
function AsteroidBelt({ count = 2000 }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 28 + Math.random() * 4 // Радиус между Марсом и Юпитером
      const theta = Math.random() * Math.PI * 2
      p[i * 3] = Math.cos(theta) * r + (Math.random() - 0.5) * 2
      p[i * 3 + 1] = (Math.random() - 0.5) * 1.5
      p[i * 3 + 2] = Math.sin(theta) * r + (Math.random() - 0.5) * 2
    }
    return p
  }, [count])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={points.length / 3} array={points} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#888888" transparent opacity={0.6} />
    </points>
  )
}

const SunMesh = forwardRef((props, ref: any) => (
  <mesh ref={ref} position={[0, 0, 0]}>
    <sphereGeometry args={[3, 64, 64]} />
    <meshStandardMaterial emissive="#ffcc00" emissiveIntensity={1.2} color="#ff8800" />
    <Html distanceFactor={15} position={[0, 4, 0]}>
      <div style={{ color: 'orange', pointerEvents: 'none', fontWeight: 'bold' }}>СОЛНЦЕ</div>
    </Html>
  </mesh>
))

function Planet({ name, size, distance, speed, textureUrl, children }: any) {
  const ref = useRef<any>()
  const texture = useLoader(THREE.TextureLoader, textureUrl)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed
    ref.current.position.x = Math.sin(t) * distance
    ref.current.position.z = Math.cos(t) * distance
    ref.current.rotation.y += 0.01
  })

  return (
    <group ref={ref}>
      <mesh shadow={true}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial map={texture} />
      </mesh>
      <Html distanceFactor={20} position={[0, size + 0.5, 0]} center>
        <div style={{ color: 'white', whiteSpace: 'nowrap', fontSize: '10px', pointerEvents: 'none', textTransform: 'uppercase' }}>
          {name}
        </div>
      </Html>
      {children}
    </group>
  )
}

// ... остальной код (Moon, SaturnRings) такой же, как раньше ...
function Moon() {
  const moonRef = useRef<any>()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 2
    moonRef.current.position.x = Math.sin(t) * 2.2
    moonRef.current.position.z = Math.cos(t) * 2.2
  })
  return (
    <mesh ref={moonRef}>
      <sphereGeometry args={[0.2, 32, 32]} />
      <meshStandardMaterial color="#aaaaaa" />
    </mesh>
  )
}

function SaturnRings() {
  return (
    <mesh rotation={[Math.PI / 2.5, 0, 0]}>
      <ringGeometry args={[2.2, 3.8, 64]} />
      <meshBasicMaterial color="#c2b280" side={THREE.DoubleSide} transparent opacity={0.4} />
    </mesh>
  )
}

export default function SpaceScene() {
  const sunRef = useRef<any>()

  return (
    <Canvas camera={{ position: [0, 50, 100], fov: 50 }}>
      <color attach="background" args={["black"]} />
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 0, 0]} intensity={25} distance={200} />
        <Stars radius={300} depth={60} count={12000} factor={7} fade />
        
        <SunMesh ref={sunRef} />
        <AsteroidBelt count={3000} />

        <Planet name="Меркурий" size={0.4} distance={8}  speed={0.5}  textureUrl="/textures/mercury.jpg" />
        <Planet name="Венера"   size={0.7} distance={13} speed={0.4}  textureUrl="/textures/venus.jpg" />
        <Planet name="Земля"    size={0.8} distance={18} speed={0.3}  textureUrl="/textures/earth.jpg">
           <Moon />
        </Planet>
        <Planet name="Марс"     size={0.5} distance={24} speed={0.25} textureUrl="/textures/mars.jpg" />
        <Planet name="Юпитер"   size={2.2} distance={38} speed={0.15} textureUrl="/textures/jupiter.jpg" />
        <Planet name="Сатурн"   size={1.8} distance={52} speed={0.1}  textureUrl="/textures/saturn.jpg">
           <SaturnRings />
        </Planet>
        <Planet name="Уран"     size={1.2} distance={65} speed={0.07} textureUrl="/textures/uranus.jpg" />
        <Planet name="Нептун"   size={1.1} distance={75} speed={0.05} textureUrl="/textures/neptune.jpg" />

        <EffectComposer multisampling={0}>
          <Bloom intensity={0.5} luminanceThreshold={0.2} mipmapBlur />
          {sunRef.current && (
            <GodRays sun={sunRef.current} samples={30} density={0.97} weight={0.3} exposure={0.2} blur />
          )}
        </EffectComposer>

        <OrbitControls makeDefault maxDistance={300} minDistance={10} />
      </Suspense>
    </Canvas>
  )
}