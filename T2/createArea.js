import * as THREE from 'three';
import {
  setDefaultMaterial
} from "../libs/util/util.js";

import { PLAYER_HEIGHT, PLAYER_WIDTH, SHIFT_MULTIPLIER, SPEED } from './constants.js';
import { EnemiesHandler } from './EnemiesHandler.js';
import { MTLLoader } from '../build/jsm/loaders/MTLLoader.js';
import { OBJLoader } from '../build/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from '../build/jsm/loaders/GLTFLoader.js';
import { desertArea } from './Area4.js';

const applyTexturesToCube = (cube, paramsVec) => {
  paramsVec.forEach(({ texture, normalMap, x, y, offsetX = 0, offsetY = 0 }, i) => {
    const texCopy = new THREE.Texture().copy(texture);
    console.log(cube.map);

    cube.material[i].map = texCopy;
    if (normalMap) {
      const texNormalCopy = new THREE.Texture().copy(normalMap);
      cube.material[i].normalMap = texNormalCopy;
      texNormalCopy.repeat.set(x, y);
      texNormalCopy.offset.set(offsetX, offsetY);
    }
    texCopy.repeat.set(x, y);
    texCopy.offset.set(offsetX, offsetY);
  })
}

const generateCubeMaterials = (type = "lambert", params) => {
  switch (type) {
    case "lambert":
      return [
        new THREE.MeshLambertMaterial(params),
        new THREE.MeshLambertMaterial(params),
        new THREE.MeshLambertMaterial(params),
        new THREE.MeshLambertMaterial(params),
        new THREE.MeshLambertMaterial(params),
        new THREE.MeshLambertMaterial(params),
      ];

    case "phong":
      return [
        new THREE.MeshPhongMaterial(params),
        new THREE.MeshPhongMaterial(params),
        new THREE.MeshPhongMaterial(params),
        new THREE.MeshPhongMaterial(params),
        new THREE.MeshPhongMaterial(params),
        new THREE.MeshPhongMaterial(params),
      ];
    default:
      break;
  }
}

export class Area {
  static collidableAreas = [];
  static collidableWalls = [];
  static collidableStairs = [];
  static altares = [];
  static elevador = [];
  static door = [];
  static agroArea = [];
  static elevadorCheck;
  static isDown = false;
  static enemiesA1;
  static enemiesA2;
  static enemiesA3;
  static enemiesA4;

  static createMap(scene, player) {
    let positions = [];
    this.enemiesA1 = new EnemiesHandler(scene, player, 5, () => {
      enemiesAreas.inimigos.area1 = []
      console.log("Área 1 limpa. Inimigos removidos.");
    });
    this.enemiesA2 = new EnemiesHandler(scene, player, 3, () => {
      enemiesAreas.inimigos.area2 = [];
      console.log("Área 2 limpa. Inimigos removidos.");
    });
    this.enemiesA3 = new EnemiesHandler(scene, player);
    this.enemiesA4 = new EnemiesHandler(scene, player);

    this.createTerrain(scene);
    this.createAreaPilars(scene);
    this.createAreaCubes(scene);

    desertArea.createAreaDesert(scene, this.collidableAreas, this.collidableStairs);
  }

