import React, { useRef, Suspense, useMemo, useState, useEffect } from "react"
import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import { OrbitControls, Html, Trail, Stars, Line } from "@react-three/drei"
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing"
import * as THREE from "three"

// --- 1. ПРОВЕРКА МОБИЛКИ ---
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// --- 2. МУЗЫКА (Кнопка выше для мобилок) ---
function BackgroundMusic() {
  const [playing, setPlaying] = useState(false)
  const audio = useMemo(() => {
    const a = new Audio("/ambient-space.mp3")
    a.loop = true
    return a
  }, [])

  const toggle = () => {
    if (playing) audio.pause()
    else audio.play().catch(() => {})
    setPlaying(!playing)
  }

  return (
    <div style={{ position: "absolute", bottom: isMobile ? "20px" : "120px", left: "20px", zIndex: 10000 }}>
      <button onClick={toggle} style={{ 
        background: "rgba(0,210,255,0.2)", color: "#00d2ff", border: "1px solid #00d2ff", 
        padding: "10px 15px", borderRadius: "10px", cursor: "pointer", fontSize: "12px"
      }}>
        {playing ? "🔈 ВЫКЛ" : "🔊 ЗВУК"}
      </button>
    </div>
  )
}

// --- 3. ОРБИТЫ (Меньше точек для FPS) ---
function Orbit({ distance }: { distance: number }) {
  const points = useMemo(() => {
    const pts = []
    const segments = isMobile ? 64 : 128
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.sin(angle) * distance, 0, Math.cos(angle) * distance))
    }
    return pts
  }, [distance])
  return <Line points={points} color="#00d2ff" lineWidth={0.5} transparent opacity={0.15} />
}

