import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';





// 3D Model Setup

// Create the scene
let cena = new THREE.Scene();

let misturador = new THREE.AnimationMixer(cena);
let acaoLongArm = null;
let acaoSupportJoint = null;
let acaoShortArm = null;
let lightIntensity = 5;

// Renderer
let myCanvas = document.getElementById('myCanvas');
let renderer = new THREE.WebGLRenderer({ canvas: myCanvas });
// const sizes = {
//     width: 992,
//     height: 744
// };

// Set world background color
// const pmremGenerator = new THREE.PMREMGenerator( renderer );

// const hdriLoader = new RGBELoader()
// hdriLoader.load( 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/wildflower_field_4k.hdr', function ( texture ) {
//   const envMap = pmremGenerator.fromEquirectangular( texture ).texture;
//   texture.dispose(); 
//   scene.environment = envMap
// } );


let width = 800;
let height = 600;

// Get the parent container's height (assuming the parent is fully rendered)

// Get the element with the ID 'image1'
let elementOfCarousel = document.querySelector('#image1');

// Get the actual rendered width and height of the element
function getActualRenderedWidthAndHeight(element) {
    let boundingBox = element.getBoundingClientRect();
    let height = boundingBox.height;
    let width = ((800 / 600) * height);
    //set to int both values
    height = parseInt(height, 10);
    width = parseInt(width, 10);
    return {
        width: width,
        height: height
    };
}

//set height and width of the renderer according to the actual rendered width and height of the element
({ width, height } = getActualRenderedWidthAndHeight(elementOfCarousel));
renderer.setSize(width, height);

//Always update the size based on the current boundingBox
window.addEventListener('resize', () => {
    // Get the actual rendered width and height of the element
    ({ width, height } = getActualRenderedWidthAndHeight(elementOfCarousel));

    renderer.setSize(width, height);
});

// Set background to gray
cena.background = new THREE.Color('white');



// // Main camera (fallback if no cameras are loaded from GLB)
// const camera2 = new THREE.PerspectiveCamera(
//     60,  // fov
//     2,   // aspect
//     0.1, // near
//     500, // far
// );
// camera2.position.set(68930.7, 7235.89, 13912.9);
// camera2.rotation.set(63.219, 0., 42.0166);
// camera2.scale.set(100, 100, 100);
// cena.add(camera2);



let luzPonto = new THREE.AmbientLight('white', 0.15);
luzPonto.position.set(0, 20, 0);
cena.add(luzPonto);

// Camera management
let camera = new THREE.PerspectiveCamera(60, 800/600, 0.1, 500);
camera.position.set(-18, 5, 5);
let cameras = [];
let lights = [];
let activeCameraIndex = 0;

// const controls2 = new OrbitControls(camera, renderer.domElement);
// controls2.update();


// GLTF loader
let carregador = new GLTFLoader();
carregador.load('./3d_module/Candeeiro.glb', function (glb) {
    // Add the scene from the GLB to your main scene
    cena.add(glb.scene);

    // Position the lamp in the center and higher
    glb.scene.position.set(0, -1, -4);

    // Extract animations
    let clipe1 = THREE.AnimationClip.findByName(glb.animations, 'LongArmRotation');
    acaoLongArm = misturador.clipAction(clipe1);
    acaoLongArm.play();
    acaoLongArm.paused = true;
    acaoLongArm.time = clipe1.duration * 0.5; // Start at 50%

    let clipe2 = THREE.AnimationClip.findByName(glb.animations, 'SupportJointRotation');
    acaoSupportJoint = misturador.clipAction(clipe2);
    acaoSupportJoint.play();
    acaoSupportJoint.paused = true;
    acaoSupportJoint.time = clipe2.duration * 0.5; // Start at 50%

    let clipe3 = THREE.AnimationClip.findByName(glb.animations, 'ShortArmRotation');
    acaoShortArm = misturador.clipAction(clipe3);
    acaoShortArm.play();
    acaoShortArm.paused = true;
    acaoShortArm.time = clipe3.duration * 0.5; // Start at 50%

    misturador.update(0); // Force update mixer to reflect initial state

    // Extract cameras from the GLB file
    if (glb.cameras && glb.cameras.length > 0) {
        cameras = glb.cameras;
        // Set the first camera as the active camera
        //camera = cameras.filter(c => c.name === 'CameraRight')[0];

    }
    // Find the object with the name "Abajur"
    let objectPosition = null;

    glb.scene.traverse(child => {
        if (child.name === 'Cube') {
            objectPosition = {
                x: child.position.x,
                y: child.position.y,
                z: child.position.z
            };
        }
    });


    if (cameras.length > 0) {
        // camera.far = ;
        // camera.near = ;
        //camera.scale = 2;
        // camera.zoom = 1;
        // camera.fov = 60;
        // camera.rotateX(0.5);
        //look at the object
        //Use the object position to alter lookAt in all cameras
        cameras.forEach(camera => {
            camera.aspect = width / height;
            camera.lookAt(objectPosition.x, objectPosition.y, objectPosition.z);
            camera.updateProjectionMatrix();
        });
        camera.updateProjectionMatrix();
    }

    // Extract lights from the scene
    glb.scene.traverse(child => {
        if (child.isLight) {
            lights.push(child);
        }
    });

    lights.forEach(light => {
        light.intensity = lightIntensity;
    });

    console.log('GLB Loaded:', glb);
});

