"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Loader2 } from "lucide-react";

interface Mascot3DProps {
  modelUrl?: string;
  className?: string;
}

export function Mascot3D({
  modelUrl = "https://a9resu5y3s.ufs.sh/f/2VAGtFpfmpZTRlUy0kj8vnI3bWiFAlL2YazyJSCHsgR7fdjo",
  className = "w-full h-[260px] sm:h-[300px]",
}: Mascot3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;
    let isDisposed = false;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup - centered squarely with comfortable field of view
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 4.0);
    camera.lookAt(0, 0, 0);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 4. Lighting setup (Clay / Inflatable studio illumination)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.2);
    dirLight1.position.set(4, 6, 4);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xdceeff, 1.3);
    dirLight2.position.set(-4, -2, -3);
    scene.add(dirLight2);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xdceeff, 1.2);
    scene.add(hemiLight);

    // 5. Pivot group to decouple model centering from world position and animation
    const pivotGroup = new THREE.Group();
    // Default lower position so head is never cut off
    pivotGroup.position.set(0, -0.16, 0);
    scene.add(pivotGroup);

    // 6. Load 3D Model directly from remote URL (No local download)
    const loader = new GLTFLoader();
    let isLoaded = false;

    loader.load(
      modelUrl,
      (gltf) => {
        if (isDisposed) return;
        setLoading(false);

        const model = gltf.scene;

        // Auto-center inner model relative to pivot
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        model.position.x = -center.x;
        model.position.y = -center.y;
        model.position.z = -center.z;

        // Scale to fit viewport with generous headroom (1.8 scale gives breathing room)
        const maxAxis = Math.max(size.x, size.y, size.z);
        const targetScale = 1.8 / (maxAxis || 1);
        pivotGroup.scale.setScalar(targetScale);

        // Material smoothness
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.needsUpdate = true;
            }
          }
        });

        pivotGroup.add(model);
        isLoaded = true;
      },
      undefined,
      (err) => {
        console.error("Failed to load remote 3D model:", err);
        if (!isDisposed) {
          setError("Failed to load 3D model");
          setLoading(false);
        }
      }
    );

    // 7. Animation Loop (Continuous 360-degree rotation + gentle breathing float at lower Y)
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      if (isLoaded) {
        // Continuous smooth rotation
        pivotGroup.rotation.y = elapsedTime * 0.75;

        // Subtle gentle breathing / floating motion anchored at lower Y position
        pivotGroup.position.y = -0.16 + Math.sin(elapsedTime * 1.8) * 0.04;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 8. Handle Resize
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // 9. Cleanup
    return () => {
      isDisposed = true;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      renderer.dispose();
      scene.clear();
    };
  }, [modelUrl]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-carbon">
          <Loader2 className="size-6 animate-spin text-carbon" />
          <span className="text-xs font-bold tracking-[0.032em] text-carbon/80">
            Loading 3D Mascot...
          </span>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-ember">
          {error}
        </div>
      )}

      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
}
