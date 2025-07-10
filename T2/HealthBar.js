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
        let greenPlaneGeometry = new THREE.PlaneGeometry(barWidth, barHeight);
        let greenPlaneMaterial = new THREE.MeshBasicMaterial({ color: '#00910c', side: THREE.DoubleSide });
        this.#greenBar = new THREE.Mesh(greenPlaneGeometry, greenPlaneMaterial);
        this.#greenBar.translateY(2.3);


        let redPlaneGeometry = new THREE.PlaneGeometry(0, barHeight);
        let redPlaneMaterial = new THREE.MeshBasicMaterial({ color: '#8d0000', side: THREE.DoubleSide });
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

    #resizeBars(health, maxHealth) {
        let greenBarScale = (health / maxHealth)
        let greenBarWidth = greenBarScale * this.#barWidth;

        this.#greenBar.geometry.dispose();
        this.#greenBar.geometry = new THREE.PlaneGeometry(greenBarWidth, this.#barHeight);
        this.#greenBar.geometry.translate((-this.#barWidth/2 + greenBarWidth/2), 0, 0);

        let redBarWidth = this.#barWidth - greenBarWidth;
        this.#redBar.geometry.dispose();
        this.#redBar.geometry = new THREE.PlaneGeometry(this.#barWidth - greenBarWidth, this.#barHeight);
        this.#redBar.geometry.translate(this.#barWidth/2 - redBarWidth/2, 0, 0)

    }

    update(health, maxHealth) {
        this.#rotateBars();
        this.#resizeBars(health, maxHealth);
    }
}