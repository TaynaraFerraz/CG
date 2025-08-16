import * as THREE from 'three';
import {
  getMaxSize,
  setDefaultMaterial
} from "../libs/util/util.js";

import { PLAYER_HEIGHT, PLAYER_WIDTH, SHIFT_MULTIPLIER, SPEED } from './constants.js';
import { EnemiesHandler } from './EnemiesHandler.js';
import { GLTFLoader } from '../build/jsm/loaders/GLTFLoader.js';
import { MTLLoader } from '../build/jsm/loaders/MTLLoader.js';
import { OBJLoader } from '../build/jsm/loaders/OBJLoader.js';
import { deserArea } from './Area4.js';
import { hangarLight, light } from './camera.js';


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
  static doorArea3 = [];

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
    this.enemiesA3 = new EnemiesHandler(scene, player, 8, () => {
      enemiesAreas.inimigos.area3 = [];
      console.log("Área 3 limpa. Inimigos removidos");
    });
    this.enemiesA4 = new EnemiesHandler(scene, player);

    this.createTerrain(scene);
    this.createAreaPilars(scene);
    this.createAreaCubes(scene);

    desertArea.createAreaDesert(scene, this.collidableAreas, this.collidableStairs);
  }

  //tudo relacionado a área 3
  static createArea3(scene) {
    this.enemiesA3.addEnemy('soldier', new THREE.Vector3(117, 0.89, -151));
    this.enemiesA3.addEnemy('soldier', new THREE.Vector3(194, 0.89, -175));
    this.enemiesA3.addEnemy('soldier', new THREE.Vector3(158, 0.89, -185));
    this.enemiesA3.addEnemy('soldier', new THREE.Vector3(99, 0.89, -189));
    this.enemiesA3.addEnemy('soldier', new THREE.Vector3(189, 0.89, -125));
    this.enemiesA3.addEnemy('soldier', new THREE.Vector3(154, 0.89, -136));
    this.enemiesA3.addEnemy('soldier', new THREE.Vector3(192, 0.89, -152));
    this.enemiesA3.addEnemy('soldier', new THREE.Vector3(130, 0.89, -175));
    function normalizeAndRescale(obj, newScale) {
      var scale = getMaxSize(obj);
      obj.scale.set(newScale * (1.0 / scale),
        newScale * (1.0 / scale),
        newScale * (1.0 / scale));
      return obj;
    }

    function fixPosition(obj) {
      // Fix position of the object over the ground plane
      var box = new THREE.Box3().setFromObject(obj);
      if (box.min.y > 0)
        obj.translateY(-box.min.y);
      else
        obj.translateY(-1 * box.min.y);
      return obj;
    }

    let hangarBox;
    var loader = new GLTFLoader();
    loader.load('./assets/hangar/' + 'hangar' + '.glb', function (gltf) {
      var obj = gltf.scene;
      obj.name = 'hangar';
      obj.visible = true;
      obj.traverse(function (child) {
        if (child.isMesh) child.castShadow = true;
        if (child.material) child.material.side = THREE.DoubleSide;
      });

      var obj = normalizeAndRescale(obj, 125);
      var obj = fixPosition(obj);
      obj.position.set(150, 0.05, -155)
      obj.rotateY(Math.PI / 2)
      scene.add(obj);
      hangarBox = new THREE.Box3().setFromObject(obj, true);
      //assetManager[modelName] = obj;        
    });

    var mtlLoader = new MTLLoader();
    mtlLoader.setPath('./assets/plane/');
    mtlLoader.load('plane' + '.mtl', function (materials) {
      materials.preload();

      var objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath('./assets/plane/');
      objLoader.load('plane' + ".obj", function (obj) {
        obj.visible = true;
        obj.name = 'plane';
        // Set 'castShadow' property for each children of the group
        obj.traverse(function (child) {
          if (child.isMesh) child.castShadow = true;
          if (child.material) child.material.side = THREE.DoubleSide;
        });

        var obj = normalizeAndRescale(obj, 40);
        var obj = fixPosition(obj);
        obj.rotateY(THREE.MathUtils.degToRad(-90));

        obj.position.set(150, 0.05, -155)
        scene.add(obj);
      })
    })

    let materialDoorHangar = this.lambertMaterial('red');
    let geometryDoorHangar = new THREE.BoxGeometry(79, 50, 3);
    let geometryDoorHangar3 = new THREE.BoxGeometry(113, 50, 3);
    let geometryDoorHangar4 = new THREE.BoxGeometry(34, 40, 3);
    let doorHangar = new THREE.Mesh(geometryDoorHangar, materialDoorHangar);
    let doorHangar2 = new THREE.Mesh(geometryDoorHangar, materialDoorHangar);
    let doorHangar3 = new THREE.Mesh(geometryDoorHangar3, materialDoorHangar);
    let doorHangar4 = new THREE.Mesh(geometryDoorHangar4, materialDoorHangar)
    let doorHangar5 = new THREE.Mesh(geometryDoorHangar4, materialDoorHangar)
    doorHangar.position.set(92, 0.89999, -155.5)
    doorHangar2.position.set(205.3, 0.89999, -155.5)
    doorHangar3.position.set(148, 0.89999, -193)
    doorHangar4.position.set(108.5, 0.89999, -117)
    doorHangar5.position.set(189, 0.89999, -117)

    doorHangar.rotateY(Math.PI / 2)
    doorHangar2.rotateY(Math.PI / 2)
    doorHangar.visible = false
    doorHangar2.visible = false
    doorHangar3.visible = false
    doorHangar4.visible = false
    doorHangar5.visible = false

    let doorHangarBox = new THREE.Box3().setFromObject(doorHangar, true);
    let doorHangarBox2 = new THREE.Box3().setFromObject(doorHangar2, true);
    let doorHangarBox3 = new THREE.Box3().setFromObject(doorHangar3, true);
    let doorHangarBox4 = new THREE.Box3().setFromObject(doorHangar4, true);
    let doorHangarBox5 = new THREE.Box3().setFromObject(doorHangar5, true);

    this.collidableAreas.push({ box: doorHangarBox, mesh: doorHangar });
    this.collidableAreas.push({ box: doorHangarBox2, mesh: doorHangar2 });
    this.collidableAreas.push({ box: doorHangarBox3, mesh: doorHangar3 });
    this.collidableAreas.push({ box: doorHangarBox4, mesh: doorHangar4 });
    this.collidableAreas.push({ box: doorHangarBox5, mesh: doorHangar5 });

    scene.add(doorHangar)
    scene.add(doorHangar2)
    scene.add(doorHangar3)
    scene.add(doorHangar4)
    scene.add(doorHangar5)

    // colisão com a roda do avião
    let geometryWheel = new THREE.BoxGeometry(1, 5, 1.5)
    let wheel = new THREE.Mesh(geometryWheel, materialDoorHangar)
    let wheel2 = new THREE.Mesh(geometryWheel, materialDoorHangar)
    let wheel3 = new THREE.Mesh(geometryWheel, materialDoorHangar)
    wheel.position.set(154.5, 0.05, -159.4)
    wheel2.position.set(145.5, 0.05, -159.4)
    wheel3.position.set(150, 0.05, -143)
    wheel.visible = false
    wheel2.visible = false
    wheel3.visible = false

    let wheelBox = new THREE.Box3().setFromObject(wheel, true);
    let wheelBox2 = new THREE.Box3().setFromObject(wheel2, true);
    let wheelBox3 = new THREE.Box3().setFromObject(wheel3, true);

    this.collidableAreas.push({ box: wheelBox, mesh: wheel });
    this.collidableAreas.push({ box: wheelBox2, mesh: wheel2 });
    this.collidableAreas.push({ box: wheelBox3, mesh: wheel3 });
    scene.add(wheel)
    scene.add(wheel2)
    scene.add(wheel3)

    const textureLoader = new THREE.TextureLoader();
    const doorTexture = textureLoader.load('./assets/texturaHangar.png');
    doorTexture.wrapS = THREE.RepeatWrapping;
    doorTexture.wrapT = THREE.RepeatWrapping;
    doorTexture.repeat.set(2, 2); // mudar os valores para repetir mais ou menos
    let materialDoor = new THREE.MeshPhongMaterial({ map: doorTexture });
    let geometryDoor = new THREE.BoxGeometry(40, 50, 1)
    let doorLeft = new THREE.Mesh(geometryDoor, materialDoor);
    let doorRight = new THREE.Mesh(geometryDoor, materialDoor);
    doorLeft.position.set(126, 0.05, -116);
    doorRight.position.set(166, 0.05, -116);

    let doorLeftBox = new THREE.Box3().setFromObject(doorLeft, true);
    let doorRightBox = new THREE.Box3().setFromObject(doorRight, true);

    this.collidableAreas.push({ box: doorLeftBox, mesh: doorLeft });
    this.collidableAreas.push({ box: doorRightBox, mesh: doorRight });
    scene.add(doorLeft);
    scene.add(doorRight);
    this.doorArea3.push(doorLeft);
    this.doorArea3.push(doorRight);

    let areaEnter = new THREE.Mesh(new THREE.BoxGeometry(60.0, 4.0, 6.0), this.lambertMaterial('white'));
    areaEnter.visible = false;
    areaEnter.position.set(142, 0.89, -116);
    scene.add(areaEnter);
    let areaEnterBox = new THREE.Box3().setFromObject(areaEnter, true);
    this.agroArea.push(areaEnterBox);

    function updateLighting(playerPosition) {
      if (!hangarBox) return;

      if (hangarBox.containsPoint(playerPosition)) {
        light.visible = false;
        hangarLight.visible = true;
      } else {
        light.visible = true;
        hangarLight.visible = false;
      }
    }

    // exportar a função ou registrar no loop principal para ser chamada a cada frame
    this.updateLighting = updateLighting;

    let altar = new THREE.Mesh(new THREE.BoxGeometry(4.0, 3.0, 4.0), this.lambertMaterial('#a7a7a7'));
    altar.castShadow = true;
    altar.receiveShadow = true;
    altar.position.set(147, -3, -91);

    scene.add(altar);

    let boxAltar = new THREE.Box3().setFromObject(altar, true);
    this.collidableAreas.push({ box: boxAltar, mesh: altar });
    this.altares.push(altar);
  }
  //fim da criação da área 3

  static openArea3() {
    let doorLeft = this.doorArea3[0];
    let doorRight = this.doorArea3[1];

    let finalPosLeft = new THREE.Vector3(110, doorLeft.position.y, doorLeft.position.z);
    let finalPosRight = new THREE.Vector3(185, doorRight.position.y, doorRight.position.z);

    doorLeft.position.lerp(finalPosLeft, 0.01);
    doorRight.position.lerp(finalPosRight, 0.01);
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

    let mainCubeMaterials = [
      new THREE.MeshStandardMaterial(),
      new THREE.MeshStandardMaterial(),
      new THREE.MeshStandardMaterial(),
      new THREE.MeshStandardMaterial(),
      new THREE.MeshStandardMaterial(),
      new THREE.MeshStandardMaterial(),
    ];

    let leftFrontCubeMaterials = [
      new THREE.MeshStandardMaterial(),
      new THREE.MeshStandardMaterial(),
      new THREE.MeshStandardMaterial(),
      new THREE.MeshStandardMaterial(),
      new THREE.MeshStandardMaterial(),
      new THREE.MeshStandardMaterial(),
    ];

    let rightFrontCubeMaterials = [
      new THREE.MeshStandardMaterial(),
      new THREE.MeshStandardMaterial(),
      new THREE.MeshStandardMaterial(),
      new THREE.MeshStandardMaterial(),
      new THREE.MeshStandardMaterial(),
      new THREE.MeshStandardMaterial(),
    ];

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

    const applyTexturesToCube = (cube, paramsVec) => {
      paramsVec.forEach(({ texture, normalMap, x, y }, i) => {
        const texCopy = new THREE.Texture().copy(texture);
        console.log(cube.map);

        cube.material[i].map = texCopy;
        if (normalMap) {
          const texNormalCopy = new THREE.Texture().copy(normalMap);
          cube.material[i].normalMap = texNormalCopy;
          texNormalCopy.repeat.set(x, y);
        }
        texCopy.repeat.set(x, y);
      })
    }
    //iniciando texturas
    const plasteredStoneTexture = textureLoader.load('./assets/textures/a1/forest_ground.jpg');
    const plasteredStoneNormal = textureLoader.load('./assets/textures/a1/forest_ground_normal.jpg');
    plasteredStoneTexture.wrapS = THREE.RepeatWrapping;
    plasteredStoneTexture.wrapT = THREE.RepeatWrapping;

    plasteredStoneNormal.wrapS = THREE.RepeatWrapping;
    plasteredStoneNormal.wrapT = THREE.RepeatWrapping;

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
      { texture: plasteredStoneTexture, normalMap: plasteredStoneNormal, x: 25, y: 25 }, // +Y (top)
      { texture: plasteredStoneTexture, normalMap: plasteredStoneNormal, x: 2, y: 1 }, // -Y (bottom)
      { texture: plasteredStoneTexture, normalMap: plasteredStoneNormal, x: 10, y: 1 }, // +Z (front)
      { texture: stoneBrickWall, normalMap: stoneBrickWallNormal, x: 35, y: 1.5 }, // -Z (back)
    ])

    //cubo 2 e 3
    applyTexturesToCube(cubeLeft, [
      { texture: stoneBrickWall, normalMap: stoneBrickWallNormal, x: 1, y: 1.5 }, // +X (right)
      { texture: stoneBrickWall, normalMap: stoneBrickWallNormal, x: 1, y: 1.5 }, // -X (left)
      { texture: plasteredStoneTexture, normalMap: plasteredStoneNormal, x: 6, y: 1 }, // +Y (top)
      { texture: plasteredStoneTexture, normalMap: plasteredStoneNormal, x: 2, y: 1 }, // -Y (bottom)
      { texture: stoneBrickWall, normalMap: stoneBrickWallNormal, x: 10, y: 1.5 }, // +Z (front)
      { texture: plasteredStoneTexture, normalMap: plasteredStoneNormal, x: 2, y: 1 }, // -Z (back)
    ]);

    applyTexturesToCube(cubeRight, [
      { texture: stoneBrickWall, normalMap: stoneBrickWallNormal, x: 1, y: 1.5 }, // +X (right)
      { texture: stoneBrickWall, normalMap: stoneBrickWallNormal, x: 1, y: 1.5 }, // -X (left)
      { texture: plasteredStoneTexture, normalMap: plasteredStoneNormal, x: 12, y: 1 }, // +Y (top)
      { texture: plasteredStoneTexture, normalMap: plasteredStoneNormal, x: 10, y: 1 }, // -Y (bottom)
      { texture: stoneBrickWall, normalMap: stoneBrickWallNormal, x: 18, y: 1.5 }, // +Z (front)
      { texture: plasteredStoneTexture, normalMap: plasteredStoneNormal, x: 10, y: 1 }, // -Z (back)
    ]);


    //colisão
    let leftBoxCube = new THREE.Box3().setFromObject(cubeLeft, true);
    let rightBoxCube = new THREE.Box3().setFromObject(cubeRight, true);
    this.collidableAreas.push({ box: leftBoxCube, mesh: cubeLeft });
    this.collidableAreas.push({ box: rightBoxCube, mesh: cubeRight });

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

    let stairMaterial = this.lambertMaterial('#ffe6d2');
    for (let i = 0; i < 8; i++) {
      let stairStepGeometry = new THREE.BoxGeometry(25.0, stairHeight, stairHeight * (1 + 7 - i));
      let stairStep = new THREE.Mesh(stairStepGeometry, stairMaterial);
      if (i == 0) {
        stairStep.position.set(stairPositionX, -1.75, 60.0);
      } else {
        stairStep.position.set(stairPositionX, -1.75 + stairHeight * i, 60.0 - (stairHeight * i) / 2);
      }
      stairStep.castShadow = true;
      stairStep.receiveShadow = true;

      cube.add(stairStep);
    }

    const loader = new THREE.TextureLoader();
    const pillarDisplacement = loader.load('./assets/textures/a1/pillars_displacement.png');
    pillarDisplacement.wrapS = THREE.RepeatWrapping;
    pillarDisplacement.wrapT = THREE.RepeatWrapping;
    pillarDisplacement.repeat.set(8, 8);

    const stoneTexture = textureLoader.load('./assets/textures/a1/plastered_stone.jpg');
    const stoneNormal = textureLoader.load('./assets/textures/a1/plastered_stone_normal.jpg');
    stoneTexture.wrapS = THREE.MirroredRepeatWrapping;
    stoneTexture.wrapT = THREE.MirroredRepeatWrapping;
    stoneNormal.wrapS = THREE.MirroredRepeatWrapping;
    stoneNormal.wrapT = THREE.MirroredRepeatWrapping;
    
    for (let i = 0; i < 12; i++) {

      let pilarGeometry = new THREE.CylinderGeometry(2.5, 2.5, 20.0, 300);
      let pilarMaterial = this.lambertMaterial("#fffde0");
      pilarMaterial.displacementScale = 0.2;
      
      pilarMaterial.map = stoneTexture;
      pilarMaterial.normalMap = stoneNormal;
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

    let blocoMaterial = [
      new THREE.MeshStandardMaterial(),
      new THREE.MeshStandardMaterial(),
      new THREE.MeshStandardMaterial(),
      new THREE.MeshStandardMaterial(),
      new THREE.MeshStandardMaterial(),
      new THREE.MeshStandardMaterial(),
    ];

    
    let r1 = new THREE.Mesh(new THREE.BoxGeometry(120.0, 5.0, 20.0), blocoMaterial);
    r1.position.set(0.0, 24.5, -48.0);
    r1.castShadow = true;
    r1.receiveShadow = true;
    cube.add(r1);
    
    let r2 = new THREE.Mesh(new THREE.BoxGeometry(120.0, 5.0, 20.0), blocoMaterial);
    r2.rotateY(Math.PI / 2);
    r2.position.set(50.0, 24.5, 2.0);
    r2.castShadow = true;
    r2.receiveShadow = true;
    cube.add(r2);
    
    let r3 = new THREE.Mesh(new THREE.BoxGeometry(120.0, 5.0, 20.0), blocoMaterial);
    r3.rotateY(Math.PI / -2);
    r3.position.set(-50.0, 24.5, 2.0);
    r3.castShadow = true;
    r3.receiveShadow = true;
    cube.add(r3);
    applyTexturesToCube(r1, [
      { texture: stoneTexture, normalMap: stoneNormal, x: 2, y: 0.5 }, // +X (right)
      { texture: stoneTexture, normalMap: stoneNormal, x: 2, y: 0.5 }, // -X (left)
      { texture: stoneTexture, normalMap: stoneNormal, x: 5, y: 0.5 }, // +Y (top)
      { texture: stoneTexture, normalMap: stoneNormal, x: 5, y: 0.5 }, // -Y (bottom)
      { texture: stoneTexture, normalMap: stoneNormal, x: 10, y: 0.5 }, // +Z (front)
      { texture: stoneTexture, normalMap: stoneNormal, x: 10, y: 0.5 }, // -Z (back)
    ])

    let altar = new THREE.Mesh(new THREE.BoxGeometry(4.0, 6.0, 4.0), this.lambertMaterial('#a7a7a7'));
    altar.castShadow = true;
    altar.receiveShadow = true;
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


    let position = new THREE.Vector3(0.0, 3.0, -162.0);
    let height = 6.0;
    let length = 120.0;
    let leftLength = 95.0;
    let rightLength = 20.0;

    //cubo principal
    let material = this.lambertMaterial('red');
    let cubeGeometry = new THREE.BoxGeometry(length, height, 116.0);
    let cube = new THREE.Mesh(cubeGeometry, material);
    cube.position.copy(position);

    let boxCube = new THREE.Box3().setFromObject(cube, true);
    cube.castShadow = true;
    cube.receiveShadow = true;
    this.collidableAreas.push({ box: boxCube, mesh: cube });
    scene.add(cube);

    let cubeGeometry2 = new THREE.BoxGeometry(leftLength, height, 4.0);
    let cubeLeft = new THREE.Mesh(cubeGeometry2, material);
    cubeLeft.position.set(-(length - leftLength) / 2, 0.0, 60.0);
    cubeLeft.castShadow = true;
    cubeLeft.receiveShadow = true;
    cube.add(cubeLeft);

    let cubeGeometry3 = new THREE.BoxGeometry(rightLength, height, 4.0);
    let cubeRight = new THREE.Mesh(cubeGeometry3, material);
    cubeRight.position.set((length - rightLength) / 2, 0.0, 60.0);
    cubeRight.castShadow = true;
    cubeRight.receiveShadow = true;
    cube.add(cubeRight);

    //colisão
    let leftBoxCube = new THREE.Box3().setFromObject(cubeLeft, true);
    let rightBoxCube = new THREE.Box3().setFromObject(cubeRight, true);
    this.collidableAreas.push({ box: leftBoxCube, mesh: cubeLeft });
    this.collidableAreas.push({ box: rightBoxCube, mesh: cubeRight });

    //porta
    let fechadura = new THREE.BoxGeometry(3.0, 3.0, 3.0);
    let fechaduraMaterial = this.lambertMaterial('rgb(180, 72, 0)');
    let fechaduraMesh = new THREE.Mesh(fechadura, fechaduraMaterial);
    fechaduraMesh.position.set(37.5, -3.0, 70.0);
    fechaduraMesh.castShadow = true;
    fechaduraMesh.receiveShadow = true;
    cube.add(fechaduraMesh);

    let boxFechadura = new THREE.Box3().setFromObject(fechaduraMesh, true);
    this.collidableAreas.push({ box: boxFechadura, mesh: fechaduraMesh });

    let doorGeometry = new THREE.BoxGeometry(6.0, 7.0, 2.0);
    let doorMaterial = this.lambertMaterial('yellow');
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
    let elevadorMaterial = this.lambertMaterial('brown');
    let elevador = new THREE.Mesh(elevadorGeometry, elevadorMaterial);
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

    let cubeMaterial = this.lambertMaterial('blue');
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        if ((i == 2 || i == 3) && (j == 2 || j == 3))
          continue;
        let cubeGeometry = new THREE.BoxGeometry(3.0, 20.0, 3.0);
        let pilar = new THREE.Mesh(cubeGeometry, cubeMaterial);
        if (i % 2 == 0 && j % 2 == 0)
          pilar.position.set(-50.0 + 20 * i, 21.0, -50.0 + 20 * j);
        else if (i == j)
          pilar.position.set(-50.0 + 20 * i, 17.0, -50.0 + 20 * j);
        else if (i % 3 == 0 || j % 3 == 0)
          pilar.position.set(-50.0 + 20 * i, 8.0, -50.0 + 20 * j);
        else
          pilar.position.set(-50.0 + 20 * i, 13.0, -50.0 + 20 * j);
        pilar.castShadow = true;
        pilar.receiveShadow = true;
        cube.add(pilar);

        let pilarBox = new THREE.Box3().setFromObject(pilar, true);
        this.collidableAreas.push({ box: pilarBox, mesh: pilar });
      }
    }

    let altar = new THREE.Mesh(new THREE.BoxGeometry(4.0, 6.0, 4.0), this.lambertMaterial('#a7a7a7'));
    altar.position.set(0.0, -3.0, 0.0);
    altar.castShadow = true;
    altar.receiveShadow = true;
    cube.add(altar);

    let boxAltar = new THREE.Box3().setFromObject(altar, true);
    this.collidableAreas.push({ box: boxAltar, mesh: altar });
    this.altares.push(altar);

    let pilarGeometry = new THREE.BoxGeometry(4.0, 20.0, 4.0);
    let pilar = new THREE.Mesh(pilarGeometry, this.lambertMaterial('blue'));
    pilar.castShadow = true;
    pilar.receiveShadow = true;
    pilar.position.set(0.0, 16.0, 0.0);

    altar.add(pilar);

    let pilarBox = new THREE.Box3().setFromObject(pilar, true);
    this.collidableAreas.push({ box: pilarBox, mesh: pilar });
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

  static terceiroAltar(key) {
    let altar = this.altares[2];
    //console.log(this.altares.length)
    altar.position.lerp(new THREE.Vector3(147, 0, -91), 0.01);
    if (key) {
      altar.add(key)
      key.position.set(0, 1.8, 0)
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
    if (this.enterArea(player, 2))
      this.#agressiveEnemies(this.enemiesA3);
    this.enemiesA1.handleEnemies();
    this.enemiesA2.handleEnemies();
    this.enemiesA3.handleEnemies();
    this.enemiesA4.handleEnemies();
  }

  static #agressiveEnemies(enemies) {
    for (let i = 0; i < enemies.enemies.length; i++) {
      enemies.enemies[i].angry = true;
      console.log(enemies.enemies[i])
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

