/* LAB03.1 — integração visual segura do arquivo de prévia enviado.
 * Reutiliza dados e autenticação da aplicação; não inventa títulos nem
 * substitui as funções administrativas existentes.
 */
(function(){
'use strict';
if(typeof render!=='function'||typeof total!=='function')return;
const $=q=>document.querySelector(q);
const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let category='champions',initialized=false;
function shell(){
 document.documentElement.classList.add('lab031-root');
 document.body.classList.add('lab031-site');
 let banner=$('#lab031-toolbar');
 if(!banner){
  banner=document.createElement('div');banner.id='lab031-toolbar';
  banner.innerHTML='<span class="lab031-caption"><b>LAB / 03.1</b><small>ACERVO DE GUERRA</small></span><span class="lab031-middle">Arquivo histórico · ranking · memória da roda</span><span class="lab031-preview-label">VERSÃO DE TESTES</span>';
  document.body.insertBefore(banner,document.body.firstChild);
 }
}
function counts(){
 const members=Array.isArray(data)?data:[];
 return {champions:members.filter(m=>total(m)>0).length,zero:members.filter(m=>total(m)===0).length};
}
function categoryTabs(){
 const sort=$('#sortbar');
 if(!sort)return;
 let tabs=$('#lab031-rank-switch');
 if(!tabs){tabs=document.createElement('section');tabs.id='lab031-rank-switch';tabs.setAttribute('aria-label','Categorias do ranking');sort.insertAdjacentElement('beforebegin',tabs);}
 tabs.hidden=window._pg!=='ranking';
 document.body.classList.toggle('lab031-zero-active',!tabs.hidden&&category==='zero');
 if(tabs.hidden)return;
 const c=counts();
 tabs.innerHTML='<div class="lab031-rank-explainer"><span>CLASSIFICAÇÕES</span><strong>O ACERVO, DUAS HISTÓRIAS.</strong></div><div class="lab031-rank-tabs"><button type="button" data-lab031-rank-view="champions" aria-pressed="'+(category==='champions')+'">Campeões ('+c.champions+')</button><button type="button" data-lab031-rank-view="zero" aria-pressed="'+(category==='zero')+'">MCs sem títulos ('+c.zero+')</button></div>';
}
function zeroTitleSection(){
 const list=$('#list');if(!list)return;
 let section=$('#lab031-no-titles');
 if(!section){section=document.createElement('section');section.id='lab031-no-titles';list.insertAdjacentElement('afterend',section);}
 const active=window._pg==='ranking'&&category==='zero';
 section.hidden=!active;
 list.hidden=active;
 const controls=$('#sortbar');if(controls)controls.hidden=active;
 if(!active)return;
 const participants=data.filter(m=>total(m)===0).slice().sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
 section.innerHTML='<div class="lab031-zero-head"><div><span>PARTICIPANTES DA HISTÓRIA</span><h2>MCs sem títulos</h2><p>Perfis cadastrados sem conquistas contabilizadas. Não entram no ranking de campeões.</p></div><b>'+participants.length+' PERFIS</b></div><div class="lab031-zero-list">'+participants.map(m=>'<button type="button" class="lab031-zero-mc" data-lab031-profile="'+escapeHTML(m.id)+'"><span class="lab031-zero-photo">'+(m.photo?'<img src="'+escapeHTML(m._tmp||m.photo)+'" alt="" loading="lazy">':escapeHTML(m.name?.[0]||'?'))+'</span><strong>'+escapeHTML(m.name)+'</strong><small>'+escapeHTML(m.city||'Local não informado')+'</small></button>').join('')+'</div>';
}
function galleryCards(){
 const page=$('#pgMem');if(!page||!Array.isArray(GAL))return;
 for(const card of page.querySelectorAll('.mem-card[data-gview]')){
  const item=GAL.find(g=>String(g.id)===card.dataset.gview);
  if(!item)continue;
  const body=card.querySelector('.mem-bd');
  if(!body||body.querySelector('h3'))continue;
  const date=item.date?new Date(item.date+'T12:00:00').toLocaleDateString('pt-BR'):(item.year?(item.approx?'Por volta de ':'')+item.year:'Data a confirmar');
  const linked=(item.mcIds||[]).slice(0,3).map(id=>data.find(m=>m.id===id)).filter(Boolean);
  body.innerHTML='<div class="mem-card-topline"><span class="mem-date">'+escapeHTML(date)+'</span><span aria-hidden="true">↗</span></div><h3>'+escapeHTML(item.title||'Registro histórico')+'</h3><p>'+escapeHTML(item.description||'Registro da roda cultural.')+'</p>'+(linked.length?'<div class="mem-card-people">'+linked.map(m=>'<span>'+escapeHTML(m.name)+'</span>').join('')+'</div>':'');
 }
}
const previousRender=render;
render=function(){
 // O arquivo de referência inicia pelo Arquivo de Guerra. Isto vale
 // para a prévia LAB03.1, sem persistir ou publicar a escolha no servidor.
 if(!initialized){initialized=true;if(!window._pv)window._pv='archive';}
 previousRender();
 shell();galleryCards();categoryTabs();zeroTitleSection();
};
document.addEventListener('click',e=>{
 const tab=e.target.closest('[data-lab031-rank-view]');
 if(tab){e.preventDefault();e.stopImmediatePropagation();category=tab.dataset.lab031RankView==='zero'?'zero':'champions';render();return;}
 const profileButton=e.target.closest('[data-lab031-profile]');
 if(profileButton){e.preventDefault();e.stopImmediatePropagation();profile(profileButton.dataset.lab031Profile);}
},true);
shell();
})();
