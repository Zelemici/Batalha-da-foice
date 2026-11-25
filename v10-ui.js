/* Batalha da Foice V10 — integra os novos recursos sem reescrever o legado. */
(function(){
'use strict';
const core=globalThis.BDFV10Core;
if(!core){console.error('Regras V10 indisponíveis');return;}
const el=s=>document.querySelector(s),els=s=>Array.from(document.querySelectorAll(s));
const h=s=>esc(s),mc=id=>data.find(m=>m.id===id),byName=n=>data.find(m=>m.name===n);
const v10=()=>{if(!CFG.v10||typeof CFG.v10!=='object')CFG.v10={};if(!CFG.v10.seasons)CFG.v10.seasons={};return CFG.v10;};
const year=()=>Number(v10().year||new Date().getFullYear());
const season=y=>{const key=String(y),s=v10().seasons[key]||(v10().seasons[key]={participants:[],rules:{...core.defaults},adjustments:{}});s.participants||=[];s.rules||={...core.defaults};s.adjustments||={};return s;};
const options=(id)=>data.slice().sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')).map(m=>'<option value="'+h(m.id)+'" '+(m.id===id?'selected':'')+'>'+h(m.name)+'</option>').join('');
const avatars=m=>m?.photo?'<img src="'+h(m.photo)+'" alt="Foto de '+h(m.name)+'" loading="lazy">':'<span class="v10-avatar">'+h(m?.name?.slice(0,1)||'?')+'</span>';
const published=()=>BRACKETS.filter(b=>b.status==='published').slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
const manualDuels=()=>Array.isArray(v10().manualDuels)?v10().manualDuels:(v10().manualDuels=[]);
const career=m=>core.mcCareer(m,data,BRACKETS,manualDuels());
const titleShareLabel=m=>core.titleShare(m,data).toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})+'%';
const titleShareTag=m=>'<span class="v10-title-share" title="Participação deste MC entre todos os títulos registrados">'+titleShareLabel(m)+' dos títulos do acervo</span>';
const staging=fn=>{fn();save();render();};
function standings(){return core.annualTable({year:year(),mcList:data,brackets:BRACKETS,season:season(year())});}
function latest(){
 const b=published()[0];return '<section class="v10-section"><div class="v10-eyebrow">Edição mais recente</div><h2>Chaveamento em destaque</h2>'+(b?v6BracketHtml(b)+'<a href="#/edicoes" class="btn">Consultar outras edições</a>':'<p class="v10-empty">O último torneio publicado aparecerá aqui, com resultados e campeão.</p>')+'</section>';
}
function hall(){
 const top=data.filter(m=>total(m)>0).slice().sort((a,b)=>total(b)-total(a)||a.name.localeCompare(b.name,'pt-BR')).slice(0,3);
 return '<section class="v10-section"><div class="v10-eyebrow">História da competição</div><h2>Hall dos Campeões</h2><div class="v10-hall">'+top.map((m,i)=>'<button class="v10-champ" data-v10-profile="'+h(m.id)+'"><span class="v10-place">'+(i+1)+'º lugar</span>'+avatars(m)+'<strong>'+h(m.name)+'</strong><span>'+total(m)+' título(s)</span>'+titleShareTag(m)+'</button>').join('')+'</div></section>';
}
function matchup(){
 const a=mc(v10().compareA)||data[0],b=mc(v10().compareB)||data.find(m=>m.id!==a?.id);
 if(!a||!b)return '<p>Cadastre ao menos dois MCs.</p>';
 const history=core.duelHistory(a,b,BRACKETS,manualDuels(),data);
 const careerA=career(a),careerB=career(b);
 const duelPct=(count,value)=>count?value+'%':'—';
 return '<section class="v10-section"><div class="v10-eyebrow">Histórico de resultados</div><h2>Confronto Direto</h2><div class="v10-compare"><div class="v10-fighter">'+avatars(a)+'<select data-v10-compare="A" aria-label="Primeiro MC">'+options(a.id)+'</select><strong>'+history.a+' vitórias · '+duelPct(history.matches.length,history.aRate)+' nos duelos</strong><small>'+duelPct(careerA.games,careerA.winRate)+' geral</small></div><div class="v10-vs"><span>VS</span><b>'+history.a+' × '+history.b+'</b><small>'+history.matches.length+' duelo(s)</small></div><div class="v10-fighter">'+avatars(b)+'<select data-v10-compare="B" aria-label="Segundo MC">'+options(b.id)+'</select><strong>'+history.b+' vitórias · '+duelPct(history.matches.length,history.bRate)+' nos duelos</strong><small>'+duelPct(careerB.games,careerB.winRate)+' geral</small></div></div><details class="v10-details"><summary>Histórico de duelos</summary>'+(history.matches.length?history.matches.map(x=>'<p>'+h(x.date||'')+' · '+h(x.edition)+' · '+h(x.winner)+' venceu · '+h(x.score)+'</p>').join(''):'<p>Não há duelos publicados entre esses MCs. Os resultados não são presumidos.</p>')+'</details><small class="hint">Inclui confrontos publicados e resultados antigos cadastrados manualmente. Double Three conta nas estatísticas gerais, mas não como duelo individual. Win rate calculado apenas sobre partidas registradas.</small></section>';
}
function annual(){
 const table=standings(),years=[...new Set([year(),...Object.keys(v10().seasons).map(Number)])].sort((a,b)=>b-a);
 return '<section class="v10-section"><div class="v10-eyebrow">Pontos acumulados na temporada</div><h2>Ranking Anual · TOP 16</h2><p>Os pontos vêm das campanhas em edições publicadas, mais bônus por 2 × 0 e ajustes justificados pelo administrador.</p><label class="v10-year">Temporada <select data-v10-year>'+years.map(y=>'<option value="'+y+'" '+(y===year()?'selected':'')+'>'+y+'</option>').join('')+'</select></label><div class="v10-table"><table><thead><tr><th>#</th><th>MC</th><th>Fase</th><th>2 × 0</th><th>Ajuste</th><th>Pontos</th></tr></thead><tbody>'+table.map((r,i)=>'<tr><td>'+(i+1)+'º</td><td><button class="v10-name" data-v10-profile="'+h(r.id)+'">'+avatars(mc(r.id))+h(mc(r.id)?.name||'MC')+'</button></td><td>'+r.stage+'</td><td>+'+r.bonus+'</td><td>'+r.manual+'</td><td><strong>'+r.points+'</strong></td></tr>').join('')+(table.length?'':'<tr><td colspan="6">Nenhum participante selecionado nesta temporada.</td></tr>')+'</tbody></table></div><p class="hint">Desempate: pontos, vitórias registradas e nome. Não há cálculo retroativo de batalhas não cadastradas.</p></section>';
}
function highlights(){
 const b=published()[0],w=b&&core.bracketRounds(b).at(-1)?.[0]?.result?.winner;
 const fm=mc(v10().featuredMC)||data.find(m=>(m.videos||[]).some(core.validVideo));
 const fv=fm&&((fm.videos||[]).find(v=>v.url===v10().featuredVideoUrl&&core.validVideo(v))||(fm.videos||[]).find(core.validVideo));
 return '<section class="v10-section"><div class="v10-eyebrow">Destaques da roda</div><h2>Destaques da semana</h2><div class="v10-highlight"><div><small>Último campeão</small><strong>'+h(w||'Ainda não informado')+'</strong></div><div><small>Batalha mais recente</small><strong>'+h(b?.title||'Aguardando cadastro')+'</strong></div><div><small>Rima em destaque</small><strong>'+h(fv?.title||'Aguardando seleção')+'</strong>'+(fm&&fv?'<button class="btn" data-v10-profile="'+h(fm.id)+'">Ver vídeo</button>':'')+'</div></div></section>';
}
function decorateCards(){
 const containers=[el('#list'),el('#top2')];
 for(const root of containers){
  if(!root)continue;
  for(const card of root.querySelectorAll('[data-id].card, [data-id].sr')){
   const m=mc(card.dataset.id);if(!m)continue;
   const st=career(m),point=card.querySelector('.tags, .sr-history-meta');
   if(!point)continue;
   if(!point.querySelector('.v10-title-share'))point.insertAdjacentHTML('beforeend',titleShareTag(m));
   if(point.querySelector('.v10-card-record'))continue;
   const rate=st.games?st.winRate+'%':'—';
   point.insertAdjacentHTML('beforeend','<span class="v10-card-record" title="Apenas batalhas com resultados cadastrados">'+
      st.wins+' vitórias · '+rate+' win rate · '+st.twoZero+' (2 × 0)</span>');
  }
 }
}
function decorate(){
 if(!data.length)return;
 // Participantes sem título ficam no cadastro administrativo e nos confrontos,
 // mas não entram nos cards históricos da página inicial.
 for(const card of el('#top2')?.querySelectorAll('[data-id]')||[]){
  const member=mc(card.dataset.id);
  if(member&&total(member)===0)card.remove();
 }
 decorateCards();
 const home=el('#pgHome');if(!home)return;
 let top=el('#v10-top');if(!top){top=document.createElement('div');top.id='v10-top';home.prepend(top);}
 top.innerHTML=latest()+hall();
 let bottom=el('#v10-bottom');if(!bottom){bottom=document.createElement('div');bottom.id='v10-bottom';home.append(bottom);}
 bottom.innerHTML=matchup()+'<div class="v10-annual-link"><a href="#/anual" class="btn on">Abrir Ranking Anual · TOP 16</a></div>'+highlights();
 const cal=el('#pgCal');
 if(cal){
  const editions=published().filter(b=>b.date);
  const list=editions.map(b=>'<div class="v10-cal-edition"><strong>'+h(b.date)+' · '+h(b.title)+'</strong><a href="#/edicoes">Ver chaveamento e resultados</a></div>').join('');
  cal.querySelector('.v10-calendar-results')?.remove();
  cal.insertAdjacentHTML('beforeend','<section class="v10-calendar-results"><h3>Edições com resultados registrados</h3>'+(list||'<p class="hint">Os chaveamentos publicados aparecerão aqui.</p>')+'</section>');
 }
 const page=el('#pgAnnual');if(page){page.hidden=window._pg!=='anual';if(!page.hidden)page.innerHTML=annual();}
 const nav=el('#v10-nav');if(nav)nav.classList.toggle('on',window._pg==='anual');
}
const originalRanked=ranked;
ranked=function(){return originalRanked().filter(m=>total(m)>0);};
v6BracketRounds=core.bracketRounds;
const originalRender=render;
function updateTreeWires(){
 for(const tree of els('.v10-tree')){
  const svg=tree.querySelector('.v10-tree-wires');if(!svg)continue;
  const rect=tree.getBoundingClientRect();if(!rect.width||!rect.height)continue;
  const lines=[],rounds=[...tree.querySelectorAll('.v10-tree-round')];
  const cx=node=>{const r=node.getBoundingClientRect();return r.left-rect.left+r.width/2;};
  const ty=node=>node.getBoundingClientRect().top-rect.top;
  const by=node=>node.getBoundingClientRect().bottom-rect.top;
  for(let i=0;i<rounds.length-1;i++){
   const kids=[...rounds[i].querySelectorAll('.v10-br-match')],parents=[...rounds[i+1].querySelectorAll('.v10-br-match')];
   parents.forEach((parent,j)=>{const py=by(parent),px=cx(parent);
    for(const child of kids.slice(j*2,j*2+2)){const x=cx(child),y=ty(child),bend=py+(y-py)/2;
     lines.push('<path d="M '+x+' '+y+' V '+bend+' H '+px+' V '+py+'"/>');}
   });
  }
  svg.setAttribute('viewBox','0 0 '+Math.ceil(rect.width)+' '+Math.ceil(rect.height));svg.innerHTML=lines.join('');
 }
}
const treeRefresh=()=>requestAnimationFrame(()=>requestAnimationFrame(updateTreeWires));
window.addEventListener('resize',treeRefresh);
if(typeof ResizeObserver!=='undefined')new ResizeObserver(treeRefresh).observe(document.documentElement);
render=function(){originalRender();decorate();treeRefresh();};
const oldMatch=bdfMatchHtml;
bdfMatchHtml=function(match){
 if(!match.third)return oldMatch(match);
 return '<div class="bdf-game">'+match.participants.map((n,i)=>'<div class="bdf-player '+(match.result?.winner===n?'won':match.result?.winner?'lost':'')+'"><span>'+h(n)+'</span><span class="bdf-score">'+(match.result?.points?.[i]??'—')+(match.result?.winner===n?' ★':'')+'</span></div>').join('')+'</div>';
};
function v10MatchHtml(match){
 const winner=match.result?.winner||'';
 const people=match.third?[match.a,match.c,match.third]:[match.a,match.c];
 return '<div class="v10-br-match">'+people.map((name,i)=>'<div class="v10-br-player '+(winner===name&&name?'v10-br-win':'')+'"><span>'+h(name||'A definir')+'</span><strong>'+(match.result?.points?.[i]??(winner===name?'★':''))+'</strong></div>').join('')+'<div class="v10-br-score">'+h(match.result?.score||'Placar pendente')+'</div></div>';
}
v6BracketHtml=function(b){
 const rounds=core.bracketRounds(b);
 const labels=rounds.map((_,i)=>i===rounds.length-1?'Final':i===rounds.length-2?'Semifinal':i===0?'Primeira fase':'Segunda fase');
 const win=rounds.at(-1)?.[0]?.result?.winner;
 const layout=['columns','tree','mirror'].includes(b.layout)?b.layout:'columns';
 const names={columns:'Clássico em fases',tree:'Árvore conectada',mirror:'Espelhado'};
 let board='';
 if(layout==='mirror'&&rounds.length>1){
  const center=rounds.at(-1);
  const sides=rounds.slice(0,-1);
  const side=right=>{
   const rs=right?sides.slice().reverse():sides;
   return '<div class="v10-br-side '+(right?'v10-br-right':'v10-br-left')+'">'+rs.map((ms,ix)=>{
    const orig=right?sides.length-ix-1:ix;
    const half=ms.length/2,subset=ms.slice(right?half:0,right?ms.length:half);
    return '<div class="v10-br-round"><h4>'+h(labels[orig])+'</h4>'+subset.map(v10MatchHtml).join('')+'</div>';
   }).join('')+'</div>';
  };
  board='<div class="v10-br-mirror-board">'+side(false)+'<div class="v10-br-center"><h4>Final</h4>'+center.map(v10MatchHtml).join('')+'</div>'+side(true)+'</div>';
 }else if(layout==='tree'){
  const leaves=rounds[0]?.length||1;
  board='<div class="v10-tree" style="--v10-leaves:'+leaves+'">'+
   '<svg class="v10-tree-wires" aria-hidden="true" preserveAspectRatio="none"></svg>'+
   rounds.map((ms,i)=>'<div class="v10-tree-round" data-tree-round="'+i+'"><h4>'+h(labels[i])+'</h4><div class="v10-tree-games">'+
   ms.map(m=>'<div class="v10-tree-match" style="grid-column:span '+Math.pow(2,i)+'">'+v10MatchHtml(m)+'</div>').join('')+
   '</div></div>').join('')+'</div>';
 }else{
  board='<div class="v10-br-rounds v10-br-columns">'+rounds.map((ms,i)=>'<div class="v10-br-round"><h4>'+h(labels[i])+'</h4><div class="v10-br-games">'+ms.map(v10MatchHtml).join('')+'</div></div>').join('')+'</div>';
 }
 return '<article class="v6-bracket v10-bracket v10-layout-'+layout+'"><div class="v6-bracket-header"><div><h3>'+h(b.title)+'</h3><p class="hint">'+h(b.date||'Data pendente')+' · '+b.players.length+' vagas · '+h(names[layout])+' · '+(b.status==='published'?'Publicado':'Rascunho')+'</p></div>'+(canAdmin?'<button class="btn" data-v6-editbr="'+h(b.id)+'">Editar chave</button>':'')+'</div><div class="v10-br-scroll" tabindex="0" aria-label="Chaveamento '+h(b.title)+'">'+board+'</div>'+(win?'<p class="v6-champion">🏆 Campeão: '+h(win)+'</p>':'')+'</article>';
};
const oldProfile=profile;
profile=function(id){
 oldProfile(id);
 const m=mc(id),sheet=el('#modal .sheet');if(!m||!sheet)return;
 const photos=GAL.filter(g=>(g.status||'published')==='published'&&(g.mcIds||[]).includes(id)).flatMap(g=>mediaList(g).filter(f=>imageMedia(f.url)).map(f=>f.url)).slice(0,12);
 const vids=(m.videos||[]).filter(core.validVideo);
 const st=career(m);
 sheet.insertAdjacentHTML('beforeend','<div class="v10-title-share-profile"><strong>'+titleShareLabel(m)+'</strong><span>dos títulos registrados pertencem a este MC · '+total(m)+' de '+data.reduce((sum,item)=>sum+total(item),0)+' títulos do acervo</span></div>');
 sheet.insertAdjacentHTML('beforeend','<div class="v10-career"><h3>Estatísticas de batalhas registradas</h3><div class="v10-stat-grid"><div><strong>'+st.games+'</strong><small>Disputadas</small></div><div><strong>'+st.wins+'</strong><small>Vitórias</small></div><div><strong>'+(st.games?st.winRate+'%':'—')+'</strong><small>Win rate</small></div><div><strong>'+st.twoZero+'</strong><small>Vitórias por 2 × 0</small></div></div><p class="hint">Só entram partidas com resultados registrados. Títulos antigos, sozinhos, não permitem calcular win rate.</p></div>');
 sheet.insertAdjacentHTML('beforeend','<div class="v10-profile"><h3>Perfil do MC</h3><div class="v10-tags">'+(m.tags||[]).map(tag=>'<span class="v10-tag">'+h(tag)+'</span>').join('')+'</div>'+(photos.length?'<h3>Galeria de fotos</h3><div class="v10-photos">'+photos.map(url=>'<img loading="lazy" src="'+h(url)+'" alt="Foto de '+h(m.name)+'">').join('')+'</div>':'')+(vids.length?'<h3>Vídeos de rimas</h3><div class="v10-videos">'+vids.map(v=>{const youtube=core.youtubeId(v.url);return '<div class="v10-video">'+(youtube?'<button class="v10-play" data-v10-play="'+youtube+'" aria-label="Reproduzir"><img loading="lazy" src="https://img.youtube.com/vi/'+youtube+'/hqdefault.jpg" alt=""><span>▶</span></button>':'<video src="'+h(v.url)+'" controls playsinline preload="none"></video>')+'<b>'+h(v.title)+'</b></div>';}).join('')+'</div>':'')+'</div>');
};
const originalAdm=admRender;
const baseForm10=form;
form=function(id){
 baseForm10(id);
 // Um MC novo começa sem títulos. Não colocá-lo automaticamente no ranking histórico.
 if(!id){const titleRows=el('#fR');const first=titleRows?.querySelector('.row');const inputs=first?.querySelectorAll('input');if(inputs?.length>1)inputs[1].value='0';}
 const panel=el('#modal .sheet');if(!panel)return;
 panel.classList.add('v10-form-modal');
 panel.insertAdjacentHTML('afterbegin','<div class="v10-toolbar"><button class="btn" data-v10-jump="fN">Informações</button><button class="btn" data-v10-jump="fRp">Estado</button><button class="btn" data-v10-jump="fP">Foto</button><button class="btn" data-v10-jump="fR">Títulos</button>'+(id?'<button class="btn" data-v10-open-panel="v10-tags" data-v10-mcid="'+h(id)+'">Tags</button><button class="btn" data-v10-open-panel="v10-videos" data-v10-mcid="'+h(id)+'">Vídeos</button>':'')+'</div>');
};
// Preserve os painéis completos da V9 (inclusive aparência, importação/exportação,
// música, calendários, níveis e layout). Os recursos novos são abas adicionais.
const legacyTabs=[['vis','Visão geral'],['mcs','MCs e títulos'],['niv','Níveis'],['ap','Aparência e fontes'],['lay','Layout do ranking'],['mus','Música'],['cal','Calendário'],['mem','Galeria'],['site','Configurações do site'],['log','Histórico'],['dad','Dados, importar/exportar'],['campeoes','Campeões 2026'],['chaves','Chaveamentos']];
const moreTabs=[['v10-cadastro','Todos os MCs'],['v10-com-titulos','MCs com títulos'],['v10-sem-titulos','MCs sem títulos'],['v10-tags','Tags'],['v10-estados','Estados'],['v10-videos','Vídeos'],['v10-destaques','Destaques'],['v10-duelos','Confrontos diretos'],['v10-anual','Ranking anual']];

