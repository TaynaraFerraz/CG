import * as THREE from 'three';
import { PLAYER_HEIGHT, PLAYER_WIDTH, SHIFT_MULTIPLIER, SPEED } from './constants.js';


export class Area {
  static collidableAreas = [];
  static collidableWalls = [];
  static collidableStairs = [];
  static altares = [];
  static elevador = [];
  static door = [];
  static elevadorCheck;
  static isDown = false;

  constructor(scene) {
    this.scene = scene;
  }

  static createMap(scene) {
    let positions = [];

    //posições para o bloco principal de cada área
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

  //TODO: criar objeto de referencia para cada area
  static createAreaPilars(scene) {
    let position = new THREE.Vector3(-160.0, 2.0, -162.0);
    let height = 4.0;
    let length = 120.0;
    let leftLength = 20.0;
    let rightLength = 75.0;
    
    //cubo principal
    let material = this.lambertMaterial('lightblue'); // remover depois 
    let cubeGeometry = new THREE.BoxGeometry(length, height, 116.0);
    let cube = new THREE.Mesh(cubeGeometry, material);
    cube.position.copy(position);

    let boxCube = new THREE.Box3().setFromObject(cube, true);
    this.collidableAreas.push({ box: boxCube, mesh: cube });
    scene.add(cube);

    let cubeGeometry2 = new THREE.BoxGeometry(leftLength, height, 4.0);
    let cubeLeft = new THREE.Mesh(cubeGeometry2, material);
    //calculo da posição do cubo esquerdo em relação ao cubo principal
    cubeLeft.position.set(-(length - leftLength) / 2, 0.0, 60.0);
    cube.add(cubeLeft);

    let cubeGeometry3 = new THREE.BoxGeometry(rightLength, height, 4.0);
    let cubeRight = new THREE.Mesh(cubeGeometry3, material);
    //calculo da posição do cubo direito em relação ao cubo principal
    cubeRight.position.set((length - rightLength) / 2, 0.0, 60.0);
    cube.add(cubeRight);

    //colisão
    let leftBoxCube = new THREE.Box3().setFromObject(cubeLeft, true);
    let rightBoxCube = new THREE.Box3().setFromObject(cubeRight, true);
    this.collidableAreas.push({ box: leftBoxCube, mesh: cubeLeft });
    this.collidableAreas.push({ box: rightBoxCube, mesh: cubeRight });

    //escadas
    let stairHeight = 4 / 8;
    //calculo da posição da escada em relação ao cubo principal
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

    cube.add(stair);
    let box = new THREE.Box3().setFromObject(stair, true);
    this.collidableStairs.push({ box: box, mesh: stair });

    //reescrever/deixar mais legivel se possivel
    //as constantes são correções para a escada ficar alinhada ao cubo principal
    for (let i = 0; i < 8; i++) {
      let stairStepGeometry = new THREE.BoxGeometry(25.0, stairHeight, stairHeight * (1 + 7 - i));
      let stairStep = new THREE.Mesh(stairStepGeometry, this.lambertMaterial('#ffe6d2'));
      if (i == 0) {
        stairStep.position.set(stairPositionX, -1.75, 60.0);
      } else {
        stairStep.position.set(stairPositionX, -1.75 + stairHeight * i, 60.0 - (stairHeight * i) / 2);
      }
      cube.add(stairStep);
    }

    for(let i = 0; i < 12; i++) {
      let pilarGeometry = new THREE.CylinderGeometry(2.5, 2.5, 20.0);
      let pilarMaterial = this.lambertMaterial('#a7a7a7');
      let pilar = new THREE.Mesh(pilarGeometry, pilarMaterial);
      pilar.position.set(-50.0+(100/11)*i, 12.0, -48.0);
      
      cube.add(pilar);
      let boxPilar = new THREE.Box3().setFromObject(pilar, true);
      this.collidableAreas.push({ box: boxPilar, mesh: pilar });
      
      let pilarLeft = new THREE.Mesh(pilarGeometry, pilarMaterial);
      let pilarRight = new THREE.Mesh(pilarGeometry, pilarMaterial);
      pilarRight.position.set(50.0, 12.0, -48.0+(100/11)*i);
      pilarLeft.position.set(-50.0, 12.0, -48.0+(100/11)*i);
      cube.add(pilarRight);
      cube.add(pilarLeft);

      let boxPilarLeft = new THREE.Box3().setFromObject(pilarLeft, true);
      let boxPilarRight = new THREE.Box3().setFromObject(pilarRight, true);
      this.collidableAreas.push({ box: boxPilarLeft, mesh: pilarLeft });
      this.collidableAreas.push({ box: boxPilarRight, mesh: pilarRight });
    }

    let r1 = new THREE.Mesh(new THREE.BoxGeometry(120.0, 5.0, 20.0), this.lambertMaterial('rgb(180, 72, 0)'));
    r1.position.set(0.0, 24.5, -48.0);
    cube.add(r1);

    let r2 = new THREE.Mesh(new THREE.BoxGeometry(120.0, 5.0, 20.0), this.lambertMaterial('rgb(180, 72, 0)'));
    r2.rotateY(Math.PI/2);
    r2.position.set(50.0, 24.5, 2.0);
    cube.add(r2);

    let r3 = new THREE.Mesh(new THREE.BoxGeometry(120.0, 5.0, 20.0), this.lambertMaterial('rgb(180, 72, 0)'));
    r3.rotateY(Math.PI/-2);
    r3.position.set(-50.0, 24.5, 2.0);
    cube.add(r3);

    let altar =  new THREE.Mesh(new THREE.BoxGeometry(4.0, 6.0, 4.0), this.lambertMaterial('#a7a7a7'));
    altar.position.set(0.0, -2.0, 0.0);
    cube.add(altar);

    let boxAltar = new THREE.Box3().setFromObject(altar, true);
    this.collidableAreas.push({ box: boxAltar, mesh: altar });
    this.altares.push(altar);
  }

  static createAreaCubes(scene) {
    let position = new THREE.Vector3(0.0, 3.0, -162.0);
    let height = 6.0;
    let length = 120.0;
    let leftLength = 95.0;
    let rightLength = 20.0;

    //cubo principal
    let material = this.lambertMaterial('red'); // remover depois 
    let cubeGeometry = new THREE.BoxGeometry(length, height, 116.0);
    let cube = new THREE.Mesh(cubeGeometry, material);
    cube.position.copy(position);

    let boxCube = new THREE.Box3().setFromObject(cube, true);
    this.collidableAreas.push({ box: boxCube, mesh: cube });
    scene.add(cube);

    let cubeGeometry2 = new THREE.BoxGeometry(leftLength, height, 4.0);
    let cubeLeft = new THREE.Mesh(cubeGeometry2, material);
    //calculo da posição do cubo esquerdo em relação ao cubo principal
    cubeLeft.position.set(-(length - leftLength) / 2, 0.0, 60.0);
    cube.add(cubeLeft);

    let cubeGeometry3 = new THREE.BoxGeometry(rightLength, height, 4.0);
    let cubeRight = new THREE.Mesh(cubeGeometry3, material);
    //calculo da posição do cubo direito em relação ao cubo principal
    cubeRight.position.set((length - rightLength) / 2, 0.0, 60.0);
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
    cube.add(fechaduraMesh);

    let boxFechadura = new THREE.Box3().setFromObject(fechaduraMesh, true);
    this.collidableAreas.push({ box: boxFechadura, mesh: fechaduraMesh });

    let doorGeometry = new THREE.BoxGeometry(6.0, 7.0, 2.0);
    let doorMaterial = this.lambertMaterial('yellow');
    let door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(37.5, 0.0, 62.0);
    cube.add(door);

    let boxDoor = new THREE.Box3().setFromObject(door, true);
    this.collidableAreas.push({ box: boxDoor, mesh: door });
    this.door.push(door);

    //elevador
    let elevadorGeometry = new THREE.BoxGeometry(5.0, 6.0, 4.0);
    let elevadorMaterial = this.lambertMaterial('brown');
    let elevador = new THREE.Mesh(elevadorGeometry, elevadorMaterial);
    elevador.position.set(37.5, 0.0, 60.0);
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

    for(let i = 0; i < 6; i++) {
      for(let j = 0; j < 6; j++) {
        if((i == 2 || i == 3) && (j == 2 || j == 3))
          continue;
        let cubeGeometry = new THREE.BoxGeometry(3.0, 20.0, 3.0);
        let cubeMaterial = this.lambertMaterial('blue');
        let pilar = new THREE.Mesh(cubeGeometry, cubeMaterial);
        if(i % 2 == 0 && j % 2 == 0)
          pilar.position.set(-50.0 + 20 * i, 21.0, -50.0 + 20 * j);
        else if(i == j)
          pilar.position.set(-50.0 + 20 * i, 17.0, -50.0 + 20 * j);
        else if(i % 3 == 0 || j % 3 == 0)
          pilar.position.set(-50.0 + 20 * i, 8.0, -50.0 + 20 * j);
        else
          pilar.position.set(-50.0 + 20 * i, 13.0, -50.0 + 20 * j);
        cube.add(pilar);

        let pilarBox = new THREE.Box3().setFromObject(pilar, true);
        this.collidableAreas.push({ box: pilarBox, mesh: pilar });
      }
    }

    let altar =  new THREE.Mesh(new THREE.BoxGeometry(4.0, 6.0, 4.0), this.lambertMaterial('#a7a7a7'));
    altar.position.set(0.0, -3.0, 0.0);
    cube.add(altar);

    let boxAltar = new THREE.Box3().setFromObject(altar, true);
    this.collidableAreas.push({ box: boxAltar, mesh: altar });
    this.altares.push(altar);

    let pilarGeometry = new THREE.BoxGeometry(4.0, 20.0, 4.0);
    let pilarMaterial = this.lambertMaterial('blue');
    let pilar = new THREE.Mesh(pilarGeometry, pilarMaterial);
    pilar.position.set(0.0, 16.0, 0.0);
    
    altar.add(pilar);
    
    let pilarBox = new THREE.Box3().setFromObject(pilar, true);
    this.collidableAreas.push({ box: pilarBox, mesh: pilar });
  }

  static createArea(scene, position, i) {
    if(i == 0 || i == 1)
      return;
    let material;
    //criação da base da plataforma
    //inicialização com valores padrão (plataforma pequena com escada ao centro)
    const height = 24.0;
    let length = 120.0;
    let leftLength = 47.5;
    let rightLength = 47.5;

    //definição do material e tamanho da plataforma de acordo com o índice
    if (i == 0) {
      material = this.lambertMaterial('lightblue');
      leftLength = 15.0;
      rightLength = 80.0;
    }
    if (i == 1) {
      material = this.lambertMaterial('#ff3535');
      leftLength = 80.0;
      rightLength = 15.0;
    }
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
    scene.add(cube);

    //colisão
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
    //calculo da posição do cubo direito em relação ao cubo principal
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
    
    let stair = new THREE.Mesh(new THREE.PlaneGeometry(26, 38), this.lambertMaterial('green'));
    stair.visible = false;
    stair.position.set(stairPositionX, 0, 60.0);
    stair.translateZ(1);
    stair.rotateX(-1 * Math.PI / 3.8);

    cube.add(stair);
    let box = new THREE.Box3().setFromObject(stair, true);
    this.collidableStairs.push({ box: box, mesh: stair });

    //reescrever/deixar mais legivel se possivel
    //as constantes são correções para a escada ficar alinhada ao cubo principal
    for (let i = 0; i < 8; i++) {
      let stairStepGeometry = new THREE.BoxGeometry(25.0, stairHeight, stairHeight * (1 + 7 - i));
      let stairStep = new THREE.Mesh(stairStepGeometry, this.lambertMaterial('#ffe6d2'));
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
    let wallMaterial = this.lambertMaterial('#a7a7a7');
    let walls = [];


    for (let i = 0; i < 4; ++i) {
      walls.push(new THREE.Mesh(wallGeometry, wallMaterial));
    }

    //posicionamento e rotação das paredes
    walls[0].position.set(0, 36, -250);

    walls[1].position.set(-250, 36, 0);
    walls[1].rotation.y = Math.PI / 2;

    walls[2].position.set(250, 36, 0);
    walls[2].rotation.y = Math.PI / -2;

    walls[3].position.set(0, 36, 250);
    walls[3].rotation.y = Math.PI

    //colisão das paredes
    for (let i = 0; i < walls.length; i++) {
      scene.add(walls[i]);
      let wallBox = new THREE.Box3().setFromObject(walls[i], true);

      this.collidableWalls.push({ box: wallBox, mesh: walls[i] });
    }

    // create the ground plane
    let planeGeometry = new THREE.PlaneGeometry(510, 510);
    let planeMaterial = this.lambertMaterial('#a7a7a7');
    let plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotateX(-Math.PI/2);

    scene.add(plane);
  }

  static lambertMaterial(color){
    return new THREE.MeshLambertMaterial({ color: color });
  }

  static doorDown() {
    let door = this.door[0];
    //posição final da porta 37.5, 0.0, 62.0
    door.position.lerp(new THREE.Vector3(37.5, -8.0, 62.0), 0.01);

    // Atualiza a Box3 da porta no vetor de colisão
    let doorCollidable = this.collidableAreas.find(obj => obj.mesh === door);
    if (doorCollidable) {
        doorCollidable.box.setFromObject(door, true);
    }
  }
  
  static primeiroAltar() {
    let altar = this.altares[0];
    altar.position.lerp(new THREE.Vector3(0.0, 1.0, 0.0), 0.01);

    // Atualiza a Box3 do altar no vetor de colisão
    let altarCollidable = this.collidableAreas.find(obj => obj.mesh === altar);
    if (altarCollidable) {
        altarCollidable.box.setFromObject(altar, true);
    }
}

static segundoAltar() {
    let altar = this.altares[1];
    altar.position.lerp(new THREE.Vector3(0.0, 2.0, 0.0), 0.01);

    // Atualiza a Box3 do altar no vetor de colisão
    let altarCollidable = this.collidableAreas.find(obj => obj.mesh === altar);
    if (altarCollidable) {
        altarCollidable.box.setFromObject(altar, true);
    }
}
}