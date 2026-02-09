import React, { useRef, Suspense, forwardRef, useMemo, useState, useEffect } from "react"
import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import { OrbitControls, Html } from "@react-three/drei"
import { EffectComposer, Bloom, GodRays, Vignette } from "@react-three/postprocessing"
import * as THREE from "three"

// --- 1. АТМОСФЕРНЫЙ ЗВУК ---
function BackgroundMusic() {
  const [playing, setPlaying] = useState(false)
  const audio = useMemo(() => {
    const a = new Audio("/ambient-space.mp3")
    a.loop = true
    return a
  }, [])

  const toggle = () => {
    if (playing) audio.pause()
    else audio.play().catch(() => alert("Добавьте ambient-space.mp3 в папку public"))
    setPlaying(!playing)
  }

  return (
    <div style={{ position: "absolute", bottom: 30, left: 30, zIndex: 10000 }}>
      <button 
        onClick={toggle} 
        style={{ 
          background: "rgba(0,210,255,0.1)", color: "#00d2ff", border: "2px solid #00d2ff", 
          padding: "15px 25px", borderRadius: "15px", cursor: "pointer", 
          backdropFilter: "blur(10px)", fontWeight: "bold", fontSize: "16px",
          boxShadow: "0 0 20px rgba(0,210,255,0.3)"
        }}>
        {playing ? "🔈 ВЫКЛЮЧИТЬ ЭМБИЕНТ" : "🔊 ВКЛЮЧИТЬ БЕСКОНЕЧНОСТЬ"}
      </button>
    </div>
  )
}

// --- 2. ГИГАНТСКАЯ СФЕРА ЗВЕЗД ---
function BackgroundStars() {
  const [positions] = useMemo(() => {
    const pos = new Float32Array(30000 * 3)
    for (let i = 0; i < 30000; i++) {
      const r = 4800 // Почти предел видимости
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
    }
    return [pos]
  }, [])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={3} color="#ffffff" transparent opacity={0.7} sizeAttenuation={false} />
    </points>
  )
}

// --- 3. ОРБИТЫ ---
function Orbit({ distance }: { distance: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[distance, distance + 0.8, 128]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.1} side={THREE.DoubleSide} />
    </mesh>
  )
}