function tabs(){
 const p=el('#adm .atabs');if(!p)return;
 for(const [id,label] of [...legacyTabs,...moreTabs]){
  const existing=p.querySelector('[data-at="'+id+'"]');
  if(existing){existing.textContent=label;existing.classList.toggle('on',admTab===id);continue;}
  p.insertAdjacentHTML('beforeend','<button class="btn '+(admTab===id?'on':'')+'" data-at="'+id+'">'+label+'</button>');
 }
}
function sheet(title,body){el('#adm').innerHTML='<div class="asheet"><div class="bar"><h2>'+title+'</h2><button class="btn" id="admClose">Fechar</button></div><div class="atabs"></div>'+body+'</div>';}
function history(y){
 const a=season(y).adjustments||{};
 return Object.entries(a).flatMap(([id,entries])=>entries.map(x=>'<p class="hint">'+h(mc(id)?.name||id)+' · '+(x.delta>0?'+':'')+x.delta+' pts · '+h(x.reason)+'</p>')).join('');
}
function fillFeatured(){
 const m=mc(el('#v10FeaturedMC')?.value),select=el('#v10FeaturedVideo');if(!select)return;
 select.innerHTML=(m?.videos||[]).filter(core.validVideo).map(v=>'<option value="'+h(v.url)+'" '+(v.url===v10().featuredVideoUrl?'selected':'')+'>'+h(v.title)+'</option>').join('')||'<option value="">Nenhum vídeo</option>';
}
function videoList(id){
 const m=mc(id),box=el('#v10VidList');if(!box)return;
 box.innerHTML='<h3>Vídeos deste MC</h3>'+((m?.videos||[]).map((v,i)=>'<div class="v10-mc-row"><span><strong>'+h(v.title)+'</strong><small>'+h(v.kind==='youtube'?'YouTube':'Enviado ao site')+'</small></span><button class="btn" data-v10-edit-video="'+i+'">Renomear</button><button class="btn" data-v10-delete-video="'+i+'">Excluir</button></div>').join('')||'<p class="hint">Nenhum vídeo cadastrado.</p>');
}
admRender=function(){
 if(!canAdmin)return;
 const y=year(),s=season(y);
 if(['mcs','v10-cadastro','v10-com-titulos','v10-sem-titulos'].includes(admTab)){
  const kind=admTab,onlyUnranked=kind==='v10-sem-titulos',onlyRanked=kind==='v10-com-titulos';
  const members=data.filter(m=>onlyUnranked?total(m)===0:onlyRanked?total(m)>0:true)
    .slice().sort((a,b)=>onlyUnranked?a.name.localeCompare(b.name,'pt-BR'):
      total(b)-total(a)||a.name.localeCompare(b.name,'pt-BR'));
  const tags='<div class="v10-roster-tabs"><button class="btn '+(onlyRanked?'on':'')+'" data-at="v10-com-titulos">Com títulos ('+data.filter(m=>total(m)>0).length+')</button>'+
    '<button class="btn '+(kind==='v10-sem-titulos'?'on':'')+'" data-at="v10-sem-titulos">Sem títulos ('+data.filter(m=>total(m)===0).length+')</button>'+
    '<button class="btn '+(kind==='v10-cadastro'||kind==='mcs'?'on':'')+'" data-at="v10-cadastro">Todos ('+data.length+')</button></div>';
  const rows=members.map(m=>{
    const t=total(m),src=m._tmp||m.photo||'';
    return '<article class="v10-admin-mc-card" data-v10-roster-mc="'+h(m.id)+'">'+
      '<div class="v10-admin-mc-face">'+(src?'<img src="'+h(src)+'" loading="lazy" alt="Foto de '+h(m.name)+'">':'<span class="v10-admin-mc-initial">'+h(m.name?.slice(0,1)||'?')+'</span>')+'</div>'+
      '<div class="v10-admin-mc-meta"><strong title="'+h(m.name)+'">'+h(m.name)+'</strong><small>'+h(m.city||'Local não informado')+'</small><b class="v10-admin-mc-counter">'+t+' '+(t===1?'título':'títulos')+'</b><span class="v10-admin-share">'+titleShareLabel(m)+' de todos os títulos</span></div>'+
      '<div class="v10-admin-mc-actions"><button class="btn" data-edit="'+h(m.id)+'" aria-label="Editar '+h(m.name)+'">Editar</button>'+
        '<button class="btn" data-q="'+h(m.id)+'" aria-label="Somar um título para '+h(m.name)+'">+1</button>'+
        '<button class="btn" data-qm="'+h(m.id)+'" aria-label="Retirar um título de '+h(m.name)+'" '+(!t?'disabled':'')+'>−1</button>'+
      '</div></article>';
  }).join('');
  const bulk=(kind==='mcs'||kind==='v10-cadastro')?'<details class="v10-roster-bulk"><summary>Cadastro em lote</summary><p class="hint">Uma linha por MC: Nome; Cidade; 2023:3, 2024:2</p><textarea id="bulk" class="w" rows="5"></textarea><div class="act"><button class="btn on" data-bulk>Adicionar MCs</button></div></details>':'';
  sheet(onlyUnranked?'MCs cadastrados sem títulos':onlyRanked?'MCs com títulos':'Cadastro geral de MCs',
    '<p class="hint">Gerencie cada MC pelo card. Participantes sem títulos continuam cadastrados e podem entrar em chaveamentos e confrontos; só aparecem no ranking histórico após conquistar o primeiro título.</p>'+
    '<div class="v10-roster-tools"><button class="btn on" id="addBtn">+ Cadastrar MC</button><label>Ano da alteração rápida <input id="qy" type="number" min="2000" max="2100" value="'+(window._qy||new Date().getFullYear())+'"></label></div>'+
    tags+bulk+'<div class="v10-admin-roster-grid">'+
    (rows||'<p class="v10-empty">Nenhum MC nesta categoria.</p>')+'</div>');
 }else if(admTab==='v10-tags'){
  sheet('Tags dos participantes','<p class="hint">Organize categorias e características por MC. Separe as tags por vírgula.</p><label>MC<select id="v10TagMC">'+options(window._v10MC||data[0]?.id)+'</select></label><label>Tags<input id="v10Tags" maxlength="800" placeholder="Revelação, Representante, Campeão..."></label><button class="btn on" data-v10-save-tags>Salvar no rascunho</button>');
 }else if(admTab==='v10-estados'){
  sheet('Representantes estaduais','<p class="hint">Vincule os participantes a estados ou regiões, mesmo que ainda não tenham títulos.</p><label>MC<select id="v10RepMC">'+options(window._v10MC||data[0]?.id)+'</select></label><label>Representação<select id="v10RepType"><option value="">Nenhuma</option><option value="estadual">Estadual</option><option value="regional">Regional</option></select></label><label>Estado / região<input id="v10RepLoc" maxlength="40" placeholder="Rio de Janeiro"></label><button class="btn on" data-v10-save-rep>Salvar representante</button>');
 }else if(admTab==='v10-videos'){
  sheet('Vídeos dos MCs','<p class="hint">Cole um link do YouTube ou envie um arquivo MP4/WebM. Para upload, configure o bucket BDF_R2 no Cloudflare.</p><label>MC<select id="v10VidMC">'+options(window._v10MC||data[0]?.id)+'</select></label><label>Título<input id="v10VidTitle" maxlength="140" placeholder="Melhor rima"></label><label>URL do YouTube<input id="v10VidUrl" placeholder="https://youtu.be/..."></label><button class="btn on" data-v10-add-youtube>Adicionar YouTube</button><h3>Enviar vídeo</h3><input id="v10VidFile" type="file" accept="video/mp4,video/webm"><button class="btn" data-v10-upload>Fazer upload</button><progress id="v10Progress" max="100" value="0" hidden></progress><p id="v10UploadStatus" class="hint"></p><div id="v10VidList"></div>');
 }else if(admTab==='v10-destaques'){
  sheet('Destaques da semana','<p class="hint">Escolha o MC e a rima em destaque na página inicial. O último campeão e a última edição vêm dos chaveamentos publicados.</p><label>MC em destaque<select id="v10FeaturedMC">'+options(v10().featuredMC||data[0]?.id)+'</select></label><label>Vídeo<select id="v10FeaturedVideo"></select></label><button class="btn on" data-v10-featured>Salvar destaque</button>');
 }else if(admTab==='v10-duelos'){
  const edit=manualDuels().find(d=>d.id===window._v10EditDuel),rows=manualDuels().slice().sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  const name=id=>h(mc(id)?.name||'MC excluído');
  sheet('Confrontos diretos · resultados antigos',
   '<p class="hint">Cadastre somente confrontos antigos que não existam em um chaveamento publicado. Cada registro soma uma vitória e uma partida aos perfis e ao confronto direto, mas não altera o ranking anual nem os títulos.</p>'+
   '<div class="v10-admin-grid"><label>Primeiro MC<select id="v10DuelA">'+options(edit?.aId||data[0]?.id)+'</select></label>'+
   '<label>Segundo MC<select id="v10DuelB">'+options(edit?.bId||data[1]?.id)+'</select></label>'+
   '<label>Vencedor<select id="v10DuelWinner">'+options(edit?.winnerId||data[0]?.id)+'</select></label>'+
   '<label>Placar<select id="v10DuelScore">'+['2×0','2×1','W.O.','Outro'].map(x=>'<option value="'+x+'" '+(edit?.score===x?'selected':'')+'>'+x+'</option>').join('')+'</select></label>'+
   '<label>Nome da batalha<input id="v10DuelEdition" maxlength="150" placeholder="Edição ou evento histórico" value="'+h(edit?.edition||'')+'"></label>'+
   '<label>Data (opcional)<input id="v10DuelDate" type="date" value="'+h(edit?.date||'')+'"></label></div>'+
   '<button class="btn on" data-v10-save-duel>'+(edit?'Atualizar resultado':'Adicionar resultado')+'</button> '+
   (edit?'<button class="btn" data-v10-cancel-duel>Cancelar edição</button>':'')+
   '<h3>Histórico manual ('+rows.length+')</h3><div class="v10-mc-list">'+
   (rows.map(d=>'<div class="v10-mc-row"><span><strong>'+name(d.aId)+' × '+name(d.bId)+'</strong><small>'+h(d.edition)+' · '+h(d.date||'Data não informada')+' · '+name(d.winnerId)+' venceu '+h(d.score)+'</small></span><button class="btn" data-v10-edit-duel="'+h(d.id)+'">Editar</button><button class="btn" data-v10-remove-duel="'+h(d.id)+'">Excluir</button></div>').join('')||'<p class="v10-empty">Nenhum confronto antigo cadastrado.</p>')+'</div>');
 }else if(admTab==='v10-anual'){
  sheet('Ranking anual · TOP 16','<p class="hint">O ranking começa vazio. Quando você publicar uma nova edição com a opção Contar no Ranking Anual, seus MCs entram automaticamente na tabela. Edições antigas não são incluídas sem sua autorização. O bônus 2 × 0 é acumulado em confrontos tradicionais.</p><label>Ano<input id="v10AdminYear" type="number" min="2000" max="2100" value="'+y+'"></label><div class="v10-admin-grid">'+Object.entries({segunda:'Segunda fase',semi:'Semifinal',final:'Vice',campeao:'Campeão',bonus:'Bônus por 2 × 0'}).map(([key,label])=>'<label>'+label+'<input type="number" data-v10-rule="'+key+'" min="0" max="1000" value="'+Number(s.rules[key]??core.defaults[key])+'"></label>').join('')+'</div><button class="btn on" data-v10-save-rules>Salvar regras</button><h3>Classificação automática</h3><p class="hint">Os 16 melhores pontuadores aparecem aqui automaticamente. Sem edições novas marcadas para a temporada, ninguém aparecerá.</p><div class="v10-mc-list">'+(standings().map((row,i)=>'<div class="v10-mc-row">'+avatars(mc(row.id))+'<span><strong>'+(i+1)+'º · '+h(mc(row.id)?.name||'MC')+'</strong><small>'+row.points+' pontos · '+row.wins+' vitórias</small></span></div>').join('')||'<div class="v10-empty">Temporada vazia. Publique o primeiro chaveamento da temporada.</div>')+'</div><h3>Ajustar pontos manualmente</h3><label>MC<select id="v10AdjustMC">'+options(data[0]?.id)+'</select></label><label>Pontos (negativo para desconto)<input id="v10AdjustPts" type="number" step="1" value="1"></label><label>Motivo<input id="v10AdjustReason" maxlength="200" placeholder="Correção de resultado"></label><button class="btn on" data-v10-adjust>Registrar ajuste</button><h3>Histórico de ajustes</h3>'+history(y));
 }else originalAdm();
 tabs();
 if(admTab==='chaves'){
  const bar=el('#adm .asheet .bar');
  bar?.insertAdjacentHTML('afterend','<div class="v10-recover-panel"><strong>Chaveamentos desaparecidos?</strong><p class="hint">Procure edições salvas como rascunho neste navegador ou no servidor. A recuperação cria rascunhos sem sobrescrever os chaveamentos atuais.</p><button class="btn" data-v10-recover-br="local">Recuperar deste navegador</button><button class="btn" data-v10-recover-br="cloud">Verificar rascunho na nuvem</button></div>');
 }
 if(!el('#adm .v10-pubbar')){
  const bar=el('#adm .asheet .bar');if(bar)bar.insertAdjacentHTML('afterend','<div class="v10-pubbar"><button class="btn on" data-v10-publish>Salvar e Publicar</button><small class="hint">Alterações em rascunho até confirmação do servidor</small></div>');
 }
 if(admTab==='v10-tags')fillTags();
 if(admTab==='v10-estados')fillRep();
 if(admTab==='v10-videos')videoList(el('#v10VidMC')?.value);
 if(admTab==='v10-destaques')fillFeatured();
};
function fillTags(){const m=mc(el('#v10TagMC')?.value);if(el('#v10Tags'))el('#v10Tags').value=(m?.tags||[]).join(', ');}
function fillRep(){const m=mc(el('#v10RepMC')?.value);if(el('#v10RepType'))el('#v10RepType').value=m?.rep||'';if(el('#v10RepLoc'))el('#v10RepLoc').value=m?.repLoc||'';}
let bracketDraft=null;
function bracketEdit(id,refresh=false){
 if(!canAdmin)return loginForm();
 let b=BRACKETS.find(x=>x.id===id);
 if(!b){b={id:'br-'+Date.now(),title:'Nova edição',date:new Date().toISOString().slice(0,10),players:Array(8).fill(''),results:{},triples:{},layout:'mirror',countAnnual:true,status:'draft'};BRACKETS.push(b);}
 if(!refresh||bracketDraft?.id!==b.id)bracketDraft=structuredClone(b);
 b=bracketDraft;
 window._v6Editing=b.id;
 const rounds=core.bracketRounds(b),names=data.map(m=>'<option value="'+h(m.name)+'"></option>').join('');
 const matches='<div class="v10-inline-board">'+rounds.map((ms,r)=>'<section class="v10-inline-round"><h3>'+(r===rounds.length-1?'Final':r===rounds.length-2?'Semifinal':r===0?'Primeira fase':'Segunda fase')+'</h3><div class="v10-inline-games">'+ms.map(m=>{
 const t=m.third,pts=m.result?.points||[];
 const row=(n,i)=>'<div class="v10-inline-player">'+(r===0&&i<2?'<input data-v10-br-player="'+(m.i*2+i)+'" list="v10-names" maxlength="100" placeholder="Nome do MC" aria-label="MC '+(i+1)+'" value="'+h(n||'')+'">':i===2?'<input data-v10-third="'+h(m.key)+'" list="v10-names" maxlength="100" aria-label="Terceiro MC" value="'+h(n||'')+'">':'<span class="v10-inline-name" data-v10-next-name="'+h(m.key)+'" data-v10-next-pos="'+i+'">'+h(n||'A definir')+'</span>')+'<input class="v10-inline-point" data-v10-pts="'+h(m.key)+'" data-v10-pos="'+i+'" type="number" min="0" max="99" aria-label="Pontos do MC '+(i+1)+'" value="'+(pts[i]??0)+'" '+(!t?'disabled':'')+'></div>';
 return '<div class="v10-inline-match" data-v10-match="'+h(m.key)+'"><strong>Confronto '+(m.i+1)+'</strong>'+row(m.a,0)+row(m.c,1)+(t?row(t,2):'<button class="btn v10-inline-third-btn" type="button" data-v10-show-third="'+h(m.key)+'">+ Terceiro MC</button>')+'<div class="v10-inline-controls">'+(!t?'<label>Placar<select data-v10-outcome="'+h(m.key)+'"><option value="">Pendente</option>'+['2×0','2×1','W.O.'].map(x=>'<option value="'+x+'" '+(m.result?.score===x?'selected':'')+'>'+x+'</option>').join('')+'</select></label>':'<span class="hint">Placar por pontos</span>')+'<label>Vencedor<select data-v10-win="'+h(m.key)+'"><option value="">A definir</option>'+m.participants.map(n=>'<option value="'+h(n)+'" '+(m.result?.winner===n?'selected':'')+'>'+h(n)+'</option>').join('')+'</select></label></div></div>';
 }).join('')+'</div></section>').join('')+'</div>';
 open('<h2>Editor visual de chaveamento</h2><p class="hint">Escolha um MC da lista ou digite o nome de um MC novo. Ao salvar a chave, participantes novos serão cadastrados automaticamente, sem títulos, para você editar a foto e o perfil em MCs sem títulos. Só um MC avança por confronto.</p><div class="v10-admin-grid"><label>Nome<input id="v10BrTitle" value="'+h(b.title)+'"></label><label>Número da edição<input id="v10BrNum" type="number" value="'+h(b.editionNumber||'')+'"></label><label>Data<input id="v10BrDate" type="date" value="'+h(b.date)+'"></label><label>Vagas iniciais<select id="v10BrSize">'+[4,8,16].map(n=>'<option value="'+n+'" '+(n===b.players.length?'selected':'')+'>'+n+'</option>').join('')+'</select></label><label>Modelo visual<select id="v10BrLayout"><option value="columns" '+((b.layout||'columns')==='columns'?'selected':'')+'>Clássico · fases em colunas</option><option value="tree" '+(b.layout==='tree'?'selected':'')+'>Árvore conectada</option><option value="mirror" '+(b.layout==='mirror'?'selected':'')+'>Espelhado · final no centro</option></select></label><label><input id="v10BrAnnual" type="checkbox" '+(b.countAnnual===true?'checked':'')+'> Contar no Ranking Anual (inclui participantes automaticamente)</label><label>Visibilidade<select id="v10BrStatus"><option value="draft" '+(b.status==='draft'?'selected':'')+'>Rascunho</option><option value="published" '+(b.status==='published'?'selected':'')+'>Publicado</option></select></label><label><input id="v10BrNoTitle" type="checkbox" '+(b.awardsTitle===false?'checked':'')+'> Esta edição não concede título</label></div><datalist id="v10-names">'+names+'</datalist><h3>Chaveamento editável</h3><p class="hint">Digite os MCs e registre placares diretamente nos confrontos. As fases seguintes são preenchidas pelos vencedores. O público vê o modelo escolhido.</p>'+matches+'<section class="v10-preview-wrap"><h3>Prévia do chaveamento escolhido</h3><p class="hint">Veja abaixo como o público verá o modelo selecionado. Esta prévia não publica nem substitui seus dados.</p><div id="v10BracketPreview" class="v10-preview-board"></div></section>'+v8BracketLinkForm(b)+'<div class="v10-toolbar"><button class="btn on" data-v10-save-br="'+h(b.id)+'">Salvar chave e placares</button><button class="btn" data-v10-remove-br="'+h(b.id)+'">Excluir torneio</button></div>',true);
 el('#modal .sheet')?.classList.add('v10-bracket-editor');
 refreshBracketPreview();
}

