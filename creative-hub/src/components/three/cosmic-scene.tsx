"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Stars,
  Float,
  MeshDistortMaterial,
  Sphere,
  OrbitControls,
  useProgress,
  Html,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { Suspense } from "react";

// Synthwave particle system - pink and cyan energy
function NeonParticles({ count = 500 }) {
  const pinkPoints = useRef<THREE.Points>(null);
  const cyanPoints = useRef<THREE.Points>(null);

  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 3 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    return positions;
  }, [count]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (pinkPoints.current) {
      pinkPoints.current.rotation.y = t * 0.02;
      pinkPoints.current.rotation.x = Math.sin(t * 0.01) * 0.1;
    }
    if (cyanPoints.current) {
      cyanPoints.current.rotation.y = -t * 0.015;
      cyanPoints.current.rotation.z = Math.cos(t * 0.008) * 0.1;
    }
  });

  return (
    <>
      {/* Pink particles */}
      <points ref={pinkPoints}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={particlesPosition}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color="#FF10F0"
          transparent
          opacity={0.9}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
      {/* Cyan particles - offset position */}
      <points ref={cyanPoints} position={[0.5, 0.5, 0.5]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={particlesPosition}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          color="#00FFFF"
          transparent
          opacity={0.7}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}

// Central cosmic orb - synthwave holographic sphere
function CosmicOrb() {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.1;
      meshRef.current.rotation.y = t * 0.15;
    }
    if (glowRef.current) {
      // Pulsing glow effect
      const scale = 1 + Math.sin(t * 2) * 0.05;
      glowRef.current.scale.setScalar(scale);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={meshRef} args={[1.5, 64, 64]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color="#AA00AA"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.15}
          metalness={0.95}
          emissive="#FF10F0"
          emissiveIntensity={0.5}
        />
      </Sphere>
      {/* Inner pink glow sphere */}
      <Sphere args={[1.3, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#FF10F0" transparent opacity={0.15} />
      </Sphere>
      {/* Outer cyan glow sphere */}
      <Sphere ref={glowRef} args={[1.8, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#00FFFF" transparent opacity={0.08} />
      </Sphere>
    </Float>
  );
}

// Orbiting rings - synthwave neon rings
function OrbitalRings() {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const ring4Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * 0.2;
      ring1Ref.current.rotation.z = t * 0.1;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = t * 0.15;
      ring2Ref.current.rotation.z = -t * 0.08;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.x = -t * 0.1;
      ring3Ref.current.rotation.y = t * 0.12;
    }
    if (ring4Ref.current) {
      ring4Ref.current.rotation.y = -t * 0.18;
      ring4Ref.current.rotation.x = t * 0.05;
    }
  });

  return (
    <group>
      {/* Hot pink ring */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[3, 0.025, 16, 100]} />
        <meshBasicMaterial color="#FF10F0" transparent opacity={0.8} />
      </mesh>
      {/* Cyan ring */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <torusGeometry args={[3.5, 0.02, 16, 100]} />
        <meshBasicMaterial color="#00FFFF" transparent opacity={0.6} />
      </mesh>
      {/* Purple ring */}
      <mesh ref={ring3Ref} rotation={[Math.PI / 6, -Math.PI / 3, 0]}>
        <torusGeometry args={[4, 0.015, 16, 100]} />
        <meshBasicMaterial color="#8B5CF6" transparent opacity={0.5} />
      </mesh>
      {/* Outer pink glow ring */}
      <mesh ref={ring4Ref} rotation={[Math.PI / 5, Math.PI / 6, 0]}>
        <torusGeometry args={[4.5, 0.01, 16, 100]} />
        <meshBasicMaterial color="#FF6BF0" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

// Camera controller with smooth movement
function CameraController() {
  const { camera } = useThree();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    camera.position.x = Math.sin(t * 0.1) * 0.5;
    camera.position.y = Math.cos(t * 0.08) * 0.3;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// Loading indicator within Three.js - Synthwave style
function Loader() {
  const { progress } = useProgress();

  return (
    <Html center>
      <div className="flex flex-col items-center gap-4">
        <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-tiger to-neon-cyan transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-tiger text-sm font-medium">
          {progress.toFixed(0)}%
        </p>
      </div>
    </Html>
  );
}

// Main scene composition - SYNTHWAVE HOLOGRAPHIC
function Scene({ onLoaded }: { onLoaded?: () => void }) {
  const { progress } = useProgress();

  useEffect(() => {
    if (progress === 100 && onLoaded) {
      setTimeout(onLoaded, 500);
    }
  }, [progress, onLoaded]);

  return (
    <>
      {/* Synthwave lighting - pink and cyan */}
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} color="#FF10F0" />
      <pointLight position={[-5, -5, -5]} intensity={0.4} color="#00FFFF" />
      <pointLight position={[0, 5, 0]} intensity={0.2} color="#8B5CF6" />

      {/* Background stars - slightly tinted */}
      <Stars
        radius={100}
        depth={50}
        count={6000}
        factor={4}
        saturation={0.3}
        fade
        speed={1.5}
      />

      {/* Main scene elements */}
      <CosmicOrb />
      <OrbitalRings />
      <NeonParticles count={600} />

      {/* Camera animation */}
      <CameraController />

      {/* Post-processing effects - enhanced bloom for neon glow */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.1}
          luminanceSmoothing={0.9}
          intensity={1.2}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.7} />
      </EffectComposer>
    </>
  );
}

interface CosmicSceneProps {
  className?: string;
  onLoaded?: () => void;
  interactive?: boolean;
}

export function CosmicScene({
  className = "",
  onLoaded,
  interactive = false,
}: CosmicSceneProps) {
  return (
    <div
      className={`canvas-container ${interactive ? "interactive" : ""} ${className}`}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={<Loader />}>
          <Scene onLoaded={onLoaded} />
        </Suspense>
        {interactive && <OrbitControls enableZoom={false} enablePan={false} />}
      </Canvas>
    </div>
  );
}
