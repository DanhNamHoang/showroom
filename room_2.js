import { DRACOLoader } from "./js/Draco/DRACOLoader.js";
// import { Stats } from "./js/Stats.js";
const canvas = document.querySelector("#c");

var stats = new Stats();
stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

var HEIGHT = window.innerHeight;
var WIDTH = window.innerWidth;

var BACKGROUND_COLOR = new THREE.Color(0xfffffff);

// PARAMETERS+
var scene = new THREE.Scene();
scene.background = new THREE.Color(BACKGROUND_COLOR);

var camera = new THREE.PerspectiveCamera(60, WIDTH / HEIGHT, 0.1, 10000);
scene.add(camera);

var renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);


renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.8;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true;
document.body.append(renderer.domElement);

var pmremGenerator = new THREE.PMREMGenerator(renderer);

THREE.DefaultLoadingManager.onLoad = function () {
  pmremGenerator.dispose();
};

var pngCubeRenderTarget;
var pngBackground;
var envMap;

new THREE.TextureLoader().load(
  "./model/Environment/hdri3_compressed.jpg",
  function (texture) {
    texture.encoding = THREE.sRGBEncoding;

    pngCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);

    pngBackground = pngCubeRenderTarget.texture;
    texture.dispose();

    envMap = pngCubeRenderTarget.texture;
    scene.background = pngBackground;
  }
);

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
  stats.begin();
  renderer.render(scene, camera);
  // camera.rotateOnWorldAxis(new THREE.Vector3(0,1,0),0.0005);
  stats.end();
  requestAnimationFrame(animate);
}

const enter_button = document.getElementById("showroom-btn");
const welcome_screen = document.getElementById("welcome-screen");

enter_button.addEventListener("click", function(){
  welcome_screen.parentNode.removeChild(welcome_screen);
})


const state_button = document.getElementById("room-1");
var room_state = true;
var room_1 = new THREE.Group();
var room_2 = new THREE.Group();

state_button.addEventListener("mouseover", loadRoom);

async function room1() {
  console.log("btn_pressed");
  var loader = new THREE.GLTFLoader();
  var model;

  var dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("./js/Draco/");
  loader.setDRACOLoader(dracoLoader);

  // var texture = new THREE.TextureLoader().load("./model/Separate/tile_AlbedoTransparency 1.jpg");
  var exteriorLightMap = new THREE.TextureLoader().load(
    "./model/Textures/Exterior_LightMap_1024 Original.jpg"
  );
  exteriorLightMap.flipY = false;
  var interiorLightMap = new THREE.TextureLoader().load(
    "./model/Textures/Interior_LightMap_1024.jpg"
  );
  interiorLightMap.flipY = false;

  var exteriorAOMap = new THREE.TextureLoader().load(
    "./model/Textures/Exterior_AO_1024.jpg"
  );
  exteriorAOMap.flipY = false;
  var interiorAOMap = new THREE.TextureLoader().load(
    "./model/Textures/Interior_AO_1024.jpg"
  );
  interiorAOMap.flipY = false;

  loader.load("./model/Room1.gltf", function (gltf) {
    gltf.scene.traverse((o) => {
      console.log("compressed models")
      if (o.isMesh) {
        console.log(o.name);
        o.material.envMap = envMap;
        if (o.name.includes("Exterior")) {
          o.material.lightMap = exteriorLightMap;
          o.material.lightMapIntensity = 5;

          o.material.aoMap = exteriorAOMap;
          o.material.aoMapIntensity = 0.8;

          o.material.envMapIntensity = 1;
        } else if (o.name.includes("Interior")) {
          o.material.lightMap = interiorLightMap;
          o.material.lightMapIntensity = 5;

          o.material.aoMap = interiorAOMap;
          o.material.aoMapIntensity = 0.8;
          o.material.envMapIntensity = 1;
        } else if (o.name == "Window") {
          o.material.roughness = 0;
          o.material.refractionRatio = 0;
          o.material.opacity = 0.2;
          o.material.envMapIntensity = 30;
        } else {
          o.material.envMapIntensity = 5;
        }
        o.material.needsUpdate = true;
      }
    });
    room_1.add(gltf.scene);
    scene.add(room_1);
    camera.position.set(-2, 1.76, -3.5);
    camera.lookAt(0,0,0);
    // room_1.visible = false;
  });
}

