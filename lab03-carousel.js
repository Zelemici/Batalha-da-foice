/* LAB03.1 — carrossel histórico baseado em títulos já contabilizados.
 * Cada conquista anual ocupa uma vaga; só um vínculo publicado e validado
 * identifica a edição. Esta função nunca modifica títulos nem chaveamentos.
 */
(function(root){
'use strict';
function createEntries(mcs,brackets,year=2026){
 const all=Array.isArray(mcs)?mcs:[];
 const bs=Array.isArray(brackets)?brackets:[];
 const records=[];
 const y=String(year);
 for(const mc of all){
  const count=Math.max(0,Math.floor(Number(mc?.titles?.[y])||0));
  if(!count||!mc?.id)continue;
  for(let ordinal=1;ordinal<=count;ordinal++){
   // Um vínculo só é válido se a edição estiver publicada, o título já
   // existir e o campeão da final for de fato o MC cadastrado.
   const matches=bs.filter(b=>b?.status==='published'&&b.titleLink?.mcId===mc.id&&
    String(b.titleLink.year)===y&&Number(b.titleLink.ordinal)===ordinal&&
    b.players?.includes(mc.name));
   const verified=matches.filter(b=>{
    const finalResults=b.results||{};
    const round=Math.log2(b.players.length)-1;
    return Number.isInteger(round)&&finalResults[round+'-0']?.winner===mc.name;
   });
   const bracket=verified.length===1?verified[0]:null;
   records.push({
    id:'title:'+y+':'+mc.id+':'+ordinal,
    mc,name:mc.name,year:Number(year),ordinal,titleCount:count,
    bracket,edition:bracket?(String(bracket.editionNumber||'').trim()?
     'BDF #'+String(bracket.editionNumber).trim():String(bracket.title||'Edição identificada')):'Edição pendente',
    status:bracket?'Conquista vinculada':'Título registrado · edição não identificada'
   });
  }
 }
 return records;
}
root.BDFLab03Carousel={createEntries};
})(typeof globalThis!=='undefined'?globalThis:window);
