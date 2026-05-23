"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x020617, 1);
    container.appendChild(renderer.domElement);

    const particleCount = 520;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const colorA = new THREE.Color("#34d399");
    const colorB = new THREE.Color("#38bdf8");
    const colorC = new THREE.Color("#e2e8f0");

    for (let index = 0; index < particleCount; index += 1) {
      const i = index * 3;
      const radius = 1.8 + Math.random() * 5.8;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 4.8;
      const drift = (Math.random() - 0.5) * 1.2;

      positions[i] = Math.cos(angle) * radius + drift;
      positions[i + 1] = height;
      positions[i + 2] = Math.sin(angle) * radius;

      const mixed = colorA.clone().lerp(colorB, Math.random() * 0.75);
      mixed.lerp(colorC, Math.random() * 0.16);
      colors[i] = mixed.r;
      colors[i + 1] = mixed.g;
      colors[i + 2] = mixed.b;
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    particlesGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colors, 3),
    );

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.035,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.72,
      vertexColors: true,
      depthWrite: false,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    const ringGeometry = new THREE.TorusGeometry(2.65, 0.006, 8, 160);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: "#34d399",
      transparent: true,
      opacity: 0.18,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2.8;
    ring.rotation.y = Math.PI / 6;
    scene.add(ring);

    let animationFrame = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();

      particles.rotation.y = elapsed * 0.035;
      particles.rotation.x = Math.sin(elapsed * 0.18) * 0.045;
      ring.rotation.z = elapsed * 0.055;
      ring.rotation.y = Math.PI / 6 + Math.sin(elapsed * 0.22) * 0.08;

      renderer.render(scene, camera);

      if (!prefersReducedMotion) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.cancelAnimationFrame(animationFrame);
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
    />
  );
}
