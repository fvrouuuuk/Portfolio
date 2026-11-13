import { lazy, Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { projects, type Language } from '../data/portfolio'

type SceneProps = {
  progress: { current: number }
  focus: { current: number }
  section: string
  activeProject?: string | null
  language: Language
  lowPower: boolean
  reducedMotion: boolean
}

const PostEffects = lazy(() => import('./PostEffects'))

function useScreenTexture(section: string, language: Language, activeProject?: string | null) {
  const textureBundle = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 576
    const context = canvas.getContext('2d')!
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 4
    return { canvas, context, texture }
  }, [])

  useEffect(() => {
    const { canvas, context, texture } = textureBundle
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#090817')
    gradient.addColorStop(1, '#13122C')
    context.fillStyle = gradient
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.fillStyle = '#8B5CF6'
    context.fillRect(58, 56, 8, 8)
    context.font = '500 22px monospace'
    context.fillStyle = '#B7B2D0'
    context.fillText(language === 'fr' ? 'SESSION / FAROUK AYOUNA' : 'SESSION / FAROUK AYOUNA', 84, 73)
    context.strokeStyle = 'rgba(160,145,205,.22)'
    context.lineWidth = 1
    context.beginPath()
    context.moveTo(58, 102)
    context.lineTo(966, 102)
    context.stroke()

    const sectionTitles: Record<string, string> = {
      home: language === 'fr' ? 'Donner forme aux idées.' : 'Giving shape to ideas.',
      about: language === 'fr' ? 'Construire avec intention.' : 'Building with intention.',
      expertise: language === 'fr' ? 'Du concept au produit.' : 'From concept to product.',
      projects: language === 'fr' ? 'Des idées en construction.' : 'Ideas in progress.',
      journey: language === 'fr' ? 'Apprendre. Construire. Avancer.' : 'Learn. Build. Move forward.',
      contact: language === 'fr' ? 'Construisons quelque chose d’utile.' : 'Let’s build something useful.',
    }
    const project = projects.find((item) => item.id === activeProject)
    const title = project?.title ?? sectionTitles[section] ?? sectionTitles.home
    context.font = '600 48px Arial, sans-serif'
    context.fillStyle = '#F4F1FF'
    context.fillText(title, 58, 178, 850)

    const prompts: Record<string, string[]> = {
      home: ['const idea = {', '  purpose: "useful",', '  interface: "considered",', '  result: build(idea)', '}'],
      about: ['function makeWithIntent(idea) {', '  connect(interface, system)', '  listen(music, theatre)', '  return somethingUseful', '}'],
      expertise: ['const toolkit = [', '  "React", "TypeScript",', '  "Node.js", "PostgreSQL",', '  "Electron", "Java"', ']'],
      projects: ['const projects = portfolio.map(', '  project => project.solve(need)', ')', '// six different fields'],
      journey: ['const path = [', '  "learn", "build", "move forward"', ']', 'path.forEach(step => practice(step))'],
      contact: ['> construisons quelque chose d’utile_', 'await conversation.start()', 'status: ready'],
    }
    const lines = project
      ? [`const project = "${project.title}"`, ...project.technologies.slice(0, 3).map((tech) => `  stack.add("${tech}")`), 'return project.build()']
      : prompts[section] ?? prompts.home
    context.font = '400 27px monospace'
    lines.forEach((line, index) => {
      context.fillStyle = index === 0 ? '#22D3EE' : index % 2 ? '#C5B7FF' : '#9691B2'
      context.fillText(line, 80, 258 + index * 49)
    })

    context.fillStyle = 'rgba(139,92,246,.14)'
    context.fillRect(764, 430, 190, 74)
    context.font = '500 18px monospace'
    context.fillStyle = '#D9D2F7'
    context.fillText(`${Math.round(22 + Math.abs(Math.sin(Date.now() / 1800)) * 71)}% / RENDER`, 786, 474)
    texture.needsUpdate = true
  }, [activeProject, language, section, textureBundle])

  return textureBundle.texture
}

