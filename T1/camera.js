import * as THREE from 'three';
import Stats from '../build/jsm/libs/stats.module.js';
import KeyboardState from '../libs/util/KeyboardState.js'
import { PointerLockControls } from '../build/jsm/controls/PointerLockControls.js'
import { Area } from './createArea.js';
import {
    initRenderer,
    initCamera,
    initDefaultBasicLight,
    setDefaultMaterial,
    InfoBox,
    onWindowResize,
    createGroundPlaneXZ,
    createGroundPlane
} from "../libs/util/util.js";
import { PlayerCollisionHandler } from './PlayerCollisionHandler.js';
import { Box3 } from '../build/three.module.js';
import { Sphere } from './BulletsCollisionHandler.js';

const spheres = [];

let scene, renderer, camera, cameraHolder, material, light, keyboard; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
material = setDefaultMaterial(); // create a basic material
light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
keyboard = new KeyboardState();

//inicio da configuração da camera
camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.lookAt(new THREE.Vector3(0.0, 1.0, -100.0));
camera.position.set(0, 17.5, 0);

// adicionar luz diferente para teste

// Camera Holder invisível
cameraHolder = new THREE.Object3D();
cameraHolder.position.set(0, 2, 5);
cameraHolder.add(camera);
scene.add(cameraHolder);

// Arma (cilindro)
const armaGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 32);
const arma = new THREE.Mesh(armaGeometry, material);
arma.rotateX(Math.PI / 2);
//arma.rotateY(THREE.MathUtils.degToRad(90))
arma.position.set(0, -0.5, -0.5); // direita, baixo, frente
camera.add(arma);

const controls = new PointerLockControls(cameraHolder, renderer.domElement);

const blocker = document.getElementById('blocker');
const instructions = document.getElementById('instructions');
const crosshair = document.getElementById('crosshair');

//controlam se o mouse está travado ou não
instructions.addEventListener('click', function () {

    controls.lock();

}, false);

//controlam a notificação de que o mouse está travado ou não
controls.addEventListener('lock', function () {
    instructions.style.display = 'none';
    blocker.style.display = 'none';
    crosshair.style.display = 'block'; // Mostra a mira
});

controls.addEventListener('unlock', function () {
    blocker.style.display = 'block';
    instructions.style.display = '';
    crosshair.style.display = 'none'; // Esconde a mira
});

scene.add(controls.getObject());

//auxiliares para a movimentação
const speed = 20;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

//melhorar isso aqui
window.addEventListener('keydown', (event) => movementControls(event.keyCode, true));
window.addEventListener('keyup', (event) => movementControls(event.keyCode, false));

//mapeia as teclas para os movimentos
function movementControls(key, value) {
    switch (key) {
        case 87: // W
            moveForward = value;
            break;
        case 83: // S
            moveBackward = value;
            break;
        case 65: // A
            moveLeft = value;
            break;
        case 68: // D
            moveRight = value;
            break;
    }
}

//realiza a movimentação utilizando metodos do PointerLockControls
function moveAnimate(delta) {
    if (moveForward) {
        controls.moveForward(speed * delta);
    }
    else if (moveBackward) {
        controls.moveForward(speed * -1 * delta);
    }

    if (moveRight) {
        controls.moveRight(speed * delta);
    }
    else if (moveLeft) {
        controls.moveRight(speed * -1 * delta);
    }
}

//testeMashs()
Area.createMap(scene);

//colisores

/* let collidables = scene.children.map((child) => {
    let boundingBox = new THREE.Box3();
    boundingBox.setFromObject(child);
    return boundingBox;
}) */
let collidables = {
    areas: Area.collidableAreas,
    walls: Area.collidableWalls,
    floor: Area.collidableFloor
}
let playerCollisionHandler = new PlayerCollisionHandler(scene, cameraHolder, collidables);


// Listen window size changes
window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);

const clock = new THREE.Clock();

render();

function keyboardUpdate() {
    keyboard.update();
    if (keyboard.down("space")) {  //A função pressed retorna true enquanto a tecla estiver segurada, o que pode ser dezenas de frames (ou seja, gera vários disparos muito rápidos).Já a função down retorna true só uma vez no frame em que a tecla foi pressionada, evitando múltiplas bolinhas criadas.
        
        const armaMundo = new THREE.Vector3();
        arma.getWorldPosition(armaMundo); // pega as coordenadas globais da arma
        
        console.log(armaMundo, 'arma')
        
        const novaSphere = new Sphere(scene, armaMundo, camera);
        spheres.push(novaSphere);

        console.log(spheres.length)
    }

}

function checkCollisionSphere(){
    for (let i = spheres.length - 1; i >= 0; i--) {
        const s = spheres[i];
        s.update();
        const boundingSphere = new THREE.Sphere(s.sphere.position.clone(), 0.2);
        let collided = false;
        
        for(const area of collidables.areas){
            if(area.box.intersectsSphere(boundingSphere)){
                collided = true;
                console.log("colidiu com a area")
                break;
            }
        }
        
        if(!collided){
            for(const wall of collidables.walls){
                console.log(collidables.walls)
                if(wall.box.intersectsSphere(boundingSphere)){
                    console.log("colidiu com a parede")
                    collided = true;
                    break;
                }
            }
        }

        if(!collided){
            for(const floor of collidables.floor){
                console.log(collidables.floor)
                if(floor.box.intersectsSphere(boundingSphere)){
                    console.log("colidiu com o chão")
                    collided = true;
                    break;
                }
            }
        }
        
        if(collided){
            s.remove(scene)
            spheres.splice(i, 1)
        }
        console.log(spheres.length)
    }
}

function render() {
    if (controls.isLocked) {
        moveAnimate(clock.getDelta());
    }

    keyboardUpdate()
    checkCollisionSphere()

    //lidando com as colisões
    playerCollisionHandler.handleCollisions();

    requestAnimationFrame(render);
    renderer.render(scene, camera) // Render scene
}