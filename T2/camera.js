import * as THREE from 'three';
import KeyboardState from '../libs/util/KeyboardState.js'
import { PointerLockControls } from './PointerLockControls.js'
import { Area } from './createArea.js';
import {
    initRenderer,
    initDefaultBasicLight,
    setDefaultMaterial,
    onWindowResize,
} from "../libs/util/util.js";
import { PlayerCollisionHandler } from './PlayerCollisionHandler.js';
import { BulletsCollisionHandler } from './BulletsCollisionHandler.js';
import { PLAYER_HEIGHT, PLAYER_WIDTH, SHIFT_MULTIPLIER, SPEED } from './constants.js';

const clock = new THREE.Clock();
let scene, renderer, camera, cameraHolder, light, keyboard; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;

renderer.setClearColor(new THREE.Color('black'));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.getElementById("webgl-output").appendChild(renderer.domElement);

//light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
keyboard = new KeyboardState();

light = new THREE.DirectionalLight('rgb(255,255,255)', 3);
light.position.set(140.0, 200.0, 120.0);
light.castShadow = true;
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;
light.shadow.camera.near = 0.1;
light.shadow.camera.far = 600;
light.shadow.camera.left = -500;
light.shadow.camera.right = 500;
light.shadow.camera.bottom = -500;
light.shadow.camera.top = 500;
light.shadow.bias = -0.0005;
light.shadow.radius = 4;

scene.add(light);

let secondLight;

secondLight = new THREE.DirectionalLight('rgb(255,255,255)', 0.5);
secondLight.position.set(-140.0, 100.0, -120.0);
secondLight.castShadow = true;
secondLight.shadow.mapSize.width = 1024;
secondLight.shadow.mapSize.height = 1024;
secondLight.shadow.camera.near = 0.1;
secondLight.shadow.camera.far = 600;
secondLight.shadow.camera.left = -500;
secondLight.shadow.camera.right = 500;
secondLight.shadow.camera.bottom = -500;
secondLight.shadow.camera.top = 500;
secondLight.shadow.bias = -0.0005;
secondLight.shadow.radius = 4;

scene.add(secondLight);

const shadowCameraHelper = new THREE.CameraHelper(light.shadow.camera);
scene.add(shadowCameraHelper);

window.addEventListener('keydown', (event) => {
    if (event.key === 'h') { // pressione 'h' para alternar
        shadowCameraHelper.visible = !shadowCameraHelper.visible;
    }
});

//inicio da configuração da camera
camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, PLAYER_HEIGHT / 2, 0);
camera.lookAt(new THREE.Vector3(0.0, 1.0, -100.0));

// Arma (cilindro)
const armaGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 32);
const arma = new THREE.Mesh(armaGeometry, Area.lambertMaterial('#3b3b3b'));
arma.rotateX(Math.PI / 2);

arma.position.set(0, -0.1, -0.1); // direita, baixo, frente

camera.add(arma);


//criando o camera holder
let cameraHolderGeometry = new THREE.CylinderGeometry(PLAYER_WIDTH, PLAYER_WIDTH, PLAYER_HEIGHT);
cameraHolder = new THREE.Mesh(cameraHolderGeometry, Area.lambertMaterial('red'));
cameraHolder.position.set(-0, PLAYER_HEIGHT+8, -0);

cameraHolder.add(camera);


//inicializando o PointerLockControls customizado
const controls = new PointerLockControls(cameraHolder, camera, renderer.domElement);

//elementos de interface
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
let shift = false;
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
        case 16: // SHIFT
            shift = value;
            break;
        case 87: // W
        case 38: // Seta pra cima
            moveForward = value;
            break;
        case 83: // S
        case 40: // Seta pra baixo
            moveBackward = value;
            break;
        case 65: // A
        case 37: // Seta pra esquerda
            moveLeft = value;
            break;
        case 68: // D
        case 39: // Seta pra direita
            moveRight = value;
            break;
        }
}

//realiza a movimentação utilizando metodos do PointerLockControls
function moveAnimate(delta) {
    let moveSpeed = shift ? SHIFT_MULTIPLIER * SPEED * delta : SPEED * delta;
    
    if (moveForward) {
        controls.moveForward(moveSpeed);
    }
    else if (moveBackward) {
        controls.moveForward(-moveSpeed);
    }

    if (moveRight) {
        controls.moveRight(moveSpeed);
    }
    else if (moveLeft) {
        controls.moveRight(-moveSpeed);
    }
}

//testeMashs()
Area.createMap(scene);

//funções e intervalo para o sistema de disparo
let shoot = false
let intervalShoot;

function shootBall() {
    let armaMundo = new THREE.Vector3();
    arma.getWorldPosition(armaMundo); // pega as coordenadas globais da arma

    let worldPosition = new THREE.Vector3();
    camera.getWorldPosition(worldPosition)

    //const novaSphere = new Sphere(scene, armaMundo, camera);
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 16);
    const materialSphere = Area.lambertMaterial('#7a7a7a');
    let sphere = new THREE.Mesh(sphereGeometry, materialSphere);

    sphere.position.copy(armaMundo);

    scene.add(sphere);
    bulletsCollisionHandler.addSphere(sphere); // instancia ou inves de armazenar a mesh
}

document.addEventListener('mousedown', (event) => {
    if (!controls.isLocked) return; // jogador não está no jogo ainda
    // event.button === 0 -> botão esquerdo, event.button === 2 -> botão direito
    if (event.button !== 0 && event.button !== 2) return;

    if (!shoot) {
        shoot = true;
        shootBall();
        intervalShoot = setInterval(shootBall, 500);
    }
});

document.addEventListener('mouseup', (event) => {
    if (event.button !== 0 && event.button !== 2) return;

    // Para o disparo contínuo
    shoot = false;
    clearInterval(intervalShoot);
});

//colisores
let collidables = {
    areas: Area.collidableAreas,
    walls: Area.collidableWalls,
    stairs: Area.collidableStairs
}
let playerCollisionHandler = new PlayerCollisionHandler(cameraHolder, collidables);
let bulletsCollisionHandler = new BulletsCollisionHandler(scene, camera);

// Listen window size changes
window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);


render();

var movimentoCompleto = true;

function render() {
    if (controls.isLocked) {
        moveAnimate(clock.getDelta());
    }

    //TODO: colocar algo para verificar se a função pode ou não ser executada
    Area.primeiroAltar();
    Area.doorDown();
    Area.segundoAltar();
    bulletsCollisionHandler.handleBulletsCollisions(collidables)

    //lidando com as colisões
    playerCollisionHandler.handleCollisions();

    requestAnimationFrame(render);
    renderer.render(scene, camera) // Render scene
}