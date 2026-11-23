import {authorize,response} from '../_lib.js';
export async function onRequestGet(context){const a=await authorize(context);if(a.failure)return a.failure;return response({ok:true,role:'admin',uid:a.user.uid,email:a.user.email});}
