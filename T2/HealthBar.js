import * as THREE from 'three';
import { scene } from './camera.js';

export class HealthBar {
    #enemy;
    #barWidth;
    #barHeight;
    #greenBar;
    #redBar;

    constructor(enemy, barWidth, barHeight) {
        this.#enemy = enemy;
        this.#barWidth = barWidth;
        this.#barHeight = barHeight;
        let greenPlaneGeometry = new THREE.PlaneGeometry(this.#barWidth, this.#barHeight);
        let greenPlaneMaterial = new THREE.MeshBasicMaterial( {color: 'green', side: THREE.DoubleSide});
        this.#greenBar = new THREE.Mesh(greenPlaneGeometry, greenPlaneMaterial);
        this.#greenBar.translateY(2.3);
        

        let redPlaneGeometry = new THREE.PlaneGeometry(0, this.#barHeight);
        let redPlaneMaterial = new THREE.MeshBasicMaterial( {color: 'red', side: THREE.DoubleSide});
        this.#redBar = new THREE.Mesh(redPlaneGeometry, redPlaneMaterial);
        this.#redBar.translateY(2.3);
        
        scene.add(this.#greenBar);
        enemy.object.attach(this.#greenBar);

        scene.add(this.#redBar);
        enemy.object.attach(this.#redBar);
    }

    #rotateBars() {
        let playerPosition = new THREE.Vector3();

        playerPosition = this.#enemy.player.getWorldPosition(playerPosition);
        
        this.#greenBar.lookAt(playerPosition);
        this.#redBar.lookAt(playerPosition);
    }

    #resizeBars(health, maxHealth){
        let greenBarScale = (health / maxHealth)
        console.log(greenBarScale);
        
        this.#greenBar.scale.y = 6;
        //this.#redBar.scale.x = 1 - greenBarScale;
    }
    update(health, maxHealth){
        this.#rotateBars();
        this.#resizeBars(health, maxHealth);
    }
}