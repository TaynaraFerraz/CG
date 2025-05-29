import * as THREE from 'three';
import {
  setDefaultMaterial,
  createGroundPlaneXZ,
} from "../libs/util/util.js";
import { BoxGeometry } from '../build/three.module.js';
export class Area {
  static collidableAreas = [];
  static collidableWalls = [];
  static collidableStairs = [];

  constructor(scene) {
    this.scene = scene;
  }

  static createMap(scene) {
    let positions = [];

    positions.push(new THREE.Vector3(-160.0, 12.0, -172.0));
    positions.push(new THREE.Vector3(0.0, 12.0, -172.0));
    positions.push(new THREE.Vector3(160.0, 12.0, -172.0));
    positions.push(new THREE.Vector3(0.0, 12.0, 172.0));

    this.createTerrain(scene);

    for (let i = 0; i < positions.length; i++) {
      this.createArea(scene, positions[i], i);
    }
  }

  static createArea(scene, position, i) {
    let material = setDefaultMaterial();
    //criação da base da plataforma
    //inicialização com valores padrão (plataforma pequena com escada ao centro)
    const height = 24.0;
    let length = 120.0;
    let leftLength = 48.0;
    let rightLength = 48.0;

    if (i == 0) {
      leftLength = 16.0;
      rightLength = 80.0;
    }
    if (i == 1) {
      leftLength = 80.0;
      rightLength = 16.0;
    }
    if (i == 2) {
      leftLength = 48.0;
      rightLength = 48.0;
    }
    if (i == 3) {
      length = 360.0;
      leftLength = 167.5;
      rightLength = 167.5;
    }


    let cubeGeometry = new THREE.BoxGeometry(length, height, 96.0);
    let cube = new THREE.Mesh(cubeGeometry, material);
    cube.position.copy(position);
    if (i == 3)
      cube.rotation.y = Math.PI;
    scene.add(cube);

    let boxCube = new THREE.Box3().setFromObject(cube, true);
    this.collidableAreas.push({ box: boxCube, mesh: cube });

    //cubos laterais
    let cubeGeometry2 = new THREE.BoxGeometry(leftLength, height, height);
    let cubeLeft = new THREE.Mesh(cubeGeometry2, material);
    //calculo da posição do cubo esquerdo em relação ao cubo principal
    cubeLeft.position.set(-(length - leftLength) / 2, 0.0, 60.0);
    cube.add(cubeLeft);

    let cubeGeometry3 = new THREE.BoxGeometry(rightLength, height, height);
    let cubeRight = new THREE.Mesh(cubeGeometry3, material);
    cubeRight.position.set((length - rightLength) / 2, 0.0, 60.0);
    cube.add(cubeRight);

    //colisão
    let leftBoxCube = new THREE.Box3().setFromObject(cubeLeft, true);
    let rightBoxCube = new THREE.Box3().setFromObject(cubeRight, true);
    this.collidableAreas.push({ box: leftBoxCube, mesh: cubeLeft });
    this.collidableAreas.push({ box: rightBoxCube, mesh: cubeRight });

    //escadas
    let stairHeight = height / 8;
    //calculo da posição da escada em relação ao cubo principal
    let stairPositionX = 0.0;
    if (leftLength < length / 2) {
      stairPositionX = -(length - leftLength) / 2 + leftLength / 2 + 12.5;
    } else {
      stairPositionX = (length - rightLength) / 2 - rightLength / 2 - 12.5;
    }

    // colisão da escada
    let stair = new THREE.Mesh(new THREE.BoxGeometry(25, 24 * Math.sqrt(2), 24 * Math.sqrt(2)), setDefaultMaterial());
    stair.position.set(stairPositionX, -12.0, 48.0);
    stair.rotateX(Math.PI / 4);
    cube.add(stair);
    let box = new THREE.Box3().setFromObject(stair, true);
    this.collidableStairs.push({ box: box, mesh: stair });

    //reescrever/deixar mais legivel se possivel
    //os numeros são correções para a escada ficar alinhada ao cubo principal
    for (let i = 0; i < 8; i++) {
      let stairStepGeometry = new THREE.BoxGeometry(25.0, stairHeight, stairHeight * (1 + 7 - i));
      let stairStep = new THREE.Mesh(stairStepGeometry, material);
      if (i == 0) {
        stairStep.position.set(stairPositionX, -10.5, 60);
      } else {
        stairStep.position.set(stairPositionX, -10.5 + stairHeight * i, 60 - (stairHeight * i) / 2);
      }
      cube.add(stairStep);
    }


  }

  static createTerrain(scene) {
    //create walls
    let wallGeometry = new THREE.BoxGeometry(500, 72, 2); // mudança de planeGeometry por BoxGeometry porque sendo um plano a esfera não estava identificando colisão, quando coloquei uma leve espessura, ela colide com a esfera  
    let wallMaterial = new THREE.MeshBasicMaterial();
    let walls = [];


    for (let i = 0; i < 4; ++i) {
      walls.push(new THREE.Mesh(wallGeometry, wallMaterial));
    }

    walls[0].position.set(0, 36, -250);

    walls[1].position.set(-250, 36, 0);
    walls[1].rotation.y = Math.PI / 2;

    walls[2].position.set(250, 36, 0);
    walls[2].rotation.y = Math.PI / -2;

    walls[3].position.set(0, 36, 250);
    walls[3].rotation.y = Math.PI

    for (let i = 0; i < walls.length; i++) {
      scene.add(walls[i]);
      let wallBox = new THREE.Box3().setFromObject(walls[i], true);
      console.log(wallBox.min, wallBox.max);

      this.collidableWalls.push({ box: wallBox, mesh: walls[i] });
    }

    // create the ground plane
    let planeGeometry = new THREE.BoxGeometry(510, 2, 510);
    let planeMaterial = setDefaultMaterial('lightgray')
    let plane = new THREE.Mesh(planeGeometry, planeMaterial)

    scene.add(plane);
  }
}