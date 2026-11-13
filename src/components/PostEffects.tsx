import { Bloom, ChromaticAberration, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import { Vector2 } from 'three'

export default function PostEffects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom intensity={0.34} luminanceThreshold={0.53} luminanceSmoothing={0.18} mipmapBlur />
      <ChromaticAberration offset={new Vector2(0.00024, 0.00024)} radialModulation={false} modulationOffset={0} />
      <Noise opacity={0.025} />
      <Vignette offset={0.24} darkness={0.42} />
    </EffectComposer>
  )
}