function ScreenTexture({ section, language, activeProject }: { section: string; language: Language; activeProject?: string | null }) {
  const texture = useScreenTexture(section, language, activeProject)
  return (
    <mesh position={[0, 1.12, 0.075]}>
      <planeGeometry args={[3.12, 1.76]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  )
}

function Keyboard() {
  const keys = useRef<THREE.InstancedMesh>(null)
  const count = 12 * 4

  useEffect(() => {
    if (!keys.current) return
    const dummy = new THREE.Object3D()
    let index = 0
    for (let row = 0; row < 4; row += 1) {
      for (let column = 0; column < 12; column += 1) {
        dummy.position.set(-1.35 + column * 0.245, 0, -0.52 + row * 0.205)
        dummy.scale.set(column === 11 && row === 3 ? 0.52 : 1, 1, 1)
        dummy.updateMatrix()
        keys.current.setMatrixAt(index, dummy.matrix)
        keys.current.setColorAt(index, new THREE.Color(row === 0 && column < 2 ? '#8B5CF6' : '#77718F'))
        index += 1
      }
    }
    keys.current.instanceMatrix.needsUpdate = true
    if (keys.current.instanceColor) keys.current.instanceColor.needsUpdate = true
  }, [])

  return (
    <instancedMesh ref={keys} args={[undefined, undefined, count]} position={[0, -0.475, 0]} castShadow>
      <boxGeometry args={[0.17, 0.025, 0.12]} />
      <meshStandardMaterial color="#8D87A6" metalness={0.38} roughness={0.4} emissive="#1E1740" emissiveIntensity={0.22} />
    </instancedMesh>
  )
}

function Laptop({ section, language, activeProject, progress, focus, reducedMotion }: SceneProps) {
  const group = useRef<THREE.Group>(null)
  const screenGroup = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (!group.current) return
    const t = state.clock.getElapsedTime()
    const p = progress.current
    const focusMix = focus.current
    const x = THREE.MathUtils.lerp(2.08 + Math.sin(p * Math.PI * 2) * 0.18, 0.05, focusMix)
    const y = 0.02 + Math.sin(p * Math.PI * 2.7) * 0.18 + (reducedMotion ? 0 : Math.sin(t * 0.65) * 0.045)
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, x, 2.5, delta)
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, y, 2.5, delta)
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, -0.18 + p * 0.58 + (reducedMotion ? 0 : Math.sin(t * 0.32) * 0.035), 2.5, delta)
    group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, -0.06 + Math.sin(p * Math.PI * 2) * 0.08, 2, delta)
    const scale = THREE.MathUtils.lerp(0.93 + Math.sin(p * Math.PI) * 0.055, 1.1, focusMix)
    group.current.scale.setScalar(scale)
    if (screenGroup.current) {
      const open = 0.16 + (section === 'home' ? Math.max(0, 1 - p * 1.3) * 0.16 : 0)
      screenGroup.current.rotation.x = THREE.MathUtils.damp(screenGroup.current.rotation.x, -open, 2, delta)
    }
  })

  return (
    <group ref={group} position={[2.08, 0, 0]} rotation={[0.12, -0.18, -0.06]}>
      <mesh position={[0, -0.58, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.55, 0.15, 2.18]} />
        <meshPhysicalMaterial color="#242234" metalness={0.82} roughness={0.28} clearcoat={0.7} clearcoatRoughness={0.25} />
      </mesh>
      <mesh position={[0, -0.49, 0]}>
        <boxGeometry args={[3.34, 0.025, 1.98]} />
        <meshStandardMaterial color="#171626" metalness={0.58} roughness={0.42} />
      </mesh>
      <Keyboard />
      <mesh position={[0, -0.47, 0.68]}>
        <boxGeometry args={[0.98, 0.014, 0.42]} />
        <meshPhysicalMaterial color="#302B43" metalness={0.64} roughness={0.28} clearcoat={0.4} />
      </mesh>
      <mesh position={[0, -0.499, -1.045]}>
        <boxGeometry args={[3.42, 0.08, 0.05]} />
        <meshStandardMaterial color="#8B5CF6" emissive="#6D28D9" emissiveIntensity={0.85} metalness={0.8} roughness={0.26} />
      </mesh>
      <group ref={screenGroup} position={[0, -0.49, -1.04]}>
        <mesh position={[0, 1.12, 0]} castShadow>
          <boxGeometry args={[3.48, 2.28, 0.12]} />
          <meshPhysicalMaterial color="#1D1B2C" metalness={0.78} roughness={0.24} clearcoat={0.85} clearcoatRoughness={0.17} />
        </mesh>
        <mesh position={[0, 1.12, 0.064]}>
          <planeGeometry args={[3.24, 1.88]} />
          <meshStandardMaterial color="#090817" emissive="#070615" emissiveIntensity={0.18} />
        </mesh>
        <ScreenTexture section={section} language={language} activeProject={activeProject} />
        <mesh position={[0, 2.19, 0.067]}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshBasicMaterial color="#22D3EE" />
        </mesh>
      </group>
      <mesh position={[0, -0.643, 0.2]}>
        <boxGeometry args={[3.52, 0.025, 1.92]} />
        <meshStandardMaterial color="#8B5CF6" emissive="#6D28D9" emissiveIntensity={0.4} metalness={0.7} roughness={0.35} />
      </mesh>
    </group>
  )
}

