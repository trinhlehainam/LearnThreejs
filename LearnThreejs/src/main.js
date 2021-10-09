import * as THREE from '../node_modules/three/build/three.module.js';
import Stats from '../node_modules/stats.js/src/Stats.js'
import * as dat from '../node_modules/dat.gui/build/dat.gui.module.js'

function initStats(type) {
    const panelType = (typeof type !== 'undefined' && type) && (!isNaN(type)) ? parseInt(type) : 0;
    const stats = new Stats();
    stats.showPanel(panelType);
    document.body.appendChild(stats.dom);
    return stats;
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

    const planeGeo = new THREE.PlaneGeometry(60, 20);
    const planeMat = new THREE.MeshPhongMaterial({ color: 0xAAAAAA });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.set(15, 0, 0);
    plane.receiveShadow = true;
    scene.add(plane);

    const sphereGeo = new THREE.SphereGeometry(4, 20, 20);
    const sphereMat = new THREE.MeshPhongMaterial({ color: 0x7777FF });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.castShadow = true;
    sphere.position.set(20, 4, 2);
    scene.add(sphere);

    const cubeGeo = new THREE.BoxGeometry(4, 4, 4);
    const cubeMat = new THREE.MeshPhongMaterial({ color: 0xFF0000 });
    const cube = new THREE.Mesh(cubeGeo, cubeMat);
    cube.castShadow = true;
    cube.position.set(-4, 3, 0);
    scene.add(cube);

    const lightColor = 0xffffff;
    const lightIntensity = 1;
    const light = new THREE.SpotLight(lightColor, lightIntensity);
    light.castShadow = true;
    light.shadow.mapSize = new THREE.Vector2(1024, 1024);
    light.position.set(-40, 40, -15);
    scene.add(light);

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
        this.rotationSpeed = 1;
        this.bouncingSpeed = 1;
    }

    const gui = new dat.GUI();
    gui.add(controls, 'rotationSpeed', 1, 2);
    gui.add(controls, 'bouncingSpeed', 1, 2);

    function render(time) {
        stats.update();

        time *= 0.001;

        if (onResize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        cube.rotation.x = time * controls.rotationSpeed;
        cube.rotation.y = time * controls.rotationSpeed;
        cube.rotation.z = time * controls.rotationSpeed;

        sphere.position.x = 20 + 10 * (Math.cos(time * controls.bouncingSpeed));
        sphere.position.y = 2 + 10 * Math.abs(Math.sin(time * controls.bouncingSpeed));

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();
