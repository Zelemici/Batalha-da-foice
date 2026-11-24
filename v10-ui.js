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
const staging=fn=>{fn();save();render();};
function standings(){return core.annualTable({year:year(),mcList:data,brackets:BRACKETS,season:season(year())});}
function latest(){
 const b=published()[0];return '<section class="v10-section"><div class="v10-eyebrow">Edição mais recente</div><h2>Chaveamento em destaque</h2>'+(b?v6BracketHtml(b)+'<a href="#/edicoes" class="btn">Consultar outras edições</a>':'<p class="v10-empty">O último torneio publicado aparecerá aqui, com resultados e campeão.</p>')+'</section>';
}
function hall(){
 const top=data.filter(m=>total(m)>0).slice().sort((a,b)=>total(b)-total(a)||a.name.localeCompare(b.name,'pt-BR')).slice(0,3);
 return '<section class="v10-section"><div class="v10-eyebrow">História da competição</div><h2>Hall dos Campeões</h2><div class="v10-hall">'+top.map((m,i)=>'<button class="v10-champ" data-v10-profile="'+h(m.id)+'"><span class="v10-place">'+(i+1)+'º lugar</span>'+avatars(m)+'<strong>'+h(m.name)+'</strong><span>'+total(m)+' título(s)</span></button>').join('')+'</div></section>';
}
function matchup(){
 const a=mc(v10().compareA)||data[0],b=mc(v10().compareB)||data.find(m=>m.id!==a?.id);
 if(!a||!b)return '<p>Cadastre ao menos dois MCs.</p>';
 const history=core.duelHistory(a,b,BRACKETS);
 return '<section class="v10-section"><div class="v10-eyebrow">Histórico de resultados</div><h2>Confronto Direto</h2><div class="v10-compare"><div class="v10-fighter">'+avatars(a)+'<select data-v10-compare="A" aria-label="Primeiro MC">'+options(a.id)+'</select><strong>'+history.a+' vitórias</strong></div><div class="v10-vs"><span>VS</span><b>'+history.a+' × '+history.b+'</b><small>'+history.matches.length+' duelo(s)</small></div><div class="v10-fighter">'+avatars(b)+'<select data-v10-compare="B" aria-label="Segundo MC">'+options(b.id)+'</select><strong>'+history.b+' vitórias</strong></div></div><details class="v10-details"><summary>Histórico de duelos</summary>'+(history.matches.length?history.matches.map(x=>'<p>'+h(x.date||'')+' · '+h(x.edition)+' · '+h(x.winner)+' venceu · '+h(x.score)+'</p>').join(''):'<p>Não há duelos publicados entre esses MCs. Os resultados não são presumidos.</p>')+'</details><small class="hint">Double Three não é contado como duelo individual entre dois MCs.</small></section>';
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
function decorate(){
 if(!data.length)return;
 const home=el('#pgHome');if(!home)return;
 let top=el('#v10-top');if(!top){top=document.createElement('div');top.id='v10-top';home.prepend(top);}
 top.innerHTML=latest()+hall();
 let bottom=el('#v10-bottom');if(!bottom){bottom=document.createElement('div');bottom.id='v10-bottom';home.append(bottom);}
 bottom.innerHTML=matchup()+'<div class="v10-annual-link"><a href="#/anual" class="btn on">Abrir Ranking Anual · TOP 16</a></div>'+highlights();
 const page=el('#pgAnnual');if(page){page.hidden=window._pg!=='anual';if(!page.hidden)page.innerHTML=annual();}
 const nav=el('#v10-nav');if(nav)nav.classList.toggle('on',window._pg==='anual');
}
const originalRanked=ranked;
ranked=function(){return originalRanked().filter(m=>total(m)>0);};
v6BracketRounds=core.bracketRounds;
const originalRender=render;
render=function(){originalRender();decorate();};
const oldMatch=bdfMatchHtml;
bdfMatchHtml=function(match){
 if(!match.third)return oldMatch(match);
 return '<div class="bdf-game">'+match.participants.map((n,i)=>'<div class="bdf-player '+(match.result?.winner===n?'won':match.result?.winner?'lost':'')+'"><span>'+h(n)+'</span><span class="bdf-score">'+(match.result?.points?.[i]??'—')+(match.result?.winner===n?' ★':'')+'</span></div>').join('')+'</div>';
};
v6BracketHtml=function(b){
 const rounds=core.bracketRounds(b),label=b.players.length===4?['Semifinal','Final']:b.players.length===8?['Quartas','Semifinal','Final']:['Oitavas','Quartas','Semifinal','Final'],win=rounds.at(-1)?.[0]?.result?.winner;
 return '<article class="v6-bracket"><div class="v6-bracket-header"><div><h3>'+h(b.title)+'</h3><p class="hint">'+h(b.date||'Data pendente')+' · '+b.players.length+' vagas iniciais · '+(b.status==='published'?'Publicado':'Rascunho')+'</p></div>'+(canAdmin?'<button class="btn" data-v6-editbr="'+h(b.id)+'">Editar chave</button>':'')+'</div><div class="v6-rounds">'+rounds.map((matches,r)=>'<div class="v6-round"><h4>'+h(label[r])+'</h4>'+matches.map(match=>'<div class="v6-match">'+match.participants.map((n,i)=>'<div class="v10-match-part '+(match.result?.winner===n?'win':'')+'"><strong>'+h(n||'A definir')+'</strong><span>'+h(match.result?.points?.[i]??'')+(match.result?.winner===n?' ★':'')+'</span></div>').join('')+'<div class="v10-result">'+h(match.result?.score||'Resultado pendente')+'</div></div>').join('')+'</div>').join('')+'</div>'+(win?'<p class="v6-champion">🏆 Campeão: '+h(win)+'</p>':'')+'</article>';
};
const oldProfile=profile;
profile=function(id){
 oldProfile(id);
 const m=mc(id),sheet=el('#modal .sheet');if(!m||!sheet)return;
 const photos=GAL.filter(g=>(g.status||'published')==='published'&&(g.mcIds||[]).includes(id)).flatMap(g=>mediaList(g).filter(f=>imageMedia(f.url)).map(f=>f.url)).slice(0,12);
 const vids=(m.videos||[]).filter(core.validVideo);
 sheet.insertAdjacentHTML('beforeend','<div class="v10-profile"><h3>Perfil do MC</h3><div class="v10-tags">'+(m.tags||[]).map(tag=>'<span class="v10-tag">'+h(tag)+'</span>').join('')+'</div>'+(photos.length?'<h3>Galeria de fotos</h3><div class="v10-photos">'+photos.map(url=>'<img loading="lazy" src="'+h(url)+'" alt="Foto de '+h(m.name)+'">').join('')+'</div>':'')+(vids.length?'<h3>Vídeos de rimas</h3><div class="v10-videos">'+vids.map(v=>{const youtube=core.youtubeId(v.url);return '<div class="v10-video">'+(youtube?'<button class="v10-play" data-v10-play="'+youtube+'" aria-label="Reproduzir"><img loading="lazy" src="https://img.youtube.com/vi/'+youtube+'/hqdefault.jpg" alt=""><span>▶</span></button>':'<video src="'+h(v.url)+'" controls playsinline preload="none"></video>')+'<b>'+h(v.title)+'</b></div>';}).join('')+'</div>':'')+'</div>');
};
const originalAdm=admRender;
const baseForm10=form;
form=function(id){
 baseForm10(id);
 const panel=el('#modal .sheet');if(!panel)return;
 panel.classList.add('v10-form-modal');
 panel.insertAdjacentHTML('afterbegin','<div class="v10-toolbar"><button class="btn" data-v10-jump="fN">Informações</button><button class="btn" data-v10-jump="fRp">Estado</button><button class="btn" data-v10-jump="fP">Foto</button><button class="btn" data-v10-jump="fR">Títulos</button>'+(id?'<button class="btn" data-v10-open-panel="v10-tags" data-v10-mcid="'+h(id)+'">Tags</button><button class="btn" data-v10-open-panel="v10-videos" data-v10-mcid="'+h(id)+'">Vídeos</button>':'')+'</div>');
};
const moreTabs=[['mcs','MCs e perfis'],['v10-tags','Tags'],['v10-estados','Estados'],['v10-videos','Vídeos'],['v10-destaques','Destaques'],['v10-anual','Ranking anual']];
function tabs(){
 const p=el('#adm .atabs');if(!p)return;
 for(const [id,label] of moreTabs){
  const existing=p.querySelector('[data-at="'+id+'"]');
  if(existing){if(id==='mcs')existing.textContent=label;continue;}
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
 if(admTab==='mcs'){
  sheet('Cadastro geral de MCs','<p class="hint">Cadastre participantes com ou sem títulos. Todos terão perfil e poderão participar do Ranking Anual.</p><button class="btn on" data-v10-form="">+ Novo MC</button><div class="v10-mc-list">'+data.slice().sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')).map(m=>'<div class="v10-mc-row">'+avatars(m)+'<span><strong>'+h(m.name)+'</strong><small>'+total(m)+' título(s) · '+h(m.city||'Sem estado')+'</small></span><button class="btn" data-v10-form="'+h(m.id)+'">Editar</button></div>').join('')+'</div>');
 }else if(admTab==='v10-tags'){
  sheet('Tags dos participantes','<p class="hint">Organize categorias e características por MC. Separe as tags por vírgula.</p><label>MC<select id="v10TagMC">'+options(window._v10MC||data[0]?.id)+'</select></label><label>Tags<input id="v10Tags" maxlength="800" placeholder="Revelação, Representante, Campeão..."></label><button class="btn on" data-v10-save-tags>Salvar no rascunho</button>');
 }else if(admTab==='v10-estados'){
  sheet('Representantes estaduais','<p class="hint">Vincule os participantes a estados ou regiões, mesmo que ainda não tenham títulos.</p><label>MC<select id="v10RepMC">'+options(window._v10MC||data[0]?.id)+'</select></label><label>Representação<select id="v10RepType"><option value="">Nenhuma</option><option value="estadual">Estadual</option><option value="regional">Regional</option></select></label><label>Estado / região<input id="v10RepLoc" maxlength="40" placeholder="Rio de Janeiro"></label><button class="btn on" data-v10-save-rep>Salvar representante</button>');
 }else if(admTab==='v10-videos'){
  sheet('Vídeos dos MCs','<p class="hint">Cole um link do YouTube ou envie um arquivo MP4/WebM. Para upload, configure o bucket BDF_R2 no Cloudflare.</p><label>MC<select id="v10VidMC">'+options(window._v10MC||data[0]?.id)+'</select></label><label>Título<input id="v10VidTitle" maxlength="140" placeholder="Melhor rima"></label><label>URL do YouTube<input id="v10VidUrl" placeholder="https://youtu.be/..."></label><button class="btn on" data-v10-add-youtube>Adicionar YouTube</button><h3>Enviar vídeo</h3><input id="v10VidFile" type="file" accept="video/mp4,video/webm"><button class="btn" data-v10-upload>Fazer upload</button><progress id="v10Progress" max="100" value="0" hidden></progress><p id="v10UploadStatus" class="hint"></p><div id="v10VidList"></div>');
 }else if(admTab==='v10-destaques'){
  sheet('Destaques da semana','<p class="hint">Escolha o MC e a rima em destaque na página inicial. O último campeão e a última edição vêm dos chaveamentos publicados.</p><label>MC em destaque<select id="v10FeaturedMC">'+options(v10().featuredMC||data[0]?.id)+'</select></label><label>Vídeo<select id="v10FeaturedVideo"></select></label><button class="btn on" data-v10-featured>Salvar destaque</button>');
 }else if(admTab==='v10-anual'){
  sheet('Ranking anual · TOP 16','<p class="hint">As fases somam apenas a maior pontuação alcançada por edição. O bônus 2 × 0 é acumulado em confrontos tradicionais.</p><label>Ano<input id="v10AdminYear" type="number" min="2000" max="2100" value="'+y+'"></label><div class="v10-admin-grid">'+Object.entries({segunda:'Segunda fase',semi:'Semifinal',final:'Vice',campeao:'Campeão',bonus:'Bônus por 2 × 0'}).map(([key,label])=>'<label>'+label+'<input type="number" data-v10-rule="'+key+'" min="0" max="1000" value="'+Number(s.rules[key]??core.defaults[key])+'"></label>').join('')+'</div><button class="btn on" data-v10-save-rules>Salvar regras</button><h3>Participantes</h3><p class="hint">Escolha até 16 MCs cadastrados.</p><div class="v10-picks">'+data.map(m=>'<label><input type="checkbox" data-v10-member="'+h(m.id)+'" '+(s.participants.includes(m.id)?'checked':'')+'>'+h(m.name)+'</label>').join('')+'</div><button class="btn on" data-v10-save-members>Salvar participantes</button><h3>Ajustar pontos manualmente</h3><label>MC<select id="v10AdjustMC">'+options(data[0]?.id)+'</select></label><label>Pontos (negativo para desconto)<input id="v10AdjustPts" type="number" step="1" value="1"></label><label>Motivo<input id="v10AdjustReason" maxlength="200" placeholder="Correção de resultado"></label><button class="btn on" data-v10-adjust>Registrar ajuste</button><h3>Histórico de ajustes</h3>'+history(y));
 }else originalAdm();
 tabs();
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
function bracketEdit(id){
 if(!canAdmin)return loginForm();
 let b=BRACKETS.find(x=>x.id===id);
 if(!b){b={id:'br-'+Date.now(),title:'Nova edição',date:new Date().toISOString().slice(0,10),players:Array(8).fill(''),results:{},triples:{},status:'draft'};BRACKETS.push(b);}
 window._v6Editing=b.id;
 const rounds=core.bracketRounds(b),names=data.map(m=>'<option value="'+h(m.name)+'"></option>').join('');
 const matches=rounds.map((ms,r)=>'<h3>'+['Primeira fase','Segunda fase','Semifinal','Final'][r]+'</h3>'+ms.map(m=>{
  const t=m.third,points=m.result?.points||m.participants.map(()=>0);
  return '<div class="v10-match-edit"><b>Confronto '+(m.i+1)+' · '+h(m.key)+'</b><p>'+h(m.a||'A definir')+' × '+h(m.c||'A definir')+(t?' × '+h(t):'')+'</p><div class="v10-third"><label>Terceiro MC (opcional)<input data-v10-third="'+h(m.key)+'" list="v10-names" placeholder="Adicionar terceiro MC" value="'+h(t)+'"></label></div>'+m.participants.map((n,i)=>'<label class="v10-score-row">'+h(n)+'<input type="number" min="0" max="99" data-v10-pts="'+h(m.key)+'" data-v10-pos="'+i+'" value="'+(points[i]??0)+'" '+(t?'':'disabled')+'></label>').join('')+(t?'':'<label>Placar do duelo <select data-v10-outcome="'+h(m.key)+'"><option value="">Pendente</option>'+['2×0','2×1','W.O.'].map(x=>'<option value="'+x+'" '+(m.result?.score===x?'selected':'')+'>'+x+'</option>').join('')+'</select></label>')+'<label>Vencedor <select data-v10-win="'+h(m.key)+'"><option value="">Ainda não definido</option>'+m.participants.map(n=>'<option value="'+h(n)+'" '+(m.result?.winner===n?'selected':'')+'>'+h(n)+'</option>').join('')+'</select></label></div>';
 }).join('')).join('');
 open('<h2>Editor visual de chaveamento</h2><p class="hint">Escolha até três MCs por confronto. Só um avança. Em caso de empate, selecione manualmente o vencedor. Primeiro salve os nomes para liberar os confrontos seguintes.</p><div class="v10-admin-grid"><label>Nome<input id="v10BrTitle" value="'+h(b.title)+'"></label><label>Número da edição<input id="v10BrNum" type="number" value="'+h(b.editionNumber||'')+'"></label><label>Data<input id="v10BrDate" type="date" value="'+h(b.date)+'"></label><label>Vagas iniciais<select id="v10BrSize">'+[4,8,16].map(n=>'<option value="'+n+'" '+(n===b.players.length?'selected':'')+'>'+n+'</option>').join('')+'</select></label><label>Visibilidade<select id="v10BrStatus"><option value="draft" '+(b.status==='draft'?'selected':'')+'>Rascunho</option><option value="published" '+(b.status==='published'?'selected':'')+'>Publicado</option></select></label><label><input id="v10BrNoTitle" type="checkbox" '+(b.awardsTitle===false?'checked':'')+'> Esta edição não concede título</label></div><datalist id="v10-names">'+names+'</datalist><h3>Participantes</h3><div class="v10-admin-grid">'+b.players.map((n,i)=>'<label>Vaga '+(i+1)+'<input list="v10-names" data-v10-br-player="'+i+'" value="'+h(n)+'"></label>').join('')+'</div><h3>Resultados</h3>'+matches+v8BracketLinkForm(b)+'<div class="v10-toolbar"><button class="btn on" data-v10-save-br="'+h(b.id)+'">Salvar chave e placares</button><button class="btn" data-v10-remove-br="'+h(b.id)+'">Excluir torneio</button></div>',true);
}
function saveBracket(id){
 const b=BRACKETS.find(x=>x.id===id);if(!b)return;
 const nextSize=Number(el('#v10BrSize')?.value),p=els('[data-v10-br-player]').map(x=>x.value.trim()),change=nextSize!==b.players.length||p.some((n,i)=>n!==b.players[i]);
 if(!el('#v10BrTitle')?.value.trim())return toast('Informe o nome da edição.',1);
 if(p.some(x=>x&&!data.some(m=>m.name===x)))return toast('Cadastre primeiro os MCs para participar.',1);
 if(new Set(p.filter(Boolean)).size!==p.filter(Boolean).length)return toast('MC repetido nas vagas.',1);
 b.title=el('#v10BrTitle').value.trim();b.date=el('#v10BrDate').value;b.editionNumber=String(el('#v10BrNum').value||'').replace(/\D/g,'').slice(0,6);b.status=el('#v10BrStatus').value;b.awardsTitle=!el('#v10BrNoTitle').checked;
 if(change){
  b.players=Array(nextSize).fill('');if(nextSize===p.length)b.players=p;
  b.results={};b.triples={};
  if(nextSize!==p.length){toast('Tamanho atualizado. Preencha as novas vagas.',1);}
 }else{
  const triples={};for(const input of els('[data-v10-third]')){if(input.value.trim())triples[input.dataset.v10Third]=input.value.trim();}
  const first=[...b.players.filter(Boolean),...Object.entries(triples).filter(([key])=>key.startsWith('0-')).map(([,n])=>n)];
  if(new Set(first).size!==first.length||Object.values(triples).some(n=>!data.some(m=>m.name===n)))return toast('Terceiro MC inválido ou repetido na primeira fase.',1);
  const old=JSON.stringify(b.triples||{});b.triples=triples;
  if(old!==JSON.stringify(triples))b.results={};
  else{
   const results={};
   for(const match of core.bracketRounds(b).flat()){
    const winner=el('[data-v10-win="'+match.key+'"]')?.value||'';
    if(!winner||!match.participants.includes(winner)||!match.a||!match.c)continue;
    if(match.third){
     const pts=els('[data-v10-pts="'+match.key+'"]').map(x=>Number(x.value));
     if(pts.length!==3||pts.some(x=>!Number.isInteger(x)||x<0||x>99))return toast('Informe três placares válidos.',1);
     const max=Math.max(...pts),top=pts.map((x,i)=>x===max?i:-1).filter(x=>x>=0);
     const selected=top.length===1?match.participants[top[0]]:winner;
     results[match.key]={winner:selected,points:pts,score:pts.join(' × ')};
    }else{
     const score=el('[data-v10-outcome="'+match.key+'"]')?.value||'';
     if(score)results[match.key]={winner,score};
    }
   }
   b.results=results;
  }
 }
 if(!v8SaveBracketLink(b))return;
 save();render();bracketEdit(id);
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
 const btn=e.target.closest('[data-v10-jump],[data-v10-open-panel],[data-v10-featured],[data-v10-profile],[data-v10-play],[data-v10-form],[data-v10-save-tags],[data-v10-save-rep],[data-v10-add-youtube],[data-v10-edit-video],[data-v10-delete-video],[data-v10-upload],[data-v10-save-rules],[data-v10-save-members],[data-v10-adjust],[data-v10-publish],[data-v10-save-br],[data-v10-remove-br]');
 if(!btn)return;
 e.stopImmediatePropagation();e.preventDefault();
 const d=btn.dataset;
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
 if(d.v10SaveRules!==undefined){const r={};for(const x of els('[data-v10-rule]')){const n=Number(x.value);if(!Number.isInteger(n)||n<0||n>1000)return toast('Informe pontos entre 0 e 1.000.',1);r[x.dataset.v10Rule]=n;}staging(()=>season(year()).rules=r);toast('Regras salvas no rascunho.');return;}
 if(d.v10SaveMembers!==undefined){const ids=els('[data-v10-member]:checked').map(x=>x.dataset.v10Member);if(ids.length>16)return toast('Escolha até 16 MCs.',1);staging(()=>season(year()).participants=ids);toast('Participantes selecionados.');return;}
 if(d.v10Adjust!==undefined){const id=el('#v10AdjustMC').value,delta=Number(el('#v10AdjustPts').value),reason=el('#v10AdjustReason').value.trim();if(!Number.isInteger(delta)||!delta||Math.abs(delta)>10000||!reason)return toast('Informe pontuação inteira e motivo.',1);staging(()=>{const s=season(year());(s.adjustments[id]||=[]).push({delta,reason,at:new Date().toISOString()});});toast('Ajuste registrado.');return;}
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
// Não cria um atalho alternativo no celular. O atalho Ctrl+Shift+A segue exigindo Firebase.
const logo=el('#hLogo');
if(logo){const clean=logo.cloneNode(true);logo.replaceWith(clean);clean.removeAttribute('tabindex');clean.removeAttribute('role');clean.setAttribute('aria-label','Batalha da Foice');}
const nav=el('#nv');if(nav){
 const login=nav.querySelector('a[href="#admin"]');if(login)login.remove();
 if(!nav.querySelector('#v10-nav'))nav.insertAdjacentHTML('beforeend','<a id="v10-nav" href="#/anual">Ranking anual</a>');
}
const page=document.createElement('div');page.id='pgAnnual';page.hidden=true;el('#pgAbout').after(page);
if(Array.isArray(data)&&data.length)render();
})();