function readBracketMeta(b){
 b.title=el('#v10BrTitle').value.trim();b.date=el('#v10BrDate').value;
 b.editionNumber=String(el('#v10BrNum').value||'').replace(/\D/g,'').slice(0,6);
 b.status=el('#v10BrStatus').value;b.layout=el('#v10BrLayout').value;
 b.countAnnual=el('#v10BrAnnual').checked;b.awardsTitle=!el('#v10BrNoTitle').checked;
 const link=el('#v8TitleLink')?.value||'';
 b.titleLink=v8AvailableTitleSlots(b).find(x=>v8TitleKey(x)===link);
}

function refreshBracketPreview(){
 const box=el('#v10BracketPreview');
 if(!box||!bracketDraft)return;
 // Mesma apresentação usada na área pública, sem enviar nada ao servidor.
 box.innerHTML=v6BracketHtml({...bracketDraft,status:'draft'});
 treeRefresh();
}
function syncBracketMatchControls(b,{resetScores=false}={}){
 const rounds=core.bracketRounds(b).flat();
 for(const match of rounds){
  const key=match.key;
  for(const span of els('[data-v10-next-name="'+key+'"]')){
   const i=Number(span.dataset.v10NextPos);
   span.textContent=([match.a,match.c,match.third][i]||'A definir');
  }
  const winner=el('[data-v10-win="'+key+'"]');
  if(winner){
   const chosen=match.result?.winner||(match.participants.includes(winner.value)?winner.value:'');
   winner.innerHTML='<option value="">A definir</option>'+match.participants.map(n=>'<option value="'+h(n)+'">'+h(n)+'</option>').join('');
   winner.value=chosen;
  }
  const score=el('[data-v10-outcome="'+key+'"]');
  if(resetScores&&score)score.value=match.result?.score||'';
 }
}
function rerenderBracketDraft(b){
 const scroll=el('#modal')?.scrollTop||0;
 bracketEdit(b.id,true);
 if(el('#modal'))el('#modal').scrollTop=scroll;
}
document.addEventListener('change',e=>{
 const x=e.target,b=bracketDraft;
 if(!canAdmin||!b||!el('#v10BrTitle'))return;
 const d=x.dataset;
 const controls='#v10BrSize,#v10BrLayout,#v10BrTitle,#v10BrDate,#v10BrNum,#v10BrStatus,#v10BrAnnual,#v10BrNoTitle,[data-v10-br-player],[data-v10-third],[data-v10-win],[data-v10-outcome],[data-v10-pts]';
 if(!x.matches(controls))return;
 const previous=structuredClone(b);
 try{
  readBracketMeta(b);
  if(x.id==='v10BrSize'){
   const size=Number(x.value);
   if(size!==b.players.length){
    if(Object.keys(b.results||{}).length&&!confirm('Alterar o tamanho limpa os resultados. Continuar?')){x.value=String(b.players.length);return;}
    b.players=Array.from({length:size},(_,i)=>b.players[i]||'');
    b.results={};b.triples={};
    rerenderBracketDraft(b);
   }
  }else if(d.v10BrPlayer!==undefined){
   const i=Number(d.v10BrPlayer),n=core.canonicalMCName(x.value,data);
   if(n&&(n.length>100||/[<>\x00-\x1f]/.test(n)))throw Error('Nome inválido: use até 100 caracteres.');
   if(n&&b.players.some((v,j)=>j!==i&&core.mcNameKey(v)===core.mcNameKey(n)))throw Error('MC já está em outra vaga.');
   if(n&&Object.entries(b.triples||{}).some(([k,v])=>k.startsWith('0-')&&core.mcNameKey(v)===core.mcNameKey(n)))throw Error('MC já está em outro confronto.');
   if(b.players[i]!==n){
    b.players[i]=n;core.invalidateBracketPath(b,'0-'+Math.floor(i/2));
    x.value=n;syncBracketMatchControls(b,{resetScores:true});
   }
  }else if(d.v10Third!==undefined){
   const k=d.v10Third,n=core.canonicalMCName(x.value,data),m=core.bracketRounds(b).flat().find(v=>v.key===k);
   if(n&&(n.length>100||/[<>\x00-\x1f]/.test(n)||[m.a,m.c].some(p=>core.mcNameKey(p)===core.mcNameKey(n))))throw Error('Informe um terceiro MC diferente, com até 100 caracteres.');
   if(n&&k.startsWith('0-')&&(b.players.some(p=>core.mcNameKey(p)===core.mcNameKey(n))||Object.entries(b.triples||{}).some(([j,v])=>j!==k&&j.startsWith('0-')&&core.mcNameKey(v)===core.mcNameKey(n))))throw Error('MC já está na primeira fase.');
   b.triples||={};
   if((b.triples[k]||'')!==n){
    if(n)b.triples[k]=n;else delete b.triples[k];
    core.invalidateBracketPath(b,k);
    // O Double Three troca o placar tradicional por pontos individuais.
    const holder=x.closest('.v10-inline-match');
    if(holder){
     const classic=holder.querySelector('[data-v10-outcome]')?.closest('label');
     if(classic)classic.hidden=Boolean(n);
     holder.querySelectorAll('[data-v10-pts]').forEach(pts=>pts.disabled=!n);
    }
    x.value=n;syncBracketMatchControls(b,{resetScores:true});
   }
  }else if(d.v10Win!==undefined||d.v10Outcome!==undefined||d.v10Pts!==undefined){
   const k=d.v10Win||d.v10Outcome||d.v10Pts;
   const m=core.bracketRounds(b).flat().find(v=>v.key===k);
   if(!m)throw Error('Confronto não encontrado.');
   const winner=el('[data-v10-win="'+k+'"]')?.value||'';
   const score=el('[data-v10-outcome="'+k+'"]')?.value||'';
   const points=els('[data-v10-pts="'+k+'"]').map(v=>Number(v.value));
   // Não recriar o editor enquanto o usuário escolhe placar E vencedor.
   // Isso preserva o 2x0/2x1/W.O. até que ambos estejam preenchidos.
   if(winner&&(m.third||score)){
    core.setBracketResult(b,k,{winner,score,points});
    rerenderBracketDraft(b);
   }else if(m.result){
    core.invalidateBracketPath(b,k);
    syncBracketMatchControls(b,{resetScores:false});
   }
  }
  refreshBracketPreview();
 }catch(err){
  bracketDraft=previous;
  toast(err.message,1);
  rerenderBracketDraft(previous);
 }
},true);
document.addEventListener('input',e=>{
 const x=e.target;
 if(!bracketDraft||!canAdmin||!el('#v10BrTitle'))return;
 if(x.id==='v10BrTitle'){
  bracketDraft.title=x.value;
  refreshBracketPreview();
 }
},true);

