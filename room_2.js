import {DRACOLoader} from './js/Draco/DRACOLoader.js';
// import { TextureLoader } from './js/three.module.js';

const canvas = document.querySelector('#c');


var HEIGHT = window.innerHeight;
var WIDTH = window.innerWidth;

var BACKGROUND_COLOR = new THREE.Color(0xfffffff);

// PARAMETERS+
var scene = new THREE.Scene();
scene.background = new THREE.Color(BACKGROUND_COLOR);

var camera = new THREE.PerspectiveCamera(60, WIDTH / HEIGHT, 0.1, 10000);
camera.position.set(-2,1.76,-3.5); // Set position like this
scene.add(camera);

var renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio); 

// renderer.toneMapping = THREE.Uncharted2ToneMapping;
// renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.8;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true;
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

new THREE.TextureLoader().load( './model/Environment/hdri3_compressed.jpg', function ( texture ) {
    
    texture.encoding = THREE.sRGBEncoding;
    
    pngCubeRenderTarget = pmremGenerator.fromEquirectangular( texture );
    
    pngBackground = pngCubeRenderTarget.texture;
    texture.dispose();
    
    envMap = pngCubeRenderTarget.texture;
    scene.background = pngBackground;
    
} );

pmremGenerator.compileEquirectangularShader();

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    var width = window.innerWidth;
    var height = window.innerHeight;
    var canvasPixelWidth = canvas.width / window.devicePixelRatio;
    var canvasPixelHeight = canvas.height / window.devicePixelRatio;
  
    const needResize = canvasPixelWidth !== width || canvasPixelHeight !== height;
    if (needResize) {
      
      renderer.setSize(width, height, false);
    }
    return needResize;
  }


function animate() {

    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }

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
var exteriorLightMap = new THREE.TextureLoader().load("./model/Textures/Room_2/Exterior_LightMap_1024.jpg");
exteriorLightMap.flipY =false;
var interiorLightMap_1 = new THREE.TextureLoader().load("./model/Textures/Room_2/Interior_1_LightMap_1024.jpg");
interiorLightMap_1.flipY =false;
var interiorLightMap_2 = new THREE.TextureLoader().load("./model/Textures/Room_2/Interior_2_LightMap_1024.jpg");
interiorLightMap_2.flipY =false;
var interiorLightMap_3 = new THREE.TextureLoader().load("./model/Textures/Room_2/Interior_3_LightMap_1024.jpg");
interiorLightMap_3.flipY =false;

var exteriorAOMap = new THREE.TextureLoader().load("./model/Textures/Room_2/Exterior_AO_1024.jpg");
exteriorAOMap.flipY =false;
var interiorAOMap_1 = new THREE.TextureLoader().load("./model/Textures/Room_2/Interior_1_AO_1024.jpg");
interiorAOMap_1.flipY =false;
var interiorAOMap_2 = new THREE.TextureLoader().load("./model/Textures/Room_2/Interior_2_AO_1024.jpg");
interiorAOMap_2.flipY =false;
var interiorAOMap_3 = new THREE.TextureLoader().load("./model/Textures/Room_2/Interior_3_AO_1024.jpg");
interiorAOMap_3.flipY =false;



loader.load("./model/Room2.gltf", function (gltf) {
    model = gltf.scene;
    model.traverse((o)=>{
        if(o.isMesh){
            console.log(o.name);
            o.material.envMap = envMap;
            if(o.name.includes('Exterior')){
                o.material.lightMap = exteriorLightMap;
                o.material.lightMapIntensity = 5;
                o.material.aoMap = exteriorAOMap;
                o.material.aoMapIntensity = 1;
                o.material.envMapIntensity = 1;
            }
            else if(o.name.includes('Interior_1')){
                o.material.lightMap = interiorLightMap_1;
                o.material.lightMapIntensity = 5;
                console.log('Interior_1');
                o.material.aoMap = interiorAOMap_1;
                o.material.aoMapIntensity = 1;
                o.material.envMapIntensity = 1;
            }else if(o.name.includes('Interior_2')){
                o.material.lightMap = interiorLightMap_2;
                o.material.lightMapIntensity = 5;
                console.log('Interior_2');
                o.material.aoMap = interiorAOMap_2;
                o.material.aoMapIntensity = 1;
                o.material.envMapIntensity = 1;
            }else if(o.name.includes('Interior_3')){
                o.material.roughness = 0;
                o.material.lightMap = interiorLightMap_3;
                o.material.lightMapIntensity = 5;
                console.log('Interior_3');
                o.material.aoMap = interiorAOMap_3;
                o.material.aoMapIntensity = 1;
                o.material.envMapIntensity = 1;
            }else 
            if(o.name == "Glasses"){
                o.material.roughness = 0;
                o.material.refractionRatio = 0;
                o.material.opacity = 0.2;
                o.material.metalness = 1;
                o.material.envMapIntensity = 30;
            }else{
                o.material.envMapIntensity = 1;
            }
            o.material.needsUpdate = true;
        }
    })
    scene.add(model);
});

var controls = new THREE.OrbitControls(camera, renderer.domElement);



animate();
