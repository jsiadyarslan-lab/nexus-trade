// ===== LIVE CLOCK =====
function startClock(){
  function update(){
    const now=new Date();
    const hms=`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    const dateStr=now.toLocaleDateString(LANG==='ar'?'ar-SA':'en-US',{month:'short',day:'numeric'});
    const el=document.getElementById('newsClock');
    const del=document.getElementById('newsDate');
    if(el) el.textContent=hms;
    if(del) del.textContent=dateStr;
  }
  update();
  setInterval(update,1000);
}

// ===== INIT =====
