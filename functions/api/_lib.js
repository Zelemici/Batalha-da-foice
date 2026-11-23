/* Cloudflare Pages Functions — autorização feita NO SERVIDOR. */
const encoder = new TextEncoder();
const JSON_HEADERS = {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
export const response = (data,status=200) => new Response(JSON.stringify(data),{status,headers:JSON_HEADERS});
export function cors(request){const origin=new URL(request.url).origin;return request.headers.get('Origin') && request.headers.get('Origin')!==origin ? response({error:'Origem não autorizada'},403):null;}
function decodeBase64Url(x){const s=x.replace(/-/g,'+').replace(/_/g,'/');return Uint8Array.from(atob(s.padEnd(Math.ceil(s.length/4)*4,'=')),c=>c.charCodeAt(0));}
function decodePart(s){return JSON.parse(new TextDecoder().decode(decodeBase64Url(s)));}
let cachedJWKS=null,expires=0;
async function jwks(){if(cachedJWKS&&Date.now()<expires)return cachedJWKS;
 const r=await fetch('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com');
 if(!r.ok)throw Error('Indisponibilidade ao consultar chaves Firebase');
 const doc=await r.json();if(!Array.isArray(doc.keys))throw Error('Chaves Firebase inválidas');
 cachedJWKS=doc.keys;expires=Date.now()+Math.min(3600000,Number((r.headers.get('cache-control')||'').match(/max-age=(\d+)/)?.[1]||3600)*1000);return cachedJWKS;
}
export async function authenticate(context){
 const {request,env}=context;
 if(!env.FIREBASE_PROJECT_ID||!env.BDF_ADMIN_UID||!env.BDF_KV)return {error:'Servidor administrativo ainda não configurado',status:503};
 const raw=request.headers.get('Authorization')||'';
 if(!raw.startsWith('Bearer ')||raw.length>12000)return {error:'Faça login para continuar',status:401};
 try{
  const [a,b,c,...extra]=raw.slice(7).split('.');if(!a||!b||!c||extra.length)return {error:'Token inválido',status:401};
  const h=decodePart(a),p=decodePart(b);
  if(h.alg!=='RS256'||!h.kid||p.aud!==env.FIREBASE_PROJECT_ID||p.iss!==`https://securetoken.google.com/${env.FIREBASE_PROJECT_ID}`||typeof p.sub!=='string'||!p.sub||!Number.isFinite(p.exp)||p.exp<=Date.now()/1000||!Number.isFinite(p.iat)||p.iat>Date.now()/1000+60||!Number.isFinite(p.auth_time)||p.auth_time>Date.now()/1000+60)return {error:'Token inválido ou expirado',status:401};
  const key=(await jwks()).find(x=>x.kid===h.kid&&x.kty==='RSA');if(!key)return {error:'Assinatura de login não reconhecida',status:401};
  const cryptoKey=await crypto.subtle.importKey('jwk',key,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
  const verified=await crypto.subtle.verify('RSASSA-PKCS1-v1_5',cryptoKey,decodeBase64Url(c),encoder.encode(a+'.'+b));
  if(!verified)return {error:'Assinatura de login inválida',status:401};
  if(p.sub!==env.BDF_ADMIN_UID)return {error:'Conta sem permissão de administrador',status:403};
  return {uid:p.sub,email:p.email||'',auth_time:p.auth_time};
 }catch{return {error:'Não foi possível validar o login',status:401};}
}
export async function authorize(context){const result=await authenticate(context);return result.error?{failure:response({error:result.error},result.status)}:{user:result};}
export function limitContentLength(request,max=8*1024*1024){let value=Number(request.headers.get('content-length')||0);return value>max?response({error:'Arquivo acima do tamanho permitido'},413):null;}
export async function readJson(request,max=8*1024*1024){const body=await request.text();if(body.length>max)throw Error('Dados acima do tamanho permitido');return JSON.parse(body);}
function safeUrl(u){return !u||(/^(https:\/\/|\/|data:image\/(jpeg|png|webp|gif);base64,)/i.test(u)&&!/[<>"']/.test(u));}
export function validate(d,{forPublish=false}={}){
 const issues=[];
 if(!d||typeof d!=='object'||!Array.isArray(d.data)||d.data.length>5000)issues.push('Lista de MCs inválida');
 if(issues.length)return issues;
 const ids=new Set(),total=m=>Object.values(m.titles||{}).reduce((acc,n)=>acc+Number(n||0),0)+Number(m.unknownTitles||0);
 for(const m of d.data){
  if(!m||typeof m.id!=='string'||!m.id||ids.has(m.id)||typeof m.name!=='string'||m.name.length>150){issues.push('ID/nome de MC inválido ou duplicado');continue;}ids.add(m.id);
  if(m.photo&&!safeUrl(m.photo))issues.push('Foto de MC com endereço inválido');
  if(m.titles&&Object.entries(m.titles).some(([y,n])=>!/^\d{4}$/.test(y)||!Number.isInteger(Number(n))||Number(n)<0||Number(n)>50000))issues.push('Contagem anual de títulos inválida');
  if(!Number.isInteger(Number(m.unknownTitles||0))||Number(m.unknownTitles||0)<0||total(m)>100000)issues.push('Total de títulos inválido');
 }
 const links=new Set();
 for(const b of d.brackets||[]){
  if(!b||!Array.isArray(b.players)||![4,8,16].includes(b.players.length))issues.push('Chaveamento de tamanho inválido');
  if(b?.status==='published'){
   const participants=b.players.filter(Boolean);if(new Set(participants).size!==participants.length)issues.push('Participantes duplicados em edição publicada');
   if(b.titleLink){const l=b.titleLink,m=d.data.find(x=>x.id===l.mcId),maximum=l.year==='undated'?m?.unknownTitles:m?.titles?.[l.year];const key=[l.mcId,l.year,l.ordinal].join(':');if(!m||l.ordinal<1||l.ordinal>Number(maximum||0)||links.has(key))issues.push('Vínculo de título inválido ou duplicado');links.add(key);}
  }
 }
 if(d.cfg?.tiers){let prev=-1;for(const t of d.cfg.tiers){if(!t||typeof t.n!=='string'||!Number.isInteger(t.min)||t.min<=prev)issues.push('Limiares de ranks inválidos');prev=t.min;}}
 if(forPublish){
  for(const b of d.brackets||[])if(b.status==='published'&&b.awardsTitle!==false&&!b.titleLink)issues.push('Edição publicada sem vínculo de título: '+(b.title||''));
  for(const g of d.gallery||[])if(g.status==='published'&&(!g.id||!g.title))issues.push('Galeria publicada sem identificação');
 }
 return [...new Set(issues)].slice(0,30);
}
export function publicCopy(d){const o={schemaVersion:2,data:d.data,cfg:d.cfg||{},events:(d.events||[]).filter(x=>(x.status||'published')==='published'),gallery:(d.gallery||[]).filter(x=>(x.status||'published')==='published'),champions2026:d.champions2026||[],brackets:(d.brackets||[]).filter(x=>x.status==='published')};return o;}
export async function initialPublic(context){const url=new URL('/data.json',context.request.url);const res=await context.env.ASSETS.fetch(new Request(url,{method:'GET'}));if(!res.ok)return null;return publicCopy(await res.json());}
