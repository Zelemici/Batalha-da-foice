import {response} from '../_lib.js';
export async function onRequestGet({request,env,params}){
 if(!env.BDF_R2)return response({error:'Armazenamento de vídeos não configurado.'},503);
 const name=String(params?.name||'');
 if(!/^[a-f0-9-]{36}\.(mp4|webm)$/.test(name))return response({error:'Vídeo não encontrado.'},404);
 const key='video/'+name;
 try{
  const options=request.headers.has('Range')?{range:request.headers}:{};
  const obj=await env.BDF_R2.get(key,options);
  if(!obj)return response({error:'Vídeo não encontrado.'},404);
  const headers=new Headers({
   'Content-Type':name.endsWith('.mp4')?'video/mp4':'video/webm',
   'Accept-Ranges':'bytes',
   'Cache-Control':'public, max-age=3600',
   'X-Content-Type-Options':'nosniff',
   'Content-Security-Policy':"default-src 'none'; sandbox"
  });
  if(obj.range&&typeof obj.range.offset==='number'){
   headers.set('Content-Range','bytes '+obj.range.offset+'-'+(obj.range.offset+obj.range.length-1)+'/'+obj.size);
   headers.set('Content-Length',String(obj.range.length));
  }else headers.set('Content-Length',String(obj.size));
  return new Response(obj.body,{status:obj.range?206:200,headers});
 }catch{return response({error:'Falha ao carregar o vídeo.'},503);}
}
