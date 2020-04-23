import {DRACOLoader} from './js/Draco/DRACOLoader.js';
// import { TextureLoader } from './js/three.module.js';
import { Reflector } from './js/Reflector.JS';

var HEIGHT = window.innerHeight;
var WIDTH = window.innerWidth;

var BACKGROUND_COLOR = new THREE.Color(0xfffffff);

// PARAMETERS+
var scene = new THREE.Scene();
scene.background = new THREE.Color(BACKGROUND_COLOR);

var camera = new THREE.PerspectiveCamera(60, WIDTH / HEIGHT, 0.1, 10000);
camera.position.set(-2,1.76,-3.5); // Set position like this
scene.add(camera);

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(WIDTH, HEIGHT);

// renderer.toneMapping = THREE.Uncharted2ToneMapping;
// renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.8;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.physicallyCorrectLights = true;
// renderer.shadowMap.enabled = true;
document.body.append(renderer.domElement);


// var ambient_light = new THREE.AmbientLight(0xffffff, 1);
// scene.add(ambient_light);

var directionalLight = new THREE.DirectionalLight(0xffffff, 0);
directionalLight.position.set(-3, 4, -6);
// scene.add(directionalLight);

var pmremGenerator = new THREE.PMREMGenerator( renderer );


THREE.DefaultLoadingManager.onLoad = function ( ) {

    pmremGenerator.dispose();

};


var pngCubeRenderTarget;
var pngBackground;
var envMap;

new THREE.TextureLoader().load( './model/Environment/hdri4.jpg', function ( texture ) {
    
    texture.encoding = THREE.sRGBEncoding;
    
    pngCubeRenderTarget = pmremGenerator.fromEquirectangular( texture );
    
    pngBackground = pngCubeRenderTarget.texture;
    texture.dispose();
    
    envMap = pngCubeRenderTarget.texture;
    scene.background = pngBackground;
    
} );

pmremGenerator.compileEquirectangularShader();

function animate() {

    // camera.rotateOnWorldAxis(new THREE.Vector3(0,1,0),0.0005);
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

var loader = new THREE.GLTFLoader();
var model;

var dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( './js/Draco/' );
loader.setDRACOLoader( dracoLoader );

// var texture = new THREE.TextureLoader().load("./model/Separate/tile_AlbedoTransparency 1.jpg");
var exteriorLightMap = new THREE.TextureLoader().load("./model/Textures/Corridor/Exterior_LightMap_1024.jpg");
exteriorLightMap.flipY =false;
var interiorLightMap = new THREE.TextureLoader().load("./model/Textures/Corridor/Interior_LightMap_1024.jpg");
interiorLightMap.flipY =false;

var exteriorAOMap = new THREE.TextureLoader().load("./model/Textures/Corridor/Exterior_AO_1024.jpg");
exteriorAOMap.flipY =false;
var interiorAOMap = new THREE.TextureLoader().load("./model/Textures/Corridor/Interior_AO_1024.jpg");
interiorAOMap.flipY =false;



loader.load("./model/Corridor.gltf", function (gltf) {
    model = gltf.scene;
    model.traverse((o)=>{
        if(o.isMesh){
            console.log(o.name);
            o.material.envMap = envMap;
            if(o.name.includes('Exterior')){
                o.material.lightMap = exteriorLightMap;
                o.material.lightMapIntensity = 3;
                
                o.material.aoMap = exteriorAOMap;
                o.material.aoMapIntensity = 0.8;
                
                o.material.envMapIntensity = 4;
            }
            else if(o.name.includes('Interior')){
                o.material.lightMap = interiorLightMap;
                o.material.lightMapIntensity = 3;
                
                o.material.aoMap = interiorAOMap;
                o.material.aoMapIntensity = 0.8;
                o.material.envMapIntensity = 2;
            }else{
                o.material.envMapIntensity = 5;
            }
            o.material.needsUpdate = true;
        }
    })
    scene.add(model);
});

var controls = new THREE.OrbitControls(camera, renderer.domElement);


animate();
