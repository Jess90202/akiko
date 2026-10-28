
(function(){var vs=[].slice.call(document.querySelectorAll('.vf video')),rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
function ld(v){if(!v.src&&v.dataset.src)v.src=v.dataset.src}
function st(v){var f=v.parentNode,b=f.querySelector('.pb');var p=!v.paused;f.classList.toggle('pl',p);b.textContent=p?'❚❚':'▶'}
function pl(v){ld(v);var r=v.play();if(r&&r.catch)r.catch(function(){});}
vs.forEach(function(v){v.addEventListener('play',function(){st(v)});v.addEventListener('pause',function(){st(v)});
v.parentNode.addEventListener('click',function(){v.paused?pl(v):v.pause()})});
var pre=new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting){ld(x.target);pre.unobserve(x.target)}})},{rootMargin:'400px'});
var act=new IntersectionObserver(function(e){e.forEach(function(x){var v=x.target;if(x.isIntersecting&&x.intersectionRatio>=.6){if(!rm)pl(v)}else v.pause()})},{threshold:[0,.6]});
vs.forEach(function(v){pre.observe(v);act.observe(v)});
document.addEventListener('visibilitychange',function(){if(document.hidden)vs.forEach(function(v){v.pause()})});})();
(function(){
var io=new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{threshold:.15});
document.querySelectorAll('.r').forEach(function(el){io.observe(el)});
if(matchMedia('(prefers-reduced-motion: reduce)').matches||!matchMedia('(hover:hover) and (pointer:fine)').matches)return;
var st=document.getElementById('st'),m=document.getElementById('mas'),ch=[].slice.call(st.querySelectorAll('.chip'));
if(!st||!m)return;
var t={x:0,y:0},c={x:0,y:0},v={x:0,y:0},run=false;
addEventListener('pointermove',function(e){var r=st.getBoundingClientRect();t.x=(e.clientX-r.left-r.width/2)/r.width;t.y=(e.clientY-r.top-r.height/2)/r.height;if(!run){run=true;requestAnimationFrame(f)}},{passive:true});
function f(){var k=.08,d=.82;['x','y'].forEach(function(a){v[a]=(v[a]+(t[a]-c[a])*k)*d;c[a]+=v[a]});
m.style.transform='translate('+(c.x*18)+'px,'+(c.y*18)+'px) rotate('+(c.x*5)+'deg)';
ch.forEach(function(el){var q=+el.dataset.d;el.style.transform='translate('+(c.x*-28*q)+'px,'+(c.y*-28*q)+'px)'});
if(Math.abs(v.x)+Math.abs(v.y)+Math.abs(t.x-c.x)+Math.abs(t.y-c.y)>.0005)requestAnimationFrame(f);else run=false}
})();

(function(){
var key='akiko_cookie_consent',banner=document.getElementById('cookie-banner'),toast=null,shown=false,timer=0,sessionKey='akiko_after_hours_seen';
try{shown=sessionStorage.getItem(sessionKey)==='1'}catch(e){}
function consent(){try{return localStorage.getItem(key)}catch(e){return null}}
function closeBanner(value){try{localStorage.setItem(key,value)}catch(e){};banner.classList.remove('show');setTimeout(function(){if(toast)showToast()},300)}
if(banner){if(!consent())setTimeout(function(){banner.classList.add('show')},1600);
var accept=document.getElementById('cookie-accept'),reject=document.getElementById('cookie-reject');
if(accept)accept.addEventListener('click',function(){closeBanner('all')});if(reject)reject.addEventListener('click',function(){closeBanner('essential')})}
function parts(date){var f=new Intl.DateTimeFormat('en-US',{timeZone:'America/Mexico_City',weekday:'short',year:'numeric',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});var o={};f.formatToParts(date).forEach(function(p){o[p.type]=p.value});return o}
var dayIds={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6},dayNames=['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
function opening(){var now=new Date(),p=parts(now),day=dayIds[p.weekday],mins=+p.hour*60 + +p.minute;
var open=day>=1&&day<=5?600:day===6?600:null,close=day>=1&&day<=5?1080:day===6?900:null;
if(open!==null&&mins<open)return {date:now,label:'hoy a las 10:00'};
var d=new Date(now);d.setUTCDate(d.getUTCDate()+1);
for(var n=0;n<7;n++){var q=parts(d),wd=dayIds[q.weekday];if(wd>=1&&wd<=6){var label=wd===1&&day===0?'el lunes a las 10:00':n===0?'mañana a las 10:00':'el '+dayNames[wd]+' a las 10:00';return {date:d,label:label}}d.setUTCDate(d.getUTCDate()+1)}
return {date:d,label:'el lunes a las 10:00'}
}
var z=parts(new Date()),today=dayIds[z.weekday],minute=+z.hour*60 + +z.minute,isOpen=today>=1&&today<=5?minute>=600&&minute<1080:today===6?minute>=600&&minute<900:false;
if(!isOpen&&!shown){toast=document.createElement('aside');toast.id='after-hours';toast.setAttribute('role','status');var next=opening();toast.innerHTML='<img src="assets/home/img/sleep.webp" width="56" height="56" alt="" decoding="async"><div><strong>Akiko está descansando 😴</strong><p>Escríbenos y te respondemos en cuanto abramos: '+next.label+'</p><a class="btn" href="https://wa.me/525515338822?text=Hola%20Akiko%2C%20me%20gustar%C3%ADa%20pedir%20informes">Escribir por WhatsApp</a></div><button class="close" type="button" aria-label="Cerrar aviso">×</button>';document.body.appendChild(toast);
function hide(){if(!toast.classList.contains('show'))return;toast.classList.add('leaving');setTimeout(function(){toast.remove()},180);try{sessionStorage.setItem(sessionKey,'1')}catch(e){}}
function showToast(){if(!toast||shown)return;shown=true;try{sessionStorage.setItem(sessionKey,'1')}catch(e){};requestAnimationFrame(function(){toast.classList.add('show')});timer=setTimeout(hide,12000)}
toast.querySelector('.close').addEventListener('click',hide);if(banner&&!consent()){banner.addEventListener('transitionend',function(e){if(e.propertyName==='transform'&&!banner.classList.contains('show'))showToast()})}else setTimeout(showToast,1200)
}
})();

