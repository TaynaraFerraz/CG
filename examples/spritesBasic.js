import * as THREE from 'three';
import KeyboardState from '../libs/util/KeyboardState.js';
import { SpriteMixer } from '../libs/sprites/SpriteMixer.js';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {
   initRenderer,
   initCamera,
   initDefaultBasicLight,
   setDefaultMaterial,
   onWindowResize,
   InfoBox,
   createGroundPlaneXZ
} from "../libs/util/util.js";

let scene, renderer, camera, material, light, orbit; // Initial variables
let clock, delta, keyboard;
let spriteMixer, actionSprite = null, running, lastRunning, runningZ, actions = {};
let parallelMovement = true; // Variable to control parallel movement

scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
material = setDefaultMaterial(); // create a basic material
light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
camera = initCamera(new THREE.Vector3(0, 7, 15)); // Init camera in this position
window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);
scene.add(camera); // Add camera to the scene
orbit = new OrbitControls(camera, renderer.domElement); // Enable mouse rotation, pan, zoom etc.
clock = new THREE.Clock();
keyboard = new KeyboardState();
let up = [1, 1, 1, 1]; // Array to control movement in 4 directions

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper(12);
scene.add(axesHelper);
let axesHelperSprite = new THREE.AxesHelper(1);

// create the ground plane
let plane = createGroundPlaneXZ(20, 20, true)
scene.add(plane);

//-------------------------------------------------------------------
//  SPRITEMIXER RELATED CODE
//-------------------------------------------------------------------

/// ACTIONSPRITE AND ACTIONS INSTANTIATION
spriteMixer = SpriteMixer();

// Make sure to use the texture once it's fully loaded, by
// passing a callback function to the loader.
let loader = new THREE.TextureLoader();
loader.load("../assets/textures/sprites/character.png", (texture) => {

   // An ActionSprite is instantiated with these arguments :
   // - which THREE.Texture to use
   // - the number of columns in your animation
   // - the number of rows in your animation
   actionSprite = spriteMixer.ActionSprite(texture, 10, 2);
   actionSprite.add(axesHelperSprite);
   actionSprite.position.y = 0.65; // Adjust the height of the sprite
   actionSprite.castShadow = true; // Enable shadow for this sprite
   actionSprite.setFrame(9); // set initial frame of the sprite

   // Two actions are created with these arguments :
   // - which actionSprite to use
   // - index of the beginning of the action
   // - index of the end of the action
   // - duration of ONE FRAME in the animation, in milliseconds
   actions.runRight = spriteMixer.Action(actionSprite, 0, 8, 40);
   actions.runLeft = spriteMixer.Action(actionSprite, 10, 18, 40);

   actionSprite.scale.set(1.7, 2, 1);
   scene.add(actionSprite);
});

showInformation();
render();

function render() {
   keyboardUpdate();
   spriteUpdate();

   requestAnimationFrame(render);
   renderer.render(scene, camera) // Render scene
}

// Update sprite position 
function spriteUpdate() {
   delta = clock.getDelta();
   spriteMixer.update(delta);

   if (running == 'right')     actionSprite.translateX(0.05);
   else if (running == 'left') actionSprite.translateX(-0.05);

   if (runningZ == 'up')        actionSprite.translateZ(-0.05);
   else if (runningZ == 'down') actionSprite.translateZ(0.05);

   // Rotate the action sprite local axes to face the camera
   if (actionSprite) {
      if(parallelMovement)
      {
         const euler = new THREE.Euler(); // Converter o quaternion da câmera para Euler
         euler.setFromQuaternion(camera.quaternion, 'YXZ'); // Acerta ordem da transformação    
         actionSprite.rotation.y = euler.y; // Copia rotação para o sprite para mantê-lo perpendicular à camera
      }else{
         actionSprite.rotation.y = 0;
      }
   }
}   

function keyboardUpdate() {
   keyboard.update();

   if (keyboard.down("A")) axesHelperSprite.visible = !axesHelperSprite.visible; // Toggle axes visibility
   if (keyboard.down("P")) parallelMovement = !parallelMovement; // Toggle parallel movement

   if (keyboard.down("left")) {
      up[0] = 0;
      if (running != 'left') {
         actions.runLeft.playLoop();
         lastRunning = running = 'left';
      }
   };

   if (keyboard.down("right")) {
      up[1] = 0;
      if (running != 'right') {
         actions.runRight.playLoop();
         lastRunning = running = 'right';
      };
   }

   if (keyboard.down("up")) {
      up[2] = 0;
      if (runningZ != 'up') {
         // Se o último movimento foi para a esquerda, continua com a animação para este lado
         if (lastRunning == 'left') 
            actions.runLeft.playLoop();
         else
            actions.runRight.playLoop();
         runningZ = 'up';
      }
   };

   if (keyboard.down("down")) {
      up[3] = 0;
      if (runningZ != 'down') {
         // Se o último movimento foi para a esquerda, continua com a animação para este lado        
         if (lastRunning == 'left')
            actions.runLeft.playLoop();
         else
            actions.runRight.playLoop();
         runningZ = 'down';
      }
   }

   // Atualiza o vetor up, que controla se o sprite está se movendo para os lados ou para cima/baixo
   if (keyboard.up("left"))  up[0] = 1;
   if (keyboard.up("right")) up[1] = 1;
   if (keyboard.up("up"))    up[2] = 1;
   if (keyboard.up("down"))  up[3] = 1;

   // Atualiza as variáveis de movimento
   if(up[0] && up[1]) running  = undefined
   if(up[2] && up[3]) runningZ = undefined   

   if (up[0] && up[1] && up[2] && up[3] && actionSprite) {
      if (running != undefined) {
         lastRunning = running;
      }
      if (lastRunning == 'left') {
         actionSprite.setFrame(19);
      } else {
         actionSprite.setFrame(9);
      };
      running = undefined;
      runningZ = undefined;
   }
}

function showInformation()
{
  // Use this to show information onscreen
  var controls = new InfoBox();
    controls.add("Sprite Example");
    controls.addParagraph();
    controls.add("Press 'A' to toggle Sprite's Axis Helper");
    controls.add("Press 'P' to set/unset paralell sprite movements");    
    controls.add("Press arrow keys to move the sprite");
    controls.show();
}