// --- 4. ПЛАНЕТА (Оптимизированная полигональность) ---
function Planet({ name, size, distance, speed, textureUrl, facts, isPaused, onPlanetClick, glowColor, children }: any) {
  const groupRef = useRef<THREE.Group>(null!)
  const meshRef = useRef<THREE.Mesh>(null!)
  const texture = useLoader(THREE.TextureLoader, textureUrl)
  const tRef = useRef(Math.random() * 100)

  useFrame((state, delta) => {
    if (!isPaused) {
      tRef.current += delta * speed
      groupRef.current.position.set(Math.sin(tRef.current) * distance, 0, Math.cos(tRef.current) * distance)
      meshRef.current.rotation.y += 0.01
    }
  })

  return (
    <group ref={groupRef}>
      {/* Атмосфера (Упрощенная для FPS) */}
      <mesh>
        <sphereGeometry args={[size * 1.1, 16, 16]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.2} side={THREE.BackSide} />
      </mesh>

      {/* Трейл (Короче для FPS) */}
      <Trail width={size * 2} length={isMobile ? 20 : 50} color={new THREE.Color(glowColor)} attenuation={(t) => t * t}>
        <mesh ref={meshRef}>
          <sphereGeometry args={[size, isMobile ? 32 : 64, isMobile ? 32 : 64]} />
          <meshStandardMaterial map={texture} />
        </mesh>
      </Trail>

      {/* ХИТБОКС (x15 для удобства) */}
      <mesh onClick={() => onPlanetClick(name, facts)}>
        <sphereGeometry args={[size * 15, 8, 8]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {!isPaused && (
        <Html distanceFactor={isMobile ? 150 : 120} position={[0, size + (isMobile ? 30 : 60), 0]} center>
          <div style={{ 
            color: '#fff', 
            fontSize: isMobile ? '120px' : '420px', 
            fontWeight: '900', 
            textShadow: `0 0 40px ${glowColor}, 0 0 20px #000`, 
            textTransform: 'uppercase', 
            whiteSpace: 'nowrap' 
          }}>{name}</div>
        </Html>
      )}
      {children}
    </group>
  )
}

// --- 5. ОСНОВНОЙ КОМПОНЕНТ ---
export default function SolarSystem() {
  const [activeFact, setActiveFact] = useState<any>(null)

  const factsData: any = {
    "Солнце": ["Каждую секунду Солнце сжигает 600 млн тонн водорода. Этой энергии хватило бы нам на миллионы лет.", "Свет идет до Земли 8 минут. Если оно исчезнет, мы узнаем об этом не сразу.", "Корона Солнца в сотни раз горячее его поверхности. Это главная загадка астрофизики."],
    "Меркурий": ["Меркурий сжимается. Его ядро остывает, из-за чего планета покрывается морщинами.", "Там есть лед. В кратерах на полюсах, куда никогда не заглядывает Солнце.", "У него есть хвост, как у кометы, длиной в миллионы километров."],
    "Венера": ["Там идет металлический снег из галенита и висмутина.", "Давление такое, будто вы находитесь на глубине 1 км под водой.", "День на Венере длиннее, чем год."],
    "Земля": ["Земля — это огромный магнит. Внутри вращается океан жидкого железа.", "Ежедневно на нас падает 100 тонн космической пыли.", "Мы живем внутри разреженной атмосферы Солнца."],
    "Марс": ["У Марса появятся кольца, когда он разорвет свой спутник Фобос.", "Закаты на Марсе синего цвета.", "Там находится вулкан Олимп высотой 26 км."],
    "Юпитер": ["Юпитер — защитник Земли, его гравитация 'ловит' астероиды.", "Там идут дожди из алмазов.", "Магнитное поле Юпитера в 20 000 раз сильнее нашего."],
    "Сатурн": ["Сатурн мог бы плавать в воде, он очень легкий.", "Его кольца исчезнут через 100 млн лет.", "На полюсе бушует шестиугольный шторм."],
    "Уран": ["Он вращается 'на боку' после древнего столкновения.", "Пахнет тухлыми яйцами из-за сероводорода.", "Там бывают алмазные ливни."],
    "Нептун": ["Ветры на Нептуне в 2 раза быстрее звука.", "Он выделяет больше тепла, чем получает от Солнца.", "Год там длится 165 земных лет."]
  }

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000", position: "relative", overflow: "hidden" }}>
      <BackgroundMusic />
      
      <Canvas 
        dpr={isMobile ? [1, 1] : [1, 2]} // Ограничение разрешения для мобилок
        camera={{ position: [0, 3000, 6000], fov: 45, far: 20000 }}
      >
        <Suspense fallback={null}>
          <Stars radius={5000} depth={50} count={isMobile ? 3000 : 10000} factor={4} fade />
          <ambientLight intensity={0.7} />
          <pointLight position={[0, 0, 0]} intensity={2000} color="#ffaa00" />
          
          <group onClick={() => setActiveFact({name: "Солнце", list: factsData["Солнце"], index: 0})}>
            <mesh>
              <sphereGeometry args={[50, 32, 32]} />
              <meshStandardMaterial emissive="#ffaa00" emissiveIntensity={10} color="#ff8800" />
            </mesh>
            <Html distanceFactor={100} position={[0, 140, 0]} center>
              <div style={{ color: '#fff', fontSize: isMobile ? '150px' : '600px', fontWeight: '950', textShadow: '0 0 50px #ffaa00', whiteSpace: 'nowrap' }}>СОЛНЦЕ</div>
            </Html>
          </group>

          {[700, 1000, 1400, 1800, 2500, 3400, 4200, 5000].map(d => <Orbit key={d} distance={d} />)}

          <Planet name="Меркурий" size={12} distance={700} speed={0.5} textureUrl="/textures/mercury.jpg" glowColor="#aaa" facts={factsData["Меркурий"]} isPaused={!!activeFact} onPlanetClick={(n:any, f:any) => setActiveFact({name: n, list: f, index: 0})} />
          <Planet name="Венера" size={18} distance={1000} speed={0.35} textureUrl="/textures/venus.jpg" glowColor="#ffcc88" facts={factsData["Венера"]} isPaused={!!activeFact} onPlanetClick={(n:any, f:any) => setActiveFact({name: n, list: f, index: 0})} />
          <Planet name="Земля" size={20} distance={1400} speed={0.25} textureUrl="/textures/earth.jpg" glowColor="#2277ff" facts={factsData["Земля"]} isPaused={!!activeFact} onPlanetClick={(n:any, f:any) => setActiveFact({name: n, list: f, index: 0})} />
          <Planet name="Марс" size={16} distance={1800} speed={0.2} textureUrl="/textures/mars.jpg" glowColor="#ff4400" facts={factsData["Марс"]} isPaused={!!activeFact} onPlanetClick={(n:any, f:any) => setActiveFact({name: n, list: f, index: 0})} />
          <Planet name="Юпитер" size={50} distance={2500} speed={0.12} textureUrl="/textures/jupiter.jpg" glowColor="#d39c7e" facts={factsData["Юпитер"]} isPaused={!!activeFact} onPlanetClick={(n:any, f:any) => setActiveFact({name: n, list: f, index: 0})} />
          <Planet name="Сатурн" size={45} distance={3400} speed={0.08} textureUrl="/textures/saturn.jpg" glowColor="#e2c17d" facts={factsData["Сатурн"]} isPaused={!!activeFact} onPlanetClick={(n:any, f:any) => setActiveFact({name: n, list: f, index: 0})} />
          <Planet name="Уран" size={30} distance={4200} speed={0.05} textureUrl="/textures/uranus.jpg" glowColor="#b2efff" facts={factsData["Уран"]} isPaused={!!activeFact} onPlanetClick={(n:any, f:any) => setActiveFact({name: n, list: f, index: 0})} />
          <Planet name="Нептун" size={30} distance={5000} speed={0.03} textureUrl="/textures/neptune.jpg" glowColor="#3f5efb" facts={factsData["Нептун"]} isPaused={!!activeFact} onPlanetClick={(n:any, f:any) => setActiveFact({name: n, list: f, index: 0})} />

          <EffectComposer>
            <Bloom luminanceThreshold={1} intensity={isMobile ? 0.5 : 1.5} />
            <Vignette darkness={0.8} />
          </EffectComposer>

          <OrbitControls makeDefault maxDistance={15000} minDistance={500} enablePan={false} />
        </Suspense>
      </Canvas>

      {/* МОДАЛКА (С ФИКСОМ ДЛЯ ТЕЛЕФОНОВ) */}
      {activeFact && (
        <div style={{ 
          position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", 
          zIndex: 100000, background: "rgba(0,0,0,0.9)", backdropFilter: "blur(10px)", padding: "20px"
        }} onClick={() => setActiveFact(null)}>
          <div style={{ 
            background: "#050505", color: "#00d2ff", padding: isMobile ? "20px" : "40px", 
            borderRadius: "20px", border: "2px solid #00d2ff", width: "100%", maxWidth: "600px", 
            maxHeight: "90vh", // Ограничение высоты
            display: "flex", flexDirection: "column", overflowY: "auto" // Прокрутка
          }} onClick={e => e.stopPropagation()}>
            
            <h2 style={{ fontSize: isMobile ? "24px" : "40px", textAlign: "center", margin: "0 0 20px 0" }}>{activeFact.name}</h2>
            
            <div style={{ flex: 1, overflowY: "auto", marginBottom: "20px", paddingRight: "10px" }}>
              <p style={{ fontSize: isMobile ? "18px" : "24px", color: "#fff", lineHeight: "1.5" }}>
                {activeFact.list[activeFact.index]}
              </p>
            </div>

            <button onClick={() => setActiveFact({...activeFact, index: (activeFact.index + 1) % activeFact.list.length})} 
              style={{ padding: "15px", background: "#00d2ff", color: "#000", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", marginBottom: "10px" }}>
              СЛЕДУЮЩИЙ ФАКТ
            </button>
            <button onClick={() => setActiveFact(null)} 
              style={{ padding: "10px", background: "transparent", color: "#666", border: "none", cursor: "pointer" }}>
              ЗАКРЫТЬ
            </button>
          </div>
        </div>
      )}
    </div>
  )
}