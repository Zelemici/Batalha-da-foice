import {response,initialPublic} from './_lib.js';
export async function onRequestGet(context){try{
 const saved=context.env.BDF_KV?await context.env.BDF_KV.get('published','json'):null;
 const data=globalThis.BDFHistory.apply(saved?.content||await initialPublic(context));
 if(!data)return response({error:'Dados públicos ainda não disponíveis'},503);
 return new Response(JSON.stringify(data),{headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'public, max-age=30','X-Content-Type-Options':'nosniff'}});
}catch{return response({error:'Não foi possível carregar os dados públicos'},503)}}
