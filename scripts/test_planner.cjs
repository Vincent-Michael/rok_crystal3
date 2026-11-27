const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const html=fs.readFileSync("index.html","utf8");
const T=JSON.parse(html.match(/<script type="application\/json" id="dataset">([\s\S]*?)<\/script>/)[1]);
const by=Object.fromEntries(T.map(t=>[t.id,t]));
const ctx=vm.createContext({T,by});
vm.runInContext(html.split("/* PLANNER_MODEL_START */")[1].split("/* PLANNER_MODEL_END */")[0],ctx);
const expand=ctx.expandPath,prune=ctx.prunePath,order=ctx.makeResearchOrder;
const empty=Object.fromEntries(T.map(t=>[t.id,0])),full=Object.fromEntries(T.map(t=>[t.id,t.rows.length]));
for(const t of T){
  const r=expand(empty,empty,t.id,t.rows.length,25,true);
  assert.equal(r.ok,true,t.name);
  const seq=order(r.plan,empty,25,[1012,1017]);
  assert.equal(seq.blocked.length,0,t.name);
  assert.equal(seq.steps.length,Object.values(r.plan).reduce((a,b)=>a+b,0));
}
assert.equal(order(full,empty,25,[1012,1017]).steps.length,421);
assert.equal(order(full,empty,25,[]).steps.reduce((s,r)=>s+r.cost,0),150600900);
assert.equal(expand(empty,empty,1041,10,1,true).ok,false);
const p=expand(empty,empty,1041,10,25,true).plan;
const removed=prune(p,empty,1001,0,true);
assert.equal(removed[1001],0);assert.equal(removed[1041],0);
assert.equal(order(removed,empty,25,[]).blocked.length,0);
const free=expand(empty,empty,1041,10,25,false);
assert.equal(free.ok,true);assert.equal(free.plan[1041],10);assert.equal(free.plan[1001],0);
assert.ok(order(free.plan,empty,25,[]).blocked.length>0);
console.log("Planner tests passed: all 45 max paths, complete 421-level order, cascading removal, center limit, and no-prerequisite mode.");

const upgrade=ctx.manualUpgrade,downgrade=ctx.manualDowngrade;
const dependent=T.find(t=>!t.awake&&t.rows[0].pr.length);
assert.ok(dependent);
const noReq=upgrade(empty,empty,dependent.id,1,25,true);
assert.equal(noReq.ok,false);
assert.ok(noReq.errors.length>0);
assert.deepEqual(empty,Object.fromEntries(T.map(t=>[t.id,0])));
const path=expand(empty,empty,dependent.id,1,25,true).plan;
const prereqs={...path,[dependent.id]:0};
const valid=upgrade(prereqs,empty,dependent.id,1,25,true);
assert.equal(valid.ok,true);
const [reqId,reqLv]=dependent.rows[0].pr[0];
assert.equal(downgrade(valid.plan,empty,reqId,reqLv-1,true).ok,false);
assert.equal(downgrade(valid.plan,empty,dependent.id,0,true).ok,true);
assert.equal(upgrade(empty,empty,dependent.id,1,25,false).ok,true);
assert.equal(upgrade(empty,empty,1041,1,1,false).ok,false);
console.log("Manual +/- tests passed: unmet prerequisites blocked, valid add, blocked dependent removal, No Prereqs override, Research Center limit.");

const buildingData=JSON.parse(html.match(/<script type="application\/json" id="buildingDataset">([\s\S]*?)<\/script>/)[1]);
vm.runInContext(html.split("/* BUILDING_MODEL_START */")[1].split("/* BUILDING_MODEL_END */")[0],ctx);
const buildingTotals=ctx.buildingTotals;
assert.equal(buildingTotals(buildingData,1,25,true,true).crystals,3600000);
assert.equal(buildingTotals(buildingData,1,20,true,false).crystals,770000);
assert.equal(buildingTotals(buildingData,20,25,true,false).crystals,1030000);
assert.equal(buildingTotals(buildingData,25,25,true,false).seconds,0);
assert.equal(buildingTotals(buildingData,1,25,false,true).seconds,1214599);
assert.equal(buildingTotals(buildingData,1,25,true,true).seconds,4859201);
assert.equal(buildingTotals(buildingData,1,25,false,false).crystals,0);
console.log("Building calculation tests passed: toggles, target levels, completed levels and construction times.");

assert.equal(ctx.centerDiscount(1),0.001);
assert.equal(ctx.centerDiscount(25),0.05);
assert.equal(ctx.researchNet(1000000,ctx.researchDiscount(25,0),0.15),800000);
assert.equal(ctx.researchNet(1000000,ctx.researchDiscount(25,0),0),950000);
assert.equal(ctx.researchNet(1000000,ctx.researchDiscount(25,2),0.15),780000);
console.log("Research Center discount tests passed: Lv.1, Lv.25, Cutting Corners and additional discounts.");

