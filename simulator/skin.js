/* Non-clinical original-image color inspection. No disease models or treatment scoring. */
import {clamp} from './engine.js';
export function pointInPolygon(x,y,poly){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,yi]=poly[i],[xj,yj]=poly[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;}return inside;}
const median=a=>{const b=[...a].sort((a,b)=>a-b);return b.length?b[Math.floor(b.length/2)]:0;};
export function inspectPhoto(canvas,lm){
 const w=canvas.width,h=canvas.height,ctx=canvas.getContext('2d',{willReadFrequently:true}),pixels=ctx.getImageData(0,0,w,h).data;
 const ids=[[50,101,205,187,147,123,116],[280,330,425,411,376,352,345],[109,10,338,337,9,108]],polys=ids.map(ids=>ids.map(i=>[lm[i].x,lm[i].y]));
 const read=(x,y)=>{const i=(clamp(Math.round(y*h),0,h-1)*w+clamp(Math.round(x*w),0,w-1))*4,r=pixels[i],g=pixels[i+1],b=pixels[i+2];return {red:r/(r+g+b+1),luma:.2126*r+.7152*g+.0722*b,clipped:Math.max(r,g,b)>251||Math.max(r,g,b)<5};};
 const samples=[];for(let y=0;y<h;y+=6)for(let x=0;x<w;x+=6)if(polys.some(p=>pointInPolygon(x/w,y/h,p)))samples.push(read(x/w,y/h));
 const pts=lm.slice(0,468),faceWidth=(Math.max(...pts.map(p=>p.x))-Math.min(...pts.map(p=>p.x)))*w,eyeWidth=Math.abs(lm[263].x-lm[33].x)*w;
 const tilt=Math.abs(lm[263].y-lm[33].y)*h/Math.max(eyeWidth,1),yaw=Math.abs(lm[263].z-lm[33].z)*w/Math.max(eyeWidth,1),clipped=samples.filter(s=>s.clipped).length/Math.max(1,samples.length);
 const ok=samples.length>=30&&faceWidth>=220&&tilt<.22&&yaw<.34&&clipped<.15;
 const mr=median(samples.map(s=>s.red)),my=median(samples.map(s=>s.luma)),signal=new Float32Array(468*3);
 pts.forEach((p,i)=>{const s=read(p.x,p.y),mask=polys.some(poly=>pointInPolygon(p.x,p.y,poly));signal[i*3]=clamp(.5+(s.red-mr)*10,0,1);signal[i*3+1]=clamp(.5+(my-s.luma)/150,0,1);signal[i*3+2]=ok&&mask&&!s.clipped?1:0;});
 // Quality thresholds are engineering heuristics, not validated clinical confidence.
 return {ok,signal,checks:{facePixels:Math.round(faceWidth),sampleCount:samples.length,tilted:tilt>=.22,oblique:yaw>=.34,clipped:clipped>=.15}};
}
export function optionsForConcern(topics,concerns,safety){return safety==='no'?topics.filter(t=>t.concerns.some(c=>concerns.includes(c))):[];}
