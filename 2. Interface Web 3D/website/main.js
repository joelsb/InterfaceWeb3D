/*
Free-form shape animation: 
    Consiste na interpolação de duas versões da mesma geometria de um objeto (por 
exemplo, uma bandeira que voa sob o efeito de vento). A modificação da forma realiza-se através da alteração 
da posição dos vértices da malha. 

3D morphing: 
    Interpolação de dois modelos diferentes. Animação de todos os pontos de um objeto até às 
posições ocupadas pelos pontos do outro objeto (exemplo, um rosto a transformar-se num cisne). 

*/

import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

// create a scene, that will hold all our elements such as objects, cameras and lights.
const scene = new THREE.Scene();
// create a camera, which defines where we're looking at
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
// tell the camera where to look
camera.position.set(6, 4, 7);
// create a render and set the size
const sizes = {
    width: 800,
    height: 600
}
//render in the id="meuCanvas" and set sizes
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('meuCanvas') });
renderer.setClearColor(0xffffff); 
renderer.setSize(sizes.width, sizes.height);

//Create a clock for the animation

//Create a mixer
let mixer = new THREE.AnimationMixer(scene);

//Add the blender file
let loader = new GLTFLoader()
let animations = []
loader.load(
    'flag.gltf',
    function (gltf) {
        scene.add(gltf.scene)
        gltf.animations.forEach((clip) => {
            let action = mixer.clipAction(clip)
            animations.push(action)
        })
    }
)

//Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);

//Creat a point of light
const light = new THREE.PointLight("white");
light.position.set(5, 3, 0);
light.intensity = 50;
//Oriente the light to the center
scene.add(light);

//Creat a new point of light
const light2 = new THREE.PointLight("white");
light2.position.set(-5, 3, 0);
light2.intensity = 50;
//Oriente the light to the center
scene.add(light2);

//Visual Auxiliar
const LightHelper1 = new THREE.PointLightHelper(light, 0.2)
scene.add(LightHelper1)

const LightHelper2 = new THREE.PointLightHelper(light2, 0.2)
scene.add(LightHelper2)


//Add shadows
// light.castShadow = true;
// renderer.shadowMap.enabled = true;


//Get button 
/*  
<button id="btn_play">Play</button>
<button id="btn_pause">Pause</button>
<button id="btn_stop">Stop</button> 
*/

//Is the animation playing?
let isPlaying = false
//Play button
document.getElementById('btn_play').addEventListener('click', () => {
    animations.forEach((action) => {
        if (action.paused) {
            action.paused = false
        }
        action.play()
    })
})

//Pause button
document.getElementById('btn_pause').addEventListener('click', () => {
    animations.forEach((action) => {
        console.log(action.paused)
        if (!action.paused) {
            action.paused = true
        }
    })
})

//Stop button
document.getElementById('btn_stop').addEventListener('click', () => {
    animations.forEach((action) => {
        action.stop(); // Stop the animation
    })
})


let delta = 0; // tempo desde a última frame
let clock = new THREE.Clock()
let min_latence = 1 / 60; // tempo mínimo entre cada frame
// function for re-rendering/animating the scene
function tick() {
    requestAnimationFrame(tick);

    delta += clock.getDelta(); // acumula tempo que passou desde a ultima chamada de getDelta
    // não exceder a taxa de atualizações definida
    if (delta < min_latence) return;

    mixer.update(Math.floor(delta / min_latence) * min_latence); // atualizar animações
    renderer.render(scene, camera)

    // atualizar delta com o excedente
    delta = delta % min_latence;
}
tick();