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
        
        const loader = new THREE.TextureLoader();
        this.mats = {
            ball1 : new THREE.MeshPhongMaterial({map: loader.load('../../assets/pool-table/1ball.png')}),
            ball2 : new THREE.MeshPhongMaterial({map: loader.load('../../assets/pool-table/2ball.png')}),
        }

        const ballGeo = new THREE.SphereGeometry(1.5);
        const matKeys = Object.keys(this.mats);
        this.balls = new Array(matKeys.length);
        for (let i = 0; i < this.balls.length; ++i){
            this.balls[i] = new THREE.Mesh(ballGeo, this.mats[matKeys[i]]);
            const ball = this.balls[i];
            ball.position.set(Math.random()*30, 1.5, Math.random()*20);
            ball.castShadow = true;
            ball.receiveShadow = true;
            this.scene.add(ball);
        }
        console.log(this.balls);

        const planeGeo = new THREE.PlaneGeometry(60, 40);
        const planeMat = new THREE.MeshPhongMaterial({color: 0x999999});
        const plane = new THREE.Mesh(planeGeo, planeMat);
        plane.receiveShadow = true;
        plane.rotateX(-0.5*Math.PI);
        this.scene.add(plane);

        this.ambient = new THREE.AmbientLight(0x222222, 1);
        this.scene.add(this.ambient);

        this.light = new THREE.DirectionalLight(0xffffff, 1);
        this.light.castShadow = true;
        this.light.position.set(2, 10, 10);
        this.light.target.position.set(0,0,0);
        this.light.shadow.mapSize.width = 2048;
        this.light.shadow.mapSize.height = 2048;
        this.scene.add(this.light);

        this.shadowHelper = new THREE.CameraHelper(this.light.shadow.camera);
        this.scene.add(this.shadowHelper);

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
                this.model.traverse(node => {
                    if (node.isMesh){
                        node.castShadow = true;
                        node.receiveShadow = true;
                    }
                })
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

                this.addGui();
            },
            xhr => {
                this.loadingBar.progress = xhr.loaded / xhr.total;
            },
            err => {
                console.error(err);
            }
        )
    }

    addGui(){
        const animGUi = this.gui.addFolder('Animation');
        animGUi.add(this, 'currentClip');

        const data = {
            scale: 1,
        }        

        const transform = this.gui.addFolder('Transform');
        const modelPos = transform.addFolder('Position');
        modelPos.add(this.model.position, 'x', -10, 10, 0.1);
        modelPos.add(this.model.position, 'y', 0, 2, 0.1);
        modelPos.add(this.model.position, 'z', -10, 10, 0.1);
        const modelScale = transform.addFolder('Scale');
        modelScale.add(data, 'scale', 1, 4, 0.1).onChange(()=>{
            this.model.scale.set(data.scale,data.scale,data.scale);
        });

        const light = this.gui.addFolder('Light');
        const lightPos = light.addFolder('Position');
        lightPos.add(this.light.position, 'x', -50, 50, 0.1);
        lightPos.add(this.light.position, 'y', -50, 50, 0.1);
        lightPos.add(this.light.position, 'z', -50, 50, 0.1);

        const shadow = this.gui.addFolder('Shadow Camera');
        shadow.add(this.light.shadow.mapSize, 
            'width', [256, 512, 1024, 2048, 4096]);
        shadow.add(this.light.shadow.mapSize,
            'height', [256, 512, 1024, 2048, 4096]);
        shadow.add(this.light.shadow.camera,
            'left', -10, -1, 0.1).
            onChange(()=>{
                this.light.shadow.camera.updateProjectionMatrix();
            });
        shadow.add(this.light.shadow.camera,
            'right', 1, 10, 0.1).
            onChange(()=>{
                this.light.shadow.camera.updateProjectionMatrix();
            });
        shadow.add(this.light.shadow.camera,
            'top', 1, 10, 0.1).
            onChange(()=>{
                this.light.shadow.camera.updateProjectionMatrix();
            });
        shadow.add(this.light.shadow.camera,
            'bottom', -1, -10, 0.1).
            onChange(()=>{
                this.light.shadow.camera.updateProjectionMatrix();
            });
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
        this.balls.forEach((ball) => {
            ball.rotateY(1.0 * dt);
        })
        this.stats.update();
        this.shadowHelper.update();
        this.gui.updateDisplay();
        this.mixer.update(dt);
        this.input.update();
        this.renderer.render(this.scene, this.camera);
    }
}

export {App};