function LiquidAvatar({ progress, reducedMotion }: Pick<SceneProps, 'progress' | 'reducedMotion'>) {
  const material = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2(0.5, 0.5) },
    uScroll: { value: 0 },
    uOpacity: { value: 0 },
  }), [])

  useFrame((state) => {
    if (!material.current) return
    material.current.uniforms.uTime.value = reducedMotion ? 0 : state.clock.getElapsedTime()
    material.current.uniforms.uScroll.value = progress.current
    const p = progress.current
    const enter = THREE.MathUtils.smoothstep(p, 0.12, 0.2)
    const leave = 1 - THREE.MathUtils.smoothstep(p, 0.32, 0.4)
    material.current.uniforms.uOpacity.value = enter * leave
    material.current.uniforms.uPointer.value.set(state.pointer.x * 0.5 + 0.5, state.pointer.y * 0.5 + 0.5)
  })

  const vertexShader = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`
  const fragmentShader = `
    uniform float uTime; uniform vec2 uPointer; uniform float uScroll; uniform float uOpacity; varying vec2 vUv;
    void main(){
      vec2 p=vUv-0.5; float ripple=sin(length(p)*18.0-uTime*0.65+uScroll*5.0)*0.035;
      float d=length(p+vec2((uPointer.x-0.5)*0.09,(uPointer.y-0.5)*0.09))+ripple;
      float edge=smoothstep(0.48,0.16,d); float glow=smoothstep(0.58,0.05,d);
      vec3 color=mix(vec3(0.16,0.11,0.42),vec3(0.42,0.25,0.78),vUv.x);
      color=mix(color,vec3(0.12,0.52,0.72),smoothstep(0.2,0.52,vUv.y)*0.28);
      color+=vec3(0.22,0.15,0.55)*glow; gl_FragColor=vec4(color,edge*0.86*uOpacity);
    }
  `

  return (
    <mesh position={[4.1, -0.18, -0.72]} scale={[1.0, 1.0, 1]}>
      <sphereGeometry args={[0.78, 48, 48]} />
      <shaderMaterial ref={material} uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} transparent depthWrite={false} />
    </mesh>
  )
}

function Aurora({ reducedMotion }: Pick<SceneProps, 'reducedMotion'>) {
  const material = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uPointer: { value: new THREE.Vector2(0.5, 0.5) } }), [])
  useFrame((state) => {
    if (!material.current) return
    material.current.uniforms.uTime.value = reducedMotion ? 0 : state.clock.getElapsedTime()
    material.current.uniforms.uPointer.value.set(state.pointer.x * 0.5 + 0.5, state.pointer.y * 0.5 + 0.5)
  })
  const vertexShader = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`
  const fragmentShader = `
    uniform float uTime; uniform vec2 uPointer; varying vec2 vUv;
    void main(){
      float t=uTime*0.11; vec2 p=vUv;
      float wave=sin(p.x*7.2+t+sin(p.y*8.0-t)*0.72)+sin(p.x*4.8-t*1.4+p.y*5.0)*0.48;
      float veil=smoothstep(-0.6,0.9,wave+p.y*2.0-0.85);
      float cloud=sin(p.x*3.0+t*0.5+uPointer.x*0.6)*0.5+0.5;
      vec3 violet=vec3(0.27,0.12,0.66); vec3 blue=vec3(0.11,0.25,0.68); vec3 cyan=vec3(0.05,0.45,0.58);
      vec3 col=mix(violet,blue,cloud); col=mix(col,cyan,smoothstep(0.72,1.0,cloud)*0.23);
      float alpha=veil*(0.12+cloud*0.12)*smoothstep(0.0,0.18,p.y)*(1.0-smoothstep(0.78,1.0,p.y));
      gl_FragColor=vec4(col,alpha);
    }
  `
  return (
    <mesh position={[0, 0, -5.2]} scale={[14, 8, 1]}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial ref={material} uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} transparent depthWrite={false} />
    </mesh>
  )
}

function Dust({ count, reducedMotion }: { count: number; reducedMotion: boolean }) {
  const points = useRef<THREE.Points>(null)
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 15
      positions[i * 3 + 1] = (Math.random() - 0.5) * 9
      positions[i * 3 + 2] = -2 + Math.random() * -5
    }
    const result = new THREE.BufferGeometry()
    result.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return result
  }, [count])
  useFrame((state, delta) => {
    if (!points.current || reducedMotion) return
    points.current.rotation.y += delta * 0.012
    points.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.025) * 0.018
  })
  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial color="#CAC1FF" size={0.022} sizeAttenuation transparent opacity={0.68} depthWrite={false} />
    </points>
  )
}