//camera position of array [0]
// camera.position.set(object.position.x, object.position.y, object.position.z + 5);

// Event listener to switch cameras
window.addEventListener('keydown', (event) => {
    if (event.key === 'c' && cameras.length > 0) {
        // Cycle through available cameras
        activeCameraIndex = (activeCameraIndex + 1) % cameras.length;
        camera = cameras[activeCameraIndex];
        console.log(`Switched to camera: ${camera.name}`);
    }
});

// Link sliders to animations
let sliderLongArm = document.getElementById('slider_long_arm');
let sliderSupportJoint = document.getElementById('slider_support_joint');
let sliderShortArm = document.getElementById('slider_short_arm');

// Define the effective frame range in seconds
const fps = 24; // Assuming 24 FPS, adjust if needed
const longArmStart = 40 / fps; // Start frame in seconds
const longArmEnd = 135 / fps;  // End frame in seconds
const longArmDuration = longArmEnd - longArmStart; // Effective duration

// Update slider for Long Arm Rotation
sliderLongArm.addEventListener('input', function () {
    if (acaoLongArm) {
        let normalizedValue = parseFloat(this.value); // Value between 0.25 and 0.75
        // Remap normalized slider value to effective range
        let mappedTime = longArmStart + (normalizedValue - 0.25) / 0.5 * longArmDuration;
        acaoLongArm.time = mappedTime;
        misturador.update(0); // Force update the animation mixer
    }
});

// Slider for Support Joint Rotation
sliderSupportJoint.addEventListener('input', function () {
    if (acaoSupportJoint) {
        let duration = acaoSupportJoint.getClip().duration;
        acaoSupportJoint.time = parseFloat(this.value) * duration;
        misturador.update(0);
    }
});

// Slider for Short Arm Rotation
sliderShortArm.addEventListener('input', function () {
    if (acaoShortArm) {
        let duration = acaoShortArm.getClip().duration;
        acaoShortArm.time = parseFloat(this.value) * duration;
        misturador.update(0);
    }
});




// Reset All Button - Switching Material Here
document.getElementById('btn_reset_all').addEventListener('click', function () {
    
    // Reset animations
    if (acaoLongArm) {
        acaoLongArm.paused = true;
        acaoLongArm.time = acaoLongArm.getClip().duration * 0.5; // Reset to middle
        sliderLongArm.value = 0.5; // Reset slider to middle
    }

    if (acaoSupportJoint) {
        acaoSupportJoint.paused = true;
        acaoSupportJoint.time = acaoSupportJoint.getClip().duration * 0.5; // Reset to middle
        sliderSupportJoint.value = 0.5; // Reset slider to middle
    }

    if (acaoShortArm) {
        acaoShortArm.paused = true;
        acaoShortArm.time = acaoShortArm.getClip().duration * 0.5; // Reset to middle
        sliderShortArm.value = 0.5; // Reset slider to middle
    }

    // Switch material on reset
    //currentMaterial = (currentMaterial === materialWood) ? materialMetal : materialWood; // Toggle between materials

    // Apply the new material to all meshes
    cena.traverse((child) => {
        if (child.isMesh) {
            child.material = currentMaterial;
        }
    });

    // Force update the animation mixer
    misturador.update(0);
});

