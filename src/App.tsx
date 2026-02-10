import React, { useRef, Suspense, forwardRef, useMemo, useState } from "react"
import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import { OrbitControls, Html, Trail, Stars, Line } from "@react-three/drei"
import { EffectComposer, Bloom, GodRays, Vignette } from "@react-three/postprocessing"
import * as THREE from "three"

// --- 1. АТМОСФЕРНЫЙ ЗВУК (Кнопка выше) ---
function BackgroundMusic() {
  const [playing, setPlaying] = useState(false)
  const audio = useMemo(() => {
    const a = new Audio("/ambient-space.mp3")
    a.loop = true
    return a
  }, [])

  const toggle = () => {
    if (playing) audio.pause()
    else audio.play().catch(() => console.log("Файл не найден"))
    setPlaying(!playing)
  }

  return (
    <div style={{ position: "absolute", bottom: "120px", left: "50%", transform: "translateX(-50%)", zIndex: 10000 }}>
      <button onClick={toggle} style={{ 
        background: "rgba(0,210,255,0.1)", color: "#00d2ff", border: "2px solid #00d2ff", 
        padding: "15px 30px", borderRadius: "15px", cursor: "pointer", 
        backdropFilter: "blur(10px)", fontWeight: "900", textTransform: "uppercase",
        boxShadow: "0 0 20px rgba(0,210,255,0.4)"
      }}>
        {playing ? "🔈 ОСТАНОВИТЬ ЭФИР" : "🔊 ЗАПУСТИТЬ ЭМБИЕНТ"}
      </button>
    </div>
  )
}

// --- 2. ЛИНИИ ОРБИТ ---
function Orbit({ distance }: { distance: number }) {
  const points = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.sin(angle) * distance, 0, Math.cos(angle) * distance))
    }
    return pts
  }, [distance])
  return <Line points={points} color="#00d2ff" lineWidth={0.5} transparent opacity={0.2} />
}

// --- 3. КОЛЬЦА САТУРНА ---
function SaturnRings({ size }: { size: number }) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame((state) => (ref.current.rotation.z = state.clock.elapsedTime * 0.1))
  return (
    <mesh ref={ref} rotation={[Math.PI / 2.5, 0, 0]}>
      <ringGeometry args={[size * 1.5, size * 2.5, 64]} />
      <meshStandardMaterial color="#c5ab6e" side={THREE.DoubleSide} transparent opacity={0.7} emissive="#c5ab6e" emissiveIntensity={1.5} />
    </mesh>
  )
}

