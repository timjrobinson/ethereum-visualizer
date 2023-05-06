// Variables
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const textureURL = "https://raw.githubusercontent.com/balancer/assets/master/assets/0x30cf203b48edaa42c3b4918e955fed26cd012a3f.png"; 

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// Physics
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);
world.broadphase = new CANNON.NaiveBroadphase();
world.solver.iterations = 10;

// Ground
const groundShape = new CANNON.Plane();
const groundBody = new CANNON.Body({ mass: 0, shape: groundShape });
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
world.addBody(groundBody);

// Load texture
const textureLoader = new THREE.TextureLoader();
fetch('/transactions/erc20')
  .then((response) => response.json())
  .then((tokens) => {
    const coins = [];
    const coinBodies = [];

    tokens.forEach((token) => {
      const textureURL = token.image;

      textureLoader.load(textureURL, (texture) => {
        const geometry = new THREE.CylinderGeometry(1, 1, 0.1, 100);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const coin = new THREE.Mesh(geometry, material);

        const coinBody = new CANNON.Body({
          mass: 1,
          shape: new CANNON.Cylinder(1, 1, 0.1, 100),
          position: new CANNON.Vec3(Math.random() * 10 - 5, 1, Math.random() * 10 - 5),
          velocity: new CANNON.Vec3(Math.random() * 5 - 2.5, Math.random() * 10, Math.random() * 5 - 2.5),
        });

        world.addBody(coinBody);
        coinBodies.push(coinBody);

        coin.position.copy(coinBody.position);
        scene.add(coin);
        coins.push(coin);
      });
    });

  camera.position.set(0, 10, 20);
  camera.lookAt(new THREE.Vector3(0, 1, 0));

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
  };

  animate();
});
