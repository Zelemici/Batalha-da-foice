
/* LAB03.1 — integração local completa sobre o código original V10 / arquivo #1–#194.
 * O visitante NÃO escolhe layout. O ADM do laboratório configura o modo de exibição.
 * Sem chamadas de escrita ao GitHub, Cloudflare ou qualquer servidor externo.
 */
(function(){
'use strict';
const $=q=>document.querySelector(q);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const layouts={classic:'Clássico',street:'Street',archive:'Arquivo P&B'};
const storeKey='bdf-lab031-admin-layout';
let chosen='classic';
let rankTab='champions'; // Publico abre sempre na aba dos campeoes.
// O layout público deve vir das configurações publicadas.
const blockedMsg='LAB03.1: nenhuma alteração foi enviada à Cloudflare ou ao GitHub. Use Exportar backup para salvar esta simulação.';
const say=message=>typeof toast==='function'?toast(message):alert(message);
const numTitles=m=>Object.values(m.titles||{}).reduce((x,n)=>x+(Number(n)||0),0)+(Number(m.unknownTitles)||0);
const totalBefore=()=>data.reduce((x,m)=>x+numTitles(m),0);
const publishedBefore=()=>GAL.filter(g=>(g.status||'published')==='published').length;

function shell(){
 document.documentElement.classList.add('lab031-root');document.body.classList.add('lab031-site');
 const dock=$('#lab031-toolbar');
 if(!dock){
  const n=document.createElement('div');n.id='lab031-toolbar';n.innerHTML='<span class="lab031-caption"><b>LAB / 03.1</b><small>ACERVO DE GUERRA · CÓPIA ISOLADA</small></span><span class="lab031-middle">Sistema V10 · histórico #1–#194 · memória da roda</span><button type="button" data-lab031-admin>ACESSO ADMINISTRATIVO ↗</button>';
  document.body.insertBefore(n,document.body.firstChild);
 }
 if(!$('#lab031-audit')){
  const x=document.createElement('div');x.id='lab031-audit';x.innerHTML='ACERVO HISTÓRICO · 2013–2026';document.body.append(x);
 }
 // Não existe seletor público de ranking neste laboratório.
 document.querySelectorAll('.lab03-layout-dock,.lab03-layout-controls').forEach(e=>e.remove());
}
function integrateGallery(){
 const root=$('#pgMem');if(!root)return;
 // A implementação original da galeria contém filtros, modal, fotos, tags e datas.
 // Preservamos esse HTML original e não alteramos nenhuma mídia.
 for(const c of root.querySelectorAll('.mem-card[data-gview]')){
  const g=GAL.find(x=>String(x.id)===c.dataset.gview);if(!g)continue;
  const b=c.querySelector('.mem-bd');if(!b)return;
  // Remontagem mínima quando a versão original só exibe 'toque para abrir'.
  if(b.querySelector('h3'))continue;
  const date=g.date?new Date(g.date+'T12:00:00').toLocaleDateString('pt-BR'):(g.year?(g.approx?'Por volta de ':'')+g.year:'Data a confirmar');
  const tags=(g.mcIds||[]).slice(0,3).map(id=>data.find(m=>m.id===id)).filter(Boolean);
  b.innerHTML='<div class="mem-card-topline"><span class="mem-date">'+esc(date)+'</span><span aria-hidden="true">↗</span></div><h3>'+esc(g.title||'Registro histórico')+'</h3><p>'+esc(g.description||'Registro da roda cultural.')+'</p>'+(tags.length?'<div class="mem-tags">'+tags.map(m=>'<span class="mem-tag">@'+esc(m.name)+'</span>').join('')+'</div>':'')+'<span class="mem-card-cta">ABRIR REGISTRO ↗</span>';
 }
}
function zeroTitleSection(){
 // A V10 já exclui quem tem zero título de ranked(). Esta lista tem ABA
 // própria, é secundária e NUNCA aparece no ranking geral de entrada.
 const list=$('#list');if(!list)return;
 let section=$('#lab031-no-titles');
 if(!section){section=document.createElement('section');section.id='lab031-no-titles';list.insertAdjacentElement('afterend',section);}
 section.hidden=window._pg!=='ranking'||rankTab!=='zero';if(section.hidden)return;
 const zero=data.filter(m=>numTitles(m)===0).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
 section.innerHTML='<div class="lab031-zero-head"><div><span>PARTICIPANTES DA HISTÓRIA</span><h2>MCs sem títulos</h2><p>Participaram da roda ou de confrontos registrados, mas ainda não constam como campeões.</p></div><b>'+zero.length+' PERFIS</b></div><div class="lab031-zero-grid">'+zero.map(m=>'<button type="button" class="lab031-zero-card" data-lab031-profile="'+esc(m.id)+'"><span class="lab031-zero-face">'+(m.photo?'<img src="'+esc(m.photo)+'" alt="" loading="lazy">':esc(m.name[0]||'?'))+'</span><span><b>'+esc(m.name)+'</b><small>0 títulos registrados · ver histórico ↗</small></span></button>').join('')+'</div><p class="lab031-zero-note">Esses MCs continuam disponíveis nos confrontos diretos e no ranking anual quando participarem de edições pontuadas, sem entrar na classificação geral de títulos.</p>';
}
function rankingSwitch(){
 const sort=$('#sortbar');if(!sort)return;
 let tabs=$('#lab031-rank-switch');
 if(!tabs){
  tabs=document.createElement('div');tabs.id='lab031-rank-switch';tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Selecionar categoria de classificação');
  sort.insertAdjacentElement('beforebegin',tabs);
 }
 tabs.hidden=window._pg!=='ranking';
 document.body.classList.toggle('lab031-zero-active',!tabs.hidden&&rankTab==='zero');
 if(tabs.hidden)return;
 const c=data.filter(m=>numTitles(m)>0).length,z=data.filter(m=>numTitles(m)===0).length;
 tabs.innerHTML='<div class="lab031-rank-explainer"><span>CLASSIFICAÇÕES</span><strong>O ACERVO, DUAS HISTÓRIAS.</strong></div><div class="lab031-rank-tabs"><button type="button" data-lab031-rank-view="champions" aria-pressed="'+(rankTab==='champions')+'" class="'+(rankTab==='champions'?'active':'')+'">Campeões <b>'+c+'</b></button><button type="button" data-lab031-rank-view="zero" aria-pressed="'+(rankTab==='zero')+'" class="'+(rankTab==='zero'?'active':'')+'">MCs sem títulos <b>'+z+'</b></button></div>';
}
function adminExtras(){
 if(!canAdmin)return;
 const root=$('#adm .asheet');if(!root)return;
 const tabs=root.querySelector('.atabs');
 if(tabs&&!tabs.querySelector('[data-lab031-admin-tab="audit"]'))tabs.insertAdjacentHTML('beforeend','<button type="button" class="btn" data-lab031-admin-tab="audit">Importar histórico</button>');
 if(admTab==='lay'){
  const grid=root.querySelector('.lgrid');
  if(grid){
   if(!grid.querySelector('[data-lsel="archive"]'))grid.insertAdjacentHTML('beforeend','<button type="button" class="lopt lab031-option-archive" data-lsel="archive" aria-pressed="false"><div class="lmini archive"><i></i><i></i><i></i></div><b>Arquivo P&B</b><small>Card monocromático, tipografia editorial e fotografias reais.</small><em>NOVO</em></button>');
   for(const b of grid.querySelectorAll('[data-lsel]')){
    b.classList.toggle('on',b.dataset.lsel===chosen);
    b.setAttribute('aria-pressed',String(b.dataset.lsel===chosen));
    let note=b.querySelector('.lab031-current');if(note)note.remove();
    if(b.dataset.lsel===chosen)b.insertAdjacentHTML('beforeend','<em class="lab031-current">SELECIONADO</em>');
   }
  }
  if(!root.querySelector('.lab031-admin-layout-note')){
   const n=document.createElement('div');n.className='lab031-admin-layout-note';n.innerHTML='<strong>Aparência definida pelo administrador</strong><p>O público não recebe botões para trocar de ranking. Escolha um dos três modelos acima e veja a aparência ser aplicada ao laboratório. A alteração fica em rascunho até publicação autenticada.</p><p><b>Visível agora:</b> <span id="lab031-layout-name">'+layouts[chosen]+'</span></p><button type="button" class="btn" data-lab031-goto-rank>VER RANKING COM ESTE LAYOUT ↗</button>';
   (grid||root).insertAdjacentElement('afterend',n);
  }
  root.querySelectorAll('[data-lpub],[data-pvpub]').forEach(b=>b.textContent='Aplicar ao rascunho');
 }
 if(admTab==='v10-historico'||admTab==='lab031-audit'){
  const ar=CFG?.v10?.editionArchive;
  const existingArchive=root.querySelector('.lab031-admin-archive');if(existingArchive)existingArchive.remove();
  const box=document.createElement('section');box.className='lab031-admin-archive';
  box.innerHTML='<h3>Arquivo histórico #1–#194</h3><p>Os registros estão carregados no laboratório e associados aos perfis sem duplicar as contagens já existentes.</p><div class="lab031-admin-pills"><b>'+(ar?.catalog?.length||0)+'</b> edições <b>'+(ar?.catalog?.filter(x=>x.claims.length).length||0)+'</b> campeões identificados <b>'+(ar?.teamMatches?.length||0)+'</b> partidas coletivas</div><p>Conflitos conhecidos: #146 e anos não identificados da última sequência. A aba Edições oferece a consulta completa.</p><button class="btn on" type="button" data-lab031-goto-editions>ABRIR HISTÓRICO POR EDIÇÃO ↗</button> <button type="button" class="btn" data-lab031-sync-archive>Reconciliar no rascunho</button>';
  root.append(box);
 }
 if(!root.querySelector('.lab031-no-pub')){
  const notice=document.createElement('small');notice.className='lab031-no-pub';notice.textContent='LAB03.1 · Para publicar use a opção protegida do painel.';
  root.append(notice);
 }
}
function mode(){
 if(!editing&&CFG?.layout in layouts)chosen=CFG.layout;
 document.body.classList.toggle('lay-archive',chosen==='archive');
 document.body.classList.toggle('lay-street',chosen==='street');
 document.body.classList.toggle('lay-classic',chosen==='classic');
 // O código V10 cria cards clássicos quando layout !== street.
 CFG.layout=chosen;window._pv=null;window._sel=chosen;
}
function choose(value){
 if(!canAdmin||!(value in layouts))return;
 chosen=value;
 try{localStorage.setItem(storeKey,value);}catch(e){}
 CFG.layout=chosen;window._pv=null;window._sel=chosen;
 saveC();render();
 say('Layout '+layouts[value]+' salvo em rascunho. Publique pelo ADM.');
}
const originalRender=render;
render=function(){mode();originalRender();mode();shell();integrateGallery();zeroTitleSection();rankingSwitch();adminExtras();};
const originalAdmRender=admRender;
admRender=function(){originalAdmRender();adminExtras();};

function adminOpen(){if(!canAdmin){loginForm();return;}editing=true;admTab='vis';$('#adm')?.classList.add('open');render();admRender();}

// A execução de todos os comandos de escrita externa é bloqueada antes
// dos event handlers originais. Não interfira nas opções locais de edição.
document.addEventListener('click',function(e){
 const target=e.target.closest('[data-lab031-admin],[data-lab031-admin-tab],[data-lab031-goto-rank],[data-lab031-goto-editions],[data-lab031-profile],[data-lab031-rank-view],[data-lab031-sync-archive],[data-lsel],[data-lpub],[data-lprev],[data-pvpub],[data-v10-publish],[data-bdf-save-server],[data-v6-commit],[data-pub]');
 if(!target)return;
 if(target.hasAttribute('data-lab031-admin')){e.preventDefault();e.stopImmediatePropagation();adminOpen();return;}
 if(target.hasAttribute('data-lab031-profile')){e.preventDefault();e.stopImmediatePropagation();profile(target.dataset.lab031Profile);return;}
 if(target.hasAttribute('data-lab031-rank-view')){e.preventDefault();e.stopImmediatePropagation();rankTab=target.dataset.lab031RankView;render();return;}
 if(target.hasAttribute('data-lsel')){if(!canAdmin)return;e.preventDefault();e.stopImmediatePropagation();choose(target.dataset.lsel);admTab='lay';admRender();return;}
 if(target.hasAttribute('data-lab031-admin-tab')){if(!canAdmin)return;e.preventDefault();e.stopImmediatePropagation();admTab='lab031-audit';admRender();return;}
 if(target.hasAttribute('data-lab031-sync-archive')){
  if(!canAdmin)return;
  e.preventDefault();e.stopImmediatePropagation();
  const previous=totalBefore(),candidate=globalThis.BDFArchive.apply(snapshot());
  const proposed=candidate.data.reduce((sum,m)=>sum+numTitles(m),0);
  if(previous!==proposed){say('Revisão interrompida: a quantidade de títulos seria alterada. Nenhum dado foi substituído.');return;}
  data=candidate.data;CFG=Object.assign({},CD,candidate.cfg||{});
  render();admTab='lab031-audit';admRender();
  say('Catálogo #1–#194 reconciliado no rascunho, sem acrescentar títulos nem publicar.');return;
 }
 if(target.hasAttribute('data-lab031-goto-rank')){e.preventDefault();e.stopImmediatePropagation();$('#adm')?.classList.remove('open');location.hash='#/ranking';render();return;}
 if(target.hasAttribute('data-lab031-goto-editions')){e.preventDefault();e.stopImmediatePropagation();$('#adm')?.classList.remove('open');location.hash='#/edicoes';render();return;}
 if(target.hasAttribute('data-lpub')||target.hasAttribute('data-pvpub')||target.hasAttribute('data-lprev')){if(!canAdmin)return;e.preventDefault();e.stopImmediatePropagation();choose(window._sel||chosen);if(target.hasAttribute('data-lprev')){$('#adm')?.classList.remove('open');location.hash='#/ranking';}return;}

},true);

// Exportação completa do laboratório: mantém chaves e campeões 2026,
// que o exportador legado não incluía.
bk=function(){
 const blob=new Blob([JSON.stringify(snapshot())],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='BDF-LAB03.1-BACKUP-COMPLETO.json';a.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
 say('Backup completo do laboratório exportado. Dados oficiais não foram alterados.');
};


try{render();}catch(err){console.error('LAB03.1: inicialização visual aguardando dados',err);}
})();

