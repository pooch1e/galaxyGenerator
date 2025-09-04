import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

//raycaster helper
const raycaster = new THREE.Raycaster();
const mouseVector = new THREE.Vector2();
const mouseWorldPosition = new THREE.Vector3();

// Scene
const scene = new THREE.Scene();

const parameters = {
  count: 1000,
  size: 0.02,
  radius: 5,
  branches: 2,
  spin: 1,
  randomness: 0.2,
  randomnessPower: 3,
  gravity: 1,
  gravityPower: 1,
  insideColor: '#f6030',
  outsideColor: '#1b3984',
};

/**
 * Create Galaxy
 */

//hoist variables otherwise will generate stacking galaxies
let geometry = null;
let material = null;
let points = null;

// const mouse = {
//   x: 0,
//   y: 0,
// };

window.addEventListener('mousemove', (e) => {
  mouseVector.x = (e.clientX / sizes.width) * 2 - 1;
  mouseVector.y = -(e.clientY / sizes.height) * 2 + 1;

  // project into world space at Z=0 plane
  raycaster.setFromCamera(mouseVector, camera);
  const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  raycaster.ray.intersectPlane(planeZ, mouseWorldPosition);
});

console.log(mouseVector.x, mouseVector.y);

const createGalaxy = () => {
  // Destroy old galaxy
  if (points !== null) {
    geometry.dispose();
    material.dispose();
    scene.remove(points);
  }

  //create basic galaxy

  geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);

  const colorInside = new THREE.Color(parameters.insideColor);
  const colorOutside = new THREE.Color(parameters.outsideColor);
  //colors
  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;
    const radius = Math.random() * parameters.radius;
    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / parameters.radius);
    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  //radial
  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;

    const radius = Math.random() * parameters.radius;

    positions[i3] = radius;
    positions[i3 + 1] = 0;
    positions[i3 + 2] = 0;
  }

  //branches
  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;

    const radius = Math.random() * parameters.radius;
    const spinAngle = radius * parameters.spin;
    const branchAngle =
      ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

    //randomness
    //create random value for each axis
    const randomX =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius;
    const randomY =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius;
    const randomZ =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius;
    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = 0 + randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  // Material
  material = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  //points
  points = new THREE.Points(geometry, material);
  scene.add(points);
};
createGalaxy();

gui
  .add(parameters, 'count')
  .min(100)
  .max(100000)
  .step(100)
  .onFinishChange(createGalaxy);
gui
  .add(parameters, 'size')
  .min(0.001)
  .max(0.1)
  .step(0.001)
  .onFinishChange(createGalaxy);

gui
  .add(parameters, 'radius')
  .min(0.01)
  .max(20)
  .step(0.01)
  .onFinishChange(createGalaxy);
gui
  .add(parameters, 'branches')
  .min(2)
  .max(20)
  .step(1)
  .onFinishChange(createGalaxy);
gui
  .add(parameters, 'spin')
  .min(-5)
  .max(5)
  .step(0.001)
  .onFinishChange(createGalaxy);

gui
  .add(parameters, 'randomness')
  .min(0.2)
  .max(1)
  .step(0.1)
  .onFinishChange(createGalaxy);

gui
  .add(parameters, 'randomnessPower')
  .min(1)
  .max(10)
  .step(0.001)
  .onFinishChange(createGalaxy);

gui.addColor(parameters, 'insideColor').onFinishChange(createGalaxy);
gui.addColor(parameters, 'outsideColor').onFinishChange(createGalaxy);
gui
  .add(parameters, 'gravity')
  .min(0.1)
  .max(5)
  .step(0.01)
  .onFinishChange(createGalaxy);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const velocities = new Float32Array(parameters.count * 3);
const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  if (geometry) {
    const positions = geometry.attributes.position.array;

    for (let i = 0; i < parameters.count; i++) {
      const i3 = i * 3;

      // current particle position
      const px = positions[i3];
      const py = positions[i3 + 1];
      const pz = positions[i3 + 2];

      // direction vector from particle → mouse
      const dx = mouseWorldPosition.x - px;
      const dy = mouseWorldPosition.y - py;
      const dz = mouseWorldPosition.z - pz;
      const distSq = dx * dx + dy * dy + dz * dz;

      // simple gravity strength
      const force = parameters.gravity / (distSq + 0.1);

      // apply "acceleration"
      velocities[i3] += dx * force * 0.01;
      velocities[i3 + 1] += dy * force * 0.01;
      velocities[i3 + 2] += dz * force * 0.01;

      velocities[i3] *= 0.95;
      velocities[i3 + 1] *= 0.95;
      velocities[i3 + 2] *= 0.95;

      // update particle position
      positions[i3] += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];
    }
  }

  geometry.attributes.position.needsUpdate = true;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
