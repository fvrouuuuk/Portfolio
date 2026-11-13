import { useLayoutEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type ExperienceCanvasProps = {
  reducedMotion: boolean
}

function Sculpture({ reducedMotion }: ExperienceCanvasProps) {
  const sculpture = useRef<Group>(null)
  const orbit = useRef<Mesh>(null)
  const secondOrbit = useRef<Mesh>(null)
  const { camera } = useThree()

  useLayoutEffect(() => {
    if (reducedMotion || window.matchMedia('(max-width: 760px)').matches) return
    if (!sculpture.current || !orbit.current || !secondOrbit.current) return

    const context = gsap.context(() => {
      const journey = gsap.timeline({
        scrollTrigger: {
          trigger: '#story',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.1,
        },
      })

      journey
        .to(camera.position, { x: -0.35, y: 0.12, z: 7.6, ease: 'none' }, 0)
        .to(sculpture.current!.position, { x: 2.6, y: 0.3, z: -0.2, ease: 'none' }, 0.6)
        .to(sculpture.current!.rotation, { x: 0.4, y: 2.7, z: 0.18, ease: 'none' }, 0)
        .to(orbit.current!.rotation, { x: 2.1, y: 0.4, z: -0.42, ease: 'none' }, 0)
        .to(secondOrbit.current!.rotation, { x: -0.65, y: 2.6, z: 0.7, ease: 'none' }, 0)
        .to(sculpture.current!.scale, { x: 0.76, y: 0.76, z: 0.76, ease: 'none' }, 0.6)
        .to(sculpture.current!.position, { x: 3.25, y: 1.05, z: -0.35, ease: 'none' }, 1.25)
        .to(sculpture.current!.scale, { x: 0.58, y: 0.58, z: 0.58, ease: 'none' }, 1.25)
        .to(camera.position, { x: 0.25, y: -0.1, z: 8.2, ease: 'none' }, 3.25)
        .to(sculpture.current!.position, { x: 2.4, y: 0.25, z: -0.5, ease: 'none' }, 3.25)
        .to(sculpture.current!.scale, { x: 0.7, y: 0.7, z: 0.7, ease: 'none' }, 3.25)

    })

    return () => context.revert()
  }, [camera, reducedMotion])

  return (
    <group ref={sculpture} position={[1.85, 0.1, 0]} rotation={[0.2, -0.25, -0.1]}>
      <mesh castShadow receiveShadow>
        <icosahedronGeometry args={[0.93, 3]} />
        <meshPhysicalMaterial
          color="#dbe6e3"
          roughness={0.19}
          metalness={0.28}
          clearcoat={0.95}
          clearcoatRoughness={0.12}
          transmission={0.14}
          thickness={0.8}
        />
      </mesh>
      <mesh ref={orbit} rotation={[1.05, 0.4, 0.28]}>
        <torusGeometry args={[1.25, 0.022, 12, 96]} />
        <meshStandardMaterial color="#65808a" metalness={0.78} roughness={0.24} />
      </mesh>
      <mesh ref={secondOrbit} rotation={[0.2, 0.65, 1.1]}>
        <torusGeometry args={[1.48, 0.012, 10, 96]} />
        <meshStandardMaterial color="#c27e53" metalness={0.62} roughness={0.3} />
      </mesh>
      <mesh position={[0.72, 0.54, 0.2]} scale={0.12}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#b36d4a" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[-0.62, -0.62, 0.08]} scale={0.075}>
        <sphereGeometry args={[1, 20, 20]} />
        <meshStandardMaterial color="#8ba4a8" metalness={0.62} roughness={0.28} />
      </mesh>
    </group>
  )
}

export default function ExperienceCanvas({ reducedMotion }: ExperienceCanvasProps) {
  const lowPower = window.matchMedia('(max-width: 760px)').matches || reducedMotion

  return (
    <div className="experience-canvas" aria-hidden="true">
      <div className="scene-fallback" />
      <Canvas
        camera={{ position: [0, 0, 8], fov: 42 }}
        dpr={lowPower ? 1 : [1, 1.35]}
        gl={{ alpha: true, antialias: !lowPower, powerPreference: 'low-power' }}
        onCreated={({ scene }) => {
          scene.background = null
          scene.fog = null
        }}
      >
        <ambientLight intensity={1.45} color="#f8fbf9" />
        <directionalLight position={[4, 5, 5]} intensity={2.2} color="#fff8ef" />
        <pointLight position={[-3, -2, 2]} intensity={22} color="#9bbdc0" distance={9} />
        <pointLight position={[2.5, 3, -2]} intensity={18} color="#d39873" distance={8} />
        <Sculpture reducedMotion={reducedMotion} />
      </Canvas>
      <div className="scene-wash" />
    </div>
  )
}
