import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import * as THREE from "three"
import { useRef, useEffect, useState } from "react"

/* ---------- HUD ---------- */

function HUD({speed}:{speed:number}) {
  return (
    <div style={{
      position:"absolute",
      top:10,left:10,
      color:"#0ff",
      fontFamily:"monospace",
      background:"rgba(0,0,0,.6)",
      padding:10
    }}>
      SPEED {speed.toFixed(2)}
    </div>
  )
}

/* ---------- SHIP ---------- */

function Ship({setSpeed}:any){
  const ref=useRef<any>()
  const keys:any={}

  useEffect(()=>{
    window.onkeydown=e=>keys[e.code]=true
    window.onkeyup=e=>keys[e.code]=false
  },[])

  useFrame(()=>{
    if(!ref.current)return
    let v=0
    if(keys["KeyW"])v=-0.3
    if(keys["KeyS"])v=0.3
    ref.current.position.z+=v
    setSpeed(Math.abs(v*10))
  })

  return(
    <mesh ref={ref}>
      <coneGeometry args={[.3,1,8]}/>
      <meshStandardMaterial emissive="#0ff"/>
    </mesh>
  )
}

/* ---------- PLANET ---------- */

function Planet({size,dist,speed,color}:any){
  const r=useRef<any>()
  useFrame(({clock})=>{
    const t=clock.getElapsedTime()*speed
    r.current.position.set(Math.cos(t)*dist,0,Math.sin(t)*dist)
  })
  return(
    <mesh ref={r}>
      <sphereGeometry args={[size,32,32]}/>
      <meshStandardMaterial color={color}/>
    </mesh>
  )
}

/* ---------- SATURN ---------- */

function Saturn(){
  return(
    <group position={[14,0,0]}>
      <mesh>
        <sphereGeometry args={[1,32,32]}/>
        <meshStandardMaterial color="gold"/>
      </mesh>
      <mesh rotation={[Math.PI/2,0,0]}>
        <ringGeometry args={[1.5,2.2,64]}/>
        <meshStandardMaterial color="#ccc" side={THREE.DoubleSide}/>
      </mesh>
    </group>
  )
}

/* ---------- ASTEROIDS ---------- */

function Asteroids(){
  const g=useRef<any>()
  useFrame(()=>g.current.rotation.y+=0.0005)
  return(
    <group ref={g}>
      {[...Array(1500)].map((_,i)=>{
        const a=Math.random()*Math.PI*2
        const r=9+Math.random()*4
        return(
          <mesh key={i} position={[Math.cos(a)*r,(Math.random()-.5)*2,Math.sin(a)*r]}
          scale={Math.random()*.2+.05}>
            <icosahedronGeometry/>
            <meshStandardMaterial color="#555"/>
          </mesh>
        )
      })}
    </group>
  )
}

/* ---------- BLACK HOLE ---------- */

function BlackHole(){
  const r=useRef<any>()
  useFrame(()=>r.current.rotation.y+=0.02)
  return(
    <mesh ref={r} position={[0,0,-40]}>
      <sphereGeometry args={[2,64,64]}/>
      <meshStandardMaterial emissive="purple" emissiveIntensity={6}/>
    </mesh>
  )
}

/* ---------- APP ---------- */

export default function App(){
  const[speed,setSpeed]=useState(0)

  return(
    <>
    <HUD speed={speed}/>

    <Canvas camera={{position:[0,5,20],fov:60}}>
      <ambientLight intensity={.4}/>
      <pointLight intensity={6}/>

      <mesh>
        <sphereGeometry args={[3,64,64]}/>
        <meshStandardMaterial emissive="#ffaa00" emissiveIntensity={5}/>
      </mesh>

      <Planet size={.3} dist={5} speed={1} color="gray"/>
      <Planet size={.5} dist={7} speed={.8} color="orange"/>
      <Planet size={.6} dist={9} speed={.6} color="blue"/>
      <Planet size={.5} dist={11} speed={.5} color="red"/>
      <Planet size={1} dist={13} speed={.3} color="brown"/>

      <Saturn/>
      <Planet size={.7} dist={18} speed={.2} color="cyan"/>
      <Planet size={.6} dist={22} speed={.15} color="purple"/>

      <Asteroids/>
      <BlackHole/>
      <Ship setSpeed={setSpeed}/>

      <Stars radius={500} depth={300} count={30000} factor={6}/>
      <OrbitControls enablePan={false}/>

      <EffectComposer>
        <Bloom intensity={3}/>
      </EffectComposer>
    </Canvas>
    </>
  )
}
