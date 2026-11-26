
/* LAB03: injeta APENAS marcação decorativa na cópia local. Sem fetch nem gravação. */
(()=>{
 'use strict';
 document.documentElement.classList.add('bdf02-active');
 const strip=document.createElement('div');strip.className='bdf02-topline';
 strip.innerHTML='<span>● ACERVO DA FOICE</span><span>BATALHA DA FOICE / ARQUIVO DE GUERRA</span><span><b>HISTÓRIA VIVA</b> · RODA CULTURAL</span>';
 document.body.insertBefore(strip,document.body.firstChild);
 const header=document.querySelector('.wrap > header');
 if(header){
  const nav=header.querySelector('.nav');
  const hero=document.createElement('section');hero.className='bdf02-hero';
  hero.innerHTML='<div><div class="bdf02-eyebrow">▣ MEMÓRIA / RODA CULTURAL / 12 ANOS</div><h2>A RODA<br>NÃO SE<br><span>ESQUECE.</span></h2><p>Mais do que títulos. Um registro vivo das histórias que construíram a cultura do freestyle.</p><a class="bdf02-btn" href="#/ranking">EXPLORAR MCs <span>↗</span></a></div><div class="bdf02-seal" aria-hidden="true"><b>12</b><span>ANOS</span></div>';
  nav?.insertAdjacentElement('afterend',hero);
 }
 const banner=document.createElement('div');banner.className='bdf02-banner';banner.setAttribute('aria-hidden','true');banner.innerHTML='▣ BATALHA DA FOICE <strong>✳</strong> ACERVO CULTURAL <strong>✳</strong> BDF';
 header?.insertAdjacentElement('afterend',banner);
 const sort=document.querySelector('#sortbar');if(sort){const cap=document.createElement('div');cap.className='bdf02-caption';cap.innerHTML='<span>REGISTRO / MCs E CONQUISTAS</span><strong>SEM INVENTAR A HISTÓRIA ↗</strong>';sort.insertAdjacentElement('beforebegin',cap);}
 const floating=document.createElement('div');floating.className='bdf02-floating';floating.innerHTML='<b>LAB / 03</b><span>MEMÓRIA DA RODA<br>HISTÓRIA DO FREESTYLE</span>';document.body.appendChild(floating);
})();

