import * as THREE from '../lib/three/three.js';
import {TrackballControls} from '../lib/three/TrackballControls.js';
import Stats from '../lib/util/Stats.js';
import * as dat from '../lib/util/dat.gui.module.js';

function initStats(type) {
    const panelType = (typeof type !== 'undefined' && type) && (!isNaN(type)) ? parseInt(type) : 0;
    const stats = new Stats();
    stats.showPanel(panelType);
    document.body.appendChild(stats.dom);
    return stats;
}

function initTrackballControls(camera, renderer) {
    var trackballControls = new TrackballControls(camera, renderer.domElement);
    trackballControls.rotateSpeed = 1.0;
    trackballControls.zoomSpeed = 1.2;
    trackballControls.panSpeed = 0.8;
    trackballControls.noZoom = false;
    trackballControls.noPan = false;
    trackballControls.staticMoving = true;
    trackballControls.dynamicDampingFactor = 0.3;
    trackballControls.keys = [65, 83, 68];

    return trackballControls;
}

function main() {
    const stats = initStats();

    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setClearColor(new THREE.Color(0x000000));
    renderer.shadowMap.enabled = true;

    const scene = new THREE.Scene();

    const fov = 45;
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(-30, 40, 30);
    camera.lookAt(scene.position);

    const axes = new THREE.AxisHelper(40);
    scene.add(axes);

    const lightColor = 0xffffff;
    const lightIntensity = 1;
    const light = new THREE.SpotLight(lightColor, lightIntensity);
    light.castShadow = true;
    light.shadow.mapSize = new THREE.Vector2(1024, 1024);
    light.position.set(-40, 40, -15);
    scene.add(light);

    const planeGeo = new THREE.PlaneGeometry(60, 40);
    const planeMat = new THREE.MeshPhongMaterial({color: 0xaaaaaa});
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.receiveShadow = true;
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.set(15, 0, 0);
    scene.add(plane);

    function onResize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width != width || canvas.height != height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    const controls = new function() {
        this.numObjects = scene.children.length;
        this.addCube = function() {
            const size = Math.round(Math.random() * 5);
            const cubeGeo = new THREE.BoxGeometry(size, size, size);
            const cubeMat = new THREE.MeshPhongMaterial({color : Math.random() * 0xffffff});
            const cube = new THREE.Mesh(cubeGeo, cubeMat);

            cube.name = "cube" + scene.children.length;

            cube.castShadow = true;

            cube.position.x = -30 + 15 + Math.round(Math.random() * 60);
            cube.position.z = -20 + Math.round(Math.random() * 40);
            cube.position.y = Math.round(Math.random() * 5);

            cube.rotation.x = Math.random(Math.PI);
            cube.rotation.y = Math.random(Math.PI);
            cube.rotation.z = Math.random(Math.PI);

            scene.add(cube);
            console.log("Created : " + cube);
            this.numObjects = scene.children.length;
        }

        this.deleteCube = function() {
            const allObject = scene.children; 
            const lastObject = allObject[allObject.length - 1];
            console.log("Deleted : " + lastObject);
            console.log(lastObject);
            scene.remove(lastObject);
            this.numObjects = scene.children.length;
        }
    }

    const gui = new dat.GUI();
    gui.add(controls, 'addCube');
    gui.add(controls, 'deleteCube');
    gui.add(controls, 'numObjects');

    const clock = new THREE.Clock();
    const trackBall = initTrackballControls(camera, renderer);

    function render() {
        stats.update();
        trackBall.update(clock.getDelta());

        if (onResize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();
