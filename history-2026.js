/* O levantamento de 26/11/2026 substitui as antigas associações de
 * edições, sem alterar os títulos do cadastro original.
 * Adaptador preserva a API histórica do site.
 */
(function(root){
 'use strict';
 if(!root.BDFArchive)throw new Error('Módulo BDFArchive não carregado.');
 root.BDFHistory={
  apply:root.BDFArchive.apply,
  champions:root.BDFArchive.allClaims().filter(x=>x.claims.length).map(x=>({edition:'#'+x.number,winners:x.claims.map(c=>c.names)})),
  historicalBrackets:root.BDFArchive.groupMatches,
  titleCount:root.BDFArchive.count
 };
})(globalThis);
