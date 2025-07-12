import * as THREE from 'three';
import {
  setDefaultMaterial
} from "../libs/util/util.js";

import { PLAYER_HEIGHT, PLAYER_WIDTH, SHIFT_MULTIPLIER, SPEED } from './constants.js';
import { EnemiesHandler } from './EnemiesHandler.js';


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
      console.log("Área 1 limpa. Inimigos removidos.");
    });
    this.enemiesA3 = new EnemiesHandler(scene, player);
    this.enemiesA4 = new EnemiesHandler(scene, player);

    positions.push(new THREE.Vector3(-160.0, 12.0, -172.0));
    positions.push(new THREE.Vector3(0.0, 12.0, -172.0));
    positions.push(new THREE.Vector3(160.0, 12.0, -172.0));
    positions.push(new THREE.Vector3(0.0, 12.0, 172.0));

    //criação da base chão/parede
    this.createTerrain(scene);

    //criação das areas
    for (let i = 0; i < positions.length; i++) {
      this.createArea(scene, positions[i], i);
    }
    this.createAreaPilars(scene);
    this.createAreaCubes(scene);
  }

  static createAreaPilars(scene) {
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

    //cubo principal
    let material = this.lambertMaterial('lightblue');
    let cubeGeometry = new THREE.BoxGeometry(length, height, 116.0);
    let cube = new THREE.Mesh(cubeGeometry, material);
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.position.copy(position);

    let boxCube = new THREE.Box3().setFromObject(cube, true);
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

    for (let i = 0; i < 12; i++) {
      let pilarGeometry = new THREE.CylinderGeometry(2.5, 2.5, 20.0);
      let pilarMaterial = this.lambertMaterial('#a7a7a7');
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

    let blocoMaterial = this.lambertMaterial('rgb(180, 72, 0)');
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
    this.enemiesA2.addEnemy('cacodemon', new THREE.Vector3(10.0, 23.0, -112.0), enemiesAreas);
    this.enemiesA2.addEnemy('cacodemon', new THREE.Vector3(10.0, 23.0, -195.0), enemiesAreas);
    this.enemiesA2.addEnemy('cacodemon', new THREE.Vector3(-35.0, 30.0, -135.0), enemiesAreas);


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

  static createArea(scene, position, i) {
    if (i == 0 || i == 1)
      return;

    let material;
    const height = 24.0;
    let length = 120.0;
    let leftLength = 47.5;
    let rightLength = 47.5;

    if (i == 2) {
      material = this.lambertMaterial('#2c41ff');
      leftLength = 47.5;
      rightLength = 47.5;
    }
    if (i == 3) {
      material = this.lambertMaterial('#00b109');
      length = 360.0;
      leftLength = 167.5;
      rightLength = 167.5;
    }

    //criação do cubo principal
    let cubeGeometry = new THREE.BoxGeometry(length, height, 96.0);
    let cube = new THREE.Mesh(cubeGeometry, material);
    cube.position.copy(position);
    //inverte a posição para a area maior ficar voltada para o centro
    if (i == 3)
      cube.rotation.y = Math.PI;
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(cube);

    let boxCube = new THREE.Box3().setFromObject(cube, true);
    this.collidableAreas.push({ box: boxCube, mesh: cube });

    //cubos laterais
    let cubeGeometry2 = new THREE.BoxGeometry(leftLength, height, height);
    let cubeLeft = new THREE.Mesh(cubeGeometry2, material);
    cubeLeft.position.set(-(length - leftLength) / 2, 0.0, 60.0);
    cubeLeft.castShadow = true;
    cubeLeft.receiveShadow = true;
    cube.add(cubeLeft);

    let cubeGeometry3 = new THREE.BoxGeometry(rightLength, height, height);
    let cubeRight = new THREE.Mesh(cubeGeometry3, material);
    cubeRight.position.set((length - rightLength) / 2, 0.0, 60.0);
    cubeRight.castShadow = true;
    cubeRight.receiveShadow = true;
    cube.add(cubeRight);

    let leftBoxCube = new THREE.Box3().setFromObject(cubeLeft, true);
    let rightBoxCube = new THREE.Box3().setFromObject(cubeRight, true);
    this.collidableAreas.push({ box: leftBoxCube, mesh: cubeLeft });
    this.collidableAreas.push({ box: rightBoxCube, mesh: cubeRight });

    //escadas
    let stairHeight = height / 8;
    let stairPositionX = 0.0;
    if (leftLength < length / 2) {
      stairPositionX = -(length - leftLength) / 2 + leftLength / 2 + 12.5;
    } else {
      stairPositionX = (length - rightLength) / 2 - rightLength / 2 - 12.5;
    }

    // colisão da escada
    let stair = new THREE.Mesh(new THREE.PlaneGeometry(26, 38), this.lambertMaterial('green'));
    stair.visible = false;
    stair.position.set(stairPositionX, 0, 60.0);
    stair.translateZ(1);
    stair.rotateX(-1 * Math.PI / 3.8);

    cube.add(stair);
    let box = new THREE.Box3().setFromObject(stair, true);
    this.collidableStairs.push({ box: box, mesh: stair });

    for (let i = 0; i < 8; i++) {
      let stairStepGeometry = new THREE.BoxGeometry(25.0, stairHeight, stairHeight * (1 + 7 - i));
      let stairStep = new THREE.Mesh(stairStepGeometry, this.lambertMaterial('#ffe6d2'));
      if (i == 0) {
        stairStep.position.set(stairPositionX, -10.5, 60);
      } else {
        stairStep.position.set(stairPositionX, -10.5 + stairHeight * i, 60 - (stairHeight * i) / 2);
      }
      stairStep.castShadow = true;
      stairStep.receiveShadow = true;
      cube.add(stairStep);
    }
  }

  static createTerrain(scene) {
    let wallGeometry = new THREE.BoxGeometry(504, 72, 8);
    let wallMaterial = this.lambertMaterial('#a7a7a7');
    let walls = [];

    for (let i = 0; i < 4; ++i) {
      walls.push(new THREE.Mesh(wallGeometry, wallMaterial));
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

    scene.add(plane);
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
    if (key) {
      altar.add(key)
      key.position.set(0, 3.3, 0)
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
}

export class enemiesAreas {
  static inimigos = {};
}

