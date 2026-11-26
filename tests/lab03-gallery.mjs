import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const gallery=JSON.parse(readFileSync(new URL('../galeria-arquivo-lab03.json',import.meta.url),'utf8'));
const entries=gallery.gallery;
assert.equal(entries.length,7,'Os sete registros publicados fornecidos devem permanecer');
assert(entries.every(x=>x.status==='published'),'Rascunhos não devem ficar em arquivo público');
assert.equal(new Set(entries.map(x=>x.id)).size,entries.length,'IDs sem duplicação');
assert.equal(entries.reduce((n,g)=>n+(g.medias?.length||0),0),36,'Preservar todas as mídias originais');
assert(entries.some(x=>x.title.includes('Zel Campeão')));
assert(entries.some(x=>x.title.includes('Naan')));
assert(entries.every(x=>Array.isArray(x.mcIds)&&x.medias.every(m=>m.url.startsWith('data:image/'))),'Manter marcações e imagens');
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
assert(html.includes("fetch('galeria-arquivo-lab03.json'"),'Galeria recuperada no boot');
assert(html.includes('j.gallery=[...merged.values()]'),'Preservar outros registros existentes');
assert(html.includes("entry?.status==='published'"),'Não importar rascunhos para a área pública');
const js=readFileSync(new URL('../lab03-integration.js',import.meta.url),'utf8');
assert(!js.includes('shell();galleryCards();'),'Não substituir os cards da galeria original');
assert(js.includes('shell();categoryTabs();zeroTitleSection();enforceRoute()'));
const start=js.indexOf('function enforceRoute(){'),end=js.indexOf('const previousRender=render;',start);
assert(start>=0&&end>start);
const nodes={};
for(const id of ['#list','#sortbar','#legend','#more','#pgHome','#pgRec','#pgMem','#pgBrackets','#pgCal','#pgAbout','#pgAnnual','#pgPriv','#pgTerms','#top2'])nodes[id]={
  hidden:false,props:{},
  style:{setProperty(k,v,p){this.values||={};this.values[k]=[v,p]},removeProperty(k){this.values||={};delete this.values[k]}}
};
let context={$:x=>nodes[x],window:{_pg:'memoria'},category:'champions'};
runInNewContext(js.slice(start,end)+';enforceRoute();',context);
assert.equal(nodes['#pgMem'].hidden,false,'Galeria visível');
assert.equal(nodes['#list'].hidden,true,'Ranking oculto na galeria');
assert.deepEqual(Array.from(nodes['#list'].style.values.display),['none','important']);
assert.equal(nodes['#pgHome'].hidden,true,'Home oculta na galeria');
context.window._pg='ranking';
runInNewContext(js.slice(start,end)+';enforceRoute();',context);
assert.equal(nodes['#pgMem'].hidden,true,'Galeria oculta no ranking');
assert.equal(nodes['#list'].hidden,false,'Ranking visível na página correta');
assert.equal(nodes['#top2'].hidden,true,'Ranking redundante nunca fica visível');
console.log('PASSOU: galeria com 7 registros, 36 mídias, privacidade dos rascunhos e rotas isoladas.');
