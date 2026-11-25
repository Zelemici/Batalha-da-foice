import {authorize,response,cors,readJson,limitContentLength,validate} from '../_lib.js';
export async function onRequestGet(context){const a=await authorize(context);if(a.failure)return a.failure;const saved=await context.env.BDF_KV.get('draft','json');return response({draft:saved?.content?globalThis.BDFHistory.apply(saved.content):null,updatedAt:saved?.updatedAt||null});}
export async function onRequestPut(context){const bad=cors(context.request);if(bad)return bad;const a=await authorize(context);if(a.failure)return a.failure;const tooBig=limitContentLength(context.request);if(tooBig)return tooBig;
 try{const data=await readJson(context.request);const issues=validate(data);if(issues.length)return response({error:'Rascunho inválido',issues},422);
 await context.env.BDF_KV.put('draft',JSON.stringify({content:data,updatedAt:new Date().toISOString(),actor:a.user.uid}));return response({ok:true});
 }catch(e){return response({error:'Falha ao salvar rascunho: '+e.message},400)}
}
