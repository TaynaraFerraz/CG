import * as THREE from '../build/three.module.js';
import { GLTFLoader } from '../build/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from '../build/jsm/loaders/OBJLoader.js';
import { MTLLoader } from '../build/jsm/loaders/MTLLoader.js';

class desertArea {

  static outerWalls = [];
  static tumbleweed;
  static tumbleweedgoing = true;
  static tumbleweedup = true;

  static createAreaDesert(scene, collidableAreas, collidableStairs) {
    let position = new THREE.Vector3(0.0, 6.0, 130.0);
    let height = 12.0;
    let length = 240.0;
    
    
    let textureLoader = new THREE.TextureLoader();
    let sandTex = textureLoader.load('./assets/area4/sand.jpg');
    sandTex.wrapS = THREE.RepeatWrapping;
    let material = this.lambertMaterial("rgb(194, 178, 128)");
    material.map = sandTex;
    let cubegeometry = new THREE.BoxGeometry(length, height, 140.0);
    let cube = new THREE.Mesh(cubegeometry, material);
    cube.position.copy(position);
    cube.material.map.wrapS = THREE.RepeatWrapping;
    cube.material.map.wrapT = THREE.RepeatWrapping;
    cube.material.map.repeat.set(12, 7);
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(cube);

    let boxCube = new THREE.Box3().setFromObject(cube, true);
    collidableAreas.push({ box: boxCube, mesh: cube });

    //carregar piramide
    this.piramideLoader(scene, cube, collidableAreas, new THREE.Vector3(100, height / 2 + 5, 5), height, 2, Math.PI /2);
    this.piramideColision(scene, cube, collidableAreas, new THREE.Vector3(100, height / 2 + 5, 5), 10, 2);
    this.piramideLoader(scene, cube, collidableAreas, new THREE.Vector3(-90, height / 2 + 15, 15), height, 3, Math.PI /2);
    this.piramideColision(scene, cube, collidableAreas, new THREE.Vector3(-90, height / 2 + 15, 15), 15, 3);
    this.piramideLoader(scene, cube, collidableAreas, new THREE.Vector3(0, height / 2 + 25, 25), height, 5, Math.PI /2);
    this.piramideColision(scene, cube, collidableAreas, new THREE.Vector3(0, height / 2 + 25, 25), 25, 5);


    let stair = new THREE.Mesh(
        new THREE.BoxGeometry(6, 2.2, 18),
        this.lambertMaterial("lightgray")
    );
    let stairTex = textureLoader.load('./assets/area4/cobblestone.jpg');
    stairTex.wrapS = THREE.RepeatWrapping;
    stairTex.wrapT = THREE.RepeatWrapping;
    stair.material.map = stairTex;
    stair.material.map.repeat.set(1, 2);
    stair.rotateX(-Math.PI/ 3.9);
    stair.castShadow = true;
    stair.receiveShadow = true;
    stair.position.set(0, -1, -75.5);
    cube.add(stair);

    let boxStair = new THREE.Box3().setFromObject(stair, true);
    collidableStairs.push({ box: boxStair, mesh: stair });


    let darkbricks = textureLoader.load('./assets/area4/darkbricks.jpg');
    darkbricks.wrapS = THREE.RepeatWrapping;
    let innerWalls = [];
    innerWalls.push(new THREE.Mesh(new THREE.BoxGeometry(248, 14, 4), this.lambertMaterial("gray")));
    innerWalls[0].position.set(0, 1, 72);
    innerWalls.push(new THREE.Mesh(new THREE.BoxGeometry(4, 14, 148), this.lambertMaterial("gray")));
    innerWalls[1].position.set(122, 1, 0);
    innerWalls.push(new THREE.Mesh(new THREE.BoxGeometry(4, 14, 148), this.lambertMaterial("gray")));
    innerWalls[2].position.set(-122, 1, 0);
    innerWalls.push(new THREE.Mesh(new THREE.BoxGeometry(121, 14, 4), this.lambertMaterial("gray")));
    innerWalls[3].position.set(63.5, 1, -72);
    innerWalls.push(new THREE.Mesh(new THREE.BoxGeometry(121, 14, 4), this.lambertMaterial("gray")));
    innerWalls[4].position.set(-63.5, 1, -72);
    innerWalls.push(new THREE.Mesh(new THREE.BoxGeometry(6, 8, 4), this.lambertMaterial("gray")));
    innerWalls[5].position.set(0, -3, -72);

    for(let i = 0; i < innerWalls.length; i++) {
      innerWalls[i].material.map = darkbricks;
      innerWalls[i].material.map.wrapS = THREE.RepeatWrapping;
      innerWalls[i].material.map.wrapT = THREE.RepeatWrapping;
      innerWalls[i].material.map.repeat.x = 4;
      innerWalls[i].material.map.repeat.y = 1;
        innerWalls[i].castShadow = true;
        innerWalls[i].receiveShadow = true;
        cube.add(innerWalls[i]);
    
        let boxInnerWall = new THREE.Box3().setFromObject(innerWalls[i], true);
        collidableAreas.push({ box: boxInnerWall, mesh: innerWalls[i] });
    }

    this.outerWalls.push(new THREE.Mesh(new THREE.BoxGeometry(270, 50, 4), this.lambertMaterial("gray")));
    this.outerWalls[0].position.set(0, 19, 80);
    this.outerWalls.push(new THREE.Mesh(new THREE.BoxGeometry(270, 50, 4), this.lambertMaterial("gray")));
    this.outerWalls[1].position.set(0, 19, -80);
    this.outerWalls.push(new THREE.Mesh(new THREE.BoxGeometry(4, 50, 156), this.lambertMaterial("gray")));
    this.outerWalls[2].position.set(133, 19, 0);
    this.outerWalls.push(new THREE.Mesh(new THREE.BoxGeometry(4, 50, 156), this.lambertMaterial("gray")));
    this.outerWalls[3].position.set(-133, 19, 0);


    for(let i = 0; i < this.outerWalls.length; i++) {
        this.outerWalls[i].material.map = darkbricks;
        this.outerWalls[i].material.map.wrapS = THREE.RepeatWrapping;
        this.outerWalls[i].material.map.wrapT = THREE.RepeatWrapping;
        this.outerWalls[i].material.map.repeat.x = 4;
        this.outerWalls[i].material.map.repeat.y = 1;
        this.outerWalls[i].castShadow = true;
        this.outerWalls[i].receiveShadow = true;
        cube.add(this.outerWalls[i]);
    
        let boxInnerWall = new THREE.Box3().setFromObject(this.outerWalls[i], true);
        collidableAreas.push({ box: boxInnerWall, mesh: this.outerWalls[i] });
    }

    let gtfLoader = new GLTFLoader();
    gtfLoader.load('./assets/area4/tumbleweed.glb', function (response) {
      let obj = response.scene;

      obj.position.set(90, 9, -30);
      obj.scale.set(0.007,0.007,0.007);

      if (obj.material) {
        obj.material.transparent = true;
      }
      obj.traverse(function (child) {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.material.transparent = true;
        }
      });
      cube.add(obj);
      desertArea.tumbleweed = obj;
    });
    
  }

  static piramideColision(scene, father, collidableAreas, position, correcao, scale) {
    // Parâmetros da escada
    const numDegraus = 21;
    const larguraBase = 14 * scale;
    const larguraTopo = 1 * scale // largura da escada
    const profundidade = 0.5 * scale; // profundidade de cada degrau
    const alturaDegrau = 0.5 * scale;
    const visibilidade = false;

    // parte de tras
    for(let i = 0; i < numDegraus; ++i) {
      let largura = larguraBase - ((larguraBase - larguraTopo) * (i / (numDegraus - 1)));
      let traseira = new THREE.Mesh(
        new THREE.BoxGeometry(largura, alturaDegrau, profundidade),
        this.lambertMaterial("darkgray")
      );
      traseira.position.set(
        position.x,
        position.y-correcao+alturaDegrau*i,
        position.z + 7 *scale- profundidade/1.5*i
      );
      traseira.visible = visibilidade;
      father.add(traseira);
      let box = new THREE.Box3().setFromObject(traseira,true);
      collidableAreas.push({ box: box, mesh: traseira });
    }

    // Lado direito
    for(let i = 0; i < numDegraus; ++i) {
        let largura = larguraBase - ((larguraBase - larguraTopo) * (i / (numDegraus - 1)));
        let degrauDir = new THREE.Mesh(
            new THREE.BoxGeometry(profundidade, alturaDegrau, largura),
            this.lambertMaterial("darkgray")
        );
        degrauDir.position.set(
            position.x + 7 * scale - profundidade / 1.5 * i,
            position.y - correcao + alturaDegrau * i,
            position.z
        );
        degrauDir.visible = visibilidade;
        father.add(degrauDir);
        let boxDegrauDir = new THREE.Box3().setFromObject(degrauDir, true);
        collidableAreas.push({ box: boxDegrauDir, mesh: degrauDir });
    }

    // Lado esquerdo
    for(let i = 0; i < numDegraus; ++i) {
        let largura = larguraBase - ((larguraBase - larguraTopo) * (i / (numDegraus - 1)));
        let degrauEsq = new THREE.Mesh(
            new THREE.BoxGeometry(profundidade, alturaDegrau, largura),
            this.lambertMaterial("darkgray")
        );
        degrauEsq.position.set(
            position.x - 7 * scale + profundidade / 1.5 * i,
            position.y - correcao + alturaDegrau * i,
            position.z
        );
        degrauEsq.visible = visibilidade;
        father.add(degrauEsq);
        let boxDegrauEsq = new THREE.Box3().setFromObject(degrauEsq, true);
        collidableAreas.push({ box: boxDegrauEsq, mesh: degrauEsq });
    }

    // frente/entrada
    for(let i = 4; i < numDegraus; ++i) {
        let largura = larguraBase - ((larguraBase - larguraTopo) * (i / (numDegraus - 1)));
        let degrauTras = new THREE.Mesh(
            new THREE.BoxGeometry(largura, alturaDegrau, profundidade),
            this.lambertMaterial("darkgray")
        );
        degrauTras.position.set(
            position.x,
            position.y - correcao + alturaDegrau * i,
            position.z - 7 * scale + profundidade / 1.5 * i
        );
        degrauTras.visible = visibilidade;0
        father.add(degrauTras);
        let boxDegrauTras = new THREE.Box3().setFromObject(degrauTras, true);
        collidableAreas.push({ box: boxDegrauTras, mesh: degrauTras });
    }

    let auxEsq = new THREE.Mesh(
      new THREE.BoxGeometry(larguraBase/2-4, alturaDegrau, profundidade*2),
      this.lambertMaterial("darkgray")
    );
    auxEsq.position.set(
      position.x - larguraBase/4 - scale+2,
      position.y - correcao + alturaDegrau,
      position.z - 7 * scale + 2.5
    );
    auxEsq.visible = visibilidade;
    father.add(auxEsq);
    let auxDir = new THREE.Mesh(
      new THREE.BoxGeometry(larguraBase/2-4, alturaDegrau, profundidade*2),
      this.lambertMaterial("darkgray")
    );
    auxDir.position.set(
      position.x + larguraBase/4 + scale-2,
      position.y - correcao + alturaDegrau,
      position.z - 7 * scale + 2.5
    );
    auxDir.visible = visibilidade;
    father.add(auxDir);
    let boxAuxEsq = new THREE.Box3().setFromObject(auxEsq, true);
    let boxAuxDir = new THREE.Box3().setFromObject(auxDir, true);
    collidableAreas.push({ box: boxAuxEsq, mesh: auxEsq });
    collidableAreas.push({ box: boxAuxDir, mesh: auxDir });
}

  static piramideLoader(scene, father, collidableAreas, position, height, scale, rotation) {

    let mtlLoader = new MTLLoader();
    mtlLoader.load('./assets/area4/piramide.mtl', function (materials) {
      materials.preload();

      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.load('./assets/area4/piramide.obj', function (obj) {
        obj.traverse(function (child) {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.material.transparent = true;
          }
        });

        obj.position.copy(position);
        obj.scale.set(scale, scale, scale);
        obj.rotation.y = rotation;
        if (obj.material) {
          obj.material.transparent = true;
        }
        
        father.add(obj);
        let boxPiramide = new THREE.Box3().setFromObject(obj, true);
        collidableAreas.push({ box: boxPiramide, mesh: obj });

      });
    });
  }

  static lambertMaterial(color) {
    return new THREE.MeshLambertMaterial({ color: color });
  }

  static wallDown(collidableAreas){
    for(let i = 0; i < this.outerWalls.length; ++i){
      if(this.outerWalls[i].position.y > - 31)
        this.outerWalls[i].position.y -= 0.2;
        let wallcollidable = collidableAreas.find(obj => obj.mesh === this.outerWalls[i]);
        if(wallcollidable)
          wallcollidable.box .setFromObject(this.outerWalls[i], true);
    }
  }

  static tumbleweedAnimate(){
    if (!this.tumbleweed) return;
    if (this.tumbleweedgoing) {
      this.tumbleweed.position.x += 0.1;
      if (this.tumbleweed.position.x > 100) {
        console.log("tumbleweed");
        this.tumbleweedgoing = false;
      }
    } else {
      this.tumbleweed.position.x -= 0.1;
      if (this.tumbleweed.position.x < -100) {
        this.tumbleweedgoing = true;
      }
    }

    if(this.tumbleweedup){
      this.tumbleweed.position.y += 0.05;
      if(this.tumbleweed.position.y > 9)
        this.tumbleweedup = false;
    } else {
      this.tumbleweed.position.y -= 0.05;
      if(this.tumbleweed.position.y < 7)
        this.tumbleweedup = true;
    }

    this.tumbleweed.rotation.y += 0.01;
    this.tumbleweed.rotation.x += 0.01;
    this.tumbleweed.rotation.z += 0.01;
  }
}

export { desertArea };