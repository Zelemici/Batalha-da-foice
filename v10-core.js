/* Batalha da Foice V10 — regras puras para navegador e testes (sem alterar a V9). */
(function(root){
  'use strict';
  const defaults=Object.freeze({segunda:2,semi:4,final:7,campeao:10,bonus:1});
  function rules(r){return Object.fromEntries(Object.keys(defaults).map(k=>[k,Number.isFinite(Number(r?.[k]))?Number(r[k]):defaults[k]]));}
  function bracketRounds(b){
    const triples=b?.triples||{},results=b?.results||{};
    let active=(b?.players||[]).map(n=>String(n||''));
    const rounds=[];
    for(let round=0;active.length>1;round++){
      const matches=[],next=[];
      for(let i=0;i<active.length;i+=2){
        const a=active[i],c=active[i+1],key=round+'-'+(i/2),third=String(triples[key]||'');
        const participants=[a,c,third].filter(Boolean);
        const raw=results[key];
        const valid=Boolean(a&&c&&raw?.winner&&participants.includes(raw.winner));
        matches.push({a,c,third,participants,key,r:round,i:i/2,result:valid?raw:null});
        next.push(valid?raw.winner:'');
      }
      rounds.push(matches);active=next;
    }
    return rounds;
  }

  // Ao alterar um participante ou vencedor, apenas o ramo afetado perde os
  // placares anteriores. Resultados de outros confrontos são preservados.
  function invalidateBracketPath(b,key){
    const match=/^(\d+)-(\d+)$/.exec(String(key));
    if(!match)throw Error('Identificador de confronto inválido');
    if(!b.results||typeof b.results!=='object')b.results={};
    const size=Array.isArray(b.players)?b.players.length:0;
    const rounds=Math.log2(size);
    let r=Number(match[1]),i=Number(match[2]);
    if(!Number.isInteger(rounds)||r>=rounds||i>=size/(2**(r+1)))throw Error('Confronto fora da chave');
    for(;r<rounds;r++,i=Math.floor(i/2))delete b.results[r+'-'+i];
    return b;
  }
  function setBracketResult(b,key,result){
    const match=bracketRounds(b).flat().find(x=>x.key===key);
    if(!match||!match.a||!match.c)throw Error('Selecione os MCs deste confronto primeiro');
    if(!result?.winner){invalidateBracketPath(b,key);return b;}
    if(!match.participants.includes(result.winner))throw Error('Vencedor precisa participar do confronto');
    const raw={winner:result.winner,score:String(result.score||'')};
    if(match.third){
      const pts=result.points;
      if(!Array.isArray(pts)||pts.length!==3||pts.some(n=>!Number.isInteger(n)||n<0||n>99))
        throw Error('Informe os três placares do Double Three');
      const highest=Math.max(...pts);
      if(pts[match.participants.indexOf(result.winner)]!==highest)
        throw Error('O vencedor precisa ter a maior pontuação');
      raw.points=[...pts];raw.score=pts.join(' × ');
    }else if(!['2×0','2×1','W.O.'].includes(raw.score))
      throw Error('Selecione o placar do confronto');
    if(b.results?.[key]?.winner!==raw.winner)invalidateBracketPath(b,key);
    if(!b.results)b.results={};
    b.results[key]=raw;
    return b;
  }

  // Permite incluir novos MCs pela própria chave, sem atribuir títulos.
  // Prepara o cadastro sem modificar a lista real até o administrador salvar.
  function mcNameKey(value){
    return String(value||'').replace(/\s+/g,' ').trim().toLocaleLowerCase('pt-BR');
  }
  function canonicalMCName(value,mcList=[]){
    const text=String(value||'').replace(/\s+/g,' ').trim();
    return mcList.find(m=>mcNameKey(m.name)===mcNameKey(text))?.name||text;
  }
  function prepareBracketRegistrations(bracket,mcList=[],idFactory){
    if(!Array.isArray(bracket?.players)||!Array.isArray(mcList))throw Error('Chave ou cadastro inválido');
    const draft=structuredClone(bracket),names=new Map(mcList.map(m=>[mcNameKey(m.name),m.name]));
    const created=[];
    const nextName=value=>{
      const text=String(value||'').replace(/\s+/g,' ').trim();
      if(!text)return '';
      if(text.length>100||/[\x00-\x1f<>]/.test(text))throw Error('Nome de MC inválido: use até 100 caracteres, sem símbolos de código.');
      const key=mcNameKey(text);
      if(names.has(key))return names.get(key);
      const id=idFactory?idFactory():('m'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10));
      if(!id||mcList.some(m=>m.id===id)||created.some(m=>m.id===id))throw Error('ID de MC duplicado');
      const mc={id,name:text,city:'',photo:'',titles:{},unknownTitles:0};
      created.push(mc);names.set(key,text);
      return text;
    };
    draft.players=draft.players.map(nextName);
    draft.triples=Object.fromEntries(Object.entries(draft.triples||{})
      .map(([key,value])=>[key,nextName(value)]).filter(([,value])=>value));
    const participants=[...draft.players.filter(Boolean),
      ...Object.entries(draft.triples).filter(([k])=>k.startsWith('0-')).map(([,v])=>v)];
    if(new Set(participants.map(mcNameKey)).size!==participants.length)
      throw Error('Um MC não pode ocupar duas vagas na primeira fase.');
    draft.results=Object.fromEntries(Object.entries(draft.results||{}).map(([key,result])=>{
      if(!result||!result.winner)return [key,result];
      const winner=names.get(mcNameKey(result.winner))||result.winner;
      return [key,{...result,winner}];
    }));
    if(mcList.length+created.length>5000)throw Error('Limite de MCs cadastrados atingido');
    return {bracket:draft,created};
  }
  function annualTable({year,mcList=[],brackets=[],season={}}){
    // A temporada começa vazia. Participantes entram somente quando um
    // chaveamento é publicado com a opção "Contar no Ranking Anual" marcada.
    // Edições antigas sem essa marca não são importadas retroativamente.
    const byId=new Map(mcList.map(m=>[m.id,m]));
    const byName=new Map(mcList.map(m=>[m.name,m]));
    const included=brackets.filter(b=>b.status==='published'&&b.countAnnual===true&&String(b.date||'').startsWith(String(year)));
    const participants=new Set();
    for(const b of included){
      for(const match of bracketRounds(b).flat()){
        for(const name of match.participants){
          const m=byName.get(name);
          if(m)participants.add(m.id);
        }
      }
    }
    const totals=new Map([...participants].map(id=>[id,{id,stage:0,bonus:0,manual:0,wins:0,games:0,automatic:0,points:0}]));
    const rule=rules(season.rules);
    for(const b of included){
      const rounds=bracketRounds(b),highest=new Map();
      rounds.forEach((matches,r)=>matches.forEach(match=>{
        for(const n of match.participants){const m=byName.get(n);if(m)highest.set(m.id,Math.max(r,highest.get(m.id)??-1));}
      }));
      const final=rounds.at(-1)?.[0];
      for(const [id,r] of highest){
        const row=totals.get(id),mc=byId.get(id);
        if(!row)continue;
        const stage=r===rounds.length-1
          ?final?.result?.winner===mc.name?'campeao':'final'
          :r===rounds.length-2?'semi':r>0?'segunda':null;
        row.stage+=stage?rule[stage]:0;
      }
      for(const match of rounds.flat()){
        if(!match.result?.winner)continue;
        for(const n of match.participants){
          const m=byName.get(n),row=m&&totals.get(m.id);if(row)row.games++;
        }
        const m=byName.get(match.result.winner),row=m&&totals.get(m.id);
        if(!row)continue;
        row.wins++;
        if(!match.third&&match.r<2&&String(match.result.score||'').replace(/\s/g,'').replace(/x/i,'×')==='2×0')row.bonus+=rule.bonus;
      }
    }
    for(const row of totals.values()){
      row.manual=(season.adjustments?.[row.id]||[]).reduce((sum,x)=>sum+Number(x.delta||0),0);
      row.automatic=row.stage+row.bonus;
      row.points=row.automatic+row.manual;
    }
    return [...totals.values()].sort((a,b)=>b.points-a.points||b.wins-a.wins||byId.get(a.id).name.localeCompare(byId.get(b.id).name,'pt-BR')).slice(0,16);
  }
  // Resultados avulsos usam IDs estáveis de MC, não dependem de chaves históricas.
  // O ADM deve registrar apenas confrontos que não constem de um chaveamento.
  // Participação nos títulos registrados, distinta do win rate de batalhas.
  // Considera todos os MCs cadastrados e também títulos sem data.
  function titleCount(m){
    return Object.values(m?.titles||{}).reduce((sum,n)=>sum+(Number(n)||0),0)+Math.max(0,Number(m?.unknownTitles)||0);
  }
  function titleShare(m,mcList=[]){
    const registered=mcList.reduce((sum,member)=>sum+titleCount(member),0);
    return registered>0?100*titleCount(m)/registered:0;
  }
  function isTwoZero(score){return /^2\s*[×xX-]\s*0$/.test(String(score||'').trim());}
  function completedBattles(brackets=[],manualDuels=[],mcList=[]){
    const byName=new Map(mcList.map(m=>[m.name,m.id]));
    const out=[];
    for(const br of brackets.filter(b=>b.status==='published')){
      for(const m of bracketRounds(br).flat()){
        if(!m.result?.winner||m.participants.length<2)continue;
        const ids=m.participants.map(n=>byName.get(n));
        const winnerId=byName.get(m.result.winner);
        if(ids.some(x=>!x)||!winnerId)continue;
        out.push({id:'br:'+br.id+':'+m.key,ids,winnerId,score:m.result.score||'',
          edition:br.title||'',date:br.date||'',source:'chaveamento'});
      }
    }
    for(const d of manualDuels||[]){
      if(!d||!d.aId||!d.bId||d.aId===d.bId||![d.aId,d.bId].includes(d.winnerId))continue;
      out.push({id:'manual:'+d.id,ids:[d.aId,d.bId],winnerId:d.winnerId,
        score:String(d.score||''),edition:String(d.edition||'Confronto antigo'),
        date:String(d.date||''),source:'manual'});
    }
    return out;
  }
  function duelHistory(a,b,brackets=[],manualDuels=[],mcList=[]){
    const out={a:0,b:0,matches:[],aRate:0,bRate:0};
    if(!a||!b||a.id===b.id)return out;
    const names=mcList.length?mcList:[a,b];
    for(const m of completedBattles(brackets,manualDuels,names)){
      if(m.ids.length!==2||!m.ids.includes(a.id)||!m.ids.includes(b.id))continue;
      if(m.winnerId===a.id)out.a++;
      else if(m.winnerId===b.id)out.b++;
      else continue;
      out.matches.push({id:m.id,edition:m.edition,date:m.date,score:m.score,
        winner:m.winnerId===a.id?a.name:b.name,source:m.source});
    }
    const count=out.a+out.b;
    out.aRate=count?Math.round(1000*out.a/count)/10:0;
    out.bRate=count?Math.round(1000*out.b/count)/10:0;
    out.matches.sort((x,y)=>String(y.date).localeCompare(String(x.date)));
    return out;
  }
  function mcCareer(m,mcList=[],brackets=[],manualDuels=[]){
    const out={games:0,wins:0,losses:0,winRate:0,twoZero:0};
    if(!m)return out;
    for(const battle of completedBattles(brackets,manualDuels,mcList)){
      if(!battle.ids.includes(m.id))continue;
      out.games++;
      if(battle.winnerId===m.id){out.wins++;
        if(battle.ids.length===2&&isTwoZero(battle.score))out.twoZero++;
      }else out.losses++;
    }
    out.winRate=out.games?Math.round(1000*out.wins/out.games)/10:0;
    return out;
  }
  function youtubeId(value){
    try{
      const u=new URL(value);let id='';
      if(u.hostname==='youtu.be')id=u.pathname.slice(1);
      else if(['youtube.com','www.youtube.com','m.youtube.com'].includes(u.hostname))
        id=u.searchParams.get('v')||((u.pathname.startsWith('/shorts/')||u.pathname.startsWith('/embed/'))?u.pathname.split('/')[2]:'');
      return /^[a-zA-Z0-9_-]{11}$/.test(id||'')?id:null;
    }catch{return null;}
  }
  function validVideo(v){
    return Boolean(v&&typeof v.title==='string'&&v.title.length<=140&&(
      v.kind==='youtube'&&youtubeId(v.url)||
      v.kind==='upload'&&/^\/api\/video\/[a-f0-9-]{36}\.(mp4|webm)$/.test(v.url||'')
    ));
  }
  function validateV10(d){
    const issues=[],ids=new Set((d?.data||[]).map(m=>m.id)),names=new Set((d?.data||[]).map(m=>m.name));
    for(const m of d?.data||[]){
      if(m.tags&&(!Array.isArray(m.tags)||m.tags.length>30||m.tags.some(t=>typeof t!=='string'||t.length>60)))issues.push('Tags inválidas para '+m.name);
      if(m.videos&&(!Array.isArray(m.videos)||m.videos.length>100||m.videos.some(v=>!validVideo(v))))issues.push('Vídeos inválidos para '+m.name);
    }
    for(const b of d?.brackets||[]){
      const triples=b.triples||{};if(!triples||typeof triples!=='object'||Array.isArray(triples)){issues.push('Double Three inválido');continue;}
      const slots=new Set();
      for(const [key,mc] of Object.entries(triples)){
        if(!/^[0-3]-(0|[1-9]\d*)$/.test(key)||!names.has(mc))issues.push('Terceiro MC inválido no torneio '+(b.title||''));
        if(key.startsWith('0-')&&slots.has(mc))issues.push('MC repetido nos confrontos iniciais');
        if(key.startsWith('0-'))slots.add(mc);
      }
      if((b.players||[]).some(n=>slots.has(n)))issues.push('MC repetido na primeira fase');
      for(const match of bracketRounds(b).flat()){
        if(match.third&&(!match.a||!match.c||new Set(match.participants).size!==3))issues.push('Double Three com participantes inválidos');
        const pts=match.result?.points;
        if(pts&&(!Array.isArray(pts)||pts.length!==match.participants.length||pts.some(x=>!Number.isInteger(x)||x<0||x>99)))issues.push('Placar individual inválido');
        if(match.third&&match.result&&(!pts||pts.length!==3))issues.push('Double Three exige três placares');
      }
    }
    const duels=d?.cfg?.v10?.manualDuels||[];
    if(!Array.isArray(duels)||duels.length>10000)issues.push('Histórico manual de confrontos inválido');
    else{
      const seenDuels=new Set();
      for(const duel of duels){
        if(!duel||typeof duel.id!=='string'||!/^[a-zA-Z0-9_-]{1,80}$/.test(duel.id)||seenDuels.has(duel.id)||
           !ids.has(duel.aId)||!ids.has(duel.bId)||duel.aId===duel.bId||
           ![duel.aId,duel.bId].includes(duel.winnerId)||
           typeof duel.score!=='string'||!['2×0','2×1','W.O.','Outro'].includes(duel.score)||
           typeof duel.edition!=='string'||!duel.edition.trim()||duel.edition.length>150||
           typeof duel.date!=='string'||(duel.date&&!/^\d{4}-\d{2}-\d{2}$/.test(duel.date)))
           issues.push('Resultado de confronto manual inválido');
        if(duel?.id)seenDuels.add(duel.id);
      }
    }
    const seasons=d?.cfg?.v10?.seasons||{};
    if(seasons&&typeof seasons==='object'&&!Array.isArray(seasons)){
      for(const [year,s] of Object.entries(seasons)){
        if(!/^\d{4}$/.test(year)||!Array.isArray(s?.participants)||s.participants.length>16||s.participants.some(id=>!ids.has(id))||new Set(s.participants).size!==s.participants.length)issues.push('Ranking anual com participantes inválidos');
        for(const [key,value] of Object.entries(s?.rules||{}))if(!(key in defaults)||!Number.isInteger(value)||value<0||value>1000)issues.push('Regra de pontuação inválida');
        for(const [id,entries] of Object.entries(s?.adjustments||{})){
          if(!ids.has(id)||!Array.isArray(entries)||entries.length>300||entries.some(x=>!Number.isInteger(x.delta)||Math.abs(x.delta)>10000||typeof x.reason!=='string'||!x.reason.trim()||x.reason.length>200))issues.push('Ajuste manual de pontuação inválido');
        }
      }
    }else issues.push('Configuração anual inválida');
    return [...new Set(issues)];
  }
  root.BDFV10Core={defaults,rules,bracketRounds,invalidateBracketPath,setBracketResult,mcNameKey,canonicalMCName,prepareBracketRegistrations,annualTable,duelHistory,mcCareer,completedBattles,titleCount,titleShare,isTwoZero,youtubeId,validVideo,validateV10};
})(globalThis);
