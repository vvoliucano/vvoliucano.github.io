import * as THREE from './vendor/three.module.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';

const host = document.querySelector('#cat3d');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf7f4ee);
const camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, .1, 4000);
camera.position.set(0, 100, 1450);

const renderer = new THREE.WebGLRenderer({antialias:true, alpha:false});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
host.append(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xfff7e8, 0x776b62, 2.1));
const key = new THREE.DirectionalLight(0xffffff, 2.5); key.position.set(3,5,5); key.castShadow=true; scene.add(key);
const rim = new THREE.DirectionalLight(0xb8cee8, .8); rim.position.set(-4,2,-3); scene.add(rim);

const ground = new THREE.Mesh(new THREE.CircleGeometry(2.5,64),new THREE.ShadowMaterial({color:0x5d5145,opacity:.14}));
ground.scale.setScalar(180); ground.rotation.x=-Math.PI/2; ground.position.y=-190; ground.receiveShadow=true; scene.add(ground);

let cat, catFrame, mixer, head, eyeL, eyeR, earL, earR;
let framed=false;
const catPalette=new THREE.TextureLoader().load('./threejs/model/my-cat-palette.png');
catPalette.colorSpace=THREE.SRGBColorSpace; catPalette.flipY=false; catPalette.magFilter=THREE.NearestFilter; catPalette.minFilter=THREE.LinearFilter;
const pointer = new THREE.Vector2();
let targetX=0,targetY=0,lookX=0,lookY=0;

const loader = new GLTFLoader();
loader.load('./threejs/model/toon_cat_free.glb', gltf => {
  cat=gltf.scene.children[0];
  cat.position.set(0,10,0); cat.rotation.y=.08; cat.updateMatrixWorld(true);
  head=cat.getObjectByName('head_018'); eyeL=cat.getObjectByName('eye.L_022'); eyeR=cat.getObjectByName('eye.R_023');
  earL=cat.getObjectByName('ear.L_019'); earR=cat.getObjectByName('ear.R_020');
  cat.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true; stylize(o.material);}});
  catFrame=new THREE.Group(); catFrame.add(cat); scene.add(catFrame);
  const visibleMesh=cat.getObjectByName('Object_43');
  const viewBox=new THREE.Box3().setFromObject(visibleMesh), viewCenter=viewBox.getCenter(new THREE.Vector3()), viewSize=viewBox.getSize(new THREE.Vector3()), span=Math.max(viewSize.x,viewSize.y,viewSize.z);
  camera.position.set(0,span*.08,span*3.15); camera.near=Math.max(.1,span/1000); camera.far=span*30; camera.lookAt(0,0,0); camera.updateProjectionMatrix();
  mixer=new THREE.AnimationMixer(cat); if(gltf.animations[0]) mixer.clipAction(gltf.animations[0]).play();
  document.querySelector('#loading').style.opacity=0;
}, undefined, e=>{document.querySelector('#loading').textContent='猫咪模型加载失败';console.error(e)});

function stylize(mat){
  mat.map=catPalette; mat.color.set(0xffffff); mat.roughness=.84; mat.metalness=0;
  mat.onBeforeCompile=s=>{
    s.uniforms.stripeDark={value:new THREE.Color(0x211d1a)};
    s.uniforms.furBase={value:new THREE.Color(0x93836e)};
    s.uniforms.furLight={value:new THREE.Color(0xc8b99e)};
    s.fragmentShader=s.fragmentShader.replace('#include <common>',`#include <common>\nuniform vec3 stripeDark; uniform vec3 furBase; uniform vec3 furLight;`)
      .replace('#include <map_fragment>',`#include <map_fragment>
        float side = abs(vNormal.x);
        float bands = smoothstep(.28,.76,sin(vMapUv.y*72.0 + abs(vMapUv.x-.5)*10.0)*.5+.5);
        float tailish = smoothstep(.38,.75,side);
        float stripe = bands * (.38 + .62*tailish);
        float belly = smoothstep(.12,.8,vNormal.z) * smoothstep(.12,.48,.5-abs(vMapUv.x-.5));
        vec3 baseTex = diffuseColor.rgb;
        vec3 tabby = mix(baseTex, stripeDark, stripe*.48);
        tabby = mix(tabby, furLight, belly*.22);
        diffuseColor.rgb = tabby;`);
  };
  mat.needsUpdate=true;
}

addEventListener('pointermove',e=>{pointer.x=e.clientX/innerWidth*2-1;pointer.y=-(e.clientY/innerHeight*2-1);targetX=pointer.x;targetY=pointer.y},{passive:true});
addEventListener('pointerleave',()=>{targetX=targetY=0});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});

const clock=new THREE.Clock();
function frame(t){
  requestAnimationFrame(frame); const dt=Math.min(clock.getDelta(),.05); mixer?.update(dt);
  if(cat&&!framed){cat.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(cat),c=b.getCenter(new THREE.Vector3());catFrame.position.set(-c.x,-c.y,-c.z);framed=true;}
  lookX+=(targetX-lookX)*.055;lookY+=(targetY-lookY)*.055;
  if(head){head.rotation.y += ((-lookX*.38)-head.rotation.y)*.12;head.rotation.x += ((lookY*.18)-head.rotation.x)*.12;}
  if(eyeL&&eyeR){eyeL.rotation.y=eyeR.rotation.y=-lookX*.3;eyeL.rotation.x=eyeR.rotation.x=lookY*.18;}
  if(earL&&earR){const twitch=Math.sin(t*.006)*Math.max(0,Math.sin(t*.0017))*0.09;earL.rotation.z=twitch-lookX*.04;earR.rotation.z=-twitch-lookX*.04;}
  renderer.render(scene,camera);
}
requestAnimationFrame(frame);
