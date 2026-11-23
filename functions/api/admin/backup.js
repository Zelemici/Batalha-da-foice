import {authorize,response} from '../_lib.js';
export async function onRequestGet(context){const a=await authorize(context);if(a.failure)return a.failure;
 const draft=await context.env.BDF_KV.get('draft','json'),live=await context.env.BDF_KV.get('published','json');
 return response({schemaVersion:2,exportedAt:new Date().toISOString(),draft:draft?.content||null,published:live||null});
}
