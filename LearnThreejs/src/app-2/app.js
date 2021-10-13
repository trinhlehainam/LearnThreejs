import * as THREE from '../../lib/three/three.js';
import {OrbitControls} from '../../lib/three/OrbitControls.js'
import {GLTFLoader} from '../../lib/three/GLTFLoader.js'
import {LoadingBar} from '../../lib/util/LoadingBar.js'

class App{
    constructor() {
        this.renderer = new THREE.WebGLRenderer();
        document.body.appendChild(this.renderer.domElement);
        this.renderer.setSize(window.innerWidth/window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xaaaa00);

        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 100);
        this.camera.position.set(0, 0, 5);

        this.ambient = new THREE.AmbientLight(0x999999, 1);
        this.scene.add(this.ambient);

        this.light = new THREE.DirectionalLight(0xffffff, 1);
        this.light.position.set(0.2, 1, 1);
        this.scene.add(this.light);

        this.clock = new THREE.Clock();

        const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
        const cubeMat = new THREE.MeshPhongMaterial({color: 0xff0000});
        this.cube = new THREE.Mesh(cubeGeo, cubeMat);
        this.scene.add(this.cube);

        this.loadingBar = new LoadingBar();
        this.loadModel();

        this.control = new OrbitControls(this.camera, this.renderer.domElement);
        
        window.addEventListener('resize', this.resize.bind(this));
    }

    resize() {
        this.camera.aspect = window.innerWidth/window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth/window.innerHeight);
    }

    loadModel() {
        const loader = new GLTFLoader().setPath('../../assets/plane/');
        loader.load(
           'microplane.glb',
            model => {
                this.scene.add(model.scene);
                this.plane = model.scene;
                this.loadingBar.visible = false;
                this.renderer.setAnimationLoop(this.render.bind(this));
            },
            progress => {
                this.loadingBar.progress = progress.loaded/progress.total;
            },
            err => {
                console.error(err);
            }
        )
    }

    render() {
        this.plane.rotateY(1.0 * this.clock.getDelta()); 
        this.renderer.render(this.scene, this.camera);
    }
}

export {App};
