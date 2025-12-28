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

// Gold particle system representing wealth/value flowing
function GoldParticles({ count = 500 }) {
  const points = useRef<THREE.Points>(null);

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

  const particlesSizes = useMemo(() => {
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      sizes[i] = Math.random() * 0.05 + 0.02;
    }
    return sizes;
  }, [count]);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.02;
      points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particlesPosition}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={particlesSizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#D4AF37"
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Central cosmic orb - represents the "quantum superposition" concept
function CosmicOrb() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={meshRef} args={[1.5, 64, 64]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color="#8C7330"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.9}
          emissive="#D4AF37"
          emissiveIntensity={0.3}
        />
      </Sphere>
      {/* Inner glow sphere */}
      <Sphere args={[1.2, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#D4AF37" transparent opacity={0.12} />
      </Sphere>
    </Float>
  );
}

// Orbiting rings - representing the "cosmic orbit" wealth protection
function OrbitalRings() {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

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
  });

  return (
    <group>
      <mesh ref={ring1Ref} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[3, 0.02, 16, 100]} />
        <meshBasicMaterial color="#D4AF37" transparent opacity={0.6} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <torusGeometry args={[3.5, 0.015, 16, 100]} />
        <meshBasicMaterial color="#8C7330" transparent opacity={0.4} />
      </mesh>
      <mesh ref={ring3Ref} rotation={[Math.PI / 6, -Math.PI / 3, 0]}>
        <torusGeometry args={[4, 0.01, 16, 100]} />
        <meshBasicMaterial color="#E5C76B" transparent opacity={0.3} />
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

// Loading indicator within Three.js
function Loader() {
  const { progress } = useProgress();

  return (
    <Html center>
      <div className="flex flex-col items-center gap-4">
        <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold-400 to-gold-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-gold-400 text-sm font-medium">
          {progress.toFixed(0)}%
        </p>
      </div>
    </Html>
  );
}

// Main scene composition
function Scene({ onLoaded }: { onLoaded?: () => void }) {
  const { progress } = useProgress();

  useEffect(() => {
    if (progress === 100 && onLoaded) {
      setTimeout(onLoaded, 500);
    }
  }, [progress, onLoaded]);

  return (
    <>
      {/* Ambient and directional lighting */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} color="#D4AF37" />
      <pointLight position={[-5, -5, -5]} intensity={0.3} color="#8C7330" />

      {/* Background stars */}
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      {/* Main scene elements */}
      <CosmicOrb />
      <OrbitalRings />
      <GoldParticles count={800} />

      {/* Camera animation */}
      <CameraController />

      {/* Post-processing effects */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          intensity={0.8}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.8} />
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
