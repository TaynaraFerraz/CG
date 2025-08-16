import * as THREE from 'three';

export class playerHealthBar {
    #player;
    #camera;
    #barWidth;
    #barHeight;
    #greenBar;
    #redBar;

    constructor(player, camera, barWidth, barHeight) {
        this.#player = player;
        this.#camera = camera;
        this.#barWidth = barWidth;
        this.#barHeight = barHeight;

        let greenPlaneGeometry = new THREE.PlaneGeometry(barWidth, barHeight);
        let greenPlaneMaterial = new THREE.MeshBasicMaterial({ color: '#00910c', side: THREE.DoubleSide });
        this.#greenBar = new THREE.Mesh(greenPlaneGeometry, greenPlaneMaterial);

        let redPlaneGeometry = new THREE.PlaneGeometry(0, barHeight);
        let redPlaneMaterial = new THREE.MeshBasicMaterial({ color: '#8d0000', side: THREE.DoubleSide });
        this.#redBar = new THREE.Mesh(redPlaneGeometry, redPlaneMaterial);

        // Adiciona as barras como filhas da câmera do player
        this.#camera.add(this.#greenBar);
        this.#camera.add(this.#redBar);
    }

    #positionBars() {
        // Barra sempre fixa na frente da câmera do player
        let offset = new THREE.Vector3(-0.092, 0.07, -0.2); // ajuste conforme necessário
        this.#greenBar.position.copy(offset);
        this.#redBar.position.copy(offset);
    }

    #rotateBars() {
        // Mantém as barras sempre "de frente" para a câmera (não precisa girar se já são filhas da câmera)
        this.#greenBar.rotation.set(0, 0, 0);
        this.#redBar.rotation.set(0, 0, 0);
    }

    #resizeBars(health, maxHealth) {
        let greenBarScale = (health / maxHealth)
        let greenBarWidth = greenBarScale * this.#barWidth;

        this.#greenBar.geometry.dispose();
        this.#greenBar.geometry = new THREE.PlaneGeometry(greenBarWidth, this.#barHeight);
        this.#greenBar.geometry.translate((-this.#barWidth / 2 + greenBarWidth / 2), 0, 0);

        let redBarWidth = this.#barWidth - greenBarWidth;
        this.#redBar.geometry.dispose();
        this.#redBar.geometry = new THREE.PlaneGeometry(this.#barWidth - greenBarWidth, this.#barHeight);
        this.#redBar.geometry.translate(this.#barWidth / 2 - redBarWidth / 2, 0, 0)
    }

    update(health, maxHealth) {
        this.#positionBars();
        this.#resizeBars(health, maxHealth);
        this.#rotateBars();
    }

    remove() {
        this.#camera.remove(this.#greenBar);
        this.#camera.remove(this.#redBar);
        this.#greenBar.geometry.dispose();
        this.#greenBar.material.dispose();
        this.#greenBar = undefined;

        this.#redBar.geometry.dispose();
        this.#redBar.material.dispose();
        this.#redBar = undefined;
    }
}