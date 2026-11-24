import assert from 'node:assert/strict';
import '../v10-core.js';
const core=globalThis.BDFV10Core;
assert(core);
const mcs=['A','B','C','D','E'].map((name,i)=>({id:'m'+i,name,titles:{},unknownTitles:0}));
const [A,B,C,D,E]=mcs;
const bracket={
 id:'2026-final',title:'Edição especial',date:'2026-11-23',status:'published',
 players:['A','B','C','D'],triples:{'0-0':'E'},
 results:{
  '0-0':{winner:'A',points:[2,1,0],score:'2 × 1 × 0'},
  '0-1':{winner:'C',score:'2×0'},
  '1-0':{winner:'A',score:'2×0'}
 },
 awardsTitle:false
};
const rounds=core.bracketRounds(bracket);
assert.equal(rounds.length,2);
assert.deepEqual(rounds[0][0].participants,['A','B','E']);
assert.equal(rounds[1][0].result.winner,'A');
const doc={data:mcs,brackets:[bracket],cfg:{v10:{seasons:{2026:{
 participants:[A.id,B.id,C.id,D.id,E.id],rules:{segunda:2,semi:4,final:7,campeao:10,bonus:1},
 adjustments:{[E.id]:[{delta:2,reason:'Correção administrativa'}]}
}}}}};
assert.deepEqual(core.validateV10(doc),[]);
const table=core.annualTable({year:2026,mcList:mcs,brackets:[bracket],season:doc.cfg.v10.seasons[2026]});
const points=id=>table.find(x=>x.id===id);
assert.equal(points(A.id).points,11,'Campeão: 10 + bônus 2×0 na final, sem bônus triple');
assert.equal(points(C.id).points,8,'Vice: 7 + um 2×0');
assert.equal(points(E.id).points,6,'Semifinal: 4 + 2 de ajuste');
assert.equal(points(A.id).bonus,1);
assert.equal(core.duelHistory(A,B,[bracket]).matches.length,0,'Double Three não vira confronto direto');
assert.equal(core.duelHistory(A,C,[bracket]).a,1);
assert.equal(core.youtubeId('https://youtu.be/dQw4w9WgXcQ'),'dQw4w9WgXcQ');
assert.equal(core.youtubeId('https://evil.test/video'),null);
assert(core.validVideo({kind:'youtube',title:'Rima',url:'https://youtube.com/watch?v=dQw4w9WgXcQ'}));
assert(core.validVideo({kind:'upload',title:'Rima',url:'/api/video/123e4567-e89b-12d3-a456-426614174000.mp4'}));
assert(!core.validVideo({kind:'upload',title:'Inválido',url:'https://evil.test/video.mp4'}));
const invalid=structuredClone(doc);
invalid.brackets[0].triples['0-0']='A';
assert(core.validateV10(invalid).some(s=>/repetido/.test(s)));
const invalidRank=structuredClone(doc);
invalidRank.cfg.v10.seasons[2026].participants.push('nao-cadastrado');
assert(core.validateV10(invalidRank).some(s=>/Ranking anual/.test(s)));
console.log('PASSOU: V10 — Double Three, ranking anual, bônus, ajustes e confrontos.');