  static createAreaPilars(scene) {
    const textureLoader = new THREE.TextureLoader();
    this.enemiesA1.addEnemy('lostsoul', new THREE.Vector3(-130.0, 5.0, -130.0));
    this.enemiesA1.addEnemy('lostsoul', new THREE.Vector3(-130.0, 5.0, -180.0));
    this.enemiesA1.addEnemy('lostsoul', new THREE.Vector3(-150.0, 5.0, -150.0));
    this.enemiesA1.addEnemy('lostsoul', new THREE.Vector3(-200.0, 5.0, -170.0));
    this.enemiesA1.addEnemy('lostsoul', new THREE.Vector3(-190.0, 5.0, -140.0));
    let position = new THREE.Vector3(-160.0, 2.0, -162.0);
    let height = 4.0;
    let length = 120.0;
    let leftLength = 20.0;
    let rightLength = 75.0;

    let mainCubeMaterials = generateCubeMaterials();

    let leftFrontCubeMaterials = generateCubeMaterials();

    let rightFrontCubeMaterials = generateCubeMaterials();

    //cubo principal
    let cubeGeometry = new THREE.BoxGeometry(length, height, 116.0);
    let cube = new THREE.Mesh(cubeGeometry, mainCubeMaterials);
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.position.copy(position);

    let boxCube = new THREE.Box3().setFromObject(cube, true);
    this.collidableAreas.push({ box: boxCube, mesh: cube });
    scene.add(cube);

    let cubeGeometry2 = new THREE.BoxGeometry(leftLength, height, 4.0);
    let cubeLeft = new THREE.Mesh(cubeGeometry2, leftFrontCubeMaterials);
    cubeLeft.position.set(-(length - leftLength) / 2, 0.0, 60.0);
    cubeLeft.castShadow = true;
    cubeLeft.receiveShadow = true;
    cube.add(cubeLeft);

    let cubeGeometry3 = new THREE.BoxGeometry(rightLength, height, 4.0);
    let cubeRight = new THREE.Mesh(cubeGeometry3, rightFrontCubeMaterials);
    cubeRight.position.set((length - rightLength) / 2, 0.0, 60.0);
    cubeRight.castShadow = true;
    cubeRight.receiveShadow = true;
    cube.add(cubeRight);

    //iniciando texturas bloco principal
    const sandyGroundTexture = textureLoader.load('./assets/textures/a1/forest_ground.jpg');
    const sandyGroundNormal = textureLoader.load('./assets/textures/a1/forest_ground_normal.jpg');
    sandyGroundTexture.wrapS = THREE.RepeatWrapping;
    sandyGroundTexture.wrapT = THREE.RepeatWrapping;

    sandyGroundNormal.wrapS = THREE.RepeatWrapping;
    sandyGroundNormal.wrapT = THREE.RepeatWrapping;

    const stoneBrickWall = textureLoader.load('./assets/textures/a1/stone_brick_wall.jpg');
    const stoneBrickWallNormal = textureLoader.load('./assets/textures/a1/stone_brick_wall_normal.jpg');
    stoneBrickWall.wrapS = THREE.RepeatWrapping;
    stoneBrickWall.wrapT = THREE.RepeatWrapping;

    stoneBrickWallNormal.wrapS = THREE.RepeatWrapping;
    stoneBrickWallNormal.wrapT = THREE.RepeatWrapping;



    //cubo 1
    applyTexturesToCube(cube, [
      { texture: stoneBrickWall, normalMap: stoneBrickWallNormal, x: 35, y: 1.5 }, // +X (right)
      { texture: stoneBrickWall, normalMap: stoneBrickWallNormal, x: 35, y: 1.5 }, // -X (left)
      { texture: sandyGroundTexture, normalMap: sandyGroundNormal, x: 25, y: 25 }, // +Y (top)
      { texture: sandyGroundTexture, normalMap: sandyGroundNormal, x: 2, y: 1 }, // -Y (bottom)
      { texture: sandyGroundTexture, normalMap: sandyGroundNormal, x: 10, y: 1 }, // +Z (front)
      { texture: stoneBrickWall, normalMap: stoneBrickWallNormal, x: 35, y: 1.5 }, // -Z (back)
    ])

    //cubo 2 e 3
    applyTexturesToCube(cubeLeft, [
      { texture: stoneBrickWall, normalMap: stoneBrickWallNormal, x: 1, y: 1.5 }, // +X (right)
      { texture: stoneBrickWall, normalMap: stoneBrickWallNormal, x: 1, y: 1.5 }, // -X (left)
      { texture: sandyGroundTexture, normalMap: sandyGroundNormal, x: 6, y: 1 }, // +Y (top)
      { texture: sandyGroundTexture, normalMap: sandyGroundNormal, x: 2, y: 1 }, // -Y (bottom)
      { texture: stoneBrickWall, normalMap: stoneBrickWallNormal, x: 10, y: 1.5 }, // +Z (front)
      { texture: sandyGroundTexture, normalMap: sandyGroundNormal, x: 2, y: 1 }, // -Z (back)
    ]);

    applyTexturesToCube(cubeRight, [
      { texture: stoneBrickWall, normalMap: stoneBrickWallNormal, x: 1, y: 1.5 }, // +X (right)
      { texture: stoneBrickWall, normalMap: stoneBrickWallNormal, x: 1, y: 1.5 }, // -X (left)
      { texture: sandyGroundTexture, normalMap: sandyGroundNormal, x: 12, y: 1 }, // +Y (top)
      { texture: sandyGroundTexture, normalMap: sandyGroundNormal, x: 10, y: 1 }, // -Y (bottom)
      { texture: stoneBrickWall, normalMap: stoneBrickWallNormal, x: 18, y: 1.5 }, // +Z (front)
      { texture: sandyGroundTexture, normalMap: sandyGroundNormal, x: 10, y: 1 }, // -Z (back)
    ]);


    //colisão
    let leftBoxCube = new THREE.Box3().setFromObject(cubeLeft, true);
    let rightBoxCube = new THREE.Box3().setFromObject(cubeRight, true);
    this.collidableAreas.push({ box: leftBoxCube, mesh: cubeLeft });
    this.collidableAreas.push({ box: rightBoxCube, mesh: cubeRight });

    //inicializando texturas das escadas, pilares e blocos
    const loader = new THREE.TextureLoader();
    const stoneTexture = textureLoader.load('./assets/textures/a1/plastered_stone.jpg');
    const stoneNormal = textureLoader.load('./assets/textures/a1/plastered_stone_normal.jpg');
    stoneTexture.wrapS = stoneTexture.wrapT = stoneNormal.wrapS = stoneNormal.wrapT = THREE.RepeatWrapping;
    stoneTexture.repeat.set(3, 1);
    stoneNormal.repeat.set(3, 1);

    const altarStoneTexture = stoneTexture.clone();
    const altarStoneNormal = stoneNormal.clone();
    altarStoneTexture.repeat.set(5, 5);
    altarStoneNormal.repeat.set(5, 5);

    const displacementRepeatX = 12;
    const displacementRepeatY = 10;

    const pillarTexture = textureLoader.load('./assets/textures/a1/pillar.jpg');
    const pillarNormal = textureLoader.load('./assets/textures/a1/pillar_normal.jpg');
    pillarTexture.wrapS = pillarTexture.wrapT = pillarNormal.wrapS = pillarNormal.wrapT = THREE.RepeatWrapping;
    pillarTexture.repeat.set(displacementRepeatX / 1, displacementRepeatY / 1);
    pillarNormal.repeat.set(displacementRepeatX / 1, displacementRepeatY / 1);



    //escadas
    let stairHeight = 4 / 8;
    let stairPositionX = 0.0;
    if (leftLength < length / 2) {
      stairPositionX = -(length - leftLength) / 2 + leftLength / 2 + 12.5;
    } else {
      stairPositionX = (length - rightLength) / 2 - rightLength / 2 - 12.5;
    }

    // colisão da escada
    let stair = new THREE.Mesh(new THREE.PlaneGeometry(26, 6), this.lambertMaterial('green'));
    stair.visible = false;
    stair.position.set(stairPositionX, 0.5, 59.3);
    stair.translateZ(1);
    stair.rotateX(-1 * Math.PI / 3.9);

    stair.castShadow = true;
    stair.receiveShadow = true;

    cube.add(stair);

    let areaEnter = new THREE.Mesh(new THREE.BoxGeometry(30.0, 4.0, 8.0), this.lambertMaterial('white'));
    areaEnter.visible = false;
    areaEnter.position.set(stairPositionX, 3.0, 59.0);
    cube.add(areaEnter);
    let areaEnterBox = new THREE.Box3().setFromObject(areaEnter, true);
    this.agroArea.push(areaEnterBox);

    let box = new THREE.Box3().setFromObject(stair, true);
    this.collidableStairs.push({ box: box, mesh: stair });


    for (let i = 0; i < 8; i++) {
      let stairMaterial = generateCubeMaterials("lambert", { color: "rgb(255, 255, 255)" });

      let stairStepGeometry = new THREE.BoxGeometry(25.0, stairHeight, stairHeight * (1 + 7 - i));
      let stairStep = new THREE.Mesh(stairStepGeometry, stairMaterial);
      applyTexturesToCube(stairStep, [
        { texture: stoneTexture, normalMap: stoneNormal, x: 1, y: 1 }, // +X (right)
        { texture: stoneTexture, normalMap: stoneNormal, x: 1, y: 1 }, // -X (left)
        { texture: stoneTexture, normalMap: stoneNormal, x: 15, y: 1 }, // +Y (top)
        { texture: stoneTexture, normalMap: stoneNormal, x: 1, y: 1 }, // -Y (bottom)
        { texture: stoneTexture, normalMap: stoneNormal, x: 15, y: 0.5 }, // +Z (front)
        { texture: stoneTexture, normalMap: stoneNormal, x: 1, y: 1 }, // -Z (back)
      ]);
      if (i == 0) {
        stairStep.position.set(stairPositionX, -1.75, 60.0);
      } else {
        stairStep.position.set(stairPositionX, -1.75 + stairHeight * i, 60.0 - (stairHeight * i) / 2);
      }
      stairStep.castShadow = true;
      stairStep.receiveShadow = true;

      cube.add(stairStep);
    }


    const pillarDisplacement = loader.load('./assets/textures/a1/pillars_displacement.png');
    pillarDisplacement.wrapS = THREE.RepeatWrapping;
    pillarDisplacement.wrapT = THREE.RepeatWrapping;
    pillarDisplacement.repeat.set(displacementRepeatX, displacementRepeatY);


    for (let i = 0; i < 12; i++) {

      let pilarGeometry = new THREE.CylinderGeometry(2.5, 2.5, 20.0, 256);
      let pilarMaterial = new THREE.MeshStandardMaterial();
      pilarMaterial.displacementScale = 0.3;

      pilarMaterial.map = pillarTexture;
      pilarMaterial.normalMap = pillarNormal;
      pilarMaterial.displacementMap = pillarDisplacement;

      let pilar = new THREE.Mesh(pilarGeometry, pilarMaterial);
      pilar.position.set(-50.0 + (100 / 11) * i, 12.0, -48.0);

      pilar.castShadow = true;
      pilar.receiveShadow = true;

      cube.add(pilar);
      let boxPilar = new THREE.Box3().setFromObject(pilar, true);
      this.collidableAreas.push({ box: boxPilar, mesh: pilar });

      let pilarLeft = new THREE.Mesh(pilarGeometry, pilarMaterial);
      let pilarRight = new THREE.Mesh(pilarGeometry, pilarMaterial);
      pilarRight.position.set(50.0, 12.0, -48.0 + (100 / 11) * i);
      pilarLeft.position.set(-50.0, 12.0, -48.0 + (100 / 11) * i);
      pilarRight.castShadow = true;
      pilarRight.receiveShadow = true;
      pilarLeft.castShadow = true;
      pilarLeft.receiveShadow = true;
      cube.add(pilarRight);
      cube.add(pilarLeft);

      let boxPilarLeft = new THREE.Box3().setFromObject(pilarLeft, true);
      let boxPilarRight = new THREE.Box3().setFromObject(pilarRight, true);
      this.collidableAreas.push({ box: boxPilarLeft, mesh: pilarLeft });
      this.collidableAreas.push({ box: boxPilarRight, mesh: pilarRight });
    }

    let blocoMaterial = new THREE.MeshStandardMaterial();

    const blockPositions = [
      [-50.0, 24.5, 47.0],
      [-50.0, 24.5, 34.0],
      [-50.0, 24.5, 10.0],
      [-50.0, 24.5, -30.0],
      [-50.0, 24.5, -43.0],
      [-42.0, 24.5, -48.0],
      [-29.0, 24.5, -48.0],
      [-16.0, 24.5, -48.0],
      [10.0, 24.5, -48.0],
      [23.0, 24.5, -48.0],
      [50.0, 24.5, -35.0],
      [50.0, 24.5, -10.0],
      [50.0, 24.5, 3.0],
      [50.0, 24.5, 37.0],
      [50.0, 24.5, 50.0],
    ];
    blockPositions.forEach((position) => {
      let block = new THREE.Mesh(new THREE.BoxGeometry(13, 5.0, 13), blocoMaterial);
      block.position.set(position[0], position[1], position[2]);
      block.castShadow = true;
      block.receiveShadow = true;
      cube.add(block);

      block.material.map = stoneTexture;
      block.material.normalMap = stoneNormal;
    })

    let altar = new THREE.Mesh(new THREE.BoxGeometry(4.0, 6.0, 4.0), this.lambertMaterial('#ffffff'));
    altar.castShadow = true;
    altar.receiveShadow = true;
    altar.material.map = altarStoneTexture;
    altar.material.normalMap = altarStoneNormal;
    altar.position.set(0.0, -2.0, 0.0);

    cube.add(altar);

    let boxAltar = new THREE.Box3().setFromObject(altar, true);
    this.collidableAreas.push({ box: boxAltar, mesh: altar });
    this.altares.push(altar);
  }

