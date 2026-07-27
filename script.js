// Mobile nav
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('main-menu');
navToggle?.addEventListener('click', () => {
  const opened = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
});
document.addEventListener('keyup',e=>{
  if(e.key==='Escape')navLinks.classList.remove('open');
});

// Smooth scroll for all anchor links
for(const link of document.querySelectorAll('a[href^="#"]')){
  link.addEventListener('click', e => {
    const target = document.getElementById(link.getAttribute('href').substring(1));
    if(target){
      e.preventDefault();
      target.scrollIntoView({behavior:'smooth'});
    }
    navLinks.classList.remove('open');
  });
}

// IntersectionObserver for .fadein elements
const fadeEls = document.querySelectorAll('.fadein');
const showOnScroll = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add('visible');showOnScroll.unobserve(e.target);}
  });
},{threshold:0.177});
fadeEls.forEach(el=>showOnScroll.observe(el));

// Reduced motion observer
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
if(prefersReduced.matches) fadeEls.forEach(el=>el.classList.add('visible'));
const reduceMotionCB = document.getElementById('reduce-motion');
if (reduceMotionCB) {
  reduceMotionCB.addEventListener('change', function () {
    document.body.classList.toggle('no-animations', this.checked);
    if(this.checked) fadeEls.forEach(el=>el.classList.add('visible'));
  });
}

// Keyboard navigation support cue
window.addEventListener('keydown',function(e){
  if(e.key==='Tab'){document.body.classList.add('kb-nav-cue');}
});

// Predictive search (fake demo)
const searchInputs = [
  document.getElementById('search'),
  document.querySelector('input[name="mobilesearch"]')
];
const predResults = [
  document.getElementById('predictive-results'),
  document.getElementById('mobpredictive-results')
];
const demoKeywords = ['Rare Beauty Blush','ILIA Serum Tint','Korean Skincare','Gift Sets','Fragrance Sampler','Lip Balm','Auto-Replenish Subscription','Clean at Sephora'];
searchInputs.forEach((input,idx)=>{
  if(!input)return;
  input.addEventListener('input',()=>{
    const val=input.value.trim().toLowerCase();
    if(val.length<2){predResults[idx].style.display='none';return;}
    predResults[idx].innerHTML = demoKeywords.filter(k=>k.toLowerCase().includes(val)).map(k=>`<div role='option' tabindex="0">${k}</div>`).join('')||'<div style="opacity:.72">No matches found</div>';
    predResults[idx].style.display='block';
  });
  input.addEventListener('blur',()=>setTimeout(()=>predResults[idx].style.display='none',170));
  predResults[idx]?.addEventListener('mousedown',e=>{
    if(e.target&&e.target.role==='option')input.value=e.target.textContent;predResults[idx].style.display='none';
  });
});

// Chatbot Widget
window.SephoraChat = {
  open: function() {
    chatbotPanel.classList.add('open');
    chatbotToggle.setAttribute('aria-expanded','true');
    chatbotPanel.querySelector('#chatbot-input').focus();
  }
};
const chatbotToggle = document.getElementById('chatbot-toggle');
const chatbotPanel = document.getElementById('chatbot-panel');
const chatbotClose = document.getElementById('chatbot-close');
const chatbotForm = document.getElementById('chatbot-form');
const chatbotInput = document.getElementById('chatbot-input');
const chatbotMsgs = document.getElementById('chatbot-messages');
chatbotToggle.onclick = function(){
  const opened= chatbotPanel.classList.toggle('open');
  chatbotToggle.setAttribute('aria-expanded',opened.toString());
  if(opened){setTimeout(()=>chatbotInput.focus(),180);}
};
chatbotClose.onclick = function(){
  chatbotPanel.classList.remove('open');
  chatbotToggle.setAttribute('aria-expanded','false');
  chatbotToggle.focus();
};
chatbotForm.onsubmit = async function(e){
  e.preventDefault();
  const msg = chatbotInput.value.trim();
  if(!msg)return;
  appendMsg('user',msg);
  chatbotInput.value='';
  chatbotInput.setAttribute('disabled','disabled');
  const reply = await fetchBotReply(msg);
  chatbotInput.removeAttribute('disabled');
  if(reply)appendMsg('bot',reply);
  else appendMsg('bot','Sorry! I didn\'t get that. Try again?');
  chatbotMsgs.scrollTop = chatbotMsgs.scrollHeight;
};
function appendMsg(role, content){
  const d = document.createElement('div');
  d.className=`chat-msg ${role}`;
  d.textContent=content;
  chatbotMsgs.appendChild(d);
  chatbotMsgs.scrollTop = chatbotMsgs.scrollHeight;
}
async function fetchBotReply(msg){
  try{
    const resp=await fetch('https://overstay-choosy-succulent.ngrok-free.dev/webhook/chat',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({message:msg,companyId: 'sephora-repo'})
    });
    if(!resp.ok)return null;
    const data=await resp.json();
    return data.reply;
  }catch(e){return null;}
}
// ESC key to close chat
window.addEventListener('keydown',e=>{
  if(e.key==='Escape' && chatbotPanel.classList.contains('open')){
    chatbotPanel.classList.remove('open');
    chatbotToggle.setAttribute('aria-expanded','false');
    chatbotToggle.focus();
  }
});
// Close chat outside click
window.addEventListener('mousedown',e=>{
  if(chatbotPanel.classList.contains('open') && !chatbotPanel.contains(e.target) && e.target!==chatbotToggle){
    chatbotPanel.classList.remove('open');
    chatbotToggle.setAttribute('aria-expanded','false');
  }
});
// Tab trap
chatbotPanel.addEventListener('keydown',function(e){
  if(e.key==='Tab'){
    var focusables = chatbotPanel.querySelectorAll('input,button,a');
    focusables = Array.prototype.slice.call(focusables);
    var first=focusables[0],last=focusables[focusables.length-1];
    if(e.shiftKey && document.activeElement===first){last.focus();e.preventDefault();}
    else if(!e.shiftKey && document.activeElement===last){first.focus();e.preventDefault();}
  }
});
