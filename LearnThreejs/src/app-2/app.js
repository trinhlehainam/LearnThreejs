import * as THREE from '../../lib/three/three.js'
import {OrbitControls} from '../../lib/three/OrbitControls.js'
import {GLTFLoader} from '../../lib/three/GLTFLoader.js'
import {LoadingBar} from '../../lib/util/LoadingBar.js'
import {DRACOLoader} from '../../lib/three/DRACOLoader.js'

class App{
    constructor() {
        this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        document.body.appendChild(this.renderer.domElement);

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

        this.control = new OrbitControls(this.camera, this.renderer.domElement);

        this.loadingBar = new LoadingBar();
        this.loadModel('../../assets/plane/microplane.glb');
        
        window.addEventListener('resize', this.resize.bind(this));

        console.log("App is constructed !");
    }

    resize() {
        this.camera.aspect = window.innerWidth/window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    loadModel(url) {
        const loader = new GLTFLoader();
        const draco = new DRACOLoader();
        draco.setDecoderPath('../../lib/three/draco/');
        loader.setDRACOLoader(draco);

        loader.load(
            url,
            model => {
                this.plane = model.scene;
                this.scene.add(this.plane);
                this.loadingBar.visible = false;
                this.renderer.setAnimationLoop(this.render.bind(this));
            },
            xhr => {
                this.loadingBar.progress = xhr.loaded / xhr.total;
            },
            err => {
                console.error(err);
            }
        )
    }

    render() {
        const dt = this.clock.getDelta()
        this.plane.rotateY(1.0 * dt);
        this.renderer.render(this.scene, this.camera);
    }
}

export {App};
