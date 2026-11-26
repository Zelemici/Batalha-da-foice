import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

// Executa a função real do HTML, sem reimplementá-la no teste.
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const start=html.indexOf('function bdfCarouselEntries(){');
const end=html.indexOf('\nfunction renderChampionsV6()',start);
assert(start>=0&&end>start,'Carrossel de 2026 deve existir');
const source=html.slice(start,end);
const makeContext=(data,BRACKETS=[])=>{
 const context={data,BRACKETS,bdfCarouselOrder:null,
  bdfRoundSummary:b=>({winner:b.winner||''}),
  bdfEditionLabel:b=>b.title||'Edição',
  Math};
 vm.createContext(context);
 vm.runInContext(source,context);
 return context;
};
const mcs=[
 {id:'a',name:'Alfa',titles:{2026:2}},
 {id:'b',name:'Beta',titles:{2026:1}},
 {id:'c',name:'Gama',titles:{2025:20}},
 {id:'d',name:'Delta',titles:{2026:0}}
];
const ctx=makeContext(mcs);
let entries=Array.from(vm.runInContext('bdfCarouselEntries()',ctx));
assert.deepEqual(entries.map(x=>x.mc.id).sort(),['a','b'],'Todos e somente os titulados de 2026 aparecem sem chaves');
assert(entries.every(x=>/pendente/.test(x.edition)),'Sem chave não se pode inventar número de edição');
assert(entries.find(x=>x.mc.id==='a').status.includes('2 títulos'));
assert(entries.find(x=>x.mc.id==='b').status.includes('1 título'));
assert.equal(mcs[0].titles[2026],2,'Renderizar não deve alterar títulos');
const published={id:'ch1',status:'published',players:['Alfa','Beta','Gama','Delta'],winner:'Alfa',title:'BDF 2026'};
const linked=makeContext(mcs,[published]);
entries=Array.from(vm.runInContext('bdfCarouselEntries()',linked));
assert.equal(entries.filter(x=>x.mc?.id==='a').length,1,'Campeão vinculado não deve duplicar registro pendente');
assert(entries.some(x=>x.id==='br:ch1'),'Chave publicada deve aparecer');
assert(entries.some(x=>x.mc?.id==='b'),'Campeão sem chave deve continuar aparecendo');
console.log('Carrossel de 2026: todos os campeões, contagem pendente e não duplicação OK.');
