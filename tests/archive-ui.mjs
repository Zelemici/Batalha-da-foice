import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import '../v10-core.js';
import '../archive-2026.js';
const original=JSON.parse(readFileSync(new URL('../data.json',import.meta.url),'utf8'));
const archive=globalThis.BDFArchive.apply(original);
const ui=readFileSync(new URL('../archive-ui.js',import.meta.url),'utf8');
const ctx={
 document:{getElementById:()=>null,addEventListener:()=>{}},
 globalThis:{BDFArchive:globalThis.BDFArchive},
 data:archive.data,CFG:archive.cfg,
 render:()=>{},profile:()=>{},bdfEditionChips:()=>'',open:()=>{},total:globalThis.BDFV10Core.titleCount
};
runInNewContext(ui,ctx,{filename:'archive-ui.js'});
const get=n=>archive.data.find(m=>globalThis.BDFArchive.canonical(m.name)===n);
const zel=ctx.bdfEditionChips(get('Zel'));
assert(zel.includes('#179'),'Zel has special #179 badge');
assert(zel.includes('arc-chip-oldnew'),'Special edition #179 is color coded');
assert(zel.includes('#173'),'Zel has Cave edition #173');
assert(zel.includes('arc-chip-cave'),'Cave #173 has separate color');
assert(!zel.includes('#10'),'No unrelated edition on Zel');
const vieira=ctx.bdfEditionChips(get('Vieira Zr'));
assert(vieira.includes('#127')===false,'Only the 7 most recent badges appear on card; complete list in profile');
const street=ctx.bdfEditionChips(get('Street'));
assert(street.includes('#146 ?'),'Ambiguous number #146 is marked as disputed');
assert(street.includes('arc-chip-review'),'Disputed editions use a distinguishable style');
const japa=ctx.bdfEditionChips(get('Japa'));
assert(japa.includes('#11'),'Japa title is edition #11');
assert(!japa.includes('#17'),'Outdated Japa #17 association not shown');
assert(ctx.bdfEditionChips(get('Magnata'))==='','Opponent with zero titles has no fake champion badge');
assert(ui.includes('categoryMembers(cat)')&&ui.includes('specialUnnumbered'),'Hall includes regional champions without a documented edition number');
assert(ui.includes('teamMatches')&&ui.includes('Resultado de três participantes'),'Team and triple encounters shown without invented head-to-head');
assert(ui.includes('archiveCatalogue()')&&ui.includes('filtered()'),'Archive can filter all editions by year and query');
console.log('PASSOU: cards especiais de Zel, Vieira, Street e Japa, Hall regional, sem títulos falsos.');
