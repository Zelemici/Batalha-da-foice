
/* Acervo por edição #1–#194: complementa V10, não inclui a LAB02. */
(function(){
'use strict';
if(typeof document==='undefined'||!globalThis.BDFArchive)return;
const h=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const a=()=>CFG?.v10?.editionArchive;
const find=id=>data.find(m=>m.id===id);
const photo=m=>m?.photo?'<img src="'+h(m.photo)+'" loading="lazy" alt="Foto de '+h(m.name)+'">':'<span class="arc-avatar-empty">'+h((m?.name||'?').slice(0,2))+'</span>';
let selected='regional',search='',filterYear='',limit=24;
const specialFor=n=>a()?.catalog?.find(e=>e.number===n)?.special;
const badge=(e,m)=>{
 const sp=specialFor(e.number);
 const active=sp&&(!sp.only||globalThis.BDFArchive.canonical(sp.only)===globalThis.BDFArchive.canonical(m?.name||''));
 return '<span class="arc-ed-chip'+(active?' arc-chip-'+h(sp.id):'')+(e.status==='conferir'?' arc-chip-review':'')+'" title="'+h(e.status==='conferir'?'Associação ou contagem a conferir':active?sp.name:'Conquista identificada')+'">#'+e.number+(e.status==='conferir'?' ?':'')+'</span>';
};
bdfEditionChips=function(m){
 const links=Array.isArray(m.archiveEditionIds)?m.archiveEditionIds:[];
 if(!links.length)return '';
 const top=links.slice().sort((x,y)=>y.number-x.number).slice(0,7);
 return '<span class="bdf-historic-editions arc-chips" title="Edições recuperadas; histórico completo no perfil"><span class="bdf-ed-label">EDIÇÕES:</span>'+top.map(e=>badge(e,m)).join('')+(links.length>7?'<span class="arc-ed-more">+'+(links.length-7)+' no perfil</span>':'')+'</span>';
};
function categoryMembers(cat){
 const archive=a();if(!archive)return [];
 const groups=new Map();
 for(const row of archive.catalog){
  if(row.special?.id!==cat)continue;
  for(const claim of row.claims)for(const id of claim.mcIds){
   const m=find(id);if(!m)continue;
   if(row.special.only&&globalThis.BDFArchive.canonical(m.name)!==globalThis.BDFArchive.canonical(row.special.only))continue;
   const item=groups.get(id)||{m,editions:[],notes:[]};
   if(!item.editions.includes(row.number))item.editions.push(row.number);
   groups.set(id,item);
  }
 }
 for(const x of archive.specialUnnumbered||[]){
  if(x.category!==cat)continue;
  const m=find(x.mcId);if(!m)continue;
  const item=groups.get(m.id)||{m,editions:[],notes:[]};item.notes.push(x.note);groups.set(m.id,item);
 }
 return [...groups.values()].sort((x,y)=>x.m.name.localeCompare(y.m.name,'pt-BR'));
}
function hallExtras(){
 const archive=a(),root=document.getElementById('v10-top');
 if(!archive||!root)return;
 const hall=[...root.querySelectorAll('.v10-section')].find(s=>s.querySelector('h2')?.textContent?.trim()==='Hall dos Campeões');
 if(!hall)return;
 const tabs=(archive.specialCategories||[]).map(c=>'<button type="button" class="arc-tab'+(selected===c.id?' active':'')+'" data-arc-category="'+h(c.id)+'" aria-pressed="'+(selected===c.id)+'">'+h(c.name)+'</button>').join('');
 const group=archive.specialCategories.find(c=>c.id===selected)||archive.specialCategories[0],members=categoryMembers(group.id);
 const cards=members.map(x=>'<button type="button" class="arc-special-mc" data-v10-profile="'+h(x.m.id)+'">'+
 '<span class="arc-special-face">'+photo(x.m)+'</span><strong>'+h(x.m.name)+'</strong><small>'+
 (x.editions.length?x.editions.map(n=>'#'+n).join(' · '):'Edição a confirmar')+'</small>'+
 (x.notes.length?'<em>Número da edição em pesquisa</em>':'')+'</button>').join('');
 let block=hall.querySelector('.arc-specials');
 if(!block){block=document.createElement('div');block.className='arc-specials';hall.append(block);}
 block.innerHTML='<div class="arc-special-header"><span class="arc-overline">Acervo de edições identificadas</span><h3>Campeões de edições especiais</h3><p>Subdivisões por modalidade histórica. Estes registros não acrescentam títulos ao ranking.</p></div>'+
 '<div class="arc-tabs" role="group" aria-label="Categorias especiais">'+tabs+'</div>'+
 '<div class="arc-special-group"><div class="arc-special-subtitle"><b>'+h(group.name)+'</b><small>'+h(group.description)+'</small></div><div class="arc-special-grid">'+(cards||'<p>Sem vencedores identificados nesta categoria.</p>')+'</div></div>';
}
function modalEdition(n){
 const row=a()?.catalog?.find(e=>e.number===n);if(!row)return;
 const duels=(CFG?.v10?.manualDuels||[]).filter(x=>String(x.id).startsWith('arc26-')&&x.edition==='#'+n);
 const groups=(a()?.teamMatches||[]).filter(x=>x.edition===n);
 const claims=row.claims.map(c=>'<div class="arc-claim"><b>'+c.names.map(h).join(' + ')+'</b><span>'+h(c.format==='dupla'?'Conquista em dupla':'Conquista individual')+'</span></div>').join('');
 const singles=duels.map(x=>{const winner=find(x.winnerId),loser=find(x.aId===x.winnerId?x.bId:x.aId);return '<div class="arc-match"><small>'+h(x.phase||'Fase a confirmar')+'</small><span><b>'+h(winner?.name||'MC')+'</b> venceu '+h(loser?.name||'MC')+'</span><em>Placar não registrado</em></div>';}).join('');
 const multi=groups.map(g=>'<div class="arc-match"><small>'+h(g.phase)+' · '+h(g.format)+'</small><span><b>'+g.winner.map(h).join(' + ')+'</b> contra '+g.other.map(h).join(' + ')+'</span><em>'+h(g.format==='tripla'?'Resultado de três participantes; não vira 1×1':'Partida em dupla; não vira 1×1')+'</em></div>').join('');
 open('<div class="arc-detail-title"><strong>#'+n+'</strong><span>'+h(row.year||'Ano a confirmar')+'</span></div>'+
 (row.special?'<p class="arc-detail-special">'+h(row.special.name)+'</p>':'')+
 (row.conflict?'<p class="arc-warning">A edição #146 foi informada tanto para Vieira quanto para Street. As duas anotações aguardam conferência, sem somar títulos.</p>':'')+
 '<h3>Campeão'+(row.claims.some(c=>c.format==='dupla')?'(s)':'')+'</h3>'+(claims||'<p>Campeão não identificado no levantamento.</p>')+
 (singles||multi?'<h3>Confrontos documentados</h3>'+singles+multi:'<p class="hint">Nenhum confronto detalhado foi informado para esta edição.</p>')+
 '<p class="hint">Nenhum placar nem adversário foi presumido.</p>',true);
}
const oldProfile=profile;
profile=function(id){
 oldProfile(id);
 const m=find(id),links=m?.archiveEditionIds||[];
 if(!m||!links.length)return;
 const sheet=document.querySelector('#modal .sheet');if(!sheet)return;
 const checked=links.filter(x=>x.status==='conferir').length,section=document.createElement('section');section.className='arc-profile';
 section.innerHTML='<span class="arc-overline">História recuperada por edição</span><h3>Conquistas identificadas</h3><p>'+
 links.length+' número(s) de edição associados ao nome deste MC. <b>O ranking continua com '+total(m)+' título(s).</b>'+
 (checked?' <strong class="arc-warning-text">'+checked+' registro(s) precisam de conferência.</strong>':'')+'</p>'+
 '<div class="arc-profile-editions">'+links.slice().sort((x,y)=>x.number-y.number).map(e=>'<button type="button" data-arc-show="'+e.number+'" class="arc-profile-link">'+badge(e,m)+'<span>'+h(e.special|| (e.format==='dupla'?'Conquista em dupla':'Edição regular'))+'</span>'+(e.status==='conferir'?'<em>A conferir</em>':'')+'</button>').join('')+'</div>'+
 '<p class="hint">Marcadores históricos não aumentam automaticamente o total de títulos. Resultados incompletos continuam explicitamente sinalizados.</p>';
 sheet.append(section);
};
function filtered(){
 const ar=a(),q=search.trim().toLowerCase();
 if(!ar)return [];
 return ar.catalog.filter(e=>(!filterYear||(filterYear==='unknown'?!e.year:String(e.year)===filterYear))&&(!q||[String(e.number),'#'+e.number,e.claims.flatMap(c=>c.names).join(' '),e.special?.name||''].some(x=>x.toLowerCase().includes(q))));
}
function refreshRows(){
 const el=document.getElementById('arcCards'),root=document.getElementById('bdf-edition-archive');
 if(!el||!root)return;
 const rows=filtered(),visible=rows.slice(0,limit),count=root.querySelector('#arcCount'),more=root.querySelector('#arcMore');
 if(count)count.textContent='Exibindo '+visible.length+' de '+rows.length+' edição(ões)';
 el.innerHTML=visible.map(e=>{
  const title=e.claims.length?e.claims.map(c=>c.names.join(' + ')).join(' / '):'Campeão não identificado';
  const duo=e.claims.some(c=>c.format==='dupla');
  return '<button type="button" class="arc-edition'+(!e.claims.length?' arc-unknown':'')+'" data-arc-show="'+e.number+'"><span class="arc-edition-number">#'+String(e.number).padStart(3,'0')+'</span><span class="arc-edition-info"><small>'+
 h(e.year||'Ano a confirmar')+(duo?' · Dupla':'')+'</small><strong>'+h(title)+'</strong>'+
 (e.conflict?'<em>Numeração a conferir</em>':e.special?'<em class="arc-special-em arc-color-'+h(e.special.id)+'">'+h(e.special.name)+'</em>':'')+'</span><span class="arc-edition-arrow">↗</span></button>';
 }).join('')||'<p class="arc-empty">Nenhuma edição encontrada. Experimente outro filtro.</p>';
 if(more)more.innerHTML=limit<rows.length?'<button type="button" class="btn arc-more" data-arc-more>Carregar mais ('+(rows.length-limit)+' restantes)</button>':'';
}
function archiveCatalogue(){
 const ar=a(),pg=document.getElementById('pgBrackets');if(!ar||!pg)return;
 let root=pg.querySelector('#bdf-edition-archive');
 if(!root){root=document.createElement('section');root.id='bdf-edition-archive';root.className='arc-catalog';pg.append(root);}
 const known=ar.catalog.filter(e=>e.claims.length).length,years=[...new Set(ar.catalog.map(x=>x.year).filter(Boolean))].sort((x,y)=>y-x);
 root.innerHTML='<div class="arc-catalog-intro"><span class="arc-overline">Acervo histórico · levantamento de 26/11/2026</span><h2>Histórico por edição</h2><p>Da #1 à #194. Conquistas, duplas e confrontos documentados. Lacunas permanecem sinalizadas.</p><div class="arc-summary"><span><b>194</b> edições numeradas</span><span><b>'+known+'</b> com campeão identificado</span><span><b>'+(194-known)+'</b> sem campeão identificado</span></div></div>'+
 '<div class="arc-filterbar"><label>Buscar edição ou MC<input id="arcSearch" type="search" autocomplete="off" placeholder="Ex.: #150, Zel, Jotapê" value="'+h(search)+'"></label><label>Ano do levantamento<select id="arcYear"><option value="">Todos os anos</option>'+
 years.map(y=>'<option value="'+y+'"'+(filterYear===String(y)?' selected':'')+'>'+y+'</option>').join('')+
 '<option value="unknown"'+(filterYear==='unknown'?' selected':'')+'>Ano a confirmar</option></select></label></div><p class="arc-count" id="arcCount"></p><div class="arc-cards" id="arcCards"></div><div class="arc-morebox" id="arcMore"></div>'+
 '<p class="arc-note">A edição #146 aparece com dois vencedores em anotações separadas e precisa de confirmação. As edições #189 a #194 não têm ano explicitamente indicado após o último marcador.</p>';
 refreshRows();
}
const prevRender=render;
render=function(){prevRender();hallExtras();archiveCatalogue();};
document.addEventListener('click',e=>{
 const t=e.target.closest('[data-arc-category],[data-arc-show],[data-arc-more]');if(!t)return;
 if(t.dataset.arcCategory){selected=t.dataset.arcCategory;hallExtras();return;}
 if(t.dataset.arcShow){e.preventDefault();e.stopImmediatePropagation();modalEdition(Number(t.dataset.arcShow));return;}
 if(t.hasAttribute('data-arc-more')){limit+=24;refreshRows();}
},true);
document.addEventListener('input',e=>{
 if(e.target.id==='arcSearch'){search=e.target.value;limit=24;refreshRows();}
});
document.addEventListener('change',e=>{
 if(e.target.id==='arcYear'){filterYear=e.target.value;limit=24;refreshRows();}
});
if(Array.isArray(data)&&data.length)render();
})();

