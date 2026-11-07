"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, BookOpen, Sparkles, ChevronRight, Compass, Award, ShieldCheck } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface CareerComebackPortalProps {
  onStartComeback: () => void;
  onOpenLearningHub: () => void;
  onOpenRoadmap: () => void;
  onOpenPassport: () => void;
}

export function CareerComebackPortal({
  onStartComeback,
  onOpenLearningHub,
  onOpenRoadmap,
  onOpenPassport,
}: CareerComebackPortalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [webglSupported] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      const testCanvas = document.createElement("canvas");
      return !!(testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl"));
    } catch {
      return false;
    }
  });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleMotionChange);

    return () => mediaQuery.removeEventListener("change", handleMotionChange);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || prefersReducedMotion || !webglSupported) return;

    const canvas = canvasRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Scene, Camera, Renderer (Obsidian Black canvas)
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0f0d, 0.08);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.2);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // 2. NOIR BLOOM Lighting Architecture (Sage Green #B6C899, Forest Green #536B58, Champagne Gold #C6AC7D)
    const ambientLight = new THREE.AmbientLight(0x1b231e, 1.3);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xb6c899, 3.2);
    keyLight.position.set(5, 6, 4);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x536b58, 4.2, 15);
    rimLight.position.set(-4, -2, 2);
    scene.add(rimLight);

    const centerGlow = new THREE.PointLight(0xc6ac7d, 2.8, 10);
    centerGlow.position.set(0, 0, -0.5);
    scene.add(centerGlow);

    // 3. Layered Sculptural Portal Geometry
    const portalGroup = new THREE.Group();
    scene.add(portalGroup);

    // Ring Materials (Noir Bloom botanical/metallic tokens)
    const sageMetalMaterial = new THREE.MeshStandardMaterial({
      color: 0xb6c899,
      metalness: 0.85,
      roughness: 0.22,
      envMapIntensity: 1.5,
    });

    const deepMossStoneMaterial = new THREE.MeshStandardMaterial({
      color: 0x1b231e,
      metalness: 0.2,
      roughness: 0.8,
    });

    const champagneBevelMaterial = new THREE.MeshStandardMaterial({
      color: 0xc6ac7d,
      metalness: 0.75,
      roughness: 0.35,
    });

    // Ring 1: Outer Deep Moss Architectural Colonnade Ring
    const outerTorusGeo = new THREE.TorusGeometry(3.0, 0.22, 32, 100);
    const outerRing = new THREE.Mesh(outerTorusGeo, deepMossStoneMaterial);
    portalGroup.add(outerRing);

    // Ring 2: Stepped Concentric Sage Metal Ring
    const midTorusGeo = new THREE.TorusGeometry(2.45, 0.16, 32, 100);
    const midRing = new THREE.Mesh(midTorusGeo, sageMetalMaterial);
    portalGroup.add(midRing);

    // Ring 3: Champagne Gold Sculptural Bevel
    const innerTorusGeo = new THREE.TorusGeometry(1.95, 0.12, 32, 80);
    const innerRing = new THREE.Mesh(innerTorusGeo, champagneBevelMaterial);
    portalGroup.add(innerRing);

    // Ring 4: Radiant Aperture Ring (Warm Ivory with Sage glow)
    const apertureTorusGeo = new THREE.TorusGeometry(1.55, 0.06, 24, 72);
    const apertureRing = new THREE.Mesh(
      apertureTorusGeo,
      new THREE.MeshStandardMaterial({
        color: 0xf5f0e5,
        emissive: 0xb6c899,
        emissiveIntensity: 0.6,
        roughness: 0.1,
      })
    );
    portalGroup.add(apertureRing);

    // 4. Floating Ambient Stardust Particles (Sage Green)
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.2 + Math.random() * 3.5;
      const angle = Math.random() * Math.PI * 2;
      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = Math.sin(angle) * radius;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 4.0;
      particleScales[i] = Math.random() * 0.05 + 0.02;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xb6c899,
      size: 0.035,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMaterial);
    portalGroup.add(particles);

    // 5. Mouse Parallax Variables
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("pointermove", handlePointerMove);

    // 6. GSAP ScrollTrigger Camera Scrubbing
    let trigger: ScrollTrigger | null = null;
    const ctx = gsap.context(() => {
      // Hero entrance reveal
      gsap.fromTo(
        camera.position,
        { z: 9.5 },
        { z: 7.2, duration: 2.2, ease: "power3.out" }
      );

      gsap.fromTo(
        portalGroup.rotation,
        { z: -0.4 },
        { z: 0, duration: 2.5, ease: "power3.out" }
      );

      // Scroll-scrub camera movement through the portal
      if (containerRef.current) {
        trigger = ScrollTrigger.create({
          trigger: containerRef.current,
          start: "top top",
          end: "+=180%",
          pin: true,
          scrub: 1.0,
          onUpdate: (self) => {
            const progress = self.progress;
            // Plunge camera through portal opening
            camera.position.z = 7.2 - progress * 6.2;
            camera.fov = 45 + progress * 25;
            camera.updateProjectionMatrix();

            // Rotate concentric rings in counter-motion
            outerRing.rotation.z = progress * 0.8;
            midRing.rotation.z = -progress * 1.2;
            innerRing.rotation.z = progress * 1.6;
            particles.rotation.z = progress * 0.5;

            // Fade and mask out typography during zoom-through
            if (contentRef.current) {
              const textOpacity = Math.max(0, 1 - progress * 1.8);
              const textTranslate = -progress * 140;
              contentRef.current.style.opacity = `${textOpacity}`;
              contentRef.current.style.transform = `translateY(${textTranslate}px) scale(${
                1 - progress * 0.15
              })`;
            }
          },
        });
      }
    }, containerRef);

    // 7. Render Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth damped mouse parallax
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      portalGroup.rotation.x = currentMouseY * 0.15;
      portalGroup.rotation.y = currentMouseX * 0.2;

      // Subtle ambient pulsation
      outerRing.rotation.z += 0.001;
      midRing.rotation.z -= 0.0018;
      innerRing.rotation.z += 0.0024;
      particles.rotation.y = elapsedTime * 0.03;

      centerGlow.intensity = 2.6 + Math.sin(elapsedTime * 2.5) * 0.4;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Responsive Resize
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (trigger) trigger.kill();
      ctx.revert();
      renderer.dispose();
      outerTorusGeo.dispose();
      midTorusGeo.dispose();
      innerTorusGeo.dispose();
      apertureTorusGeo.dispose();
      sageMetalMaterial.dispose();
      deepMossStoneMaterial.dispose();
      champagneBevelMaterial.dispose();
    };
  }, [prefersReducedMotion]);

  return (
    <section
      ref={containerRef}
      id="home"
      className="relative w-full h-screen overflow-hidden bg-[#0B0F0D] flex items-center justify-center select-none"
    >
      {/* 3D WebGL Canvas or Static Architectural Fallback */}
      {webglSupported && !prefersReducedMotion ? (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          aria-hidden="true"
        />
      ) : (
        /* Static High-End Editorial Architectural Gateway Fallback */
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-40">
          <div className="w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] rounded-full border border-[#344236] shadow-[0_0_120px_rgba(182,200,153,0.12)] flex items-center justify-center">
            <div className="w-[380px] h-[380px] sm:w-[540px] sm:h-[540px] rounded-full border border-[#536B58]/40 flex items-center justify-center">
              <div className="w-[260px] h-[260px] sm:w-[380px] sm:h-[380px] rounded-full border border-[#B6C899]/30 bg-radial from-[#B6C899]/10 to-transparent" />
            </div>
          </div>
        </div>
      )}

      {/* Atmospheric Lighting Overlay Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,transparent_20%,#0B0F0D_90%)] z-1" />

      {/* Hero Typography & Interactive Actions */}
      <div
        ref={contentRef}
        className="relative z-10 max-w-5xl mx-auto px-6 sm:px-10 text-center flex flex-col items-center space-y-6 pt-16 transition-all duration-300"
      >
        {/* Curated Editorial Eyebrow */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#111714]/90 border border-[#344236] backdrop-blur-md shadow-lg animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-[#B6C899] shadow-[0_0_8px_#B6C899]" />
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.24em] text-[#B6C899] font-semibold">
            GFG // CAREER COMEBACK PLATFORM
          </span>
          <span className="text-[10px] text-[#AAB9A9] hidden sm:inline">•</span>
          <span className="text-[10px] font-mono text-[#F5F0E5]/80 hidden sm:inline tracking-wider">
            SCULPTURAL RE-ENTRY GATEWAY
          </span>
        </div>

        {/* Monumental Editorial Headline */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[7.25rem] font-serif font-normal tracking-tight leading-[0.94] text-[#F5F0E5] select-none">
          <span>Not a restart. </span>
          <br />
          <span className="italic text-[#B6C899] font-serif">
            A return to possibility.
          </span>
        </h1>

        {/* Mission Statement */}
        <p className="text-sm sm:text-lg md:text-xl text-[#AAB9A9] max-w-2xl font-light leading-relaxed px-2">
          A career break is not a gap — it is an active phase of life leadership, resilience, and perspective. 
          Step through the gateway to verified skills, personalized AI roadmaps, and dignified opportunities.
        </p>

        {/* Primary Action Buttons (Clickable & Accessible) */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
          <button
            type="button"
            onClick={onStartComeback}
            className="px-8 py-3.5 rounded-full bg-[#B6C899] hover:bg-[#c8d8b0] text-[#0B0F0D] font-semibold text-xs uppercase tracking-widest transition-all shadow-[0_0_25px_rgba(182,200,153,0.35)] hover:scale-[1.03] active:scale-[0.98] flex items-center gap-2"
          >
            <span>Begin Your Journey</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          <button
            type="button"
            onClick={onOpenRoadmap}
            className="px-6 py-3.5 rounded-full bg-[#111714]/90 hover:bg-[#1B231E] border border-[#344236] text-xs font-semibold text-[#F5F0E5] hover:text-[#B6C899] hover:border-[#B6C899]/60 tracking-wider uppercase transition-all backdrop-blur-md flex items-center gap-2"
          >
            <Compass className="w-3.5 h-3.5 text-[#B6C899]" />
            <span>Explore Opportunities</span>
          </button>

          <button
            type="button"
            onClick={onOpenLearningHub}
            className="px-6 py-3.5 rounded-full bg-[#111714]/80 hover:bg-[#1B231E] border border-[#344236] text-xs font-semibold text-[#F5F0E5] hover:text-[#B6C899] tracking-wider uppercase transition-all backdrop-blur-md flex items-center gap-2"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#B6C899]" />
            <span>Learning Hub</span>
          </button>

          <button
            type="button"
            onClick={onOpenPassport}
            className="px-6 py-3.5 rounded-full bg-[#111714]/60 hover:bg-[#1B231E] border border-[#344236] text-xs font-semibold text-[#C6AC7D] hover:border-[#C6AC7D]/60 tracking-wider uppercase transition-all backdrop-blur-md flex items-center gap-2"
          >
            <Award className="w-3.5 h-3.5 text-[#C6AC7D]" />
            <span>Career Passport</span>
          </button>
        </div>

        {/* Scroll Instruction Indicator */}
        <div className="pt-8 flex flex-col items-center gap-1.5 opacity-70 animate-bounce">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#B6C899]">
            Scroll to Enter Portal
          </span>
          <div className="w-4 h-6 rounded-full border border-[#344236] flex justify-center p-1">
            <div className="w-1 h-1.5 rounded-full bg-[#B6C899] animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}
