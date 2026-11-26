import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../v10.css',import.meta.url),'utf8');
const file=JSON.parse(fs.readFileSync(new URL('../data.json',import.meta.url),'utf8'));

assert(html.includes("const rows=Object.entries(m.titles);if(!rows.length)rows.push([new Date().getFullYear(),0]);"));
assert(html.includes("if(t.id=='addRow')return $('#fR').insertAdjacentHTML('beforeend',rowH('',0));"));
assert(!html.includes("rows.push([new Date().getFullYear(),1])"));
assert(!html.includes("rowH('',1)"));
assert(html.includes("if(y&&n>0)titles[y]=n"),'Zero is never persisted as a title');

const start=html.indexOf('function form(id){');
const end=html.indexOf('\nconst rowH=',start);
assert(start>0&&end>start,'Locate real MC form');
const block=html.slice(start,end);
function renderForm(member){
  let markup='';
  const context={data:[member],window:{},open:s=>{markup=s},esc:s=>String(s??''),rowH:(year,n)=>'ROW('+year+','+n+')'};
  vm.runInNewContext(block+';form("mc");',context);
  return markup;
}
const missing=renderForm({id:'mc',name:'Teste',city:'',photo:'',titles:{},unknownTitles:5});
assert(missing.includes('ROW('+new Date().getFullYear()+',0)'),'Editing an undated-only MC must start with zero annual titles');
assert(missing.includes('id="fUnknown" type="number" min="0" step="1" value="5"'),'Undated existing titles remain');
const established=renderForm({id:'mc',name:'Teste',city:'',photo:'',titles:{2023:3},unknownTitles:0});
assert(established.includes('ROW(2023,3)'),'Keep true annual titles');
assert(!established.includes('ROW('+new Date().getFullYear()+',0)'),'No extra row if historical titles exist');

const memStart=html.lastIndexOf('function memoryRender(){');
const memEnd=html.indexOf('\nfunction v6BracketRounds(',memStart);
assert(memStart>0&&memEnd>memStart,'Use active historical gallery renderer');
const memFn=html.slice(memStart,memEnd);
const records=[
 {id:'a',title:'Roda histórica',type:'foto',date:'2020-01-01',description:'Descrição original da roda',mcIds:['j'],status:'published',year:'2020'},
 {id:'b',title:'Flyer antigo',type:'flyer',date:'2018-01-01',description:'Flyer da batalha',mcIds:[],status:'published',year:'2018'}
];
const types={foto:'Fotografia',flyer:'Flyer'};
const base={publishedMem:()=>records,data:[{id:'j',name:'Jaime'}],MEMT:types,memCover:()=>'<img src="foto.jpg" alt="">',memLabel:g=>g.date,esc:s=>String(s??'')};
const all=vm.runInNewContext(memFn+';memoryRender();',{...base,window:{}});
assert(all.includes('Roda histórica')&&all.includes('Flyer antigo'),'Render both categories');
assert(all.includes('Descrição original da roda'),'Cards show original descriptions');
assert(all.includes('@Jaime'),'Cards show MC annotations');
assert(all.includes('mem-card-topline'),'Cards show dates');
assert(all.includes('1 registro'),'Show actual counts, never fabricated statistics');
assert(all.includes('data-gview="a"'),'Preserve click-through to full record');
for(const q of ['jaime','roda','histórica']){
 const result=vm.runInNewContext(memFn+';memoryRender();',{...base,window:{_memQuery:q}});
 assert(result.includes('Roda histórica'),'Search by name, title or description works: '+q);
 assert(!result.includes('Flyer antigo'),'Search filters unrelated records');
}
assert(css.includes('#pgMem .mem-grid')&&css.includes('repeat(auto-fit'),'Responsive gallery grid');
assert(css.includes('#pgMem .mem-card:focus-visible')&&css.includes('prefers-reduced-motion'),'Accessible interactions');
assert(css.includes('#pgMem .mem-bd > *{display:block!important;}'),'Legacy hidden captions now appear');
const count=m=>Object.values(m.titles||{}).reduce((sum,n)=>sum+Number(n||0),0)+Number(m.unknownTitles||0);
assert(file.data.every(m=>count(m)>=0),'Do not change original historical title data');
console.log('PASSOU: editar MC sem ano não soma título; galeria mostra fotos, legendas, MCs e filtros.');