const verifiedCenterRates=[0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1,1.2,1.4,1.6,1.8,2,2.2,2.4,2.6,2.8,3,3.3,3.6,4,4.5,5];
verifiedCenterRates.forEach((pct,i)=>assert.equal(ctx.centerDiscount(i+1),pct/100));
assert.equal(ctx.researchNet(1000000,ctx.researchDiscount(15,0),0),980000);
assert.equal(ctx.researchNet(1000000,ctx.researchDiscount(20,0),0.15),820000);
console.log("All 25 in-game Research Center discount rates verified.");

assert.equal(ctx.adjustedBuildingTime(19800,98),10000);
assert.equal(ctx.adjustedBuildingTime(19800,0),19800);
assert.equal(Math.floor(ctx.adjustedBuildingTime(1214597,98)/60),10223);
assert.equal(Math.floor(ctx.adjustedBuildingTime(3644602,98)/60),30678);
console.log("Building speed tests passed: separate +98% bonus and KingsCodex adjusted totals.");

const visible=ctx.visibleColumns;
assert.deepEqual(JSON.parse(JSON.stringify(visible(0,1350,21,264,32,213))),{first:1,last:5});
assert.deepEqual(JSON.parse(JSON.stringify(visible(4206,1350,21,264,32,213))),{first:17,last:21});
assert.deepEqual(JSON.parse(JSON.stringify(visible(0,5556,21,264,32,213))),{first:1,last:21});
assert.deepEqual(JSON.parse(JSON.stringify(visible(0,220,21,264,32,213))),{first:1,last:1});
assert.equal(visible(0,0,21,264,32,213),null);
console.log("Navigation tests passed: initial, final, full-width and mobile visible column ranges.");

const orCases=T.flatMap(t=>t.rows.filter(r=>r.relation===1).map(r=>[t.id,r.level]));
assert.deepEqual(orCases,[[1011,1],[1011,5],[1011,8],[1011,10],[1014,8]]);
for(const t of T)for(const r of t.rows){
  const none={...empty};
  assert.equal(ctx.requirementsMet(r,none),r.pr.length===0);
  const all={...empty};for(const [id,n] of r.pr)all[id]=n;
  assert.equal(ctx.requirementsMet(r,all),true);
  for(const [id,n] of r.pr){
    const one={...empty,[id]:n};
    assert.equal(ctx.requirementsMet(r,one),r.relation===1||r.pr.length===1,t.name+" Lv."+r.level);
  }
  if(r.relation!==1&&r.pr.length>1)for(const [id,n] of r.pr)assert.equal(ctx.requirementsMet(r,{...all,[id]:n-1}),false);
}
for(const [id,level] of orCases){
  const row=by[id].rows[level-1],prev={...empty,[id]:level-1},base={...prev};
  assert.equal(upgrade(prev,empty,id,level,25,true).ok,false);
  for(const [req,n] of row.pr){
    const one={...base,[req]:n};
    assert.equal(upgrade(one,empty,id,level,25,true).ok,true);
    const path=expand(empty,empty,req,n,25,true).plan;
    const seeded=expand(path,empty,id,level,25,true);
    assert.equal(seeded.ok,true);
    assert.equal(order(seeded.plan,empty,25,[1012,1017]).blocked.length,0);
    const done={...empty};
    for(const s of order(seeded.plan,empty,25,[]).steps){assert.ok(ctx.requirementsMet(by[s.id].rows[s.level-1],done));done[s.id]=s.level}
    // Check isolated OR row, with earlier research treated as completed.
    const floors={...empty,[id]:level-1};
    const plan={...one,[id]:level};
    assert.equal(downgrade(plan,floors,req,n-1,true).ok,false);
    const alt=row.pr.find(p=>p[0]!==req);
    assert.equal(downgrade({...plan,[alt[0]]:alt[1]},floors,req,n-1,true).ok,true);
  }
  const single=expand(empty,empty,id,level,25,true);
  assert.equal(single.ok,true);
  assert.equal(order(single.plan,empty,25,[1012,1017]).blocked.length,0);
  // A priority path may only choose branches already selected in the plan.
  const [lastId,lastLv]=row.pr.at(-1),seed=expand(empty,empty,lastId,lastLv,25,true).plan;
  const preferred=expand(seed,empty,id,level,25,true).plan;
  assert.equal(expand(empty,empty,id,level,25,true,preferred).ok,true);
}
console.log("Prerequisite tests passed: all 421 rows, all 5 OR gates, every alternative, last-branch removal and valid research order.");
