/* Reconstrução histórica de 24/11/2026: acrescenta fatos confirmados sem recontar títulos.
 * Edições identificadas são marcadores de conquistas já existentes, NÃO novos títulos.
 * Importação idempotente, inclusive quando os dados são carregados do Cloudflare KV.
 */
(function(root){
 'use strict';
 const champions=[
  {name:'Bruno Rodriguês',count:1,editions:['#1']},
  {name:'Jeffinho',count:1,editions:['#2']},
  {name:'Brandon',count:2,editions:['#3']},
  {name:'Maldonado',count:4,editions:['#4','#6','#15','#48']},
  {name:'JR',aliases:['Jr Final','MC Jr'],count:1,editions:['#7']},
  {name:'BOB',count:7,editions:['#10','#12','#25','#41','#44','#63','Especial: Caravana da Juventude']},
  {name:'Dia',count:3,editions:['#11','#20','#58']},
  {name:'Japa',count:1,editions:['#17']},
  {name:'JVV',count:1,editions:['#18']},
  {name:'Mad Dog',aliases:['MadDoog','Maddoog'],count:6,editions:[]},
  {name:'Jaime',aliases:['Jamie'],count:3,editions:['#46','#67']},
  {name:'Naan',aliases:['Nan'],count:1,editions:[]},
  {name:'Son',count:3,editions:['#45','#70']},
  {name:'Ezinho',count:1,editions:['#49']},
  {name:'Valdir',count:1,editions:['#51']},
  {name:'LK',count:1,editions:['#52']},
  {name:'Vieira Zr',count:81,editions:['#53','#54','#55','#56','#57']},
  {name:'Mopa',count:1,editions:['#59']},
  {name:'R10',aliases:['Verissimo','Veríssimo'],count:2,editions:['#60','#62']},
  {name:'Rafael',count:1,editions:['#64']},
  {name:'Amaury',count:1,editions:['#65']}
 ];
 // Os oponentes sem título informado entram sem títulos e sem foto.
 const opponents=[
  {name:'Vitin',aliases:['MC Vitin'],count:0,editions:[]},
  {name:'Pelé',aliases:['Pelé MilFlows','Pelé Mil Flows','MilFlows','Mil Flows'],count:0,editions:[]}
 ];
 // Somente confrontos explicitamente recuperados. Nenhum placar ou data foi presumido.
 const historicalBrackets=[
  {id:'hist2026-jr-7',edition:'#7',champion:'JR',rounds:[{label:'Final',matches:[{a:'JR',b:'Japa',winner:'JR'}]}]},
  {id:'hist2026-bob-t3',edition:'Edição não identificada — 3º título de BOB',champion:'BOB',rounds:[{label:'Final',matches:[{a:'BOB',b:'Vitin',winner:'BOB'}]}]},
  {id:'hist2026-maddog-t3',edition:'Edição não identificada — 3º título de Mad Dog',champion:'Mad Dog',rounds:[
   {label:'Semifinais',matches:[{a:'Mad Dog',b:'Japa',winner:'Mad Dog'},{a:'BOB',b:'Jaime',winner:'Jaime'}]},
   {label:'Final',matches:[{a:'Mad Dog',b:'Jaime',winner:'Mad Dog'}]}
  ]},
  {id:'hist2026-jaime-67',edition:'#67',champion:'Jaime',rounds:[{label:'Final',matches:[{a:'Jaime',b:'Pelé',winner:'Jaime'}]}]},
  {id:'hist2026-naan',edition:'Edição não identificada — título de Naan',champion:'Naan',rounds:[{label:'Final',matches:[{a:'Naan',b:'Dia',winner:'Naan'}]}]},
  {id:'hist2026-r10-60',edition:'#60',champion:'R10',rounds:[{label:'Final',matches:[{a:'R10',b:'Jaime',winner:'R10'}]}]}
 ];
 const key=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/^mc\s+/i,'').trim().replace(/\s+/g,' ').toLowerCase();
 const count=m=>Object.values(m.titles||{}).reduce((n,v)=>n+Number(v||0),0)+Number(m.unknownTitles||0);
 const archiveId=name=>'hist2026-'+key(name).replace(/[^a-z0-9]+/g,'-');
 function apply(document){
  if(!document||!Array.isArray(document.data))return document;
  const out={...document,data:document.data.map(m=>({...m}))};
  const cfg={...(document.cfg||{})},v10={...(cfg.v10||{})};
  const mcByName=new Map();
  for(const m of out.data)for(const v of [m.name,...(m.aliases||[])])mcByName.set(key(v),m);
  const names={};
  for(const item of [...champions,...opponents]){
   let m=[item.name,...(item.aliases||[])].map(n=>mcByName.get(key(n))).find(Boolean);
   if(!m){
    m={id:archiveId(item.name),name:item.name,city:'',photo:'',titles:{},unknownTitles:item.count||0,aliases:[...(item.aliases||[])]};
    if(out.data.some(x=>x.id===m.id))m.id+='-legacy';
    out.data.push(m);
   }else if(!Array.isArray(m.aliases))m.aliases=[];
   for(const n of [item.name,...(item.aliases||[])]){mcByName.set(key(n),m);if(key(n)!==key(m.name)&&!m.aliases.some(a=>key(a)===key(n)))m.aliases.push(n)}
   // Existing MCs keep their stored totals, including Vieira ZR (81), Dia (5), R10 (30).
   // Do not infer a missing year from an edition number.
   m.historicEditions=Array.isArray(m.historicEditions)?[...m.historicEditions]:[];
   for(const e of item.editions)if(!m.historicEditions.includes(e))m.historicEditions.push(e);
   names[key(item.name)]=m;
  }
  v10.historicalBrackets=Array.isArray(v10.historicalBrackets)?[...v10.historicalBrackets]:[];
  v10.manualDuels=Array.isArray(v10.manualDuels)?[...v10.manualDuels]:[];
  const known=new Set(v10.historicalBrackets.map(b=>b.id));
  const knownDuels=new Set(v10.manualDuels.map(d=>d.id));
  const get=name=>mcByName.get(key(name));
  for(const b of historicalBrackets){
   if(!known.has(b.id))v10.historicalBrackets.push(structuredClone(b));
   let i=0;
   for(const round of b.rounds)for(const match of round.matches){
    const a=get(match.a),c=get(match.b),winner=get(match.winner);
    if(!a||!c||!winner||a.id===c.id)continue;
    const id=b.id+'-'+String(++i);
    const exists=v10.manualDuels.some(d=>d.aId===a.id&&d.bId===c.id&&d.winnerId===winner.id&&d.edition===b.edition)
     ||v10.manualDuels.some(d=>d.aId===c.id&&d.bId===a.id&&d.winnerId===winner.id&&d.edition===b.edition);
    if(!knownDuels.has(id)&&!exists){
     v10.manualDuels.push({id,aId:a.id,bId:c.id,winnerId:winner.id,score:'Outro',edition:b.edition,date:''});
     knownDuels.add(id);
    }
   }
  }
  cfg.v10=v10;out.cfg=cfg;
  return out;
 }
 root.BDFHistory={apply,champions,historicalBrackets,titleCount:count};
})(globalThis);
