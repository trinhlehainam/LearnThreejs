import * as THREE from '../lib/three/three.js';
import {OrbitControls} from '../lib/three/OrbitControls.js'
import {GLTFLoader} from '../lib/three/GLTFLoader.js'
import {LoadingBar} from '../lib/util/LoadingBar.js'

class App{
    constructor() {
        this.renderer = new THREE.WebGLRenderer();
        document.body.appendChild(this.renderer.domElement);
        this.renderer.setSize(window.innerWidth/window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.scene = new THREE.Scene();
        this.scene.background = 0xaaaaaa;

        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 100);
        this.camera.position.set(0, 0, 2);
        this.scene.add(this.camera);

        this.ambient = new THREE.AmbientLight(0x999999, 1);
        this.scene.add(this.ambient);

        this.clock = new THREE.Clock();

        this.loadingBar = new LoadingBar();
        this.loadModel();

        const control = new OrbitControls(this.camera, this.renderer.domElement);
        
        window.addEventListener('resize', this.resize.bind(this));
        this.renderer.render(this.scene, this.camera);
    }

    resize() {
        this.camera.aspect = window.innerWidth/window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth/window.innerHeight);
    }

    loadModel() {
        const loader = new GLTFLoader().setPath('../assets/plane/');
        loader.load(
           'microplane.glb',
            gltf => {
                this.scene.add(gltf.scene);
                this.plane = gltf.scene;
                this.loadingBar.visible = false;
                this.renderer.setAnimationLoop(this.render.bind(this));
            },
            xhr => {
                this.loadingBar.progress = xhr.loaded/xhr.total;
            },
            err => {
                console.error(err);
            }
        )
    }

    render() {
        this.plane.rotateY(1.0 * this.clock.getDelta()); 
    }
}

export {App};
