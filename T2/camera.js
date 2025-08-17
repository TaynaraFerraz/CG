import * as THREE from 'three';
import KeyboardState from '../libs/util/KeyboardState.js'
import { PointerLockControls } from './PointerLockControls.js'
import { Area, enemiesAreas } from './createArea.js';
import { desertArea } from './Area4.js';
import {
    initRenderer,
    initDefaultBasicLight,
    setDefaultMaterial,
    onWindowResize,
    getMaxSize,
} from "../libs/util/util.js";
import { PlayerCollisionHandler } from './PlayerCollisionHandler.js';
import { PLAYER_HEIGHT, PLAYER_WIDTH, SHIFT_MULTIPLIER, SPEED } from './constants.js';
import { Collidables } from './Collidables.js'
import { Key } from './Key.js';
import { ChainGun } from './ChainGun.js';
import { Player } from './Player.js';
import { BulletsCollisionHandler } from './BulletsCollisionHandler.js';
import { CubeTextureLoaderSingleFile } from '../libs/util/cubeTextureLoaderSingleFile.js';
import { Gun } from './Gun.js';

let firstPlay = true;
const clock = new THREE.Clock();
let scene, renderer, camera, cameraHolder, keyboard; 
export let light;
// Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;

renderer.setClearColor(new THREE.Color('black'));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.getElementById("webgl-output").appendChild(renderer.domElement);


keyboard = new KeyboardState();

light = new THREE.DirectionalLight('rgb(255,255,255)', 3);
light.position.set(140.0, 220.0, 120.0);
light.castShadow = true;
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;
light.shadow.camera.near = 0.01;
light.shadow.camera.far = 600;
light.shadow.camera.left = -450;
light.shadow.camera.right = 450;
light.shadow.camera.bottom = -450;
light.shadow.camera.top = 450;
light.shadow.bias = -0.0005;
light.shadow.normalBias = 0.01;
light.shadow.radius = 4;

scene.add(light);

let secondLight;
secondLight = new THREE.HemisphereLight('white', 'darkslategray', 0.8);
secondLight.castShadow = false;

scene.add(secondLight);

export const hangarLight = new THREE.DirectionalLight('rgb(255,255,255)', 1);
hangarLight.position.set(0, 20, 0);
hangarLight.castShadow = true;
scene.add(hangarLight);
hangarLight.visible = false;

const lightCamera = new THREE.OrthographicCamera(
    light.shadow.camera.left,
    light.shadow.camera.right,
    light.shadow.camera.top,
    light.shadow.camera.bottom,
    light.shadow.camera.near,
    light.shadow.camera.far
);
lightCamera.position.copy(light.position);
lightCamera.lookAt(light.target.position);


const shadowCameraHelper = new THREE.CameraHelper(light.shadow.camera);
//scene.add(shadowCameraHelper);

/* window.addEventListener('keydown', (event) => {
    if (event.key === 'h') { // pressione 'h' para alternar
        shadowCameraHelper.visible = !shadowCameraHelper.visible;
    }
}); */

//skybox
let cubeTexture = new CubeTextureLoaderSingleFile().loadSingle('./assets/skybox/skybox.png', 1);

scene.background = cubeTexture;


//inicio da configuração da camera
camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, PLAYER_HEIGHT / 2);
camera.lookAt(new THREE.Vector3(0.0, 1.0, -100.0));


//criando o camera holder
let cameraHolderGeometry = new THREE.CylinderGeometry(PLAYER_WIDTH, PLAYER_WIDTH, PLAYER_HEIGHT);
cameraHolder = new THREE.Mesh(cameraHolderGeometry, Area.lambertMaterial('red'));
cameraHolder.position.set(0, PLAYER_HEIGHT/2, 0);
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
    firstPlaySound();
});

