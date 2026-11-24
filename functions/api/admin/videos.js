import {authorize,response,cors} from '../_lib.js';
const LIMIT=25*1024*1024;
const types={'video/mp4':'mp4','video/webm':'webm'};
export async function onRequestPost(context){
 const origin=cors(context.request);if(origin)return origin;
 const a=await authorize(context);if(a.failure)return a.failure;
 if(!context.env.BDF_R2)return response({error:'O bucket BDF_R2 ainda não foi configurado no Cloudflare Pages.'},503);
 const mime=(context.request.headers.get('content-type')||'').split(';')[0].trim().toLowerCase();
 if(!types[mime])return response({error:'Formato inválido. Envie MP4 ou WebM.'},415);
 const length=Number(context.request.headers.get('content-length')||0);
 if(length>LIMIT)return response({error:'Vídeo acima de 25 MB.'},413);
 try{
  const bytes=await context.request.arrayBuffer();
  if(!bytes.byteLength||bytes.byteLength>LIMIT)return response({error:'Vídeo vazio ou acima de 25 MB.'},413);
  const sig=new Uint8Array(bytes.slice(0,12));
  const mp4=String.fromCharCode(...sig.slice(4,8))==='ftyp';
  const webm=sig[0]===0x1a&&sig[1]===0x45&&sig[2]===0xdf&&sig[3]===0xa3;
  if(!(mime==='video/mp4'?mp4:webm))return response({error:'Assinatura do arquivo de vídeo não corresponde ao formato declarado.'},415);
  const id=crypto.randomUUID(),ext=types[mime],key='video/'+id+'.'+ext;
  await context.env.BDF_R2.put(key,bytes,{httpMetadata:{contentType:mime},customMetadata:{uploadedBy:a.user.uid}});
  return response({ok:true,url:'/api/video/'+id+'.'+ext,size:bytes.byteLength});
 }catch{return response({error:'Não foi possível armazenar o vídeo no R2.'},500);}
}