function saveBracket(id){
 const b=bracketDraft;if(!canAdmin||!b||b.id!==id)return;
 readBracketMeta(b);
 if(!b.title)return toast('Informe o nome da edição.',1);
 let prepared;
 try{prepared=core.prepareBracketRegistrations(b,data);}catch(err){return toast(err.message,1);}
 if(!v8SaveBracketLink(prepared.bracket))return;
 const i=BRACKETS.findIndex(x=>x.id===id);if(i<0)return;
 // Só cadastra MCs novos depois de validar todo o chaveamento. Nada é
 // publicado no servidor até o botão geral Salvar e Publicar do ADM.
 for(const member of prepared.created)data.push(member);
 BRACKETS[i]=structuredClone(prepared.bracket);
 bracketDraft=structuredClone(prepared.bracket);
 save();render();bracketEdit(id);
 toast(prepared.created.length?prepared.created.length+' MC(s) novo(s) cadastrado(s) sem títulos. Abra a aba MCs sem títulos para adicionar fotos.':'Chave e placares salvos no rascunho.');
}
v6BracketEdit=bracketEdit;
v6SaveBracket=saveBracket;
function videoChange(y){
 const m=mc(el('#v10VidMC')?.value);if(!m)return;
 const videos=m.videos||[];const v=videos[y.index];if(!v)return;
 if(y.type==='delete'){if(!confirm('Remover o vídeo do perfil? A alteração só aparecerá após publicar.'))return;videos.splice(y.index,1);}
 else {const next=prompt('Novo título',v.title);if(!next)return;v.title=next.trim().slice(0,140);}
 m.videos=videos;save();videoList(m.id);
}
async function upload(){
 if(!canAdmin||!G?.t)return toast('É necessário login administrativo.',1);
 const file=el('#v10VidFile')?.files?.[0],m=mc(el('#v10VidMC')?.value),title=el('#v10VidTitle')?.value.trim()||file?.name;
 if(!m||!file)return toast('Escolha um MC e um arquivo.',1);
 if(!['video/mp4','video/webm'].includes(file.type)||file.size>25*1024*1024)return toast('Use MP4 ou WebM de até 25 MB.',1);
 if(!title||title.length>140)return toast('Informe um título com até 140 caracteres.',1);
 const bar=el('#v10Progress'),msg=el('#v10UploadStatus');bar.hidden=false;bar.value=0;msg.textContent='Enviando vídeo…';
 try{
  const saved=await new Promise((resolve,reject)=>{
   const xhr=new XMLHttpRequest();xhr.open('POST','/api/admin/videos');
   xhr.setRequestHeader('Authorization','Bearer '+G.t);xhr.setRequestHeader('Content-Type',file.type);
   xhr.upload.onprogress=e=>{if(e.lengthComputable)bar.value=Math.floor(100*e.loaded/e.total);};
   xhr.onerror=()=>reject(Error('Conexão interrompida.'));
   xhr.onload=()=>{let res={};try{res=JSON.parse(xhr.responseText)}catch{}if(xhr.status>=200&&xhr.status<300)resolve(res);else reject(Error(res.error||'Falha no upload ('+xhr.status+').'));};
   xhr.send(file);
  });
  if(!core.validVideo({kind:'upload',title,url:saved.url}))throw Error('URL de vídeo inválida retornada pelo servidor.');
  m.videos||=[];m.videos.push({kind:'upload',url:saved.url,title});save();msg.textContent='Arquivo armazenado. Use Salvar e Publicar para liberar a exibição pública.';videoList(m.id);
 }catch(err){msg.textContent=err.message;toast(err.message,1);}finally{bar.hidden=true;}
}
async function recoverBrackets(source){
 if(!canAdmin)return loginForm();
 let stored;
 try{
  if(source==='local'){
   const raw=localStorage.getItem('foice_draft');
   stored=raw?JSON.parse(raw):null;
  }else{
   const result=await bdfServer('draft');
   stored=result?.draft||null;
  }
 }catch(err){return toast('Não foi possível ler o rascunho: '+err.message,1);}
 const available=Array.isArray(stored?.brackets)?stored.brackets:[];
 if(!available.length)return toast('Nenhum chaveamento encontrado neste rascunho.');
 const candidates=available.filter(b=>b&&Array.isArray(b.players)&&b.id);
 if(!candidates.length)return toast('Não há chaveamentos válidos para recuperar.');
 const missing=candidates.filter(b=>!BRACKETS.some(current=>current.id===b.id));
 const changed=candidates.filter(b=>{
  const current=BRACKETS.find(x=>x.id===b.id);
  return current&&JSON.stringify(current)!==JSON.stringify(b);
 });
 if(!missing.length&&!changed.length)return toast('Os chaveamentos deste rascunho já estão no painel.');
 if(!confirm('Encontrados '+missing.length+' chaveamento(s) ausente(s) e '+changed.length+' versão(ões) diferente(s). Recuperar como RASCUNHO, mantendo todos os registros atuais?'))return;
 // Antes de alterar o rascunho local, mantenha cópia integral recuperável.
 try{
  const oldLocal=localStorage.getItem('foice_draft');
  if(oldLocal)localStorage.setItem('foice_recovery_backup_'+Date.now(),oldLocal);
 }catch(err){return toast('Sem espaço para preservar uma cópia do rascunho atual. Exporte um backup antes de recuperar.',1);}
 const known=[...data],recovered=[],newMembers=[],now=Date.now();
 let skipped=0;
 for(const [i,original] of [...missing,...changed].entries()){
  try{
   const collision=BRACKETS.some(b=>b.id===original.id)||recovered.some(b=>b.id===original.id);
   const copy={...structuredClone(original),status:'draft'};
   if(collision){
    copy.id='br-recovered-'+now+'-'+i;
    copy.title=String(original.title||'Chaveamento')+' (recuperado)';
    delete copy.titleLink;
   }
   if(![4,8,16].includes(copy.players.length))throw Error('Tamanho inválido');
   const prepared=core.prepareBracketRegistrations(copy,known);
   known.push(...prepared.created);
   newMembers.push(...prepared.created);
   recovered.push(prepared.bracket);
  }catch(err){skipped++;}
 }
 if(!recovered.length)return toast('Não foi possível recuperar os chaveamentos encontrados.',1);
 data.push(...newMembers);
 BRACKETS.push(...recovered);
 save();render();admRender();
 toast(recovered.length+' chaveamento(s) recuperado(s) em rascunho.'+(skipped?' '+skipped+' não foram importados.':'')+' Revise e use Salvar e Publicar quando quiser.');
}
async function saveAndPublish(btn){
 if(!canAdmin||!G?.t)return toast('Entre como administrador para publicar.',1);
 if(!confirm('Publicar todas as mudanças da V10 no site público?'))return;
 btn.disabled=true;btn.textContent='Salvando no servidor…';
 try{
  const draft=snapshot(),issues=core.validateV10(draft);if(issues.length)throw Error(issues.join('; '));
  await bdfServer('draft',{method:'PUT',content:draft});
  btn.textContent='Publicando…';
  const r=await bdfServer('publish',{method:'POST',content:{confirm:'PUBLICAR',expectedRevision:bdfServerRevision,content:draft}});
  bdfServerRevision=r.revision;publishState='confirmed';
  try{localStorage.removeItem('foice_draft')}catch{}
  toast('Publicação confirmada no servidor: '+r.mcCount+' MCs e '+r.titleCount+' títulos.');
 }catch(err){publishState='error';draftSave();toast('Não foi possível publicar: '+err.message,1);}
 finally{btn.disabled=false;btn.textContent='Salvar e Publicar';}
}
async function clickAction(e){
 const btn=e.target.closest('[data-v10-mobile-login],[data-v10-show-third],[data-v10-jump],[data-v10-open-panel],[data-v10-featured],[data-v10-profile],[data-v10-play],[data-v10-form],[data-v10-save-tags],[data-v10-save-rep],[data-v10-add-youtube],[data-v10-edit-video],[data-v10-delete-video],[data-v10-upload],[data-v10-save-rules],[data-v10-save-members],[data-v10-adjust],[data-v10-save-duel],[data-v10-edit-duel],[data-v10-remove-duel],[data-v10-cancel-duel],[data-v10-publish],[data-v10-recover-br],[data-v10-save-br],[data-v10-remove-br]');
 if(!btn)return;
 e.stopImmediatePropagation();e.preventDefault();
 const d=btn.dataset;
 if(d.v10MobileLogin!==undefined){el('#nv')?.classList.remove('open');el('#mbtn')?.setAttribute('aria-expanded','false');toggleAdminPanel();return;}
 if(d.v10ShowThird){const key=d.v10ShowThird, match=core.bracketRounds(bracketDraft).flat().find(m=>m.key===key);if(!match)return;const holder=btn.closest('.v10-inline-match');if(!holder)return;const row=document.createElement('div');row.className='v10-inline-player';row.innerHTML='<input data-v10-third="'+h(key)+'" list="v10-names" maxlength="100" aria-label="Terceiro MC" placeholder="Nome do terceiro MC"><input class="v10-inline-point" data-v10-pts="'+h(key)+'" data-v10-pos="2" type="number" min="0" max="99" value="0" disabled>';btn.replaceWith(row);row.querySelector('input')?.focus();return;}
 if(d.v10Jump){const target=el('#'+d.v10Jump);target?.scrollIntoView({behavior:'smooth',block:'center'});target?.focus();return;}
 if(d.v10OpenPanel){window._v10MC=d.v10Mcid;admTab=d.v10OpenPanel;close();admRender();return;}
 if(d.v10Profile)return profile(d.v10Profile);
 if(d.v10Play){
  const iframe=document.createElement('iframe');iframe.src='https://www.youtube-nocookie.com/embed/'+d.v10Play;iframe.title='Rima no YouTube';iframe.allow='accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture';iframe.allowFullscreen=true;btn.replaceWith(iframe);return;
 }
 if(!canAdmin)return loginForm();
 if(d.v10Form!==undefined)return form(d.v10Form);
 if(d.v10SaveTags!==undefined){const m=mc(el('#v10TagMC')?.value);if(!m)return;m.tags=[...new Set(el('#v10Tags').value.split(',').map(x=>x.trim()).filter(Boolean))].slice(0,30).map(x=>x.slice(0,60));save();toast('Tags salvas no rascunho.');return;}
 if(d.v10SaveRep!==undefined){const m=mc(el('#v10RepMC')?.value);if(!m)return;m.rep=el('#v10RepType').value;m.repLoc=el('#v10RepLoc').value.trim().slice(0,40);save();toast('Representação salva no rascunho.');return;}
 if(d.v10Featured!==undefined){const selected=el('#v10FeaturedMC')?.value,url=el('#v10FeaturedVideo')?.value||'';v10().featuredMC=selected;v10().featuredVideoUrl=url;save();toast('Destaque salvo no rascunho.');return;}
 if(d.v10AddYoutube!==undefined){
  const m=mc(el('#v10VidMC')?.value),url=el('#v10VidUrl')?.value||'',title=el('#v10VidTitle')?.value.trim();if(!m||!title||title.length>140||!core.youtubeId(url))return toast('Informe um título e um link válido do YouTube.',1);
  m.videos||=[];m.videos.push({kind:'youtube',url,title});save();videoList(m.id);toast('Vídeo incluído no rascunho.');return;
 }
 if(d.v10EditVideo!==undefined)return videoChange({index:Number(d.v10EditVideo),type:'edit'});
 if(d.v10DeleteVideo!==undefined)return videoChange({index:Number(d.v10DeleteVideo),type:'delete'});
 if(d.v10Upload!==undefined)return upload();
 if(d.v10SaveDuel!==undefined){
  const aId=el('#v10DuelA')?.value,bId=el('#v10DuelB')?.value,winnerId=el('#v10DuelWinner')?.value,
        edition=el('#v10DuelEdition')?.value.trim(),score=el('#v10DuelScore')?.value,date=el('#v10DuelDate')?.value||'';
  if(!aId||!bId||aId===bId||![aId,bId].includes(winnerId)||!edition||edition.length>150)return toast('Informe dois MCs diferentes, vencedor e nome da batalha.',1);
  // Evitar duas entradas idênticas para o mesmo confronto histórico, inclusive
  // quando ele já foi registrado em um chaveamento publicado.
  const norm=x=>String(x||'').trim().toLocaleLowerCase('pt-BR');
  const samePair=(a,b,x,y)=>(a===x&&b===y)||(a===y&&b===x);
  const dupe=manualDuels().some(d=>d.id!==window._v10EditDuel&&samePair(aId,bId,d.aId,d.bId)&&norm(d.edition)===norm(edition)&&d.date===date&&d.score===score&&d.winnerId===winnerId);
  const bracketDupe=core.completedBattles(BRACKETS,[],data).some(d=>d.ids.length===2&&samePair(aId,bId,d.ids[0],d.ids[1])&&norm(d.edition)===norm(edition)&&d.date===date&&d.score===score&&d.winnerId===winnerId);
  if(dupe||bracketDupe)return toast('Esse confronto já está cadastrado. Edite o registro existente para evitar dupla contagem.',1);
  const original=manualDuels().find(d=>d.id===window._v10EditDuel);
  const record={id:original?.id||'duel-'+Date.now()+'-'+Math.random().toString(36).slice(2,8),aId,bId,winnerId,edition,score,date};
  if(original)Object.assign(original,record);else manualDuels().push(record);
  window._v10EditDuel=null;save();render();admRender();toast('Confronto salvo no rascunho.');return;
 }
 if(d.v10EditDuel!==undefined){window._v10EditDuel=d.v10EditDuel;admRender();return;}
 if(d.v10CancelDuel!==undefined){window._v10EditDuel=null;admRender();return;}
 if(d.v10RemoveDuel!==undefined){if(!confirm('Excluir este confronto do histórico manual?'))return;v10().manualDuels=manualDuels().filter(x=>x.id!==d.v10RemoveDuel);window._v10EditDuel=null;save();render();admRender();return;}
 if(d.v10SaveRules!==undefined){const r={};for(const x of els('[data-v10-rule]')){const n=Number(x.value);if(!Number.isInteger(n)||n<0||n>1000)return toast('Informe pontos entre 0 e 1.000.',1);r[x.dataset.v10Rule]=n;}staging(()=>season(year()).rules=r);toast('Regras salvas no rascunho.');return;}
 // A classificação anual não exige seleção manual de participantes.
 if(d.v10Adjust!==undefined){const id=el('#v10AdjustMC').value,delta=Number(el('#v10AdjustPts').value),reason=el('#v10AdjustReason').value.trim();if(!Number.isInteger(delta)||!delta||Math.abs(delta)>10000||!reason)return toast('Informe pontuação inteira e motivo.',1);staging(()=>{const s=season(year());(s.adjustments[id]||=[]).push({delta,reason,at:new Date().toISOString()});});toast('Ajuste registrado.');return;}
 if(d.v10RecoverBr!==undefined)return recoverBrackets(d.v10RecoverBr);
 if(d.v10Publish!==undefined)return saveAndPublish(btn);
 if(d.v10SaveBr!==undefined)return saveBracket(d.v10SaveBr);
 if(d.v10RemoveBr!==undefined){if(!confirm('Excluir este torneio do rascunho?'))return;BRACKETS=BRACKETS.filter(x=>x.id!==d.v10RemoveBr);save();close();render();return;}
}
document.addEventListener('click',e=>{clickAction(e).catch(err=>toast(err.message,1));},true);
document.addEventListener('change',e=>{
 const t=e.target;
 if(t.dataset.v10Compare){v10()['compare'+t.dataset.v10Compare]=t.value;render();}
 else if(t.dataset.v10Year!==undefined){v10().year=Number(t.value);render();}
 else if(t.id==='v10AdminYear'){const y=Number(t.value);if(Number.isInteger(y)&&y>=2000&&y<=2100){v10().year=y;admRender();}}
 else if(t.id==='v10TagMC')fillTags();
 else if(t.id==='v10RepMC')fillRep();
 else if(t.id==='v10VidMC')videoList(t.value);
 else if(t.id==='v10FeaturedMC')fillFeatured();
},true);
// Acesso administrativo mobile por botão no menu; a autenticação Firebase e a autorização no servidor continuam obrigatórias.
const logo=el('#hLogo');
if(logo){const clean=logo.cloneNode(true);logo.replaceWith(clean);clean.removeAttribute('tabindex');clean.removeAttribute('role');clean.setAttribute('aria-label','Batalha da Foice');}
const nav=el('#nv');if(nav){
 const login=nav.querySelector('a[href="#admin"]');if(login)login.remove();
 if(!nav.querySelector('#v10-nav'))nav.insertAdjacentHTML('beforeend','<a id="v10-nav" href="#/anual">Ranking anual</a>');
 if(!nav.querySelector('#v10-mobile-admin'))nav.insertAdjacentHTML('beforeend','<button type="button" id="v10-mobile-admin" data-v10-mobile-login aria-label="Abrir login administrativo">⚙ Área administrativa</button>');
}
const page=document.createElement('div');page.id='pgAnnual';page.hidden=true;el('#pgAbout').after(page);
if(Array.isArray(data)&&data.length)render();
})();



