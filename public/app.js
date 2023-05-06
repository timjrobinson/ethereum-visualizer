// Variables
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load texture
const textureLoader = new THREE.TextureLoader();
const textureURL = "https://raw.githubusercontent.com/balancer/assets/master/assets/0x30cf203b48edaa42c3b4918e955fed26cd012a3f.png"; // Replace with your texture URL
textureLoader.load(textureURL, function (texture) {
  // Coin-like object
  const geometry = new THREE.CylinderGeometry(1, 1, 0.1, 100);
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const coin = new THREE.Mesh(geometry, material);
  scene.add(coin);

  camera.position.z = 5;

  // Animation
  const animate = function () {
    requestAnimationFrame(animate);

    coin.rotation.x += 0.01;
    coin.rotation.y += 0.01;

    renderer.render(scene, camera);
  };

  animate();
});
