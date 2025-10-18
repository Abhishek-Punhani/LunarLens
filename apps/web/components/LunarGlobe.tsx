import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CLASSMetadata } from "@/types/class-data";

interface LunarGlobeProps {
  classFiles: CLASSMetadata[];
  onMarkerClick: (metadata: CLASSMetadata) => void;
}

export default function LunarGlobe({
  classFiles,
  onMarkerClick,
}: LunarGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const moonRef = useRef<THREE.Mesh | null>(null);
  const markersRef = useRef<
    Array<{ mesh: THREE.Mesh; metadata: CLASSMetadata }>
  >([]);
  const classFilesRef = useRef(classFiles);
  const onMarkerClickRef = useRef(onMarkerClick);

  const [hoveredMarker, setHoveredMarker] = useState<CLASSMetadata | null>(
    null
  );
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Setup scene once
  useEffect(() => {
    if (!containerRef.current) return;

    const containerElement = containerRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerElement.clientWidth / containerElement.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      containerElement.clientWidth,
      containerElement.clientHeight
    );
    const canvasElement = renderer.domElement;
    containerElement.appendChild(canvasElement);
    rendererRef.current = renderer;

    // OrbitControls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controlsRef.current = controls;

    // Raycaster for click detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      // Check for marker intersections
      const markerMeshes = markersRef.current.map((m) => m.mesh);
      const markerIntersects = raycaster.intersectObjects(markerMeshes);
      if (markerIntersects.length > 0) {
        const intersectedMesh = markerIntersects[0].object as THREE.Mesh;
        const markerData = markersRef.current.find(
          (m) => m.mesh === intersectedMesh
        );
        if (markerData) {
          onMarkerClickRef.current(markerData.metadata);
          return;
        }
      }

      // Check moon surface
      const moonIntersects = raycaster.intersectObject(moonRef.current!);
      if (moonIntersects.length > 0) {
        const point = moonIntersects[0].point;
        // Convert point to lat/lon
        const lat = 90 - (Math.acos(point.y / 2) * 180) / Math.PI;
        const lon = (Math.atan2(point.z, -point.x) * 180) / Math.PI - 180;
        // Find closest file
        let closestFile: CLASSMetadata | null = null;
        let minDist = Infinity;
        classFilesRef.current.forEach((file) => {
          const dist = Math.sqrt(
            (file.boreLat - lat) ** 2 + (file.boreLon - lon) ** 2
          );
          if (dist < minDist) {
            minDist = dist;
            closestFile = file;
          }
        });
        if (closestFile) {
          onMarkerClickRef.current(closestFile);
        }
      }
    };
    renderer.domElement.addEventListener("click", handleClick);

    // Mouse move for hover
    const handleMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      setMousePos({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
      raycaster.setFromCamera(mouse, camera);

      const markerMeshes = markersRef.current.map((m) => m.mesh);
      const markerIntersects = raycaster.intersectObjects(markerMeshes);
      if (markerIntersects.length > 0) {
        const intersectedMesh = markerIntersects[0].object as THREE.Mesh;
        const markerData = markersRef.current.find(
          (m) => m.mesh === intersectedMesh
        );
        if (markerData) {
          setHoveredMarker(markerData.metadata);
          return;
        }
      }
      setHoveredMarker(null);
    };
    renderer.domElement.addEventListener("mousemove", handleMouseMove);

    // Lighting setup
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(-100, 10, 50);
    scene.add(light);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.1);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(0, 0, 0);
    scene.add(hemiLight);

    // Create moon with realistic textures and displacement mapping
    const geometry = new THREE.SphereGeometry(2, 60, 60);
    const textureLoader = new THREE.TextureLoader();

    // Load lunar surface textures
    const texture = textureLoader.load(
      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/17271/lroc_color_poles_1k.jpg"
    );
    const displacementMap = textureLoader.load(
      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/17271/ldem_3_8bit.jpg"
    );

    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      map: texture,
      displacementMap: displacementMap,
      displacementScale: 0.06,
      bumpMap: displacementMap,
      bumpScale: 0.04,
      reflectivity: 0,
      shininess: 0,
    });

    const moon = new THREE.Mesh(geometry, material);
    moon.rotation.x = Math.PI * 0.02;
    moon.rotation.y = Math.PI * 1.54;
    scene.add(moon);
    moonRef.current = moon;

    // Add starfield background sphere
    const worldTexture = textureLoader.load(
      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/17271/hipp8_s.jpg"
    );
    const worldGeometry = new THREE.SphereGeometry(1000, 60, 60);
    const worldMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: worldTexture,
      side: THREE.BackSide,
    });
    const world = new THREE.Mesh(worldGeometry, worldMaterial);
    scene.add(world);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      moon.rotation.y += 0.002;
      moon.rotation.x += 0.0001;
      world.rotation.y += 0.0001;
      world.rotation.x += 0.0005;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current)
        return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("click", handleClick);
      renderer.domElement.removeEventListener("mousemove", handleMouseMove);
      if (containerElement && canvasElement.parentNode === containerElement) {
        containerElement.removeChild(canvasElement);
      }
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // Update markers when classFiles change
  useEffect(() => {
    classFilesRef.current = classFiles;
    onMarkerClickRef.current = onMarkerClick;
    console.log("Updating markers for", classFiles.length, "files");
    if (!sceneRef.current || !moonRef.current) return;

    // Remove old markers
    markersRef.current.forEach(({ mesh }) => {
      moonRef.current?.remove(mesh);
    });
    markersRef.current = [];

    // Add new markers
    classFiles.forEach((file, index) => {
      const lat = file.boreLat;
      const lon = file.boreLon;
      console.log(
        "Adding marker for",
        file.filename,
        "at lat:",
        lat,
        "lon:",
        lon
      );

      // Convert lat/lon to 3D position on sphere
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const radius = 2.02; // Slightly above moon surface (moon radius is 2)

      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      console.log("Marker position:", x, y, z);

      const markerGeometry = new THREE.SphereGeometry(0.08, 16, 16);
      const markerMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL((index * 0.618) % 1, 0.8, 0.6),
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(x, y, z);

      moonRef.current?.add(marker);
      markersRef.current.push({ mesh: marker, metadata: file });
    });
  }, [classFiles, onMarkerClick]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-lg overflow-hidden border border-border relative"
    >
      {hoveredMarker && (
        <div
          className="absolute bg-gray-800 text-white p-3 rounded-lg shadow-xl pointer-events-none z-10 border border-gray-600"
          style={{ left: mousePos.x + 10, top: mousePos.y + 10 }}
        >
          <div className="font-semibold text-blue-400 mb-1">
            {hoveredMarker.filename}
          </div>
          <div className="text-sm text-gray-300">
            Lat:{" "}
            <span className="text-white font-mono">
              {hoveredMarker.boreLat.toFixed(2)}
            </span>
          </div>
          <div className="text-sm text-gray-300">
            Lon:{" "}
            <span className="text-white font-mono">
              {hoveredMarker.boreLon.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