function OrbitObjects({ reducedMotion }: Pick<SceneProps, 'reducedMotion'>) {
  return (
    <>
      <Float speed={reducedMotion ? 0 : 0.5} rotationIntensity={reducedMotion ? 0 : 0.08} floatIntensity={reducedMotion ? 0 : 0.13}>
        <group position={[3.85, 0.58, -0.2]} rotation={[0, -0.25, -0.05]}>
          <mesh castShadow>
            <boxGeometry args={[1.05, 0.75, 0.08]} />
            <meshPhysicalMaterial color="#28253B" metalness={0.7} roughness={0.28} clearcoat={0.7} />
          </mesh>
          <mesh position={[0, 0, 0.05]}>
            <planeGeometry args={[0.88, 0.56]} />
            <meshBasicMaterial color="#17112C" />
          </mesh>
          <mesh position={[0, -0.43, 0]}>
            <boxGeometry args={[1.32, 0.05, 0.56]} />
            <meshStandardMaterial color="#39344C" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      </Float>
      <Float speed={reducedMotion ? 0 : 0.8} rotationIntensity={reducedMotion ? 0 : 0.12} floatIntensity={reducedMotion ? 0 : 0.2}>
        <group position={[0.15, -1.18, 0.1]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.19, 0.22, 0.42, 24]} />
            <meshPhysicalMaterial color="#2E2A3D" metalness={0.6} roughness={0.24} clearcoat={0.9} />
          </mesh>
          <mesh position={[0.22, 0.02, 0]}>
            <torusGeometry args={[0.12, 0.025, 12, 24]} />
            <meshStandardMaterial color="#8B5CF6" metalness={0.72} roughness={0.25} emissive="#5323A7" emissiveIntensity={0.3} />
          </mesh>
        </group>
      </Float>
      <Sparkles count={reducedMotion ? 0 : 8} scale={[7, 4.5, 4]} size={1.6} speed={reducedMotion ? 0 : 0.16} color="#B7A6FF" opacity={0.7} />
    </>
  )
}

function CameraRig({ progress, focus }: Pick<SceneProps, 'progress' | 'focus'>) {
  const { camera } = useThree()
  useFrame((_, delta) => {
    const p = progress.current
    const f = focus.current
    const x = THREE.MathUtils.lerp(Math.sin(p * Math.PI * 2) * 0.2, -0.15, f)
    const y = Math.sin(p * Math.PI * 2.4) * 0.12
    const z = THREE.MathUtils.lerp(8.5 - Math.sin(p * Math.PI) * 0.35, 6.4, f)
    camera.position.x = THREE.MathUtils.damp(camera.position.x, x, 1.9, delta)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, y, 1.9, delta)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, z, 1.9, delta)
    camera.lookAt(0.35 + Math.sin(p * Math.PI * 1.3) * 0.12, 0, 0)
  })
  return null
}

export default function Scene(props: SceneProps) {
  const dpr = props.lowPower ? 1 : Math.min(window.devicePixelRatio || 1, 1.65)
  return (
    <div className="scene-root" aria-hidden="true">
      <Canvas
        dpr={dpr}
        camera={{ position: [0, 0, 8.5], fov: 39, near: 0.1, far: 80 }}
        gl={{ alpha: true, antialias: !props.lowPower, powerPreference: props.lowPower ? 'low-power' : 'high-performance' }}
        performance={{ min: 0.6 }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor('#05030F', 0)
          scene.background = null
        }}
      >
        <ambientLight intensity={0.82} color="#E9E3FF" />
        <directionalLight position={[4, 6, 5]} intensity={2.15} color="#F4F1FF" />
        <pointLight position={[-3, 1, 3]} intensity={18} distance={9} color="#7C3AED" />
        <pointLight position={[4, -2, 1]} intensity={13} distance={8} color="#3B82F6" />
        <Aurora reducedMotion={props.reducedMotion} />
        <Dust count={props.lowPower ? 54 : 180} reducedMotion={props.reducedMotion} />
        <CameraRig progress={props.progress} focus={props.focus} />
        <Laptop {...props} />
        <LiquidAvatar progress={props.progress} reducedMotion={props.reducedMotion} />
        <OrbitObjects reducedMotion={props.reducedMotion} />
        {!props.lowPower && !props.reducedMotion && <Suspense fallback={null}><PostEffects /></Suspense>}
      </Canvas>
    </div>
  )
}
