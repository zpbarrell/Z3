import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function initializeCarViewer(element: HTMLElement): () => void {
  const stage = element.querySelector<HTMLElement>('.car-stage')!;
  const status = element.querySelector<HTMLElement>('.car-status')!;
  const toolbar = element.querySelector<HTMLElement>('.car-controls')!;
  const rotateButton = element.querySelector<HTMLButtonElement>('[data-action="rotate"]')!;
  const resetButton = element.querySelector<HTMLButtonElement>('[data-action="reset"]')!;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    element.dataset.state = 'error';
    status.textContent = '3D viewing is unavailable on this device.';
    return () => {};
  }

  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0x17191b, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  stage.append(renderer.domElement);
  renderer.domElement.tabIndex = 0;
  renderer.domElement.setAttribute('aria-label', 'BMW Z3 3D view');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.01, 100);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.maxPolarAngle = Math.PI / 2;
  controls.minPolarAngle = 0.15;
  controls.autoRotateSpeed = 0.6;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x707784, 2.5));
  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(4, 6, 3);
  scene.add(light);

  let model: THREE.Group | undefined;
  let alive = true;
  let loaded = false;
  let frame = 0;
  let lastTime = 0;
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();

  function setRotation(rotate: boolean) {
    controls.autoRotate = rotate;
    rotateButton.setAttribute('aria-pressed', String(rotate));
    rotateButton.setAttribute('aria-label', rotate ? 'Pause rotation' : 'Start rotation');
    rotateButton.title = rotate ? 'Pause rotation' : 'Start rotation';
  }

  function fitCamera() {
    const vertical = THREE.MathUtils.degToRad(camera.fov);
    const horizontal = 2 * Math.atan(Math.tan(vertical / 2) * camera.aspect);
    const radius = size.length() / 2;
    const distance = radius / Math.sin(Math.min(vertical, horizontal) / 2) * 1.08;
    camera.position.copy(new THREE.Vector3(1, 0.45, 1).normalize().multiplyScalar(distance));
    controls.target.set(0, 0, 0);
    controls.minDistance = radius * 1.1;
    controls.maxDistance = distance * 2.5;
    camera.far = distance * 10;
    camera.updateProjectionMatrix();
    controls.update();
    controls.saveState();
  }

  function resize() {
    const { width, height } = stage.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    if (loaded) fitCamera();
  }

  function animate(time: number) {
    frame = requestAnimationFrame(animate);
    const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.1) : 0;
    lastTime = time;
    if (document.hidden || !loaded) return;
    controls.update(delta);
    renderer.render(scene, camera);
  }

  function disposeModel(group: THREE.Group) {
    const textures = new Set<THREE.Texture>();
    group.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.geometry.dispose();
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        for (const value of Object.values(material)) {
          if (value instanceof THREE.Texture) textures.add(value);
        }
        material.dispose();
      }
    });
    textures.forEach((texture) => texture.dispose());
  }

  const observer = new ResizeObserver(resize);
  observer.observe(stage);
  resize();
  frame = requestAnimationFrame(animate);

  new GLTFLoader().load('/models/bmw-z3-cabriolet/car-web.glb', (gltf) => {
    if (!alive) {
      disposeModel(gltf.scene);
      return;
    }
    model = gltf.scene;
    const bounds = new THREE.Box3().setFromObject(model);
    bounds.getSize(size);
    bounds.getCenter(center);
    model.position.sub(center);
    scene.add(model);
    loaded = true;
    fitCamera();
    setRotation(!motion.matches);
    status.hidden = true;
    toolbar.hidden = false;
    element.dataset.state = 'ready';
  }, undefined, (error) => {
    if (!alive) return;
    console.error('Car model failed to load:', error);
    status.textContent = 'The car model could not be loaded.';
    element.dataset.state = 'error';
  });

  const stopRotation = () => setRotation(false);
  const toggleRotation = () => setRotation(!controls.autoRotate);
  const resetView = () => { setRotation(false); controls.reset(); };
  const motionChanged = () => { if (motion.matches) setRotation(false); };
  const keyPressed = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      setRotation(false);
      const offset = camera.position.clone().sub(controls.target);
      offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), event.key === 'ArrowLeft' ? 0.15 : -0.15);
      camera.position.copy(controls.target).add(offset);
    }
  };
  controls.addEventListener('start', stopRotation);
  rotateButton.addEventListener('click', toggleRotation);
  resetButton.addEventListener('click', resetView);
  renderer.domElement.addEventListener('keydown', keyPressed);
  motion.addEventListener('change', motionChanged);

  return () => {
    alive = false;
    cancelAnimationFrame(frame);
    observer.disconnect();
    controls.removeEventListener('start', stopRotation);
    controls.dispose();
    rotateButton.removeEventListener('click', toggleRotation);
    resetButton.removeEventListener('click', resetView);
    renderer.domElement.removeEventListener('keydown', keyPressed);
    motion.removeEventListener('change', motionChanged);
    if (model) disposeModel(model);
    renderer.dispose();
    renderer.domElement.remove();
  };
}