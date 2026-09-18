// Bundled by tools/build-showroom.mjs. Only original PDF artwork is used for labels.
import {Scene,PerspectiveCamera,WebGLRenderer,Group,Mesh,BoxGeometry,PlaneGeometry,SphereGeometry,MeshPhysicalMaterial,MeshBasicMaterial,AmbientLight,DirectionalLight,HemisphereLight,TextureLoader,SRGBColorSpace,ACESFilmicToneMapping,PMREMGenerator,Color,BackSide,Vector3} from 'three';
export async function createShowroom(host,size,onLost){
 let renderer;
 try{renderer=new WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'})}catch{return null}
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(size.width,size.height);renderer.setClearColor(0,0);renderer.outputColorSpace=SRGBColorSpace;renderer.toneMapping=ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
 const scene=new Scene(),camera=new PerspectiveCamera(31,size.width/size.height,.1,50);
 const env=new Scene();env.background=new Color('#e7e4e2');
 const room=new Mesh(new BoxGeometry(12,12,12),new MeshBasicMaterial({color:0xdedbd6,side:BackSide}));env.add(room);
 const panel=(x,y,z,w,h,intensity)=>{const m=new Mesh(new PlaneGeometry(w,h),new MeshBasicMaterial({color:new Color(intensity,intensity*.97,intensity*.92)}));m.position.set(x,y,z);m.lookAt(0,0,0);env.add(m)};
 panel(-4,3,3,3,7,5);panel(4,2,-2,2,6,3);panel(0,5,0,6,3,4);
 const pmrem=new PMREMGenerator(renderer);const envTarget=pmrem.fromScene(env,.04);scene.environment=envTarget.texture;
 scene.add(new AmbientLight(0xffffff,.7));scene.add(new HemisphereLight(0xffffff,0xc6a286,1.2));
 const key=new DirectionalLight(0xfff9ef,2.1);key.position.set(-3,6,5);scene.add(key);
 const rim=new DirectionalLight(0xeceeff,1.3);rim.position.set(4,1,-2);scene.add(rim);
 const loader=new TextureLoader();const names=['alpha','beta','gamma'];const faces=['right','left','top','bottom','front','back'];
 const geometry=new BoxGeometry(1.44,3.8,.56);const boxes=[];
 try{
  for(const name of names){
   const textures=await Promise.all(faces.map(face=>loader.loadAsync(new URL(`./ha-3d/${name}-${face}.webp`,import.meta.url).href)));
   textures.forEach(t=>{t.colorSpace=SRGBColorSpace;t.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8)});
   const materials=textures.map(map=>new MeshPhysicalMaterial({map,color:0xffffff,roughness:.35,metalness:.07,clearcoat:.45,clearcoatRoughness:.26,envMapIntensity:.55}));
   const group=new Group();group.add(new Mesh(geometry,materials));scene.add(group);boxes.push(group);
  }
 }catch{renderer.dispose();envTarget.dispose();pmrem.dispose();return null}
 // Subtle glass droplets echo the supplied translucent molecular references.
 const dropMat=new MeshPhysicalMaterial({color:0xf8e5d3,metalness:.13,roughness:.11,transmission:.8,thickness:.6,ior:1.4,transparent:true,opacity:.7,envMapIntensity:.8});
 const drops=[[-3.35,1.42,-.3,.17],[2.95,-1.4,-.5,.22],[1.9,2.1,-1,.12]];
 for(const [x,y,z,r] of drops){const m=new Mesh(new SphereGeometry(r,28,20),dropMat);m.position.set(x,y,z);scene.add(m)}
 function resize(s){camera.aspect=s.width/s.height;camera.position.set(0,.18,Math.max(10.7,7.65/(2*Math.tan(31*Math.PI/360)*camera.aspect)));camera.lookAt(new Vector3(0,0,0));camera.updateProjectionMatrix();renderer.setSize(s.width,s.height)}
 resize(size);host.append(renderer.domElement);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();renderer.domElement.remove();renderer.dispose();onLost()},{once:true});
 return {resize,draw(poses){poses.forEach((p,i)=>{boxes[i].position.set(p.x,p.y,p.z);boxes[i].rotation.set(p.rx,p.ry,p.rz)});renderer.render(scene,camera)}};
}
