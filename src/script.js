import './style.css'
import * as THREE from 'three'
// import * as dat from 'lil-gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
Shery.mouseFollower();

function inet(){
    gsap.registerPlugin(ScrollTrigger);
    const locoScroll = new LocomotiveScroll({
      el: document.querySelector("#main"),
      smooth: true
    });
    locoScroll.on("scroll", ScrollTrigger.update);
    
    ScrollTrigger.scrollerProxy("#main", {
      scrollTop(value) {
        return arguments.length ? locoScroll.scrollTo(value, 0, 0) : locoScroll.scroll.instance.scroll.y;
      }, 
        getBoundingClientRect() {
        return {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight};
      },
      pinType: document.querySelector("#main").style.transform ? "transform" : "fixed"
    });
    
    }
    
    inet();
    const totalItems = 12;
    const loadingManager = new THREE.LoadingManager(
       // Loaded
    () =>
      {
          // Wait a little
          window.setTimeout(() =>
              {
                console.log("loaded");
  
          }, 1000)
  
        
      },
  
      // Progress
      (itemUrl, itemsLoaded, itemsTotal) =>
      {
       console.log(itemsLoaded,itemsTotal);
        const progressRatio = itemsLoaded / totalItems;
        const progressPercentage =( (itemsLoaded / totalItems) * 100).toFixed();
        console.log(progressRatio, progressPercentage);
    
        // loadingBarElement.style.width = `${progressPercentage}%`;
        //  loadingBarElementh2.textContent = progressPercentage + "%"
      }
  )
// Texture loading
const textureLoader = new THREE.TextureLoader(loadingManager);
const floorterrain = textureLoader.load('/textures/terrain-normal.jpg');
const floorrough = textureLoader.load('/textures/terrain-roughness.jpg');
const cubetexture = new THREE.CubeTextureLoader(loadingManager);
const env = cubetexture.load([
    '/textures/environmentMaps/0/px.jpg',
    '/textures/environmentMaps/0/nx.jpg',
    '/textures/environmentMaps/0/py.jpg',
    '/textures/environmentMaps/0/ny.jpg',
    '/textures/environmentMaps/0/pz.jpg',
    '/textures/environmentMaps/0/nz.jpg',
]);

// GLTF and DRACO loading
const dracoLoader = new DRACOLoader(loadingManager);
dracoLoader.setDecoderPath('/draco/');
dracoLoader.setDecoderConfig({ type: 'wasm', url: '/draco/draco_decoder.wasm' });
const gltfLoader = new GLTFLoader(loadingManager);
gltfLoader.setDRACOLoader(dracoLoader);

// Base settings
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();
const sizes = { width: window.innerWidth, height: window.innerHeight };
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 70;
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true,});
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
// env.encoding = THREE.sRGBEncoding
renderer.shadowMap.enabled = true;
renderer.toneMappingExposure = 3    
renderer.setClearColor('#111')

const fog = new THREE.Fog('#111',50,130)
scene.fog = fog

// const gui = new dat.GUI({ width: 400, height: 400, scale: 2 });
// const Debugobj = { intensity: 1 };
// gui.add(Debugobj, 'intensity').max(10).min(1).step(1).name('intensityEnvMap').onChange(updateMaterial);
// gui.add(renderer, 'toneMapping', {
//     No: THREE.NoToneMapping,
//     Linaer: THREE.LinearToneMapping,
//     Reinhard: THREE.ReinhardToneMapping,
//     cineon: THREE.CineonToneMapping,
//     ACESFilmicg: THREE.ACESFilmicToneMapping,
// });

// Lighting
const directionlight = new THREE.DirectionalLight('#ffffff',15)
directionlight.position.set(-5.763,90,-2.25)
scene.add(directionlight)

directionlight.castShadow = true;
directionlight.shadow.mapSize.width = 2048; // Adjust as necessary
directionlight.shadow.mapSize.height = 2048;

directionlight.shadow.camera.left = -50;
directionlight.shadow.camera.right = 50;
directionlight.shadow.camera.top = 50;
directionlight.shadow.camera.bottom = -50;
directionlight.shadow.camera.near = 0.5;
directionlight.shadow.camera.far = 500;
const DirectionalLightHelper = new THREE.DirectionalLightHelper(directionlight,0.2)
// scene.add(DirectionalLightHelper)
// gui.add(directionlight,'intensity').min(0).max(25).step(0.001).name('lightIntensity')
// gui.add(directionlight.position,'x').min(-50).max(50).step(0.001).name('lightX')
// gui.add(directionlight.position,'y').min(-50).max(50).step(0.001).name('lightY')
// gui.add(directionlight.position,'z').min(-50).max(50).step(0.001).name('lightZ')
const ambientLight = new THREE.AmbientLight('#b9d5ff', 0.12)
// gui.add(ambientLight, 'intensity').min(0).max(10).step(0.001)
scene.add(ambientLight)


// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 400),
    new THREE.MeshStandardMaterial({ 
        color: '#111',
        normalMap:floorterrain,
        roughnessMap:floorrough,
        roughness: 0.8, // Lower value makes it shinier
        metalness: 1, // Higher value gives a metallic look
     })
)
floor.geometry.setAttribute(
  'uv2',
  new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array,2)
)
floorrough.repeat.set(2,2)
floorterrain.repeat.set(5,5)
floor.receiveShadow = true; 

floorterrain.wrapS = THREE.RepeatWrapping
floorrough.wrapT = THREE.RepeatWrapping