async function room2() {
  var loader = new THREE.GLTFLoader();
  var model;

  var dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("./js/Draco/");
  loader.setDRACOLoader(dracoLoader);

  // var texture = new THREE.TextureLoader().load("./model/Separate/tile_AlbedoTransparency 1.jpg");
  var exteriorLightMap = new THREE.TextureLoader().load(
    "./model/Textures/Room_2/Exterior_LightMap_1024.jpg"
  );
  exteriorLightMap.flipY = false;
  var interiorLightMap_1 = new THREE.TextureLoader().load(
    "./model/Textures/Room_2/Interior_1_LightMap_1024.jpg"
  );
  interiorLightMap_1.flipY = false;
  var interiorLightMap_2 = new THREE.TextureLoader().load(
    "./model/Textures/Room_2/Interior_2_LightMap_1024.jpg"
  );
  interiorLightMap_2.flipY = false;
  var interiorLightMap_3 = new THREE.TextureLoader().load(
    "./model/Textures/Room_2/Interior_3_LightMap_1024.jpg"
  );
  interiorLightMap_3.flipY = false;

  var exteriorAOMap = new THREE.TextureLoader().load(
    "./model/Textures/Room_2/Exterior_AO_1024.jpg"
  );
  exteriorAOMap.flipY = false;
  var interiorAOMap_1 = new THREE.TextureLoader().load(
    "./model/Textures/Room_2/Interior_1_AO_1024.jpg"
  );
  interiorAOMap_1.flipY = false;
  var interiorAOMap_2 = new THREE.TextureLoader().load(
    "./model/Textures/Room_2/Interior_2_AO_1024.jpg"
  );
  interiorAOMap_2.flipY = false;
  var interiorAOMap_3 = new THREE.TextureLoader().load(
    "./model/Textures/Room_2/Interior_3_AO_1024.jpg"
  );
  interiorAOMap_3.flipY = false;

  loader.load("./model/Room2.gltf", function (gltf) {
    gltf.scene.traverse((o) => {
      if (o.isMesh) {
        console.log(o.name);
        o.material.envMap = envMap;
        if (o.name.includes("Exterior")) {
          o.material.metalness = 0;
          console.log('METALLNES', o.material.metalness);
          o.material.lightMap = exteriorLightMap;
          o.material.lightMapIntensity = 5;
          o.material.aoMap = exteriorAOMap;
          o.material.aoMapIntensity = 1;
          o.material.envMapIntensity = 1;
        } else if (o.name.includes("Interior_1")) {
          o.material.lightMap = interiorLightMap_1;
          o.material.lightMapIntensity = 5;
          console.log("Interior_1");
          o.material.aoMap = interiorAOMap_1;
          o.material.aoMapIntensity = 1;
          o.material.envMapIntensity = 1;
        } else if (o.name.includes("Interior_2")) {
          o.material.lightMap = interiorLightMap_2;
          o.material.lightMapIntensity = 5;
          console.log("Interior_2");
          o.material.aoMap = interiorAOMap_2;
          o.material.aoMapIntensity = 1;
          o.material.envMapIntensity = 1;
        } else if (o.name.includes("Interior_3")) {
          o.material.roughness = 0;
          o.material.lightMap = interiorLightMap_3;
          o.material.lightMapIntensity = 5;
          console.log("Interior_3");
          o.material.aoMap = interiorAOMap_3;
          o.material.aoMapIntensity = 1;
          o.material.envMapIntensity = 1;
        } else if (o.name == "Glasses") {
          o.material.roughness = 0;
          o.material.refractionRatio = 0;
          o.material.opacity = 0.2;
          o.material.metalness = 1;
          o.material.envMapIntensity = 30;
        } else {
          o.material.envMapIntensity = 1;
        }
        o.material.needsUpdate = true;
      }
    });
    room_2.add(gltf.scene);
    scene.add(room_2);
    room_2.visible = false;
  });
}

room1();
room2();

var controls = new THREE.OrbitControls(camera, renderer.domElement);

function loadRoom() {
  if (room_state == false) {
      camera.position.set(-2, 1.76, -3.5); // Set position like this
      state_button.innerText = "room 2";
      console.log("pressed");
      room_1.visible = true;
      room_2.visible = false;
      room_state = true;
      camera.lookAt(0,0,0);
  } else {
    camera.position.set(1.7, 1.6, 2.6); // Set position like this
    state_button.innerText = "room 1";
    console.log("pressed2");
    room_2.visible = true;
    room_1.visible = false;
    room_state = false;
    camera.lookAt(0,0,0);
  }
}

animate();
