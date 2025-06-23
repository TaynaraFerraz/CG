import * as THREE from  'three';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ} from "../libs/util/util.js";
import { GLTFLoader } from '../build/jsm/loaders/GLTFLoader.js';

let scene, renderer, camera, material, light, orbit; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
material = setDefaultMaterial(); // create a basic material
light = initDefaultBasicLight(scene, true, new THREE.Vector3(0, 8, 10)); 
orbit = new OrbitControls( camera, renderer.domElement ); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

// create the ground plane
let plane = createGroundPlaneXZ(20, 20)
plane.receiveShadow = true;
scene.add(plane);

loadGLBFile('../assets/objects/', 'toontank', true, 1.2);

// Use this to show information onscreen
let controls = new InfoBox();
  controls.add("Basic Scene");
  controls.addParagraph();
  controls.add("Use mouse to interact:");
  controls.add("* Left button to rotate");
  controls.add("* Right button to translate (pan)");
  controls.add("* Scroll to zoom in/out.");
  controls.show();

render();

function loadGLBFile(modelPath, modelName, visibility, desiredScale)
{
   var loader = new GLTFLoader( );
   loader.load( modelPath + modelName + '.glb', function ( gltf ) {
      var obj = gltf.scene;
      obj.name = modelName;
      obj.visible = visibility;
      obj.traverse( function ( child ) {
         if( child.isMesh ) child.castShadow = true;
         if( child.material ) child.material.side = THREE.DoubleSide;         
      });

    //   var obj = normalizeAndRescale(obj, desiredScale);
    //   var obj = fixPosition(obj);

      scene.add ( obj );
      //assetManager[modelName] = obj;        
    });
}

function render()
{
  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}