/* Aestyve Face Lab: dependency-free WebGL surface renderer.
 * Units are arbitrary visual units; never mm, mL, or tissue measurements.
 */
export const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const gauss=(x,y,cx,cy,sx,sy)=>Math.exp(-(((x-cx)/sx)**2+((y-cy)/sy)**2)/2);
export function demoMesh(){
 const p=[],uv=[],indices=[],nx=42,ny=58;
 for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){
  const v=j/ny,u=i/nx,y=1.35-2.7*v,width=.99*Math.sqrt(Math.max(.035,1-(y/1.48)**2))*(1-.10/(1+Math.exp((y+.65)*12))),x=(u*2-1)*width;
  let z=.38*Math.sqrt(Math.max(0,1-(x/1.04)**2-(y/1.52)**2));
  z+=.49*gauss(x,y,0,.10,.13,.32)+.13*gauss(x,y,0,-.12,.20,.12);
  z-=.13*(gauss(x,y,-.39,.37,.19,.10)+gauss(x,y,.39,.37,.19,.10));
  z+=.09*(gauss(x,y,-.50,-.07,.24,.25)+gauss(x,y,.50,-.07,.24,.25));
  z+=.105*gauss(x,y,0,-.46,.31,.075)+.10*gauss(x,y,0,-.58,.27,.065)-.045*gauss(x,y,0,-.52,.31,.023)+.12*gauss(x,y,0,-1.00,.30,.18);
  p.push(x,y,z);uv.push(u,1-v);
  if(i<nx&&j<ny){const a=j*(nx+1)+i,b=a+1,c=a+nx+1;indices.push(a,c,b,b,c,c+1);}
 }
 return {positions:new Float32Array(p),uv:new Float32Array(uv),indices:new Uint16Array(indices)};
}
// Bowyer-Watson triangulation in image coordinates, with duplicate/degenerate guards.
export function triangulate(input){
 const points=input.map(p=>[p[0],p[1]]),n=points.length;
 points.push([-100,-100],[100,-100],[0,100]);let ts=[[n,n+1,n+2]];
 const inside=(t,p)=>{const [a,b,c]=t.map(i=>points[i]);const d=2*(a[0]*(b[1]-c[1])+b[0]*(c[1]-a[1])+c[0]*(a[1]-b[1]));if(Math.abs(d)<1e-12)return false;const aa=a[0]**2+a[1]**2,bb=b[0]**2+b[1]**2,cc=c[0]**2+c[1]**2;const x=(aa*(b[1]-c[1])+bb*(c[1]-a[1])+cc*(a[1]-b[1]))/d,y=(aa*(c[0]-b[0])+bb*(a[0]-c[0])+cc*(b[0]-a[0]))/d;return (p[0]-x)**2+(p[1]-y)**2<=(a[0]-x)**2+(a[1]-y)**2+1e-10;};
 for(let i=0;i<n;i++){const bad=ts.filter(t=>inside(t,points[i])),edges=new Map();for(const t of bad)for(let k=0;k<3;k++){const a=t[k],b=t[(k+1)%3],key=[a,b].sort((a,b)=>a-b).join(':');if(edges.has(key))edges.delete(key);else edges.set(key,[a,b]);}const set=new Set(bad);ts=ts.filter(t=>!set.has(t));for(const [a,b] of edges.values())ts.push([a,b,i]);}
 return ts.filter(t=>t.every(i=>i<n)&&Math.abs((points[t[1]][0]-points[t[0]][0])*(points[t[2]][1]-points[t[0]][1])-(points[t[1]][1]-points[t[0]][1])*(points[t[2]][0]-points[t[0]][0]))>1e-10).flat();
}
export function meshFromLandmarks(lm,width,height){
 if(lm.length<468||!lm.slice(0,468).every(p=>[p.x,p.y,p.z].every(Number.isFinite)))throw Error('landmarks');
 const pts=lm.slice(0,468),xs=pts.map(p=>p.x),ys=pts.map(p=>p.y),cx=(Math.min(...xs)+Math.max(...xs))/2,cy=(Math.min(...ys)+Math.max(...ys))/2;
 const span=Math.max(...ys)-Math.min(...ys);if(span<1e-4||Math.max(...xs)-Math.min(...xs)<1e-4||width<=0||height<=0)throw Error('landmarks');const scale=2.65/span,aspect=width/height;
 const p=pts.flatMap(p=>[(p.x-cx)*scale*aspect,-(p.y-cy)*scale,-p.z*scale*aspect]);
 const uv=pts.flatMap(p=>[p.x,1-p.y]);let indices=triangulate(pts.map(p=>[p.x,p.y]));
 // Standardise winding to face the camera.
 for(let i=0;i<indices.length;i+=3){const a=indices[i]*3,b=indices[i+1]*3,c=indices[i+2]*3;if((p[b]-p[a])*(p[c+1]-p[a+1])-(p[b+1]-p[a+1])*(p[c]-p[a])<0)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];}
 return {positions:new Float32Array(p),uv:new Float32Array(uv),indices:new Uint16Array(indices)};
}
export function deform(base,points){
 const out=new Float32Array(base);
 for(let i=0;i<out.length;i+=3){let dz=0,dx=0,dy=0;for(const pt of points){const x=base[i]-pt.x,y=base[i+1]-pt.y,z=base[i+2]-pt.z,d=x*x+y*y+.25*z*z,r=.27,a=clamp(pt.strength,0,100)/100*.13,w=Math.exp(-d/(2*r*r));dz+=a*w;dx+=x*a*w*.55;dy+=y*a*w*.55;}out[i]+=clamp(dx,-.07,.07);out[i+1]+=clamp(dy,-.07,.07);out[i+2]+=clamp(dz,0,.20);}
 return out;
}
function normals(p,idx){const ns=new Float32Array(p.length);for(let i=0;i<idx.length;i+=3){const a=idx[i]*3,b=idx[i+1]*3,c=idx[i+2]*3,ux=p[b]-p[a],uy=p[b+1]-p[a+1],uz=p[b+2]-p[a+2],vx=p[c]-p[a],vy=p[c+1]-p[a+1],vz=p[c+2]-p[a+2],x=uy*vz-uz*vy,y=uz*vx-ux*vz,z=ux*vy-uy*vx;for(const j of [a,b,c]){ns[j]+=x;ns[j+1]+=y;ns[j+2]+=z;}}for(let i=0;i<ns.length;i+=3){const d=Math.hypot(ns[i],ns[i+1],ns[i+2])||1;for(let j=0;j<3;j++)ns[i+j]/=d;}return ns;}
const VS=`attribute vec3 aPosition;attribute vec3 aNormal;attribute vec2 aUV;attribute vec3 aSignal;
uniform vec2 uRotation;uniform vec2 uView;uniform float uLine;varying vec3 vNormal;varying vec2 vUV;varying vec3 vSignal;
void main(){float c=cos(uRotation.x),s=sin(uRotation.x),cp=cos(uRotation.y),sp=sin(uRotation.y);mat3 ry=mat3(c,0.,-s,0.,1.,0.,s,0.,c);mat3 rx=mat3(1.,0.,0.,0.,cp,sp,0.,-sp,cp);vec3 p=rx*ry*aPosition;vNormal=rx*ry*aNormal;vUV=aUV;vSignal=aSignal;gl_Position=vec4(p.x/uView.x,p.y/uView.y,-p.z*.2-uLine*.0008,1.);gl_PointSize=11.;}`;
const FS=`precision mediump float;varying vec3 vNormal;varying vec2 vUV;varying vec3 vSignal;uniform sampler2D uTexture;uniform float uPhoto;uniform float uMode;uniform float uLine;
void main(){if(uLine>1.5){if(distance(gl_PointCoord,vec2(.5))>.5)discard;gl_FragColor=vec4(.7,.42,.27,1.);return;}if(uLine>.5){gl_FragColor=vec4(.32,.35,.43,.4);return;}
vec3 n=normalize(vNormal);float light=max(0.,dot(n,normalize(vec3(-.5,.6,1.))));vec3 base=mix(vec3(.86,.83,.79),texture2D(uTexture,vUV).rgb,uPhoto);if(uMode>2.5)base=vec3(.84,.82,.79);vec3 col=base*(uPhoto>.5&&uMode<2.5?.90+.10*light:.48+.52*light);
if(uMode>.5&&uMode<2.5){float s=uMode<1.5?vSignal.x:vSignal.y;vec3 heat=mix(vec3(.17,.42,.58),vec3(.92,.46,.20),clamp(s,0.,1.));col=mix(base*.85,heat,.7*vSignal.z);}gl_FragColor=vec4(col,1.);}`;
export class FaceView{
 constructor(canvas){this.canvas=canvas;this.gl=canvas.getContext('webgl',{antialias:true,alpha:true,preserveDrawingBuffer:true});if(!this.gl)throw Error('webgl');const gl=this.gl;
 const shader=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
 const pr=gl.createProgram();gl.attachShader(pr,shader(gl.VERTEX_SHADER,VS));gl.attachShader(pr,shader(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(pr));gl.useProgram(pr);this.pr=pr;this.attrs={};for(const [key,size] of [['aPosition',3],['aNormal',3],['aUV',2],['aSignal',3]]){const loc=gl.getAttribLocation(pr,key),buffer=gl.createBuffer();this.attrs[key]={loc,size,buffer};}
 this.us={};for(const key of ['uRotation','uView','uLine','uPhoto','uMode','uTexture'])this.us[key]=gl.getUniformLocation(pr,key);
 this.ib=gl.createBuffer();this.eb=gl.createBuffer();this.mb=gl.createBuffer();this.tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([255,255,255,255]));for(const k of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,k,gl.LINEAR);for(const k of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,k,gl.CLAMP_TO_EDGE);
 this.yaw=-.2;this.pitch=0;this.zoom=1;this.wire=false;this.mode=0;this.photo=false;this.points=[];this.before=false;this.resize=new ResizeObserver(()=>this.draw());this.resize.observe(canvas);this.setMesh(demoMesh());
 }
 upload(key,data){const gl=this.gl,a=this.attrs[key];gl.bindBuffer(gl.ARRAY_BUFFER,a.buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(a.loc);gl.vertexAttribPointer(a.loc,a.size,gl.FLOAT,false,0,0);}
 setMesh(mesh,source=null){const gl=this.gl;this.base=mesh.positions;this.mesh=mesh;this.points=[];this.positions=new Float32Array(this.base);this.upload('aUV',mesh.uv);this.upload('aSignal',new Float32Array(this.base.length));gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,mesh.indices,gl.STATIC_DRAW);const edges=[];for(let i=0;i<mesh.indices.length;i+=3){const [a,b,c]=mesh.indices.slice(i,i+3);edges.push(a,b,b,c,c,a);}this.edgeCount=edges.length;gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.eb);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(edges),gl.STATIC_DRAW);this.photo=!!source;gl.bindTexture(gl.TEXTURE_2D,this.tex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);if(source)gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);else gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([255,255,255,255]));this.mode=0;this.update([]);}
 setSignals(data){this.upload('aSignal',data);this.draw();}
 update(points,before=false){this.points=points;this.before=before;this.positions=deform(this.base,before?[]:points);this.upload('aPosition',this.positions);this.upload('aNormal',normals(this.positions,this.mesh.indices));this.draw();}
 project(x,y,z){const c=Math.cos(this.yaw),s=Math.sin(this.yaw),cp=Math.cos(this.pitch),sp=Math.sin(this.pitch),xx=c*x+s*z,zz=-s*x+c*z,yy=cp*y-sp*zz;const r=this.canvas.getBoundingClientRect(),vy=1.75/this.zoom,vx=vy*r.width/r.height;return [r.left+(xx/vx+1)*r.width/2,r.top+(1-yy/vy)*r.height/2];}
 pick(x,y){let best=Infinity,idx=-1;for(let i=0;i<this.positions.length;i+=3){const p=this.project(...this.positions.slice(i,i+3)),d=Math.hypot(p[0]-x,p[1]-y);if(d<best){idx=i;best=d;}}if(best>34)return null;return {x:this.base[idx],y:this.base[idx+1],z:this.base[idx+2]};}
 draw(){const gl=this.gl,r=this.canvas.getBoundingClientRect();if(!r.width||!r.height||!this.mesh)return;const dpr=Math.min(2,globalThis.devicePixelRatio||1),w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}gl.viewport(0,0,w,h);gl.useProgram(this.pr);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
 for(const a of Object.values(this.attrs)){gl.bindBuffer(gl.ARRAY_BUFFER,a.buffer);gl.enableVertexAttribArray(a.loc);gl.vertexAttribPointer(a.loc,a.size,gl.FLOAT,false,0,0);}gl.uniform2f(this.us.uRotation,this.yaw,this.pitch);const vy=1.75/this.zoom;gl.uniform2f(this.us.uView,vy*w/h,vy);gl.uniform1f(this.us.uPhoto,this.photo?1:0);gl.uniform1f(this.us.uMode,this.mode);gl.uniform1f(this.us.uLine,0);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.tex);gl.uniform1i(this.us.uTexture,0);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.ib);gl.drawElements(gl.TRIANGLES,this.mesh.indices.length,gl.UNSIGNED_SHORT,0);
 if(this.wire){gl.uniform1f(this.us.uLine,1);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.eb);gl.drawElements(gl.LINES,this.edgeCount,gl.UNSIGNED_SHORT,0);}
 if(this.points.length&&!this.before&&this.mode===0){const a=this.attrs.aPosition,marks=new Float32Array(this.points.flatMap(p=>[p.x,p.y,p.z+.035+clamp(p.strength,0,100)/100*.13]));gl.bindBuffer(gl.ARRAY_BUFFER,this.mb);gl.bufferData(gl.ARRAY_BUFFER,marks,gl.DYNAMIC_DRAW);gl.vertexAttribPointer(a.loc,3,gl.FLOAT,false,0,0);gl.uniform1f(this.us.uLine,2);gl.drawArrays(gl.POINTS,0,this.points.length);}
 }
 resetCamera(){this.yaw=0;this.pitch=0;this.zoom=1;this.draw();}
}
// Software 3D fallback for browsers without an available WebGL context.
// Still projects actual x/y/z vertices; this is not a CSS-transformed photograph.
export class CanvasFaceView{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');if(!this.ctx)throw Error('canvas');this.yaw=-.2;this.pitch=0;this.zoom=1;this.wire=false;this.mode=0;this.photo=false;this.points=[];this.before=false;this.resize=new ResizeObserver(()=>this.draw());this.resize.observe(canvas);this.setMesh(demoMesh());}
 setMesh(mesh,source=null){this.base=mesh.positions;this.mesh=mesh;this.source=source;this.photo=!!source;this.signals=new Float32Array(this.base.length);this.points=[];this.mode=0;this.update([]);}
 setSignals(data){this.signals=data;this.draw();}
 update(points,before=false){this.points=points;this.before=before;this.positions=deform(this.base,before?[]:points);this.ns=normals(this.positions,this.mesh.indices);this.draw();}
 project(x,y,z){return FaceView.prototype.project.call(this,x,y,z);}
 pick(x,y){return FaceView.prototype.pick.call(this,x,y);}
 resetCamera(){FaceView.prototype.resetCamera.call(this);}
 draw(){if(!this.mesh)return;const canvas=this.canvas,r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;const dpr=Math.min(1.5,globalThis.devicePixelRatio||1),w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}const ctx=this.ctx;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,w,h);const p=this.positions,uv=this.mesh.uv,idx=this.mesh.indices,c=Math.cos(this.yaw),s=Math.sin(this.yaw),cp=Math.cos(this.pitch),sp=Math.sin(this.pitch),vy=1.75/this.zoom,vx=vy*w/h,projected=[],lights=[];
 for(let i=0;i<p.length;i+=3){const x=c*p[i]+s*p[i+2],z=-s*p[i]+c*p[i+2],y=cp*p[i+1]-sp*z,zz=sp*p[i+1]+cp*z;projected.push([(x/vx+1)*w/2,(1-y/vy)*h/2,zz]);const nx=c*this.ns[i]+s*this.ns[i+2],nz=-s*this.ns[i]+c*this.ns[i+2],ny=cp*this.ns[i+1]-sp*nz,nzz=sp*this.ns[i+1]+cp*nz;lights.push(Math.max(0,(-.5*nx+.6*ny+nzz)/1.269));}
 const triangles=[];for(let i=0;i<idx.length;i+=3){const a=idx[i],b=idx[i+1],c=idx[i+2];triangles.push([a,b,c,(projected[a][2]+projected[b][2]+projected[c][2])/3]);}triangles.sort((a,b)=>a[3]-b[3]);
 for(const [a,b,c] of triangles){const points=[projected[a],projected[b],projected[c]],cx=(points[0][0]+points[1][0]+points[2][0])/3,cy=(points[0][1]+points[1][1]+points[2][1])/3,vs=points.map(p=>{const dx=p[0]-cx,dy=p[1]-cy,len=Math.hypot(dx,dy)||1;return [p[0]+dx/len*.35,p[1]+dy/len*.35];});ctx.save();ctx.beginPath();ctx.moveTo(...vs[0]);ctx.lineTo(...vs[1]);ctx.lineTo(...vs[2]);ctx.closePath();const light=(lights[a]+lights[b]+lights[c])/3;
 const heatMode=this.mode>0&&this.mode<3,mask=(this.signals[a*3+2]+this.signals[b*3+2]+this.signals[c*3+2])/3;
 if(this.source&&this.mode!==3){ctx.clip();const source=this.source,src=[a,b,c].map(i=>[uv[i*2]*source.width,(1-uv[i*2+1])*source.height]),[q0,q1,q2]=src,[d0,d1,d2]=points,den=q0[0]*(q1[1]-q2[1])+q1[0]*(q2[1]-q0[1])+q2[0]*(q0[1]-q1[1]);
 if(Math.abs(den)>1e-7){const affine=k=>[(d0[k]*(q1[1]-q2[1])+d1[k]*(q2[1]-q0[1])+d2[k]*(q0[1]-q1[1]))/den,(d0[k]*(q2[0]-q1[0])+d1[k]*(q0[0]-q2[0])+d2[k]*(q1[0]-q0[0]))/den,(d0[k]*(q1[0]*q2[1]-q2[0]*q1[1])+d1[k]*(q2[0]*q0[1]-q0[0]*q2[1])+d2[k]*(q0[0]*q1[1]-q1[0]*q0[1]))/den];const ax=affine(0),ay=affine(1);ctx.setTransform(ax[0],ay[0],ax[1],ay[1],ax[2],ay[2]);ctx.drawImage(source,0,0);ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=`rgba(0,0,0,${.1*(1-light)})`;ctx.fillRect(0,0,w,h);}
 }else{const l=.48+.52*light;ctx.fillStyle=`rgb(${Math.round(219*l)},${Math.round(212*l)},${Math.round(201*l)})`;ctx.fill();}
 if(heatMode&&mask>0){const component=this.mode===1?0:1,t=(this.signals[a*3+component]+this.signals[b*3+component]+this.signals[c*3+component])/3;ctx.fillStyle=`rgba(${Math.round(43+192*t)},${Math.round(107+10*t)},${Math.round(148-97*t)},${.7*mask})`;ctx.fill();}ctx.restore();
 if(this.wire){ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);ctx.lineTo(points[1][0],points[1][1]);ctx.lineTo(points[2][0],points[2][1]);ctx.closePath();ctx.strokeStyle='rgba(80,87,102,.3)';ctx.lineWidth=.55;ctx.stroke();}}
 if(!this.before&&this.mode===0)for(const pt of this.points){const xy=this.project(pt.x,pt.y,pt.z+.035+clamp(pt.strength,0,100)/100*.13),x=(xy[0]-r.left)*dpr,y=(xy[1]-r.top)*dpr;ctx.beginPath();ctx.arc(x,y,4.5*dpr,0,Math.PI*2);ctx.fillStyle='#b38060';ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.stroke();}
 }
}
