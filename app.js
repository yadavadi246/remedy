const KEY='remedy.tasks.v1';
let tasks=load();
let focusId=null;

const $=id=>document.getElementById(id);
const escapeHtml=s=>s.replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function load(){try{return JSON.parse(localStorage.getItem(KEY))||[]}catch{return[]}}
function save(){localStorage.setItem(KEY,JSON.stringify(tasks));render()}
function addTask(){const title=$('taskInput').value.trim();if(!title)return;tasks.push({id:crypto.randomUUID(),title,bucket:$('bucketInput').value,priority:Number($('priorityInput').value),createdAt:Date.now(),done:false});$('taskInput').value='';save()}
function complete(id){const t=tasks.find(x=>x.id===id);if(t){t.done=true;t.completedAt=Date.now();save()}}
function remove(id){tasks=tasks.filter(x=>x.id!==id);save()}
function move(id,bucket){const t=tasks.find(x=>x.id===id);if(t){t.bucket=bucket;save()}}
function active(){return tasks.filter(t=>!t.done)}
function current(){return active().filter(t=>t.bucket==='now').sort((a,b)=>a.priority-b.priority||a.createdAt-b.createdAt)[0]||active().sort((a,b)=>a.priority-b.priority||a.createdAt-b.createdAt)[0]}
function render(){
  ['now','next','later'].forEach(bucket=>{
    const list=tasks.filter(t=>!t.done&&t.bucket===bucket).sort((a,b)=>a.priority-b.priority||a.createdAt-b.createdAt);
    $(bucket+'Count').textContent=list.length;
    const el=$(bucket+'Tasks');
    el.innerHTML=list.length?list.map(t=>`<article class="task ${t.priority===1?'high':''}"><div class="task-main"><div class="task-title">${escapeHtml(t.title)}</div><div class="task-meta"><span class="dot"></span>${t.priority===1?'High':t.priority===2?'Medium':'Low'}</div></div><div class="task-actions"><button class="icon-btn" data-focus="${t.id}" title="Focus">↗</button><button class="icon-btn" data-complete="${t.id}" title="Complete">✓</button><button class="icon-btn" data-remove="${t.id}" title="Delete">×</button></div></article>`).join(''):'<div class="empty">Nothing here.</div>';
  });
  const now=current();
  $('nowTitle').textContent=now?now.title:'Nothing urgent.';
  $('nowMeta').textContent=now?(now.bucket==='now'?'This is your current task.':'No task is in Now — this is the highest-priority active task.'):'Add a task and put it in Now.';
  $('completeNow').disabled=!now;
  $('stats').textContent=`${active().length} active · ${tasks.filter(t=>t.done).length} completed`;
}
function openFocus(id){focusId=id||current()?.id||null;const t=tasks.find(x=>x.id===focusId);$('focusTitle').textContent=t?t.title:'No task selected.';$('focusDialog').showModal()}
$('addBtn').addEventListener('click',addTask);$('taskInput').addEventListener('keydown',e=>{if(e.key==='Enter')addTask()});
$('completeNow').addEventListener('click',()=>{const t=current();if(t)complete(t.id)});
$('focusBtn').addEventListener('click',()=>openFocus());$('closeFocus').addEventListener('click',()=>$('focusDialog').close());
$('focusComplete').addEventListener('click',()=>{if(focusId)complete(focusId);$('focusDialog').close()});
$('clearBtn').addEventListener('click',()=>{tasks=tasks.filter(t=>!t.done);save()});
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.complete)complete(b.dataset.complete);if(b.dataset.remove)remove(b.dataset.remove);if(b.dataset.focus)openFocus(b.dataset.focus)});
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));
render();
