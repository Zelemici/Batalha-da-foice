
/* BDF — levantamento de 26/11/2026, edições #1–#194.
 * O arquivo é declarativo; nenhum título do cadastro existente é incrementado.
 * Divergências e lacunas permanecem explícitas. Importação idempotente.
 */
(function(root){
'use strict';
const ALIASES={
 'Bruno Rodrigues':['Bruno Rodriguês','MC Bruno Rodrigues'],
 'Brandon':['Mc Brandon'],
 'Maldonado':['Mc Maldonado','MC Maldonado'],
 'JR':['Jr','Mc Jr','Jr Final'],
 'BOB':['Bob','Mc Bob'],
 'Japa':['MC Japa'],
 'JV':['JVV','Mc JV'],
 'Vieira Zr':['Vieira','Vieira ZR'],
 'MC Mensageiro':['Mensageiro'],
 'Jotapê':['Jotape','JP','Mc Jotapê'],
 'J²':['J2','J²'],
 'Lozz':["Lo'zz","Mc Lo'zz","MC Lozz"],
 'Nobruxxo':['Nobruxo','Nobruxxo'],
 'Schuler':['Schuller'],
 'Athena BXD':['Athena'],
 'MC Pretinho':['Pretinho','Mc Pretinho'],
 'DestroAk':['Destro','Destro Ak'],
 'Dubeck':['Duback','Dubeck'],
 'Pelé':['Pelé Mil Flows','Pelé MilFlows','Pelé Milflows','Mil Flows'],
 'Indio':['Índio'],
 'Rico Mesquita':['Rico'],
 'Alcantara':['Alcântara'],
 'Frazão':['Frazao'],
 'Jotagê':['Jotage'],
 'M4':['M 4']
};
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/²/g,'2').replace(/^mc\s+/i,'').replace(/[’']/g,'').trim().replace(/\s+/g,' ').toLowerCase();
const keyToCanonical=new Map();
for(const [name,others] of Object.entries(ALIASES))for(const term of [name,...others])keyToCanonical.set(norm(term),name);
const canonical=name=>keyToCanonical.get(norm(name))||String(name||'').trim().replace(/^mc\s+/i,'');
const canonKey=name=>norm(canonical(name));
const slug=name=>canonKey(name).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const count=m=>Object.values(m.titles||{}).reduce((s,v)=>s+Number(v||0),0)+Number(m.unknownTitles||0);
const CLAIMS=[
 '1|Bruno Rodrigues','2|Jeffinho','4|Brandon','5|Maldonado','6|JR','7|Maldonado','8|JR','9|BOB','10|Dia','11|Japa',
 '15|Brandon','16|Maldonado','22|Maldonado','25|JV','26|BOB','27|Mad Dog','30|Mad Dog','31|Jaime','32|Mad Dog','33|Naan',
 '34|BOB','35|Mad Dog','36|Mad Dog','37|BOB','38|Mad Dog',
 '39|Danillo','41|Dia','43|BOB','44|Son','46|BOB','47|Maldonado','49|Ezinho','51|Valdir','52|BOB',
 '54|Vieira Zr','55|Dia','56|Vieira Zr','57|Vieira Zr','58|Vieira Zr','59|Mopa','60|Son','61|R10','62|R10','63|BOB','64|Jaime','65|Rafael','66|Amaury','67|Jaime','68|Jaime','69|Son','70|BOB',
 '71|MC Mensageiro','72|Vieira Zr','73|Vieira Zr','74|R10','75|Vieira Zr','76|Vieira Zr','77|Vieira Zr','78|Vieira Zr','79|R10','80|Vieira Zr','83|Jaime','84|Vieira Zr','85|Vieira Zr','86|Jacaré','87|Vieira Zr','88|Jaime','89|BOB','90|Jotapê','91|R10',
 '92|Lozz+Lorenzo','93|Jaime+Jotapê','94|Vieira Zr','95|R10','96|Vieira Zr','97|Jotapê','98|Ajayo','99|Mopa','100|Vieira Zr','101|R10','102|Jotapê',
 '103|Vieira Zr','104|Jotapê','105|Vieira Zr','106|Frazão','107|Frazão','108|Vieira Zr','109|Jotapê','110|Jotapê','111|Frazão',
 '112|Quintanilha','113|Vieira Zr','114|Vieira Zr','115|Vieira Zr','116|Mopa','117|Jotapê','118|Quintanilha','119|Nobruxxo','123|LK','124|Vieira Zr','125|Dia','126|Vieira Zr','127|Vieira Zr',
 '128|Bruno','130|Vieira Zr','131|Vieira Zr','132|Jotapê','133|Jotapê','134|Mutuca','135|Mont','136|Vieira Zr','137|Nobruxxo','138|Jotapê','139|Nobruxxo','140|R10','141|Vieira Zr',
 '142|Quintanilha','143|Quintanilha','144|Vieira Zr','145|Athena BXD','146|Vieira Zr','146|Street','147|Vieira Zr','148|Nobruxxo','149|Vieira Zr','150|Zel','151|Street','154|Street','155|Zel','158|Nobruxxo','159|Antares','160|R10','161|Zel',
 '162|MC Pretinho','163|Zel','165|J²','166|Antares+TH','167|W','168|J²','170|Jotagê','171|Jotagê','172|R10','173|J²+Zel','174|Zel','175|Street','176|W',
 '177|Dubeck+Schuler','178|Antares','179|Zel',
 '180|Vieira Zr','181|MT','182|Midas','183|Audaz','184|W','185|Efraim','186|Jotinha','187|DestroAk','188|Noth',
 '189|Goiaba','190|Alcantara','191|M4','192|Rico Mesquita','193|Gaab+Jamal','194|Audaz'
];
const SPECIALS={
 103:{id:'baile',name:'1º Baile da Foice'},
 110:{id:'regional',name:'Seletiva Regional'},
 127:{id:'oldnew',name:'Old x New School'},
 146:{id:'retorno',name:'Retorno às Ruas',only:'Vieira Zr'},
 167:{id:'regional',name:'Edição Regional'},
 173:{id:'cave',name:'Edição Cave'},
 178:{id:'regional',name:'Edição Regional'},
 179:{id:'oldnew',name:'New vs Old School'},
 188:{id:'baile',name:'Baile da Foice'}
};
const SPECIAL_CATEGORIES=[
 {id:'baile',name:'Baile da Foice',description:'Edições identificadas como Baile da Foice'},
 {id:'regional',name:'Seletiva Regional',description:'Seletivas e edições regionais identificadas'},
 {id:'oldnew',name:'New vs Old School',description:'Encontros históricos entre gerações'},
 {id:'retorno',name:'Retorno às Ruas',description:'A edição do retorno à rua'},
 {id:'cave',name:'Edição Cave',description:'Conquista especial em dupla'}
];
const DIRECT=[
 [30,'Final','Mad Dog','Jaime'],
 [33,'Final','Naan','Dia'],
 [61,'Final','R10','Jaime'],
 [67,'Final','Jaime','Pelé'],
 [68,'Final','Jaime','Jotapê'],
 [70,'Final','BOB','Jotapê'],
 [80,'Final','Vieira Zr','Jotapê'],
 [97,'Final','Jotapê','Magnata'],
 [135,'Semifinal','Mont','Antares'],
 [135,'Final','Mont','Frazão'],
 [138,'Final','Jotapê','Vieira Zr'],
 [147,'Final','Vieira Zr','Frazão'],
 [150,'Primeira fase','Zel','Antares'],
 [150,'Semifinal','Zel','JV'],
 [155,'Final','Zel','JV'],
 [160,'Final','R10','Antares'],
 [161,'Final','Zel','Antares'],
 [162,'Final','MC Pretinho','Zel'],
 [163,'Final','Zel','MC Pretinho'],
 [165,'Fase a confirmar','Audaz','MC Pretinho'],
 [165,'Fase a confirmar','J²','Audaz'],
 [165,'Fase a confirmar','Indio','Zel'],
 [165,'Fase a confirmar','J²','Dubeck'],
 [168,'Final','J²','Jotagê'],
 [172,'Final','R10','Zel'],
 [174,'Final','Zel','Antares'],
 [175,'Final','Street','Zel'],
 [182,'Final','Midas','J²']
];
const GROUP_MATCHES=[
 {edition:150,phase:'Final (três MCs)',winner:['Zel'],other:['R10','Jotapê'],format:'tripla',note:'Não converter em duas vitórias individuais'},
 {edition:166,phase:'Final',winner:['Antares','TH'],other:['MC Pretinho','MAX'],format:'dupla'},
 {edition:173,phase:'Primeira fase',winner:['J²','Zel'],other:['Gaab','JV'],format:'dupla'},
 {edition:173,phase:'Segunda fase',winner:['J²','Zel'],other:['Antares','Debochado'],format:'dupla'},
 {edition:173,phase:'Final',winner:['J²','Zel'],other:['Dubeck','Lozz'],format:'dupla'},
 {edition:193,phase:'Final',winner:['Gaab','Jamal'],other:['Son','Goiaba'],format:'dupla'}
];
const years=[[11,2013],[38,2014],[70,2015],[102,2016],[111,2017],[127,2018],[141,2019],[143,2020],[145,2021],[161,2022],[176,2023],[179,2024],[188,2025],[194,2026]];
function editionYear(n){for(const [end,y] of years)if(n<=end)return y;return null;}
const byEdition=new Map();
for(const line of CLAIMS){const [raw,names]=line.split('|'),n=Number(raw);
 if(!Number.isInteger(n)||n<1||n>194||!names)throw Error('Edição inválida na fonte: '+line);
 const claim={names:names.split('+').map(canonical),format:names.includes('+')?'dupla':'individual'};
 const row=byEdition.get(n)||[];row.push(claim);byEdition.set(n,row);
}
const identityNames=new Set();
for(const rows of byEdition.values())for(const claim of rows)for(const name of claim.names)identityNames.add(name);
for(const [, ,winner,loser] of DIRECT){identityNames.add(canonical(winner));identityNames.add(canonical(loser));}
for(const g of GROUP_MATCHES)for(const name of [...g.winner,...g.other])identityNames.add(canonical(name));
identityNames.add('Vieira Zr'); // Vitória em seletiva regional citada sem número de edição.
identityNames.add('Vitin'); // Adversário de registro anterior, sem título e sem edição identificada.
function allClaims(){return Array.from({length:194},(_,i)=>{
 const n=i+1,claims=byEdition.get(n)||[];
 const conflict=claims.length>1&&claims.some(c=>c.format!=='dupla');
 return {number:n,year:editionYear(n),claims,conflict,special:SPECIALS[n]||null,
   status:claims.length?(conflict?'numeração em conflito':'campeão registrado'):'campeão não identificado'};
 });}
function apply(source){
 if(!source||!Array.isArray(source.data))return source;
 const out={...source,data:source.data.map(m=>({...m,aliases:Array.isArray(m.aliases)?[...m.aliases]:[]}))};
 const map=new Map();
 for(const m of out.data){for(const v of [m.name,...m.aliases])if(!map.has(canonKey(v))||String(map.get(canonKey(v)).id).startsWith('hist2026-'))map.set(canonKey(v),m);}
 const originalCounts=new Map(out.data.map(m=>[m.id,count(m)]));
 const created=[];
 function get(raw){
  const name=canonical(raw),key=canonKey(name);
  let m=map.get(key);
  if(m)return m;
  const nums=allClaims().filter(e=>e.claims.some(c=>c.names.some(n=>canonKey(n)===key))).map(e=>e.number);
  let id='hist2026-'+slug(name);
  if(out.data.some(x=>x.id===id))id+='-source';
  m={id,name,city:'',photo:'',titles:{},unknownTitles:new Set(nums).size,aliases:[]};
  out.data.push(m);map.set(key,m);created.push({id,name,titles:m.unknownTitles});
  return m;
 }
 for(const name of identityNames)get(name);
 const rows=allClaims(),registeredPerMC=new Map();
 for(const entry of rows){
  const claims=entry.claims.map(c=>({...c,mcIds:c.names.map(n=>get(n).id)}));
  entry.claims=claims;
  for(const c of claims)for(const id of c.mcIds){
   if(!registeredPerMC.has(id))registeredPerMC.set(id,[]);
   registeredPerMC.get(id).push(entry);
  }
 }
 for(const m of out.data){
  const entries=registeredPerMC.get(m.id)||[],limit=count(m);
  // Não modificar m.titles, m.unknownTitles, fotos, apelidos nem outros campos do perfil.
  m.archiveEditionIds=entries.map((e,i)=>({number:e.number,year:e.year,
    status:e.conflict||i>=limit?'conferir':'vinculado',
    special:e.special&&(!e.special.only||canonKey(m.name)===canonKey(e.special.only))?e.special.name:'',
    format:e.claims.find(c=>c.mcIds.includes(m.id))?.format||'individual'}));
 }
 const cfg={...(out.cfg||{})},v10={...(cfg.v10||{})};
 v10.historicalBrackets=(v10.historicalBrackets||[]).filter(x=>!String(x.id||'').startsWith('hist2026-'));
 const teamMatches=GROUP_MATCHES.map((g,i)=>({...g,id:'archive-group-'+g.edition+'-'+i,
   winnerIds:g.winner.map(n=>get(n).id),otherIds:g.other.map(n=>get(n).id)}));
 const old=(v10.manualDuels||[]).filter(d=>!/^hist2026-|^arc26-/.test(d.id||''));
 // Confrontos já registrados no chaveamento completo não devem ser contados duas vezes.
 const confirmed=root.BDFV10Core?.completedBattles(out.brackets||[],[],out.data)||[];
 const duels=[...old],added=[];
 for(let i=0;i<DIRECT.length;i++){
  const [edition,stage,a,b]=DIRECT[i],w=get(a),l=get(b),id='arc26-'+edition+'-'+i;
  if(w.id===l.id)continue;
  const exists=[...old,...confirmed].some(d=>{
    const participants=d.ids||[d.aId,d.bId];
    const winner=d.winnerId;
    const editionNo=(String(d.edition||'').match(/(?:^|#|BDF\s*|Edi[cç][aã]o\s*)(\d{1,3})\b/i)||[])[1];
    return participants.includes(w.id)&&participants.includes(l.id)&&winner===w.id&&Number(editionNo)===edition;
  });
  if(exists)continue;
  const duel={id,aId:w.id,bId:l.id,winnerId:w.id,score:'Outro',edition:'#'+edition,date:'',phase:stage,source:'Levantamento histórico de 26/11/2026'};
  duels.push(duel);added.push(duel);
 }
 v10.manualDuels=duels;
 const catalog=rows.map(e=>({...e,claims:e.claims.map(c=>({...c,names:[...c.names]}))}));
 v10.editionArchive={version:1,source:'Levantamento do organizador em 26/11/2026',catalog,teamMatches,
   specialCategories:SPECIAL_CATEGORIES.map(c=>({...c})),
   specialUnnumbered:[{category:'regional',mcId:get('Vieira Zr').id,note:'Campeão de seletiva regional; número da edição a confirmar'}],
   issues:[{type:'duplicate_edition',number:146,note:'A edição #146 aparece para Vieira Zr e Street; não presumir dupla nem duas edições.'},
           {type:'year_unknown',start:189,end:194,note:'Ano não indicado após a última marcação de 2026.'}],
   createdProfiles:[...(source.cfg?.v10?.editionArchive?.createdProfiles||[]),...created].filter((x,i,arr)=>arr.findIndex(a=>a.id===x.id)===i)};
 cfg.v10=v10;out.cfg=cfg;
 return out;
}
root.BDFArchive={apply,canonical,norm,count,allClaims,direct:DIRECT,groupMatches:GROUP_MATCHES,specialCategories:SPECIAL_CATEGORIES,aliases:ALIASES};
})(globalThis);