  static createAreaCubes(scene) {
    this.enemiesA2.addEnemy('cacodemon', new THREE.Vector3(10.0, 23.0, -112.0));
    this.enemiesA2.addEnemy('cacodemon', new THREE.Vector3(10.0, 23.0, -195.0));
    this.enemiesA2.addEnemy('cacodemon', new THREE.Vector3(-35.0, 30.0, -135.0));
    this.enemiesA2.addEnemy('painelemental', new THREE.Vector3(-25.0, 6.0, -135.0));


    let position = new THREE.Vector3(0.0, 3.0, -162.0);
    let height = 6.0;
    let length = 120.0;
    let leftLength = 95.0;
    let rightLength = 20.0;

    //carregando texturas
    const textureLoader = new THREE.TextureLoader();

    const gateTexture = textureLoader.load('./assets/textures/a2/gate.jpg');
    const gateNormal = textureLoader.load('./assets/textures/a2/gate_normal.jpg');
    gateTexture.wrapS = gateTexture.wrapT = gateNormal.wrapS = gateNormal.wrapT = THREE.RepeatWrapping;

    const metalGroundTexture = textureLoader.load('./assets/textures/a2/metal_ground.jpg');
    const metalGroundNormal = textureLoader.load('./assets/textures/a2/metal_ground_normal.jpg');
    metalGroundTexture.wrapS = metalGroundTexture.wrapT = metalGroundNormal.wrapS = metalGroundNormal.wrapT = THREE.RepeatWrapping;

    const metalBoxTexture = textureLoader.load('./assets/textures/a2/box.jpg');
    const metalBoxNormal = textureLoader.load('./assets/textures/a2/box_normal.jpg');
    metalBoxTexture.wrapS = metalBoxTexture.wrapT = metalBoxNormal.wrapS = metalBoxNormal.wrapT = THREE.RepeatWrapping;

    const metalWallTexture = textureLoader.load('./assets/textures/a2/metal_wall.jpg');
    const metalWallNormal = textureLoader.load('./assets/textures/a2/metal_wall_normal.jpg');
    metalWallTexture.wrapS = metalWallTexture.wrapT = metalWallNormal.wrapS = metalWallNormal.wrapT = THREE.RepeatWrapping;

    const elevatorTexture = textureLoader.load('./assets/textures/a2/elevator.jpg');
    const elevatorNormal = textureLoader.load('./assets/textures/a2/elevator_normal.jpg');
    elevatorTexture.wrapS = elevatorTexture.wrapT = elevatorNormal.wrapS = elevatorNormal.wrapT = THREE.RepeatWrapping;

    const stoneTexture = textureLoader.load('./assets/textures/a1/plastered_stone.jpg');
    const stoneNormal = textureLoader.load('./assets/textures/a1/plastered_stone_normal.jpg');
    stoneTexture.wrapS = stoneTexture.wrapT = stoneNormal.wrapS = stoneNormal.wrapT = THREE.RepeatWrapping;

    //cubo principal
    let cubeMaterials = generateCubeMaterials("phong", { color: "rgb(255,255,255)", specular: "rgb(255,255,255)", shininess: 5 });
    let cubeMaterials2 = generateCubeMaterials("phong", { color: "rgb(255,255,255)", specular: "rgb(255,255,255)", shininess: 5 });
    let cubeMaterials3 = generateCubeMaterials("phong", { color: "rgb(255,255,255)", specular: "rgb(255,255,255)", shininess: 5 });
    let material = new THREE.MeshStandardMaterial();
    let cubeGeometry = new THREE.BoxGeometry(length, height, 116.0);
    let cube = new THREE.Mesh(cubeGeometry, cubeMaterials);
    cube.position.copy(position);

    let boxCube = new THREE.Box3().setFromObject(cube, true);
    cube.castShadow = true;
    cube.receiveShadow = true;
    this.collidableAreas.push({ box: boxCube, mesh: cube });
    scene.add(cube);

    let cubeGeometry2 = new THREE.BoxGeometry(leftLength, height, 4.0);
    let cubeLeft = new THREE.Mesh(cubeGeometry2, cubeMaterials2);
    cubeLeft.position.set(-(length - leftLength) / 2, 0.0, 60.0);
    cubeLeft.castShadow = true;
    cubeLeft.receiveShadow = true;
    cube.add(cubeLeft);

    let cubeGeometry3 = new THREE.BoxGeometry(rightLength, height, 4.0);
    let cubeRight = new THREE.Mesh(cubeGeometry3, cubeMaterials3);
    cubeRight.position.set((length - rightLength) / 2, 0.0, 60.0);
    cubeRight.castShadow = true;
    cubeRight.receiveShadow = true;
    cube.add(cubeRight);

    applyTexturesToCube(cube, [
      { texture: metalWallTexture, normalMap: metalWallNormal, x: 10, y: 1.5 }, // +X (right)
      { texture: metalWallTexture, normalMap: metalWallNormal, x: 10, y: 1.5 }, // -X (left)
      { texture: metalGroundTexture, normalMap: metalGroundNormal, x: 18, y: 18 }, // +Y (top)
      { texture: metalGroundTexture, normalMap: metalGroundNormal, x: 10, y: 1 }, // -Y (bottom)
      { texture: metalWallTexture, normalMap: metalWallNormal, x: 10, y: 1.5 }, // +Z (front)
      { texture: metalWallTexture, normalMap: metalWallNormal, x: 10, y: 1.5 }, // -Z (back)
    ]);

    applyTexturesToCube(cubeLeft, [
      { texture: metalWallTexture, normalMap: metalWallNormal, x: 0.3, y: 1.5 }, // +X (right)
      { texture: metalWallTexture, normalMap: metalWallNormal, x: 0.3, y: 1.5 }, // -X (left)
      { texture: metalGroundTexture, normalMap: metalGroundNormal, x: leftLength / length * 18, y: 0.7, offsetX: 0, offsetY: 0.21 }, // +Y (top)
      { texture: metalGroundTexture, normalMap: metalGroundNormal, x: 10, y: 1 }, // -Y (bottom)
      { texture: metalWallTexture, normalMap: metalWallNormal, x: 10, y: 1.5 }, // +Z (front)
      { texture: metalWallTexture, normalMap: metalWallNormal, x: 10, y: 1.5 }, // -Z (back)
    ]);

    applyTexturesToCube(cubeRight, [
      { texture: metalWallTexture, normalMap: metalWallNormal, x: 0.3, y: 1.5 }, // +X (right)
      { texture: metalWallTexture, normalMap: metalWallNormal, x: 0.3, y: 1.5 }, // -X (left)
      { texture: metalGroundTexture, normalMap: metalGroundNormal, x: 3, y: 0.7, offsetX: 0, offsetY: 0.3 }, // +Y (top)
      { texture: metalGroundTexture, normalMap: metalGroundNormal, x: 10, y: 1 }, // -Y (bottom)
      { texture: metalWallTexture, normalMap: metalWallNormal, x: 2, y: 1.5 }, // +Z (front)
      { texture: metalWallTexture, normalMap: metalWallNormal, x: 10, y: 1.5 }, // -Z (back)
    ]);


    //colisão
    let leftBoxCube = new THREE.Box3().setFromObject(cubeLeft, true);
    let rightBoxCube = new THREE.Box3().setFromObject(cubeRight, true);
    this.collidableAreas.push({ box: leftBoxCube, mesh: cubeLeft });
    this.collidableAreas.push({ box: rightBoxCube, mesh: cubeRight });

    //porta
    let fechadura = new THREE.BoxGeometry(3.0, 3.0, 3.0);
    let fechaduraMaterial = this.lambertMaterial('rgb(236, 236, 236)');
    fechaduraMaterial.map = stoneTexture;
    fechaduraMaterial.normalMap = stoneNormal;
    let fechaduraMesh = new THREE.Mesh(fechadura, fechaduraMaterial);
    fechaduraMesh.position.set(37.5, -3.0, 70.0);
    fechaduraMesh.castShadow = true;
    fechaduraMesh.receiveShadow = true;
    cube.add(fechaduraMesh);

    let boxFechadura = new THREE.Box3().setFromObject(fechaduraMesh, true);
    this.collidableAreas.push({ box: boxFechadura, mesh: fechaduraMesh });

    let doorGeometry = new THREE.BoxGeometry(6.0, 5.99, 0.5);
    let doorMaterial = new THREE.MeshPhongMaterial({ color: "rgb(255,255,255)", specular: "rgb(255,255,255)", shininess: 15 });
    doorMaterial.map = gateTexture;
    doorMaterial.normalMap = gateNormal;

    let door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(37.5, 0.0, 62.0);
    door.castShadow = true;
    door.receiveShadow = true;
    cube.add(door);

    let boxDoor = new THREE.Box3().setFromObject(door, true);
    this.collidableAreas.push({ box: boxDoor, mesh: door });
    this.door.push(door);

    let areaEnter = new THREE.Mesh(new THREE.BoxGeometry(7.0, 4.0, 6.0), this.lambertMaterial('white'));
    areaEnter.visible = false;
    areaEnter.position.set(37.5, 5.0, 60.0);
    cube.add(areaEnter);
    let areaEnterBox = new THREE.Box3().setFromObject(areaEnter, true);
    this.agroArea.push(areaEnterBox);

    //elevador
    let elevadorGeometry = new THREE.BoxGeometry(5.0, 6.0, 4.0);
    let elevadorMaterial = generateCubeMaterials();
    let elevador = new THREE.Mesh(elevadorGeometry, elevadorMaterial);
    applyTexturesToCube(elevador, [
      { texture: elevatorTexture, normalMap: elevatorNormal, x: 0.3, y: 1.5 }, // +X (right)
      { texture: elevatorTexture, normalMap: elevatorNormal, x: 0.3, y: 1.5 }, // -X (left)
      { texture: elevatorTexture, normalMap: elevatorNormal, x: 1.2, y: 1.2 }, // +Y (top)
      { texture: elevatorTexture, normalMap: elevatorNormal, x: 10, y: 1 }, // -Y (bottom)
      { texture: elevatorTexture, normalMap: elevatorNormal, x: 1.2, y: 2 }, // +Z (front)
      { texture: elevatorTexture, normalMap: elevatorNormal, x: 10, y: 1.5 }, // -Z (back)
    ]);

    elevador.position.set(37.5, 0.0, 60.0);
    elevador.castShadow = true;
    elevador.receiveShadow = true;
    cube.add(elevador);

    let boxElevador = new THREE.Box3().setFromObject(elevador, true);
    this.elevador.push({ box: boxElevador, mesh: elevador });
    this.collidableAreas.push({ box: boxElevador, mesh: elevador });

    let elevadorAreaGeo = new THREE.BoxGeometry(11.0, 8.0, 11.0);
    let elevadorAreaMaterial = this.lambertMaterial('white');
    let elevadorArea = new THREE.Mesh(elevadorAreaGeo, elevadorAreaMaterial);
    elevadorArea.position.set(37.5, 0.0, 60.0);
    elevadorArea.visible = false;

    cube.add(elevadorArea);

    this.elevadorCheck = new THREE.Box3().setFromObject(elevadorArea, true);

    let boxElevadorArea = new THREE.Box3().setFromObject(elevadorArea, true);
    let helper = new THREE.BoxHelper(elevadorArea, 0x00ff00);
    //scene.add(helper);

    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        if ((i == 2 || i == 3) && (j == 2 || j == 3))
          continue;

        let boxMaterials = generateCubeMaterials("phong", { color: "rgb(255,255,255)", specular: "rgb(255,255,255)", shininess: 50 });
        let cubeGeometry = new THREE.BoxGeometry(3.0, 20.0, 3.0);
        let floatingBox = new THREE.Mesh(cubeGeometry, boxMaterials);
        let sidesRepeatX = 0.7;
        let sidesRepeatY = 5;
        applyTexturesToCube(floatingBox, [
          { texture: metalBoxTexture, normalMap: metalBoxNormal, x: sidesRepeatX, y: sidesRepeatY }, // +X (right)
          { texture: metalBoxTexture, normalMap: metalBoxNormal, x: sidesRepeatX, y: sidesRepeatY }, // -X (left)
          { texture: metalBoxTexture, normalMap: metalBoxNormal, x: 2, y: 2 }, // +Y (top)
          { texture: metalBoxTexture, normalMap: metalBoxNormal, x: 2, y: 2 }, // -Y (bottom)
          { texture: metalBoxTexture, normalMap: metalBoxNormal, x: sidesRepeatX, y: sidesRepeatY }, // +Z (front)
          { texture: metalBoxTexture, normalMap: metalBoxNormal, x: sidesRepeatX, y: sidesRepeatY }, // -Z (back)
        ]);
        if (i % 2 == 0 && j % 2 == 0)
          floatingBox.position.set(-50.0 + 20 * i, 21.0, -50.0 + 20 * j);
        else if (i == j)
          floatingBox.position.set(-50.0 + 20 * i, 17.0, -50.0 + 20 * j);
        else if (i % 3 == 0 || j % 3 == 0)
          floatingBox.position.set(-50.0 + 20 * i, 8.0, -50.0 + 20 * j);
        else
          floatingBox.position.set(-50.0 + 20 * i, 13.0, -50.0 + 20 * j);
        floatingBox.castShadow = true;
        floatingBox.receiveShadow = true;
        cube.add(floatingBox);

        let floatingBoxBox = new THREE.Box3().setFromObject(floatingBox, true);
        this.collidableAreas.push({ box: floatingBoxBox, mesh: floatingBox });
      }
    }

    let altarMaterials = generateCubeMaterials("phong", { color: "rgb(255,255,255)", specular: "rgb(255,255,255)", shininess: 5 });
    let altar = new THREE.Mesh(new THREE.BoxGeometry(4.0, 6.0, 4.0), altarMaterials);
    applyTexturesToCube(altar, [
      { texture: metalGroundTexture, normalMap: metalGroundNormal, x: 1, y: 1 }, // +X (right)
      { texture: metalGroundTexture, normalMap: metalGroundNormal, x: 1, y: 1 }, // -X (left)
      { texture: metalGroundTexture, normalMap: metalGroundNormal, x: 1, y: 1 }, // +Y (top)
      { texture: metalGroundTexture, normalMap: metalGroundNormal, x: 1, y: 1 }, // -Y (bottom)
      { texture: metalGroundTexture, normalMap: metalGroundNormal, x: 1, y: 1 }, // +Z (front)
      { texture: metalGroundTexture, normalMap: metalGroundNormal, x: 1, y: 1 }, // -Z (back)
    ]);

    altar.position.set(0.0, -3, 0.0);
    altar.castShadow = true;
    altar.receiveShadow = true;
    cube.add(altar);

    let boxAltar = new THREE.Box3().setFromObject(altar, true);
    this.collidableAreas.push({ box: boxAltar, mesh: altar });
    this.altares.push(altar);

    let boxMaterials = generateCubeMaterials();
    let pillarGeometry = new THREE.BoxGeometry(4.0, 20.0, 4.0);
    let pillar = new THREE.Mesh(pillarGeometry, boxMaterials);
    let sidesRepeatX = 0.7;
    let sidesRepeatY = 4;
    applyTexturesToCube(pillar, [
      { texture: metalBoxTexture, normalMap: metalBoxNormal, x: sidesRepeatX, y: sidesRepeatY }, // +X (right)
      { texture: metalBoxTexture, normalMap: metalBoxNormal, x: sidesRepeatX, y: sidesRepeatY }, // -X (left)
      { texture: metalBoxTexture, normalMap: metalBoxNormal, x: 2, y: 2 }, // +Y (top)
      { texture: metalBoxTexture, normalMap: metalBoxNormal, x: 2, y: 2 }, // -Y (bottom)
      { texture: metalBoxTexture, normalMap: metalBoxNormal, x: sidesRepeatX, y: sidesRepeatY }, // +Z (front)
      { texture: metalBoxTexture, normalMap: metalBoxNormal, x: sidesRepeatX, y: sidesRepeatY }, // -Z (back)
    ]);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    pillar.position.set(0.0, 16.0, 0.0);

    altar.add(pillar);

    let pillarBox = new THREE.Box3().setFromObject(pillar, true);
    this.collidableAreas.push({ box: pillarBox, mesh: pillar });
  }


  static createTerrain(scene) {
    const textureLoader = new THREE.TextureLoader();
    let wallGeometry = new THREE.BoxGeometry(504, 72, 8);
    let wallMaterial = this.lambertMaterial('#a7a7a7');

    const wallTexture = textureLoader.load('./assets/textures/walls/rock_wall.jpg');

    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;

    wallTexture.repeat.set(45, 10);
    wallMaterial.map = wallTexture;

    let walls = [];

    for (let i = 0; i < 4; ++i) {
      let wall = new THREE.Mesh(wallGeometry, wallMaterial);

      walls.push(wall);
    }

    walls[0].position.set(0, 36, -254);

    walls[1].position.set(-254, 36, 0);
    walls[1].rotation.y = Math.PI / 2;

    walls[2].position.set(254, 36, 0);
    walls[2].rotation.y = Math.PI / -2;

    walls[3].position.set(0, 36, 254);
    walls[3].rotation.y = Math.PI

    for (let i = 0; i < walls.length; i++) {
      walls[i].castShadow = true;
      walls[i].receiveShadow = true;


      scene.add(walls[i]);
      let wallBox = new THREE.Box3().setFromObject(walls[i], true);

      this.collidableWalls.push({ box: wallBox, mesh: walls[i] });
    }

    let plane = new THREE.Mesh(new THREE.PlaneGeometry(510, 510), this.lambertMaterial('#a7a7a7'));
    plane.receiveShadow = true;
    plane.rotateX(-Math.PI / 2);

    const floorTexture = textureLoader.load('./assets/textures/floor/floor.jpg');

    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;

    floorTexture.repeat.set(200, 200);

    plane.material.map = floorTexture;

    scene.add(plane);

    let planeBox = new THREE.Box3().setFromObject(plane, true);
    this.collidableAreas.push({ box: planeBox, mesh: plane });
  }

  static lambertMaterial(color) {
    return new THREE.MeshLambertMaterial({ color: color });
  }

  static doorDown() {
    let door = this.door[0];
    door.position.lerp(new THREE.Vector3(37.5, -8.0, 62.0), 0.01);

    let doorCollidable = this.collidableAreas.find(obj => obj.mesh === door);
    if (doorCollidable) {
      doorCollidable.box.setFromObject(door, true);
    }
  }

  static primeiroAltar(key) {
    let altar = this.altares[0];
    altar.position.lerp(new THREE.Vector3(0.0, 1.0, 0.0), 0.01);
    key.visible = true
    if (key.csgFinal) {
      altar.add(key.csgFinal)
      key.csgFinal.position.set(0, 3.3, 0)
    }

    let altarCollidable = this.collidableAreas.find(obj => obj.mesh === altar);
    if (altarCollidable) {
      altarCollidable.box.setFromObject(altar, true);
    }
  }

  static segundoAltar(key) {
    let altar = this.altares[1];
    altar.position.lerp(new THREE.Vector3(0.0, 1.7, 0.0), 0.01);
    if (key) {
      altar.add(key)
      key.position.set(0, 3.3, 0)
    }

    let altarCollidable = this.collidableAreas.find(obj => obj.mesh === altar);
    if (altarCollidable) {
      altarCollidable.box.setFromObject(altar, true);
    }
  }

  static handleEnemiesArea(player) {
    if (this.enterArea(player, 0))
      this.#agressiveEnemies(this.enemiesA1);
    if (this.enterArea(player, 1))
      this.#agressiveEnemies(this.enemiesA2);
    this.enemiesA1.handleEnemies();
    this.enemiesA2.handleEnemies();
    this.enemiesA3.handleEnemies();
    this.enemiesA4.handleEnemies();
  }

  static #agressiveEnemies(enemies) {
    for (let i = 0; i < enemies.enemies.length; i++) {
      enemies.enemies[i].angry = true;
    }
  }

  static enterArea(player, area) {
    let playerBox = new THREE.Box3().setFromObject(player, true);
    let boxArea = this.agroArea[area];
    if (playerBox.intersectsBox(boxArea)) {
      return true;
    }
    return false;
  }
  static area4Walls(){
    desertArea.wallDown(this.collidableAreas);
  }

}

export class enemiesAreas {
  static inimigos = {};
}

