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
