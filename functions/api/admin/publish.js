import {authorize,response,cors,readJson,limitContentLength,validate,publicCopy,initialPublic} from '../_lib.js';
export async function onRequestPost(context){const bad=cors(context.request);if(bad)return bad;const a=await authorize(context);if(a.failure)return a.failure;const tooBig=limitContentLength(context.request);if(tooBig)return tooBig;
 try{
  const submitted=await readJson(context.request);
  if(submitted.confirm!=='PUBLICAR')return response({error:'Confirmação obrigatória antes de publicar'},400);
  const data=submitted.content,issues=validate(data,{forPublish:true});if(issues.length)return response({error:'Validação de publicação falhou',issues},422);
  const old=await context.env.BDF_KV.get('published','json');const previous=old?.content||await initialPublic(context);
  if(previous){const expected=Number(submitted.expectedRevision||0),live=Number(old?.revision||0);if(expected!==live)return response({error:'Outro conteúdo foi publicado. Recarregue os dados antes de tentar novamente.',currentRevision:live},409);}
  const revision=Number(old?.revision||0)+1,now=new Date().toISOString();
  if(previous)await context.env.BDF_KV.put('backup:'+String(revision-1),JSON.stringify({content:previous,at:now}));
  const content=publicCopy(data);
  await context.env.BDF_KV.put('published',JSON.stringify({revision,updatedAt:now,actor:a.user.uid,content}));
  await context.env.BDF_KV.put('draft',JSON.stringify({content:data,updatedAt:now,actor:a.user.uid}));
  return response({ok:true,revision,updatedAt:now,mcCount:content.data.length,titleCount:content.data.reduce((n,m)=>n+Object.values(m.titles||{}).reduce((a,b)=>a+Number(b||0),0)+Number(m.unknownTitles||0),0)});
 }catch(e){return response({error:'Falha ao publicar: '+e.message},400)}
}
export async function onRequestGet(context){const a=await authorize(context);if(a.failure)return a.failure;const old=await context.env.BDF_KV.get('published','json');return response({revision:old?.revision||0,updatedAt:old?.updatedAt||null});}