// --- 4. ТРИ РЯДА АСТЕРОИДОВ ---
function AsteroidBelt({ count, innerRadius, width, isPaused, speed, color, sizeMod = 1 }: any) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const asteroids = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      const r = innerRadius + Math.random() * width
      const theta = Math.random() * Math.PI * 2
      temp.push({ r, theta, scale: (0.4 + Math.random() * 0.6) * sizeMod, offset: (Math.random() - 0.5) * 10 })
    }
    return temp
  }, [count, innerRadius, width, sizeMod])

  useFrame((state) => {
    if (!isPaused && meshRef.current) {
      const dummy = new THREE.Object3D()
      const t = state.clock.elapsedTime * speed
      asteroids.forEach((ast, i) => {
        const currentTheta = ast.theta + t
        dummy.position.set(Math.cos(currentTheta) * ast.r, ast.offset, Math.sin(currentTheta) * ast.r)
        dummy.rotation.set(t, t * 0.5, 0)
        dummy.scale.set(ast.scale, ast.scale, ast.scale)
        dummy.updateMatrix()
        meshRef.current.setMatrixAt(i, dummy.matrix)
      })
      meshRef.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </instancedMesh>
  )
}

// --- 5. СОЛНЦЕ (Интерактивное) ---
const SunMesh = forwardRef(({ onSunClick, facts, isPaused }: any, ref: any) => (
  <group>
    <mesh ref={ref} onClick={() => onSunClick({ name: "Солнце", fact: facts[Math.floor(Math.random() * facts.length)] })}>
      <sphereGeometry args={[12, 64, 64]} />
      <meshStandardMaterial emissive="#ffaa00" emissiveIntensity={15} color="#ff8800" toneMapped={false} />
    </mesh>
    <Html distanceFactor={80} position={[0, 40, 0]} center style={{ pointerEvents: isPaused ? 'none' : 'auto' }}>
      <div 
        onClick={() => onSunClick({ name: "Солнце", fact: facts[Math.floor(Math.random() * facts.length)] })}
        style={{ 
          color: '#fff', fontSize: '150px', fontWeight: '950', cursor: 'pointer',
          textShadow: '0 0 50px #ffaa00, 0 0 20px #000', letterSpacing: '20px', whiteSpace: 'nowrap'
        }}>СОЛНЦЕ</div>
    </Html>
  </group>
))

// --- 6. ПЛАНЕТА (С огромным хитбоксом) ---
function Planet({ name, size, distance, speed, textureUrl, facts, isPaused, onPlanetClick, children }: any) {
  const ref = useRef<any>()
  const texture = useLoader(THREE.TextureLoader, textureUrl)
  const tRef = useRef(Math.random() * 100)

  useFrame((state, delta) => {
    if (!isPaused && ref.current) {
      tRef.current += delta * speed
      ref.current.position.x = Math.sin(tRef.current) * distance
      ref.current.position.z = Math.cos(tRef.current) * distance
      ref.current.rotation.y += 0.015
    }
  })

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[size, 64, 64]} />
        <meshStandardMaterial map={texture} roughness={0.8} />
      </mesh>
      
      {/* ОГРОМНЫЙ ХИТБОКС */}
      <mesh 
        onClick={(e) => { e.stopPropagation(); if(!isPaused) onPlanetClick({ name, fact: facts[Math.floor(Math.random() * facts.length)] }); }}
        onPointerOver={() => !isPaused && (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <sphereGeometry args={[size * 10, 16, 16]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      
      <Html distanceFactor={90} position={[0, size + 20, 0]} center style={{ pointerEvents: 'none', opacity: isPaused ? 0.1 : 1 }}>
        <div style={{ 
          color: '#fff', fontSize: '105px', fontWeight: '950', 
          textShadow: '0 0 30px #000, 0 0 20px #00d2ff', 
          textTransform: 'uppercase', whiteSpace: 'nowrap', letterSpacing: '5px'
        }}>{name}</div>
      </Html>
      {children}
    </group>
  )
}

// --- 7. ГЛАВНЫЙ КОМПОНЕНТ СЦЕНЫ ---
export default function SolarSystem() {
  const [sun, setSun] = useState<THREE.Mesh | null>(null)
  const [activeFact, setActiveFact] = useState<any>(null)

  const facts = {
    sun: ["Солнце — это 99.8% массы всей системы.", "Свет идет до Земли 8 минут 20 секунд.", "Внутри него поместится 1.3 миллиона Земель."],
    mercury: ["На Меркурии есть лед в кратерах вечной тени.", "Ядро занимает 75% объема планеты."],
    venus: ["Солнце тут встает на западе.", "Давление как на глубине 900м в океане."],
    earth: ["Земля — единственная планета, не названная в честь бога.", "Каждый день на нас падает 100 тонн космической пыли."],
    mars: ["Закаты на Марсе синего цвета.", "Тут находится высочайшая гора системы — Олимп (26 км)."],
    jupiter: ["Юпитер настолько велик, что все остальные планеты могли бы поместиться внутри него дважды.", "Тут идут алмазные дожди."],
    saturn: ["Кольца Сатурна состоят из чистейшего льда.", "Плотность Сатурна меньше, чем у воды — он бы плавал в океане."],
    uranus: ["Уран вращается лежа на боку.", "Самая холодная планета системы (-224°C)."],
    neptune: ["На Нептуне самые быстрые ветры — до 2100 км/ч.", "Год здесь длится 165 земных лет."]
  }

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000", position: "relative", overflow: "hidden" }}>
      
      <BackgroundMusic />

      <Canvas camera={{ position: [0, 1000, 2500], fov: 45, far: 12000 }}>
        <Suspense fallback={null}>
          <color attach="background" args={["#000"]} />
          <fog attach="fog" args={["#000", 3000, 9000]} />
          
          <BackgroundStars />
          <ambientLight intensity={1.5} />
          <pointLight position={[0, 0, 0]} intensity={300} color="#ffffff" />
          
          <SunMesh ref={setSun} onSunClick={setActiveFact} facts={facts.sun} isPaused={!!activeFact} />

          {/* Орбиты */}
          {[60, 110, 170, 250, 400, 550, 680, 800].map(d => <Orbit key={d} distance={d} />)}

          {/* Три ряда астероидов */}
          <AsteroidBelt count={1000} innerRadius={80} width={20} isPaused={!!activeFact} speed={0.015} color="#8a7e72" /> 
          <AsteroidBelt count={2000} innerRadius={210} width={35} isPaused={!!activeFact} speed={0.01} color="#555555" /> 
          <AsteroidBelt count={1500} innerRadius={480} width={60} isPaused={!!activeFact} speed={0.005} color="#3366ff" sizeMod={2.5} />

          <Planet name="Меркурий" size={3} distance={60} speed={0.5} textureUrl="/textures/mercury.jpg" facts={facts.mercury} isPaused={!!activeFact} onPlanetClick={setActiveFact} />
          <Planet name="Венера" size={4} distance={110} speed={0.35} textureUrl="/textures/venus.jpg" facts={facts.venus} isPaused={!!activeFact} onPlanetClick={setActiveFact} />
          <Planet name="Земля" size={4.2} distance={170} speed={0.25} textureUrl="/textures/earth.jpg" facts={facts.earth} isPaused={!!activeFact} onPlanetClick={setActiveFact} />
          <Planet name="Марс" size={3.5} distance={250} speed={0.2} textureUrl="/textures/mars.jpg" facts={facts.mars} isPaused={!!activeFact} onPlanetClick={setActiveFact} />
          <Planet name="Юпитер" size={14} distance={400} speed={0.12} textureUrl="/textures/jupiter.jpg" facts={facts.jupiter} isPaused={!!activeFact} onPlanetClick={setActiveFact} />
          
          <Planet name="Сатурн" size={12} distance={550} speed={0.08} textureUrl="/textures/saturn.jpg" facts={facts.saturn} isPaused={!!activeFact} onPlanetClick={setActiveFact}>
             <mesh rotation={[Math.PI / 2.1, 0, 0]}>
                <ringGeometry args={[14, 28, 64]} />
                <meshBasicMaterial color="#d4cda5" transparent opacity={0.7} side={THREE.DoubleSide} />
             </mesh>
          </Planet>

          <Planet name="Уран" size={8} distance={680} speed={0.05} textureUrl="/textures/uranus.jpg" facts={facts.uranus} isPaused={!!activeFact} onPlanetClick={setActiveFact} />
          <Planet name="Нептун" size={7.8} distance={800} speed={0.03} textureUrl="/textures/neptune.jpg" facts={facts.neptune} isPaused={!!activeFact} onPlanetClick={setActiveFact} />

          <EffectComposer>
            <Bloom luminanceThreshold={1} intensity={1.5} mipmapBlur />
            {sun && <GodRays sun={sun} samples={50} density={0.97} weight={0.5} />}
            <Vignette darkness={0.85} />
          </EffectComposer>

          <OrbitControls makeDefault maxDistance={9000} minDistance={500} enablePan={false} />
        </Suspense>
      </Canvas>

      {/* Окно факта */}
      {activeFact && (
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 99999, background: "rgba(0,0,0,0.9)", backdropFilter: "blur(25px)" }} onClick={() => setActiveFact(null)}>
          <div style={{ background: "linear-gradient(145deg, #001a33, #000a1a)", color: "#00d2ff", padding: "60px", borderRadius: "50px", border: "4px solid #00d2ff", width: "600px", textAlign: "center", boxShadow: "0 0 100px rgba(0,210,255,0.5)" }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: "54px", marginBottom: "30px", textTransform: 'uppercase', letterSpacing: '4px' }}>{activeFact.name}</h2>
            <p style={{ fontSize: "28px", color: "#fff", lineHeight: "1.5", fontWeight: '300' }}>{activeFact.fact}</p>
            <button onClick={() => setActiveFact(null)} style={{ marginTop: "50px", padding: "20px 70px", background: "#00d2ff", color: "#000", border: "none", borderRadius: "20px", cursor: "pointer", fontWeight: "900", fontSize: "22px" }}>ВЕРНУТЬСЯ В КОСМОС</button>
          </div>
        </div>
      )}
    </div>
  )
}