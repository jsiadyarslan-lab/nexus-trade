// ===== TOAST =====
function showToast(msg,cls=''){
  const t=document.getElementById('toast');
  t.textContent=msg;t.className='toast show '+(cls||'');
  setTimeout(()=>t.classList.remove('show'),3000);
}

