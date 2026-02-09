"use client";

import { useRef, useMemo, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export type ParticleFieldMode = "desktop" | "mobile";

type ParticleFieldProps = {
  mode?: ParticleFieldMode;
  interactive?: boolean;
};

const MODE_CONFIG: Record<
  ParticleFieldMode,
  {
    particleCount: number;
    fieldSize: number;
    connectionDistance: number;
    maxConnections: number;
    mouseInfluenceRadius: number;
    mouseRepelStrength: number;
    rotationSpeed: number;
    connectionThrottle: number;
  }
> = {
  desktop: {
    particleCount: 500,
    fieldSize: 14,
    connectionDistance: 1.8,
    maxConnections: 150,
    mouseInfluenceRadius: 3,
    mouseRepelStrength: 0.08,
    rotationSpeed: 0.015,
    connectionThrottle: 2,
  },
  mobile: {
    particleCount: 260,
    fieldSize: 12,
    connectionDistance: 1.55,
    maxConnections: 70,
    mouseInfluenceRadius: 2.2,
    mouseRepelStrength: 0.05,
    rotationSpeed: 0.01,
    connectionThrottle: 3,
  },
};

// Custom shader for glowing particles
const vertexShader = `
  attribute float aSize;
  attribute float aOpacity;
  varying float vOpacity;
  uniform float uTime;
  uniform float uPixelRatio;
  
  void main() {
    vOpacity = aOpacity;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float pulse = 1.0 + sin(uTime * 2.0 + position.x * 3.0 + position.y * 2.0) * 0.3;
    gl_PointSize = aSize * pulse * uPixelRatio * (80.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying float vOpacity;
  uniform vec3 uColor;
  
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    
    // Soft glow falloff
    float glow = 1.0 - smoothstep(0.0, 0.5, d);
    glow = pow(glow, 1.5);
    
    // Core brightness
    float core = 1.0 - smoothstep(0.0, 0.15, d);
    
    vec3 color = uColor * (glow * 0.6 + core * 0.8);
    float alpha = (glow * 0.4 + core * 0.9) * vOpacity;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

export function ParticleField({ mode = "desktop", interactive = true }: ParticleFieldProps) {
  const config = MODE_CONFIG[mode];
  const {
    particleCount,
    fieldSize,
    connectionDistance,
    maxConnections,
    mouseInfluenceRadius,
    mouseRepelStrength,
    rotationSpeed,
    connectionThrottle,
  } = config;

  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const mouseRef = useRef(new THREE.Vector3(0, 0, 0));
  const { viewport, pointer } = useThree();

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Distribute in a slightly flattened ellipsoid for better visual
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.cbrt(Math.random()) * fieldSize * 0.5;

      pos[i3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      pos[i3 + 2] = r * Math.cos(phi) * 0.4;

      vel[i3] = (Math.random() - 0.5) * 0.003;
      vel[i3 + 1] = (Math.random() - 0.5) * 0.003;
      vel[i3 + 2] = (Math.random() - 0.5) * 0.001;
    }

    return { positions: pos, velocities: vel };
  }, [fieldSize, particleCount]);

  const { sizes, opacities } = useMemo(() => {
    const s = new Float32Array(particleCount);
    const o = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      s[i] = Math.random() * 1.5 + 0.3;
      o[i] = Math.random() * 0.5 + 0.3;
    }
    return { sizes: s, opacities: o };
  }, [particleCount]);

  // Line geometry for connections
  const linePositions = useMemo(
    () => new Float32Array(maxConnections * 6),
    [maxConnections]
  );
  const lineColors = useMemo(
    () => new Float32Array(maxConnections * 6),
    [maxConnections]
  );

  const shaderUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color("#00FFE0") },
      uPixelRatio: {
        value:
          typeof window !== "undefined"
            ? Math.min(window.devicePixelRatio, 2)
            : 1,
      },
    }),
    []
  );

  const updateConnections = useCallback(
    (posArray: Float32Array) => {
      if (!linesRef.current) return;

      const lineGeo = linesRef.current.geometry;
      const linePosAttr = lineGeo.getAttribute(
        "position"
      ) as THREE.BufferAttribute;
      const lineColAttr = lineGeo.getAttribute("color") as THREE.BufferAttribute;
      const lPos = linePosAttr.array as Float32Array;
      const lCol = lineColAttr.array as Float32Array;

      let connectionCount = 0;

      for (let i = 0; i < particleCount && connectionCount < maxConnections; i++) {
        const i3 = i * 3;
        for (let j = i + 1; j < particleCount && connectionCount < maxConnections; j++) {
          const j3 = j * 3;
          const dx = posArray[i3] - posArray[j3];
          const dy = posArray[i3 + 1] - posArray[j3 + 1];
          const dz = posArray[i3 + 2] - posArray[j3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < connectionDistance) {
            const c6 = connectionCount * 6;
            lPos[c6] = posArray[i3];
            lPos[c6 + 1] = posArray[i3 + 1];
            lPos[c6 + 2] = posArray[i3 + 2];
            lPos[c6 + 3] = posArray[j3];
            lPos[c6 + 4] = posArray[j3 + 1];
            lPos[c6 + 5] = posArray[j3 + 2];

            const alpha = 1 - dist / connectionDistance;
            const a = alpha * 0.15;

            // Cyan-ish color for lines
            lCol[c6] = 0 * a;
            lCol[c6 + 1] = 1 * a;
            lCol[c6 + 2] = 0.88 * a;
            lCol[c6 + 3] = 0 * a;
            lCol[c6 + 4] = 1 * a;
            lCol[c6 + 5] = 0.88 * a;

            connectionCount++;
          }
        }
      }

      // Zero out remaining
      for (let i = connectionCount * 6; i < maxConnections * 6; i++) {
        lPos[i] = 0;
        lCol[i] = 0;
      }

      linePosAttr.needsUpdate = true;
      lineColAttr.needsUpdate = true;
      lineGeo.setDrawRange(0, connectionCount * 2);
    },
    [connectionDistance, maxConnections, particleCount]
  );

  useFrame((state) => {
    if (!pointsRef.current) return;

    const time = state.clock.elapsedTime;
    shaderUniforms.uTime.value = time;

    if (interactive) {
      // Map pointer to world coords
      mouseRef.current.set(
        pointer.x * viewport.width * 0.5,
        pointer.y * viewport.height * 0.5,
        0
      );
    }

    const geometry = pointsRef.current.geometry;
    const posAttr = geometry.getAttribute("position") as THREE.BufferAttribute;
    const posArray = posAttr.array as Float32Array;
    const opacityAttr = geometry.getAttribute("aOpacity") as THREE.BufferAttribute;
    const opArray = opacityAttr.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Base drift
      posArray[i3] += velocities[i3] + Math.sin(time * 0.3 + i * 0.1) * 0.0004;
      posArray[i3 + 1] +=
        velocities[i3 + 1] + Math.cos(time * 0.2 + i * 0.1) * 0.0004;
      posArray[i3 + 2] += velocities[i3 + 2];

      if (interactive) {
        // Mouse repulsion
        const dx = posArray[i3] - mouseRef.current.x;
        const dy = posArray[i3 + 1] - mouseRef.current.y;
        const mouseDist = Math.sqrt(dx * dx + dy * dy);

        if (mouseDist < mouseInfluenceRadius && mouseDist > 0.01) {
          const force = (1 - mouseDist / mouseInfluenceRadius) * mouseRepelStrength;
          posArray[i3] += (dx / mouseDist) * force;
          posArray[i3 + 1] += (dy / mouseDist) * force;
          // Boost opacity near mouse
          opArray[i] = Math.min(1, opacities[i] + force * 3);
        } else {
          // Gentle return to base opacity
          opArray[i] += (opacities[i] - opArray[i]) * 0.02;
        }
      }

      // Soft boundary — pull back to field
      const halfField = fieldSize * 0.5;
      const pullStrength = 0.001;
      if (Math.abs(posArray[i3]) > halfField) {
        posArray[i3] -= Math.sign(posArray[i3]) * pullStrength;
      }
      if (Math.abs(posArray[i3 + 1]) > halfField * 0.6) {
        posArray[i3 + 1] -= Math.sign(posArray[i3 + 1]) * pullStrength;
      }
      if (Math.abs(posArray[i3 + 2]) > halfField * 0.4) {
        posArray[i3 + 2] -= Math.sign(posArray[i3 + 2]) * pullStrength;
      }
    }

    posAttr.needsUpdate = true;
    opacityAttr.needsUpdate = true;

    // Update connection lines (throttled)
    if (Math.round(time * 60) % connectionThrottle === 0) {
      updateConnections(posArray);
    }

    // Gentle overall rotation
    pointsRef.current.rotation.y = time * rotationSpeed;
    if (linesRef.current) {
      linesRef.current.rotation.y = time * rotationSpeed;
    }
  });

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
            count={particleCount}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-aSize"
            args={[sizes, 1]}
            count={particleCount}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-aOpacity"
            args={[opacities, 1]}
            count={particleCount}
            itemSize={1}
          />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={shaderUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Connection lines */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
            count={maxConnections * 2}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[lineColors, 3]}
            count={maxConnections * 2}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </>
  );
}