controls.addEventListener('unlock', function () {
    blocker.style.display = 'block';
    instructions.style.display = '';
    crosshair.style.display = 'none'; // Esconde a mira
    firstPlaySound();
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
    firstPlaySound();
    switch (key) {
        case 'p':
        case 80:
            break;
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

Area.createMap(scene, cameraHolder);

//colisores
Collidables.collidables = {
    areas: Area.collidableAreas,
    walls: Area.collidableWalls,
    stairs: Area.collidableStairs
}

enemiesAreas.inimigos = {
    area1: Area.enemiesA1.enemies,
    area2: Area.enemiesA2.enemies,
    area3: Area.enemiesA3.enemies,
    area4: Area.enemiesA4.enemies,
};


let bulletsCollisionHandler = new BulletsCollisionHandler(scene, camera);
let globalPlayer = new Player(scene, cameraHolder, camera, bulletsCollisionHandler, enemiesAreas);
let playerCollisionHandler = new PlayerCollisionHandler(globalPlayer, Collidables.collidables);

window.addEventListener('keydown', (event) => {
    if (event.key === 'h') { // pressione 'h' para alternar
        globalPlayer.damage(50);
        console.log('damage');
    }
    if (event.key === 'l') {
        window.location.reload();
    }
});

globalPlayer.actions(controls)
let inimigosNaArea1 = false
let isOpening = false;

// Listen window size changes
window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);

var listener = new THREE.AudioListener();
camera.add(listener);

let audioLoader = new THREE.AudioLoader();
let doomSoundLoaded = false;
const doomSound = new THREE.PositionalAudio(listener);
audioLoader.load('../0_assetsT3/sounds/doom.mp3', function (buffer) {
    doomSound.setBuffer(buffer);
    doomSound.setLoop(true);
    doomSoundLoaded = true;

});
camera.add(doomSound);

function firstPlaySound() {
    if (firstPlay && doomSoundLoaded) {
        doomSound.play();
        firstPlay = false;
    }
}

render();

function render() {

    // espera carregar os inimigos da area 1 e consequentemente da area 2
    if (!inimigosNaArea1) {
        if (enemiesAreas.inimigos.area1.length == 5) {
            inimigosNaArea1 = true;
        } else {
            requestAnimationFrame(render);
            return;
        }
    }
    //console.log(cameraHolder.getWorldPosition(new THREE.Vector3()))
    if (controls.isLocked) {
        moveAnimate(clock.getDelta());
    }

    globalPlayer.checkArea1(enemiesAreas)
    globalPlayer.checkArea2(enemiesAreas)
    globalPlayer.handlePlayer();
    //lidando com as colisões
    playerCollisionHandler.handleCollisions()

    if (globalPlayer.activeGun instanceof ChainGun && globalPlayer.activeGun.isFiring) {
        globalPlayer.activeGun.spriteUpdate(); // animação do sprite tem que ser no render
    }

    if (Area.updateLighting) {
        Area.updateLighting(cameraHolder.getWorldPosition(new THREE.Vector3()));
    }

    
    //lidando com inimigos
    Area.handleEnemiesArea(cameraHolder);
    enemiesAreas.inimigos = {
        area1: Area.enemiesA1.enemies,
        area2: Area.enemiesA2.enemies,
        area3: Area.enemiesA3.enemies,
        area4: Area.enemiesA4.enemies,
    };

    //paredes da area 4
    Area.area4Walls();
    Area.finalScene(scene, cameraHolder, playerCollisionHandler);

    //animação do objeto do deserto
    desertArea.tumbleweedAnimate();


    globalPlayer.checkArea1(enemiesAreas)
    globalPlayer.checkArea2(enemiesAreas)
    globalPlayer.checkArea3(enemiesAreas)
    globalPlayer.openArea3(cameraHolder)
    globalPlayer.handlePlayer();
    //lidando com as colisões
    playerCollisionHandler.handleCollisions()

    if ((player.activeGun instanceof ChainGun || player.activeGun instanceof Gun) && player.activeGun.isFiring) {
        player.activeGun.spriteUpdate(); // animação do sprite tem que ser no render
    }

    // Render principal
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
    renderer.setScissorTest(true);
    renderer.render(scene, camera);

    // Render da câmera auxiliar no canto esquerdo superior (200x200 px)
    renderer.setViewport(10, window.innerHeight - 210, 200, 200);
    renderer.setScissor(10, window.innerHeight - 210, 200, 200);
    renderer.setScissorTest(true);


    requestAnimationFrame(render);
}

export { scene, camera, globalPlayer, clock };