floor.rotation.x = - Math.PI * 0.5
floor.position.y = -12.5
scene.add(floor)




let model;
// Load model
let carPaintMesh = null;
let tyreMeshes = [];
gltfLoader.load('/models/scene.glb', (gltf) => {
  
  model = gltf.scene
   
    model.scale.set(25, 25, 25);
    model.position.set(0, 0, 0);
    model.rotation.y = Math.PI / 2;
    scene.add(model);
    adjustModelForScreen()
//     // gui.add(model.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.001).name('Rotation');
//     // gui.add(model.position, 'x').min(0).max(100).step(0.001).name('Rotation');
//     // gui.add(model.position, 'y').min(0).max(100).step(0.001).name('Rotation');
//     // gui.add(model.position, 'z').min(0).max(100).step(0.001).name('Rotation');
//     // gui.add(model.scale, 'x').min(0).max(100).step(0.001).name('Rotation');
//     // gui.add(model.scale, 'y').min(0).max(100).step(0.001).name('Rotation');
//     // gui.add(model.scale, 'z').min(0).max(100).step(0.001).name('Rotation');
   
    updateMaterial();
});


// Global variables
let currentModel = null;

// Function to load models
function loadModel(modelPath) {
    // If there's a model already loaded, remove it from the scene
    if (currentModel) {
        scene.remove(currentModel);
        currentModel.traverse((child) => {
            if (child.isMesh) {
                child.geometry.dispose();
                child.material.dispose();
            }
        });
    }

    // Load the new model
    gltfLoader.load(modelPath, (gltf) => {
        currentModel = gltf.scene;
        currentModel.scale.set(25, 25, 25);
        currentModel.position.set(0, 0, 0);
        currentModel.rotation.y = Math.PI / 2;
        scene.add(currentModel);
        adjustModelForScreen(); // Adjust the model for screen size
        updateMaterial(); // Update materials for the new model
    });
}

// Load the default model initially
loadModel('/models/scene2.glb');

// Button event listeners to load different models
// document.getElementById('button1').addEventListener('click', () => {
//     loadModel('/models/hamburger.glb');
// });

// document.getElementById('button2').addEventListener('click', () => {
//     loadModel('/models/scene.glb');
// });

// document.getElementById('button3').addEventListener('click', () => {
//     loadModel('/models/model3.glb');
// });



function adjustModelForScreen() {
  if (model) {
      const aspectRatio = window.matchMedia("(max-width: 768px)").matches
      if (aspectRatio) { // Portrait mode
          model.scale.set(13, 13, 13)
          model.position.set(0, -4, 0)
      } else { // Landscape mode
          model.scale.set(25, 25, 25)
      }
  } 
}

let wasMobile = sizes.width <= 768;
function refreshPageIfNeeded() {
  const isMobile = window.innerWidth <= 768;

  // Check if the viewport crossed the mobile threshold
  if (isMobile !== wasMobile) {
      location.reload(); // Reload the page
  }

  wasMobile = isMobile;
}


refreshPageIfNeeded();


// Update material
function updateMaterial() {
    scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            child.material.envMap = env;
            // child.material.envMapIntensity = Debugobj.intensity;
            child.castShadow = true;
            child.receiveShadow = true;
        }
        if (child.isMesh && child.material.name === 'EXT_Carpaint.004') {
            carPaintMesh = child;
            carPaintMesh.material.color.set('white');
        }
    }); 
}

const controls = new OrbitControls(camera, canvas)


// // Restrict vertical rotation (phi) to limit top and bottom views
controls.minPolarAngle = Math.PI / 2.6; // 45 degrees
controls.maxPolarAngle = Math.PI / 2.6;
controls.enableZoom = false;
// Optionally, set damping factor for smoothness
controls.dampingFactor = 0.25; 
controls.enableDamping = true
function changeCarPaintColor(color) {
    if (carPaintMesh) {
        carPaintMesh.material.color.set(color);
    }
}

const clock = new THREE.Clock();
// Animate
function animate() {

  controls.update();
  const elapsedTime = clock.getElapsedTime();
  // const radius = 65; // Radius of the circular path
  // const speed = 0.1; // Speed of the camera revolution
  // const angle = elapsedTime * speed; // Calculate the angle based on elapsed time
  
  // camera.position.x = radius * Math.cos(angle);
  // camera.position.z = radius * Math.sin(angle);
  // camera.lookAt(0, 0, 0);
  if(model){
    floor.rotation.z = elapsedTime * 0.2
    model.rotation.y = elapsedTime * 0.2
  }
  if(currentModel){
    floor.rotation.z = elapsedTime * 0.2
    currentModel.rotation.y = elapsedTime * 0.2
  }
   // Look at the center where the car is
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

// Resize handling
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    refreshPageIfNeeded();
    adjustModelForScreen()
});

const colors = ['#FFCC00', '#CC0033', 'black', '#A4C4B8', '#00194B', '#333333','red'];
let currentColorIndex = 0;

function autoChangeColor() {
    if (carPaintMesh) {
        currentColorIndex = (currentColorIndex + 1) % colors.length;
        carPaintMesh.material.color.set(colors[currentColorIndex]);
    }
}

setInterval(autoChangeColor, 10000);

// Color change buttons
document.querySelectorAll('button[data-color]').forEach(button => {
    button.addEventListener('click', () => {
        changeCarPaintColor(button.getAttribute('data-color'));
        clearInterval(autoChangeColor);
    });
});



