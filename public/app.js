import {
	BoxGeometry,
	CylinderGeometry,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	Scene,
	TextureLoader,
	Raycaster,
	Vector2,
	Vector3,
	WebGLRenderer,
} from 'three';

import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';

import { Body, Plane, NaiveBroadphase, Vec3, Cylinder, World  } from 'cannon-es';

// ... (rest of the code)


// Variables
const scene = new Scene();
const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const textureURL = "https://raw.githubusercontent.com/balancer/assets/master/assets/0x30cf203b48edaa42c3b4918e955fed26cd012a3f.png"; 


const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add OutlineEffect
const effect = new OutlineEffect(renderer);
effect.setSize(window.innerWidth, window.innerHeight);

// Raycaster and mouse
const raycaster = new Raycaster();
const mouse = new Vector2();

// Mouse move event listener
window.addEventListener("mousemove", (event) => {
  event.preventDefault();

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Physics
const world = new World();
world.gravity.set(0, -9.82, 0);
world.broadphase = new NaiveBroadphase();
world.solver.iterations = 10;

// Ground
const groundShape = new Plane();
const groundBody = new Body({ mass: 0, shape: groundShape });
groundBody.quaternion.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2);
world.addBody(groundBody);

// Load texture
const textureLoader = new TextureLoader();
fetch('/transactions/erc20')
  .then((response) => response.json())
  .then((tokens) => {
    const coins = [];
    const coinBodies = [];

    tokens.forEach((token) => {
      const textureURL = token.image;

      textureLoader.load(textureURL, (texture) => {
        const geometry = new CylinderGeometry(1, 1, 0.1, 100);
        const material = new MeshBasicMaterial({ map: texture });
        const coin = new Mesh(geometry, material);

        const coinBody = new Body({
          mass: 1,
          shape: new Cylinder(1, 1, 0.1, 100),
          position: new Vec3(Math.random() * 10 - 5, 1, Math.random() * 10 - 5),
          velocity: new Vec3(Math.random() * 5 - 2.5, Math.random() * 10, Math.random() * 5 - 2.5),
        });

        world.addBody(coinBody);
        coinBodies.push(coinBody);

        coin.position.copy(coinBody.position);
        scene.add(coin);
        coins.push(coin);
      });
    });

  camera.position.set(0, 10, 20);
  camera.lookAt(new Vector3(0, 1, 0));

  // Animation
  const animate = function () {
    requestAnimationFrame(animate);
    
    const dt = 1 / 60;
    world.step(dt);

    for (let i = 0; i < coins.length; i++) {
      coins[i].position.copy(coinBodies[i].position);
      coins[i].quaternion.copy(coinBodies[i].quaternion);
    }

    renderer.render(scene, camera);
    
    raycaster.setFromCamera(mouse, camera);
    
     // Find intersected objects
    const intersects = raycaster.intersectObjects(coins);
  
    // Reset outline for all coins
    coins.forEach((coin) => {
      coin.userData.outline = false;
    });
  
    // Apply outline to intersected objects
    if (intersects.length > 0) {
      intersects[0].object.userData.outline = true;
    }
  
    // Update outline effect
    effect.render(scene, camera);

    
  };

  animate();
});
