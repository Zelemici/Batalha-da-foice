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
  function annualTable({year,mcList=[],brackets=[],season={}}){
    const participants=Array.isArray(season.participants)?season.participants.slice(0,16):[];
    const byId=new Map(mcList.map(m=>[m.id,m]));
    const byName=new Map(mcList.map(m=>[m.name,m]));
    const totals=new Map(participants.filter(id=>byId.has(id)).map(id=>[id,{id,stage:0,bonus:0,manual:0,wins:0,games:0,automatic:0,points:0}]));
    const rule=rules(season.rules);
    for(const b of brackets.filter(b=>b.status==='published'&&String(b.date||'').startsWith(String(year)))){
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
        if(!match.third&&String(match.result.score||'').replace(/\s/g,'').replace(/x/i,'×')==='2×0')row.bonus+=rule.bonus;
      }
    }
    for(const row of totals.values()){
      row.manual=(season.adjustments?.[row.id]||[]).reduce((sum,x)=>sum+Number(x.delta||0),0);
      row.automatic=row.stage+row.bonus;
      row.points=row.automatic+row.manual;
    }
    return [...totals.values()].sort((a,b)=>b.points-a.points||b.wins-a.wins||byId.get(a.id).name.localeCompare(byId.get(b.id).name,'pt-BR'));
  }
  function duelHistory(a,b,brackets=[]){
    const out={a:0,b:0,matches:[]};
    if(!a||!b||a.id===b.id)return out;
    for(const bracket of brackets.filter(br=>br.status==='published')){
      for(const match of bracketRounds(bracket).flat()){
        if(match.third||!match.result?.winner||![match.a,match.c].includes(a.name)||![match.a,match.c].includes(b.name))continue;
        if(match.result.winner===a.name)out.a++;
        else if(match.result.winner===b.name)out.b++;
        else continue;
        out.matches.push({edition:bracket.title,date:bracket.date,score:match.result.score||'',winner:match.result.winner});
      }
    }
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
  root.BDFV10Core={defaults,rules,bracketRounds,annualTable,duelHistory,youtubeId,validVideo,validateV10};
})(globalThis);
