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
import { PLAYER_HEIGHT, PLAYER_WIDTH, SHIFT_MULTIPLIER, SPEED } from './constants.js';
import { Key} from './Key.js';
import { ChainGun } from './ChainGun.js';
import { Player } from './Player.js';
import { Collidables } from './Collidables.js';

const clock = new THREE.Clock();
let scene, renderer, camera, cameraHolder, material, light, keyboard; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
material = setDefaultMaterial(); // create a basic material
light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
keyboard = new KeyboardState();

//inicio da configuração da camera
camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, PLAYER_HEIGHT / 2, 0);
camera.lookAt(new THREE.Vector3(0.0, 1.0, -100.0));

//criando o camera holder
let cameraHolderGeometry = new THREE.CylinderGeometry(PLAYER_WIDTH, PLAYER_WIDTH, PLAYER_HEIGHT);
cameraHolder = new THREE.Mesh(cameraHolderGeometry, material);
cameraHolder.position.set(-120, PLAYER_HEIGHT + 5, -120);
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
Area.createMap(scene);

//colisores
Collidables.collidables = {
    areas: Area.collidableAreas,
    walls: Area.collidableWalls,
    stairs: Area.collidableStairs
}

let player = new Player(scene, cameraHolder, camera);
let playerCollisionHandler = new PlayerCollisionHandler(player.object, Collidables.collidables);
let initialKey = new Key(scene, "rgb(223, 47, 47)"); // fazer um controle para aparecer apenas quando matar os inimigos

player.actions(controls)

// Listen window size changes
window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);
render();

function render() {
    if (controls.isLocked) {
        moveAnimate(clock.getDelta());
    }

    player.handlePlayer();
    player.addKey(initialKey)

    //lidando com as colisões
    playerCollisionHandler.handleCollisions();

    if (player.activeGun instanceof ChainGun) {
        player.activeGun.spriteUpdate(); // animação do sprite tem que ser no render
    }

    requestAnimationFrame(render);
    renderer.render(scene, camera) // Render scene
}