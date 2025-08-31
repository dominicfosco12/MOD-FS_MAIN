import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing' // v2 line
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

const damp = (a, b, lambda, dt) => THREE.MathUtils.damp(a, b, lambda, dt)

/** Mouse-driven camera parallax */
function ParallaxCamera() {
  const { camera, mouse } = useThree()
  const target = useRef({ x: 0, y: 0 })
  useFrame((_, dt) => {
    const intensity = 0.65
    target.current.x = (mouse.x || 0) * intensity
    target.current.y = (mouse.y || 0) * intensity
    camera.position.x = damp(camera.position.x, target.current.x, 4, dt)
    camera.position.y = damp(camera.position.y, target.current.y, 4, dt)
    camera.lookAt(0, 0, 0)
  })
  return null
}

/** Procedural radial nebula: additive, soft falloff, tiny pulse */
function RadialNebula({ color = '#7ea8ff', size = 140, position = [0,0,-60], opacity = 0.035, rotate = 0 }) {
  const mat = useRef()
  const uniforms = useMemo(() => ({
    uColor: { value: new THREE.Color(color) },
    uTime:  { value: 0 },
    uOpacity: { value: opacity }
  }), [color, opacity])

  useFrame((state) => {
    if (mat.current) mat.current.uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <mesh position={position} rotation={[0, rotate, 0]}>
      <planeGeometry args={[size, size]} />
      <shaderMaterial
        ref={mat}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={/* glsl */`
          varying vec2 vUv;
          void main(){
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={/* glsl */`
          varying vec2 vUv;
          uniform vec3 uColor;
          uniform float uTime;
          uniform float uOpacity;

          // simple radial falloff + tiny time wobble to avoid static feel
          void main(){
            vec2 p = vUv - 0.5;
            // elliptical stretch to avoid perfect circle
            p.x *= 1.2;
            float r = length(p);

            // soft core, feathered edges
            float inner = smoothstep(0.45, 0.0, r);
            float outer = smoothstep(0.80, 0.45, r);

            // gentle pulsation 0.95..1.05
            float pulse = 0.95 + 0.10 * sin(uTime * 0.15);

            float alpha = inner * outer * uOpacity * pulse;
            gl_FragColor = vec4(uColor, alpha);
          }
        `}
      />
    </mesh>
  )
}

/** Drifting little comets */
function Comets({ count = 16, radius = 80 }) {
  const group = useRef()
  const data = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      temp.push({
        pos: new THREE.Vector3(
          THREE.MathUtils.randFloatSpread(radius),
          THREE.MathUtils.randFloatSpread(radius * 0.6),
          -THREE.MathUtils.randFloat(30, 140)
        ),
        vel: new THREE.Vector3(
          THREE.MathUtils.randFloat(0.05, 0.16),
          THREE.MathUtils.randFloat(-0.03, 0.03),
          THREE.MathUtils.randFloat(0.16, 0.34)
        ),
        size: THREE.MathUtils.randFloat(0.05, 0.12)
      })
    }
    return temp
  }, [count, radius])

  useFrame(() => {
    const g = group.current
    if (!g) return
    g.children.forEach((m, i) => {
      const d = data[i]
      m.position.add(d.vel)
      if (m.position.z > 6 || Math.abs(m.position.x) > radius) {
        m.position.set(
          THREE.MathUtils.randFloatSpread(radius * 0.7),
          THREE.MathUtils.randFloatSpread(radius * 0.4),
          -THREE.MathUtils.randFloat(50, 140)
        )
      }
    })
  })

  return (
    <group ref={group}>
      {data.map((d, i) => (
        <mesh key={i} position={d.pos}>
          <sphereGeometry args={[d.size, 8, 8]} />
          <meshBasicMaterial color='#ffffff' toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

export default function SpaceBackground() {
  return (
    <div className='canvas-bg'>
      <Canvas
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ fov: 70, position: [0, 0, 12], near: 0.1, far: 600 }}
        dpr={[1, 2]}
      >
        {/* deep base + light fog */}
        <color attach='background' args={['#02030a']} />
        <fogExp2 attach='fog' args={['#000000', 0.006]} />

        <ParallaxCamera />

        {/* dense stars */}
        <Stars
          radius={260}
          depth={180}
          count={10000}
          factor={2}
          saturation={0}
          fade
          speed={0.1}
        />

        {/* subtle localized clouds – no full-screen tint */}
        <RadialNebula color='#7ea8ff' size={150} position={[  0, -6, -70]} opacity={0.032} rotate={ 0.08} />
        <RadialNebula color='#a78bfa' size={170} position={[ 36,-18, -90]} opacity={0.028} rotate={-0.10} />
        <RadialNebula color='#22d3ee' size={160} position={[-34, 24, -85]} opacity={0.026} rotate={ 0.12} />

        <Comets count={18} radius={90} />

        {/* rim lights for depth */}
        <pointLight position={[12, 10, 10]} intensity={0.8} color='#7aa2ff' />
        <pointLight position={[-14, -10, -8]} intensity={0.5} color='#a78bfa' />

        {/* glow pass */}
        <EffectComposer>
          <Bloom intensity={1.6} luminanceThreshold={0.06} luminanceSmoothing={0.9} />
        </EffectComposer>
      </Canvas>

      {/* vignette kept in CSS */}
      <div className='vignette' aria-hidden='true' />
    </div>
  )
}