// Update slider positions dynamically during animation playback
function updateSliders() {
    if (acaoLongArm && !acaoLongArm.paused) {
        let duration = acaoLongArm.getClip().duration;
        sliderLongArm.value = acaoLongArm.time / duration; // Normalize time
    }

    if (acaoSupportJoint && !acaoSupportJoint.paused) {
        let duration = acaoSupportJoint.getClip().duration;
        sliderSupportJoint.value = acaoSupportJoint.time / duration; // Normalize time
    }

    if (acaoShortArm && !acaoShortArm.paused) {
        let duration = acaoShortArm.getClip().duration;
        sliderShortArm.value = acaoShortArm.time / duration; // Normalize time
    }
}

// Render and animate
let delta = 0;
let relogio = new THREE.Clock();
let latencia_minima = 1 / 60;

function animar() {
    requestAnimationFrame(animar);

    delta += relogio.getDelta();
    if (delta < latencia_minima) {
        return;
    }
    const excedente = delta % latencia_minima;
    const latenciaDiscreta = delta - excedente;

    // Update the mixer for animations
    misturador.update(latenciaDiscreta);

    // Update sliders dynamically
    updateSliders();

    // Render the scene
    renderer.render(cena, camera);
    delta = excedente;
}

animar(); // Start the animation loop

// Functions Setup
document.addEventListener("DOMContentLoaded", () => {
    // Select the buttons, input fields, and the reset button for the animations section
    const inputButtons = document.querySelectorAll('#animations .buttons-on-model');
    const inputFields = document.querySelectorAll('#animations .input-animation');
    const reset_button = document.getElementById('btn_reset_all');
    
    // Select the buttons and input fields for the lights section
    const inputFieldsLights = document.querySelectorAll('#lighting .input-lighting');
    const inputButtonsLights = document.querySelectorAll('#lighting .buttons-on-model');

    // Input visibility functionality for animations based on button clicks
    inputButtons.forEach((button, index) => {
      button.addEventListener('click', () => {
        // Remove 'active' class from all inputs in the animation section
        inputFields.forEach(input => input.classList.remove('active'));

        // Add 'active' class to the corresponding input based on button index
        inputFields[index].classList.add('active');
        
        // Add 'selected-button' class to the clicked button for visual feedback
        inputButtons.forEach(btn => btn.classList.remove('selected-button'));
        button.classList.add('selected-button');
      });
    });

    // Input visibility functionality for lighting based on button clicks
    inputButtonsLights.forEach((button, index) => {
      button.addEventListener('click', () => {
        // Remove 'active' class from all inputs in the lighting section
        inputFieldsLights.forEach(input => input.classList.remove('active'));

        // Add 'active' class to the corresponding input based on button index
        inputFieldsLights[index].classList.add('active');
        
        // Add 'selected-button' class to the clicked button for visual feedback
        inputButtonsLights.forEach(btn => btn.classList.remove('selected-button'));
        button.classList.add('selected-button');
      });
    });

    // Reset button functionality for both sections
    if (reset_button) {
      reset_button.addEventListener('click', () => {
        // Remove the 'active' class from all input fields in both sections
        inputFields.forEach(input => input.classList.remove('active'));
        inputButtons.forEach(btn => btn.classList.remove('selected-button'));
        
        inputFieldsLights.forEach(input => input.classList.remove('active'));
        inputButtonsLights.forEach(btn => btn.classList.remove('selected-button'));

        // Reset the slider values to their minimum value
        inputFields.forEach(input => {
          input.value = input.min;  // Reset to minimum value (0.25 as per your range setup)
        });

        inputFieldsLights.forEach(input => {
          input.value = input.min;  // Reset to minimum value (0.25 as per your range setup)
        });

        // Reset lights intensities in the scene if needed
        lights.forEach(light => {
          light.intensity = lightIntensity; // Set lights intensity back to default (1)
        });
      });
    }

    // Adjust light intensity based on input slider in the lighting section
    inputFieldsLights.forEach((input, index) => {
      input.addEventListener('input', () => {
        if (lights[index]) {
          // Update light intensity in the scene
          lights[index].intensity = parseFloat(input.value);
          console.log(`Light ${index + 1} intensity: ${lights[index].intensity}`);
        }
      });
    });
  });
