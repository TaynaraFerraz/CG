import {
    Euler,
    EventDispatcher,
    Vector3
} from 'three';

const _euler = new Euler( 0, 0, 0, 'YXZ' );
const _eulerHolder = new Euler( 0, 0, 0, 'YXZ' );
const _vector = new Vector3();

const _changeEvent = { type: 'change' };
const _lockEvent = { type: 'lock' };
const _unlockEvent = { type: 'unlock' };

const _PI_2 = Math.PI / 2;

class PointerLockControls extends EventDispatcher {

    constructor(holder, camera, domElement ) {

        super();
        this.holder = holder;
        this.camera = camera;
        this.domElement = domElement;



        this.isLocked = false;

        // Set to constrain the pitch of the camera
        // Range is 0 to Math.PI radians
        this.minPolarAngle = 0; // radians
        this.maxPolarAngle = Math.PI; // radians

        this.pointerSpeed = 1.0;

        this._onMouseMove = onMouseMove.bind( this );
        this._onPointerlockChange = onPointerlockChange.bind( this );
        this._onPointerlockError = onPointerlockError.bind( this );

        this.connect();

    }

    connect() {

        this.domElement.ownerDocument.addEventListener( 'mousemove', this._onMouseMove );
        this.domElement.ownerDocument.addEventListener( 'pointerlockchange', this._onPointerlockChange );
        this.domElement.ownerDocument.addEventListener( 'pointerlockerror', this._onPointerlockError );

    }

    disconnect() {

        this.domElement.ownerDocument.removeEventListener( 'mousemove', this._onMouseMove );
        this.domElement.ownerDocument.removeEventListener( 'pointerlockchange', this._onPointerlockChange );
        this.domElement.ownerDocument.removeEventListener( 'pointerlockerror', this._onPointerlockError );

    }

    dispose() {

        this.disconnect();

    }

    getObject() { // retaining this method for backward compatibility

        return this.holder;

    }

    getDirection( v ) {

        return v.set( 0, 0, - 1 ).applyQuaternion( this.camera.quaternion );

    }

    moveForward( distance ) {

        // move forward parallel to the xz-plane
        // assumes camera.up is y-up

        const holder = this.holder;

        _vector.setFromMatrixColumn( holder.matrix, 0 );

        _vector.crossVectors( holder.up, _vector );

        holder.position.addScaledVector( _vector, distance );

    }

    moveRight( distance ) {

        const holder = this.holder;

        _vector.setFromMatrixColumn( holder.matrix, 0 );

        holder.position.addScaledVector( _vector, distance );

    }

    lock() {

        this.domElement.requestPointerLock();

    }

    unlock() {

        this.domElement.ownerDocument.exitPointerLock();

    }

}

// event listeners

function onMouseMove( event ) {

    if ( this.isLocked === false ) return;
    
    //para garantir compatibilidade entre navegadores
    // respectivamente: padrão atual, Firefox antigo, chrome antigo
    const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    let range = 300;
    if(movementX > range || movementX < -range) return;

    const camera = this.camera;
    const holder = this.holder;

    // Separa os euleres para a câmera e o holder
    _euler.setFromQuaternion( camera.quaternion );
    _eulerHolder.setFromQuaternion( holder.quaternion );

    // Atualiza o yaw (rotação Y) do holder com o movimento horizontal do mouse
    _eulerHolder.y -= movementX * 0.002 * this.pointerSpeed;

    // Atualiza o pitch (rotação X) da câmera com o movimento vertical do mouse
    _euler.x -= movementY * 0.002 * this.pointerSpeed;

    // Limita o pitch para não virar de cabeça para baixo
    _euler.x = Math.max( _PI_2 - this.maxPolarAngle, Math.min( _PI_2 - this.minPolarAngle, _euler.x ) );

    // Aplica as rotações calculadas
    camera.quaternion.setFromEuler( _euler );
    holder.quaternion.setFromEuler( _eulerHolder );

    this.dispatchEvent( _changeEvent );
}

function onPointerlockChange() {

    if ( this.domElement.ownerDocument.pointerLockElement === this.domElement ) {

        this.dispatchEvent( _lockEvent );

        this.isLocked = true;

    } else {

        this.dispatchEvent( _unlockEvent );

        this.isLocked = false;

    }

}

function onPointerlockError() {

    console.error( 'THREE.PointerLockControls: Unable to use Pointer Lock API' );

}

export { PointerLockControls };