// --- 4. ПЛАНЕТА (С полным визуалом) ---
function Planet({ name, size, distance, speed, textureUrl, facts, isPaused, onPlanetClick, glowColor, children }: any) {
  const groupRef = useRef<THREE.Group>(null!)
  const meshRef = useRef<THREE.Mesh>(null!)
  const glowRef = useRef<THREE.Mesh>(null!)
  const texture = useLoader(THREE.TextureLoader, textureUrl)
  const tRef = useRef(Math.random() * 100)

  useFrame((state, delta) => {
    if (!isPaused) {
      tRef.current += delta * speed
      groupRef.current.position.set(Math.sin(tRef.current) * distance, 0, Math.cos(tRef.current) * distance)
      meshRef.current.rotation.y += 0.01
      if (glowRef.current) {
        const s = 1.35 + Math.sin(state.clock.elapsedTime * 2) * 0.1
        glowRef.current.scale.set(s, s, s)
      }
    }
  })

  return (
    <group ref={groupRef}>
      <mesh ref={glowRef}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.35} side={THREE.BackSide} />
      </mesh>

      <Trail width={size * 3} length={80} color={new THREE.Color(glowColor)} attenuation={(t) => t * t}>
        <mesh ref={meshRef}>
          <sphereGeometry args={[size, 64, 64]} />
          <meshStandardMaterial map={texture} roughness={1} />
        </mesh>
      </Trail>

      <mesh onClick={() => onPlanetClick(name, facts)} onPointerOver={() => (document.body.style.cursor='pointer')} onPointerOut={() => (document.body.style.cursor='default')}>
        <sphereGeometry args={[size * 15, 16, 16]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {!isPaused && (
        <Html distanceFactor={120} position={[0, size + 60, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{ color: '#fff', fontSize: '420px', fontWeight: '900', textShadow: `0 0 60px ${glowColor}, 0 0 30px #000`, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{name}</div>
        </Html>
      )}
      {children}
    </group>
  )
}

// --- 5. ГЛАВНАЯ СЦЕНА ---
export default function SolarSystem() {
  const [sun, setSun] = useState<THREE.Mesh | null>(null)
  const [activeFact, setActiveFact] = useState<any>(null)

  const factsData: any = {
    "Солнце": [
      "Каждую секунду Солнце сжигает около 600 миллионов тонн водорода, превращая его в энергию. Этой энергии хватило бы человечеству на миллионы лет.",
      "Если бы Солнце вдруг погасло, мы бы узнали об этом только через 8 минут и 20 секунд — именно столько времени свет идет до Земли.",
      "Солнечная корона в сотни раз горячее, чем сама поверхность звезды. Ученые до сих пор не могут точно объяснить этот парадокс нагрева.",
      "Магнитное поле Солнца переворачивается каждые 11 лет, меняя северный и южный полюса местами."
    ],
    "Меркурий": [
      "Меркурий буквально съеживается. Его ядро остывает, из-за чего планета уменьшилась в диаметре на 14 километров, покрываясь гигантскими морщинами-разломами.",
      "Несмотря на близость к Солнцу, в вечной тени его глубоких кратеров находятся миллиарды тонн водяного льда, который никогда не тает.",
      "У этой планеты есть 'хвост', как у кометы. Солнечный ветер выбивает атомы натрия с поверхности, создавая шлейф длиной в миллионы километров.",
      "Железное ядро Меркурия занимает 85% его объема. По сути, это гигантский металлический шар, едва покрытый каменной корой."
    ],
    "Венера": [
      "На Венере снег состоит из металла. Из-за чудовищного давления и жары пары галенита и висмутина выпадают на вершинах гор в виде блестящего налета.",
      "Атмосфера настолько плотная, что прогулка по Венере была бы похожа на попытку идти сквозь толщу океана на глубине одного километра.",
      "День здесь длиннее года. Планета вращается вокруг своей оси так медленно, что успевает облететь вокруг Солнца быстрее, чем совершить один оборот.",
      "Ветер в верхних слоях атмосферы достигает скорости 360 км/ч, заставляя облака облетать планету всего за 4 земных дня."
    ],
    "Земля": [
      "Земля — это огромный магнит. Внутри нее вращается жидкий океан железа, создающий щит, который защищает нас от смертельной радиации космоса.",
      "Если бы мы могли выкачать всё золото из ядра Земли, мы смогли бы покрыть всю сушу слоем этого драгоценного металла высотой в колено.",
      "Мы живем внутри атмосферы Солнца. Внешняя часть солнечной короны простирается далеко за орбиту Земли, и мы постоянно находимся в потоке его частиц.",
      "Каждый день на Землю падает около 100 тонн космической пыли и микрометеоритов, но мы этого даже не замечаем."
    ],
    "Марс": [
      "Марс обречен на кольца. Через 30-50 миллионов лет его спутник Фобос будет разорван гравитацией, и у Марса появятся кольца, как у Сатурна.",
      "Здесь находится самый большой каньон в системе — Долина Маринер. Если его положить на карту Земли, он растянется от Нью-Йорка до Лос-Анджелеса.",
      "На Марсе есть 'пылевые дьяволы' — гигантские смерчи, которые могут достигать нескольких километров в высоту и менять цвет неба.",
      "Синее небо на закате. Из-за специфического состава пыли в разреженной атмосфере Марса, свет рассеивается так, что закат кажется земному глазу ярко-голубым."
    ],
    "Юпитер": [
      "Юпитер — это 'пылесос' Солнечной системы. Его гравитация притягивает и уничтожает большинство комет и астероидов, которые могли бы врезаться в Землю.",
      "Внутри Юпитера находится океан жидкого металлического водорода. Под таким давлением водород ведет себя как ртуть и проводит электричество.",
      "Его магнитное поле в 20 000 раз сильнее земного. Если бы оно было видимым с Земли, оно казалось бы в два раза больше диска Луны.",
      "На Юпитере могут идти дожди из алмазов. Молнии в атмосфере превращают метан в сажу, которая при падении твердеет в алмазные грады."
    ],
    "Сатурн": [
      "Кольца Сатурна — это временное явление. Ученые подсчитали, что они исчезнут через 100 миллионов лет, 'выпав' на планету в виде ледяного дождя.",
      "Сатурн настолько легкий, что если бы вы нашли ванну подходящего размера и наполнили ее водой, эта гигантская планета просто плавала бы на поверхности.",
      "На северном полюсе бушует идеальный шестиугольный шторм. Этот гексагон не меняет форму десятилетиями, и его природа до конца не ясна.",
      "Спутник Сатурна Титан — единственное место, кроме Земли, где есть реки и моря, но наполнены они не водой, а жидким метаном и этаном."
    ],
    "Уран": [
      "Уран — самый экстремальный мир. Он вращается 'на боку' после столкновения с объектом размером с Землю в далеком прошлом.",
      "Здесь царит 'вечная зима' длительностью в 21 год. Именно столько времени каждое полушарие планеты находится в полной темноте или под солнцем.",
      "Атмосфера Урана пахнет тухлыми яйцами, так как она насыщена облаками сероводорода — того самого газа, что дает специфический запах.",
      "Магнитное поле Урана не совпадает с его центром и сильно наклонено, что заставляет его 'кувыркаться' во время движения по орбите."
    ],
    "Нептун": [
      "На Нептуне дуют самые быстрые ветры в системе — их скорость превышает 2100 км/ч, что почти в два раза быстрее скорости звука.",
      "Нептун выделяет в 2.6 раза больше тепла, чем получает от Солнца. Источник этой внутренней энергии остается одной из главных загадок планеты.",
      "Солнце с Нептуна кажется всего лишь маленькой яркой точкой, которая светит не ярче, чем Венера кажется нам с Земли.",
      "Его самый крупный спутник Тритон — единственный в системе, который вращается против направления вращения своей планеты."
    ]
  }

  const handleOpenFact = (name: string, list: string[]) => setActiveFact({ name, list, index: 0 })

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000", position: "relative", overflow: "hidden" }}>
      <BackgroundMusic />
      <Canvas camera={{ position: [0, 3000, 6000], fov: 45, far: 30000 }}>
        <Suspense fallback={null}>
          <Stars radius={8000} depth={100} count={20000} factor={6} saturation={0} fade speed={1.5} />
          
          <ambientLight intensity={0.5} />
          <pointLight position={[0, 0, 0]} intensity={2500} color="#ffaa00" />
          
          <group onClick={() => handleOpenFact("Солнце", factsData["Солнце"])}>
            <mesh ref={setSun}>
              <sphereGeometry args={[50, 64, 64]} />
              <meshStandardMaterial emissive="#ffaa00" emissiveIntensity={60} color="#ff8800" toneMapped={false} />
            </mesh>
            <Html distanceFactor={100} position={[0, 140, 0]} center>
                <div style={{ color: '#fff', fontSize: '600px', fontWeight: '950', textShadow: '0 0 100px #ffaa00, 0 0 40px #000', letterSpacing: '40px', whiteSpace: 'nowrap' }}>СОЛНЦЕ</div>
            </Html>
            <mesh><sphereGeometry args={[250, 32, 32]} /><meshBasicMaterial visible={false} /></mesh>
          </group>

          {[700, 1000, 1400, 1800, 2500, 3400, 4200, 5000].map(d => <Orbit key={d} distance={d} />)}

          <Planet name="Меркурий" size={12} distance={700} speed={0.5} textureUrl="/textures/mercury.jpg" glowColor="#aaa" facts={factsData["Меркурий"]} isPaused={!!activeFact} onPlanetClick={handleOpenFact} />
          <Planet name="Венера" size={18} distance={1000} speed={0.35} textureUrl="/textures/venus.jpg" glowColor="#ffcc88" facts={factsData["Венера"]} isPaused={!!activeFact} onPlanetClick={handleOpenFact} />
          <Planet name="Земля" size={20} distance={1400} speed={0.25} textureUrl="/textures/earth.jpg" glowColor="#2277ff" facts={factsData["Земля"]} isPaused={!!activeFact} onPlanetClick={handleOpenFact} />
          <Planet name="Марс" size={16} distance={1800} speed={0.2} textureUrl="/textures/mars.jpg" glowColor="#ff4400" facts={factsData["Марс"]} isPaused={!!activeFact} onPlanetClick={handleOpenFact} />
          <Planet name="Юпитер" size={50} distance={2500} speed={0.12} textureUrl="/textures/jupiter.jpg" glowColor="#d39c7e" facts={factsData["Юпитер"]} isPaused={!!activeFact} onPlanetClick={handleOpenFact} />
          <Planet name="Сатурн" size={45} distance={3400} speed={0.08} textureUrl="/textures/saturn.jpg" glowColor="#e2c17d" facts={factsData["Сатурн"]} isPaused={!!activeFact} onPlanetClick={handleOpenFact}>
            <SaturnRings size={45} />
          </Planet>
          <Planet name="Уран" size={30} distance={4200} speed={0.05} textureUrl="/textures/uranus.jpg" glowColor="#b2efff" facts={factsData["Уран"]} isPaused={!!activeFact} onPlanetClick={handleOpenFact} />
          <Planet name="Нептун" size={30} distance={5000} speed={0.03} textureUrl="/textures/neptune.jpg" glowColor="#3f5efb" facts={factsData["Нептун"]} isPaused={!!activeFact} onPlanetClick={handleOpenFact} />

          <EffectComposer>
            <Bloom luminanceThreshold={0.1} intensity={2.2} mipmapBlur />
            {sun && <GodRays sun={sun} samples={60} density={0.96} weight={0.6} />}
            <Vignette darkness={0.8} />
          </EffectComposer>

          <OrbitControls makeDefault maxDistance={20000} minDistance={500} />
        </Suspense>
      </Canvas>

      {/* УЛУЧШЕННАЯ МОДАЛКА */}
      {activeFact && (
        <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100, background: "rgba(0,0,0,0.95)", backdropFilter: "blur(25px)" }} onClick={() => setActiveFact(null)}>
          <div style={{ background: "#000", color: "#00d2ff", padding: "60px", borderRadius: "40px", border: "4px solid #00d2ff", width: "90%", maxWidth: "800px", textAlign: "center", boxShadow: "0 0 100px rgba(0,210,255,0.3)" }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: "56px", textTransform: 'uppercase', letterSpacing: "10px", marginBottom: "30px" }}>{activeFact.name}</h2>
            <div style={{ minHeight: "220px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ fontSize: "28px", color: "#fff", lineHeight: "1.6", fontWeight: "300" }}>{activeFact.list[activeFact.index]}</p>
            </div>
            <div style={{ marginTop: "40px", display: "flex", flexDirection: "column", gap: "15px" }}>
                <button onClick={() => setActiveFact({...activeFact, index: (activeFact.index + 1) % activeFact.list.length})} style={{ 
                  padding: "25px", background: "#00d2ff", color: "#000", border: "none", borderRadius: "20px", 
                  fontWeight: "900", cursor: "pointer", fontSize: "22px", textTransform: "uppercase" 
                }}>УЗНАТЬ БОЛЬШЕ ТАЙН →</button>
                <button onClick={() => setActiveFact(null)} style={{ background: "none", color: "#444", border: "none", cursor: "pointer", fontSize: "20px" }}>ЗАКРЫТЬ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}