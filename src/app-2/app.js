import * as THREE from '../../lib/three/three.js'
import {OrbitControls} from '../../lib/three/OrbitControls.js'
import {GLTFLoader} from '../../lib/three/GLTFLoader.js'
import {LoadingBar} from '../../lib/util/LoadingBar.js'
import {DRACOLoader} from '../../lib/three/DRACOLoader.js'
import * as dat from '../../lib/util/dat.gui.module.js'
import Stats from '../../lib/util/Stats.js';

import {Controller} from './controller.js'

function initStats(type) {
    const panelType = (typeof type !== 'undefined' && type) && (!isNaN(type)) ? parseInt(type) : 0;
    const stats = new Stats();
    stats.showPanel(panelType);
    document.body.appendChild(stats.dom);
    return stats;
}

class App{
    constructor() {
        this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);

        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 100);
        this.camera.position.set(0, 2, 5);

        const planeGeo = new THREE.PlaneGeometry(60, 40);
        const planeMat = new THREE.MeshPhongMaterial({color: 0x999999});
        const plane = new THREE.Mesh(planeGeo, planeMat);
        plane.receiveShadow = true;
        plane.rotateX(-0.5*Math.PI);
        this.scene.add(plane);

        const cubeGeo = new THREE.BoxGeometry(2, 2, 2);
        const cubeMat = new THREE.MeshPhongMaterial({color: 0xff0000});
        const cube = new THREE.Mesh(cubeGeo, cubeMat);
        cube.castShadow = true;
        cube.receiveShadow = true;
        cube.position.set(2,2,2);
        this.scene.add(cube);

        this.ambient = new THREE.AmbientLight(0x222222, 1);
        this.scene.add(this.ambient);

        this.light = new THREE.DirectionalLight(0xffffff, 1);
        this.light.castShadow = true;
        this.light.position.set(2, 10, 10);
        this.light.target.position.set(0,0,0);
        this.scene.add(this.light);

        const dirLightHelper = new THREE.DirectionalLightHelper(this.light, 50, 0xffffff);
        this.scene.add(dirLightHelper);

        this.clock = new THREE.Clock();

        this.control = new OrbitControls(this.camera, this.renderer.domElement);

        this.loadingBar = new LoadingBar();
        const modelUrl = '../../assets/factory/eve.glb'
        this.loadGLTF(modelUrl);

        this.gui = new dat.GUI();
        this.stats = initStats();

        this.input = new Controller();
        
        window.addEventListener('resize', this.resize.bind(this));

        console.log("App is constructed !");
    }

    resize() {
        this.camera.aspect = window.innerWidth/window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    loadGLTF(url) {
        const loader = new GLTFLoader();
        const draco = new DRACOLoader();
        draco.setDecoderPath('../../lib/three/draco/');
        loader.setDRACOLoader(draco);

        loader.load(
            url,
            gltf => {
                this.model = gltf.scene;
                this.model.castShadow = true;
                this.scene.add(this.model);
                this.animations = {};
                gltf.animations.forEach(animation => {
                    this.animations[animation.name.toLowerCase()] = animation;
                });
                const keys = Object.keys(this.animations);
                keys.forEach(key => {
                    console.log(key);
                })
                this.mixer = new THREE.AnimationMixer(this.model);
                this.currentClip = 'walk';
                const action = this.mixer.clipAction(this.animations[this.currentClip]);
                action.play();
                this.loadingBar.visible = false;
                this.renderer.setAnimationLoop(this.render.bind(this));
                
                const animGUi = this.gui.addFolder('Animation');
                animGUi.add(this, 'currentClip');

                const posGUI = this.gui.addFolder('Transform');
                posGUI.add(this.model.position, 'x');
                posGUI.add(this.model.position, 'y');
                posGUI.add(this.model.position, 'z');
            },
            xhr => {
                this.loadingBar.progress = xhr.loaded / xhr.total;
            },
            err => {
                console.error(err);
            }
        )
    }

    newAnim(){
        const keys = Object.keys(this.animations);
        const index = Math.floor(Math.random() * keys.length);
        if(keys[index] == this.currentClip) return
        this.currentClip = keys[index];
        const action = this.mixer.clipAction(this.animations[this.currentClip]);
        action.reset();
        action.play();
    }

    render() {
        const dt = this.clock.getDelta();
        if (this.input.isJustPressed(65)) {
            this.newAnim();
        }
        if (this.input.isPressed(37)){
            this.model.position.x += 1*dt;
        }
        if (this.input.isPressed(39)){
            this.model.position.x -= 1*dt;
        }
        if (this.input.isPressed(38)){
            this.model.position.z += 1*dt;
        }
        if (this.input.isPressed(40)){
            this.model.position.z -= 1*dt;
        }
        this.stats.update();
        this.gui.updateDisplay();
        this.mixer.update(dt);
        this.input.update();
        this.renderer.render(this.scene, this.camera);
    }
}

export {App};
