const KEY='remedy.tasks.v1';
const SETTINGS='remedy.settings.v1';
let tasks=loadTasks();
let settings=loadSettings();
let focusId=null;
let lastDueNotification=0;
const $=id=>document.getElementById(id);
const escapeHtml=s=>String(s).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function loadTasks(){try{return JSON.parse(localStorage.getItem(KEY))||[]}catch{return[]}}
function loadSettings(){try{return JSON.parse(localStorage.getItem(SETTINGS))||{attention:true}}catch{return{attention:true}}}
function persist(){localStorage.setItem(KEY,JSON.stringify(tasks));render()}
function addTask(){const title=$('taskInput').value.trim();if(!title)return;const due=$('dueInput').value;tasks.push({id:crypto.randomUUID(),title,bucket:$('bucketInput').value,priority:Number($('priorityInput').value),dueAt:due?new Date(due).getTime():null,createdAt:Date.now(),done:false});$('taskInput').value='';$('dueInput').value='';persist()}
function complete(id){const t=tasks.find(x=>x.id===id);if(t){t.done=true;t.completedAt=Date.now();persist()}}
function remove(id){tasks=tasks.filter(x=>x.id!==id);persist()}
function active(){return tasks.filter(t=>!t.done)}
function current(){return active().filter(t=>t.bucket==='now').sort(compare)[0]||active().sort(compare)[0]}
function compare(a,b){const ad=a.dueAt||Infinity,bd=b.dueAt||Infinity;return a.priority-b.priority||ad-bd||a.createdAt-b.createdAt}
function dueText(t){if(!t.dueAt)return '';const d=t.dueAt-Date.now();if(d<0)return 'Overdue';if(d<60000)return 'Due now';if(d<3600000)return `Due in ${Math.ceil(d/60000)}m`;if(d<86400000)return `Due in ${Math.ceil(d/3600000)}h`;return `Due ${new Date(t.dueAt).toLocaleDateString(undefined,{month:'short',day:'numeric'})}`}
function render(){
  ['now','next','later'].forEach(bucket=>{const list=tasks.filter(t=>!t.done&&t.bucket===bucket).sort(compare);$(bucket+'Count').textContent=list.length;const el=$(bucket+'Tasks');el.innerHTML=list.length?list.map(t=>`<article class="task ${t.priority===1?'high':''}"><div class="task-main"><div class="task-title">${escapeHtml(t.title)}</div><div class="task-meta"><span class="dot"></span>${t.priority===1?'High':t.priority===2?'Medium':'Low'} ${dueText(t)?`· <span class="${t.dueAt<Date.now()?'overdue':''}">${dueText(t)}</span>`:''}</div></div><div class="task-actions"><button class="icon-btn" data-focus="${t.id}" title="Focus">↗</button><button class="icon-btn" data-complete="${t.id}" title="Complete">✓</button><button class="icon-btn" data-remove="${t.id}" title="Delete">×</button></div></article>`).join(''):'<div class="empty">Nothing here.</div>'});
  const now=current();
  $('nowTitle').textContent=now?now.title:'Nothing urgent.';
  $('nowMeta').textContent=now?(now.bucket==='now'?'This is your current task.':'No task is in Now — this is the highest-priority active task.'):'Add a task and put it in Now.';
  $('completeNow').disabled=!now;
  $('stats').textContent=`${active().length} active · ${tasks.filter(t=>t.done).length} completed`;
  $('attentionTitle').textContent=now?now.title:'Nothing urgent.';
  $('attentionBar').classList.toggle('hidden',!settings.attention||!now);
  $('attentionBtn').classList.toggle('active',settings.attention);
}
function openFocus(id){focusId=id||current()?.id||null;const t=tasks.find(x=>x.id===focusId);$('focusTitle').textContent=t?t.title:'No task selected.';$('focusDialog').showModal()}
function toggleAttention(){settings.attention=!settings.attention;localStorage.setItem(SETTINGS,JSON.stringify(settings));render()}
function notifyDue(){const now=Date.now();if(now-lastDueNotification<60000)return;const due=active().filter(t=>t.dueAt&&t.dueAt<=now).sort(compare)[0];if(due&&'Notification'in window&&Notification.permission==='granted'){new Notification('Remedy: do this now',{body:due.title});lastDueNotification=now}}
$('addBtn').addEventListener('click',addTask);$('taskInput').addEventListener('keydown',e=>{if(e.key==='Enter')addTask()});
$('completeNow').addEventListener('click',()=>{const t=current();if(t)complete(t.id)});
$('attentionComplete').addEventListener('click',()=>{const t=current();if(t)complete(t.id)});
$('attentionBtn').addEventListener('click',toggleAttention);$('focusBtn').addEventListener('click',()=>openFocus());$('closeFocus').addEventListener('click',()=>$('focusDialog').close());
$('focusComplete').addEventListener('click',()=>{if(focusId)complete(focusId);$('focusDialog').close()});$('clearBtn').addEventListener('click',()=>{tasks=tasks.filter(t=>!t.done);persist()});
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.complete)complete(b.dataset.complete);if(b.dataset.remove)remove(b.dataset.remove);if(b.dataset.focus)openFocus(b.dataset.focus)});
if('Notification'in window&&Notification.permission==='default'){document.addEventListener('click',()=>Notification.requestPermission(),{once:true})}
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));
render();setInterval(()=>{render();notifyDue()},30000);