/* Acervo histórico de campeões — importação revisável, não destrutiva.
 * Títulos/edições não equivalem automaticamente a vitórias contabilizáveis. */
(function(){
'use strict';
const historical=[
 {name:'Bruno Rodriguês',count:1,editions:['1']},
 {name:'Jeffinho',count:1,editions:['2']},
 {name:'Brandon',count:2,editions:['3']},
 {name:'Maldonado',count:4,editions:['4','6','15','48']},
 {name:'Jr',count:1,editions:['7'],notes:['Final contra Japa na edição #7'],matches:[{edition:'7',stage:'Final',participants:['Jr','Japa'],winner:'Jr'}]},
 {name:'Bob',count:7,editions:['10','12','25','41','44','63','Especial: Caravana da Juventude'],notes:['Título 3: final contra Vitin, edição a confirmar'],matches:[{edition:null,stage:'Final',participants:['Bob','Vitin'],winner:'Bob',note:'Referente ao terceiro título; edição não confirmada'}]},
 {name:'Dia',count:3,editions:['11','20','58'],notes:['Três títulos identificados dentro dos cinco já cadastrados; preservar o total existente']},
 {name:'Japa',count:1,editions:['17']},
 {name:'JVV',count:1,editions:['18']},
 {name:'Mad Dog',count:6,editions:[],notes:['Terceiro título: semifinais Mad Dog x Japa e Bob x Jaime; final Jaime x Mad Dog, edição desconhecida'],matches:[
  {edition:null,group:'Mad Dog: título 3',stage:'Semifinal',participants:['Mad Dog','Japa'],winner:'Mad Dog'},
  {edition:null,group:'Mad Dog: título 3',stage:'Semifinal',participants:['Bob','Jaime'],winner:'Jaime'},
  {edition:null,group:'Mad Dog: título 3',stage:'Final',participants:['Jaime','Mad Dog'],winner:'Mad Dog'}]},
 {name:'Jaime',count:3,editions:['46','67'],notes:['Final contra Pelé Mil Flows associada a título com edição ainda não confirmada'],matches:[{edition:null,stage:'Final',participants:['Jaime','Pelé Mil Flows'],winner:'Jaime'}]},
 {name:'Naan',count:1,editions:[],notes:['Final contra Dia; edição desconhecida'],matches:[{edition:null,stage:'Final',participants:['Naan','Dia'],winner:'Naan'}]},
 {name:'Son',count:3,editions:['45','70'],notes:['Terceira edição ainda desconhecida']},
 {name:'Ezinho',count:1,editions:['49']},
 {name:'Valdir',count:1,editions:['51']},
 {name:'LK',count:1,editions:['52']},
 {name:'Vieira Zr',count:null,editions:['53','54','55','56','57'],notes:['A lista identifica cinco edições de títulos já existentes; não reduz nem aumenta os 81 títulos registrados']},
 {name:'Mopa',count:1,editions:['59']},
 {name:'R10',count:2,editions:['60','62'],notes:['Edição #60: anotação de final Jaime x Verissimo; NÃO atribuir resultado ou campeão desta final sem confirmação'],matches:[{edition:'60',stage:'Final (a conferir)',participants:['Jaime','Verissimo'],winner:null}]},
 {name:'Rafael',count:1,editions:['64']},
 {name:'Amaury',count:1,editions:['65']}
];
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/^mc\s+/i,'').replace(/\s+/g,' ').trim().toLowerCase();
const escH=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const count=m=>Object.values(m.titles||{}).reduce((a,b)=>a+(Number(b)||0),0)+Math.max(0,Number(m.unknownTitles)||0);
const cfg=()=>{CFG.v10||={};CFG.v10.historicalArchive||={entries:[],matches:[],importVersion:0};return CFG.v10.historicalArchive;};
const find=n=>data.find(m=>norm(m.name)===norm(n));
function plan(){
 return historical.map(row=>{
  const matched=find(row.name),present=matched?count(matched):0;
  return {...row,existingId:matched?.id||null,existingName:matched?.name||null,current:present,
   added:matched?Math.max(0,(row.count??0)-present):row.count??0,
   missingEditionCount:row.count===null?null:Math.max(0,row.count-row.editions.length)};
 });
}
function displayPlan(){
 const rows=plan();
 const newNames=rows.filter(r=>!r.existingId).length, extra=rows.reduce((a,r)=>a+r.added,0);
 return '<section class="v10-history-panel"><h2>Importar campeões históricos</h2>'+
 '<p class="hint">Lista recebida em 24/11/2026. Prévia: '+rows.length+' campeões, '+newNames+' cadastros novos, '+extra+' títulos a incluir. MCs existentes são conciliados por nome e têm sua contagem preservada. Nenhuma alteração acontece até clicar em "Adicionar ao rascunho".</p>'+
 '<p class="hint">Os duelos históricos são apenas registros documentais: NÃO contam automaticamente no win rate ou confronto direto, para evitar duplicidade e placares inventados. Edições sem número permanecem sem número.</p>'+
 '<div class="v10-table"><table><thead><tr><th>MC</th><th>Cadastro atual</th><th>Títulos informados</th><th>Adicionar</th><th>Edições identificadas</th></tr></thead><tbody>'+
 rows.map(r=>'<tr><td>'+escH(r.existingName||r.name)+'</td><td>'+(r.existingId?r.current:'Novo (sem foto)')+'</td><td>'+(r.count===null?'Não informado':r.count)+'</td><td>+'+r.added+'</td><td>'+escH(r.editions.join(', ')||'A confirmar')+'</td></tr>').join('')+
 '</tbody></table></div><p class="hint">Os registros de Jaime/Pelé Mil Flows e a final Jaime/Verissimo ficam sinalizados para revisão. O título 3 de Bob e Mad Dog fica com edição desconhecida quando não for possível identificar a edição correta.</p>'+
 '<button type="button" class="btn on" data-v10-import-history>Adicionar ao rascunho com segurança</button></section>';
}
function page(){
 const adm=document.getElementById('adm');if(!adm)return;
 const panel=adm.querySelector('.asheet');if(!panel)return;
 const old=panel.querySelector('.v10-history-panel');old?.remove();
 panel.insertAdjacentHTML('beforeend',displayPlan());
}
const originalAdm=admRender;
admRender=function(){
 originalAdm();
 if(!canAdmin)return;
 const tabs=document.querySelector('#adm .atabs');
 if(tabs&&!tabs.querySelector('[data-at="v10-historico"]'))tabs.insertAdjacentHTML('beforeend','<button class="btn" data-at="v10-historico">Importar histórico</button>');
 if(admTab==='v10-historico')page();
};
function importHistory(){
 if(!canAdmin)return;
 const entries=cfg().entries||[];
 const existingKeys=new Set(entries.map(e=>norm(e.name)+'|'+String(e.edition)));
 const archivedMatches=cfg().matches||[];
 const matchKeys=new Set(archivedMatches.map(m=>[m.edition||'',m.group||'',m.stage,m.participants.join('|')].join('::')));
 const planned=plan();
 if(!confirm('Adicionar registros históricos ao RASCUNHO, sem publicar? Os títulos dos MCs já cadastrados serão preservados e nenhuma vitória de confronto será duplicada.'))return;
 const namesToAdd=new Map();
 for(const r of planned){
  let m=find(r.name);
  if(!m){
   m={id:'hist-'+Date.now().toString(36)+'-'+data.length+'-'+Math.random().toString(36).slice(2,7),
     name:r.name,city:'',photo:'',titles:{},unknownTitles:0};
   data.push(m);namesToAdd.set(norm(r.name),m.id);
  }
  const missing=Math.max(0,(r.count??0)-count(m));
  if(missing)m.unknownTitles=(Number(m.unknownTitles)||0)+missing;
  for(const edition of r.editions){
   const key=norm(r.name)+'|'+edition;
   if(existingKeys.has(key))continue;
   entries.push({mcId:m.id,name:m.name,edition,verified:true,source:'Lista histórica enviada em 24/11/2026',notes:r.notes||[]});
   existingKeys.add(key);
  }
  // Títulos sem edição ficam representados pela contagem, não por números fabricados.
 }
 const lookup=n=>find(n)?.id||null;
 for(const r of planned){
  for(const match of r.matches||[]){
   const key=[match.edition||'',match.group||'',match.stage,match.participants.join('|')].join('::');
   if(matchKeys.has(key))continue;
   archivedMatches.push({...match,participantIds:match.participants.map(lookup),
    winnerId:match.winner?lookup(match.winner):null,
    source:'Lista histórica enviada em 24/11/2026',statistical:false});
   matchKeys.add(key);
  }
 }
 const archive=cfg();archive.entries=entries;archive.matches=archivedMatches;archive.importVersion=1;
 // Não substitui rascunhos antigos, fotos nem BRACKETS; alterações locais sujeitas a publicação posterior.
 draftSave();render();admRender();
 toast('Importação salva somente no rascunho: '+planned.length+' campeões processados. Confira os confrontos e publique manualmente.');
}
function archivePublic(){
 const a=CFG?.v10?.historicalArchive;
 if(!a?.entries?.length)return;
 const pg=document.getElementById('pgBrackets');if(!pg)return;
 let root=pg.querySelector('#v10-historical-archive');
 if(!root){root=document.createElement('section');root.id='v10-historical-archive';root.className='v10-section';pg.append(root);}
 const sorted=a.entries.slice().sort((x,y)=>Number(x.edition)-Number(y.edition));
 const badges=sorted.map(e=>'<span class="v10-history-chip"><b>'+escH(e.edition.startsWith('Especial:')?e.edition:'#'+e.edition)+'</b> '+escH(e.name)+'</span>').join('');
 const matches=(a.matches||[]).map(m=>{
  const winner=m.winner?'<small>Campeão identificado: '+escH(m.winner)+'</small>':'<small>Resultado não confirmado</small>';
  return '<div class="v10-history-match"><strong>'+escH(m.group||('Edição '+(m.edition?'#'+m.edition:'desconhecida')))+'</strong><span>'+escH(m.stage)+': '+escH(m.participants.join(' × '))+'</span>'+winner+'</div>';
 }).join('');
 root.innerHTML='<div class="v10-eyebrow">Memória da Batalha da Foice</div><h2>Campeões por edição</h2><p class="hint">Arquivo parcial, com edições confirmadas e confrontos documentados. Títulos antigos não representam automaticamente partidas completas registradas.</p><div class="v10-history-chips">'+badges+'</div>'+(matches?'<h3>Chaves históricas parciais</h3><div class="v10-history-grid">'+matches+'</div>':'');
}
const originalRender=render;
render=function(){originalRender();archivePublic();};
document.addEventListener('click',event=>{
 if(!event.target.closest('[data-v10-import-history]'))return;
 event.preventDefault();event.stopImmediatePropagation();importHistory();
},true);
if(Array.isArray(data)&&data.length)archivePublic();
})();
