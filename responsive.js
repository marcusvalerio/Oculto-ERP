(function(){
  const MOBILE_BREAKPOINT=767;
  function fitDocument(){
    const wrap=document.querySelector('.paper-wrap, .document-stage');
    const sheet=document.querySelector('.a4-sheet, .a4-document');
    if(!wrap||!sheet)return;
    const mobile=window.innerWidth<=MOBILE_BREAKPOINT;
    sheet.style.transformOrigin='top center';
    if(!mobile){
      sheet.style.transform='scale(1)';
      wrap.style.height='';
      return;
    }
    const available=Math.max(0,wrap.clientWidth-24);
    const naturalWidth=sheet.offsetWidth||794;
    const scale=Math.min(1,available/naturalWidth);
    sheet.style.transform=`scale(${scale})`;
    const naturalHeight=sheet.offsetHeight||1123;
    wrap.style.height=`${Math.ceil(naturalHeight*scale)+24}px`;
  }
  function syncMobileNav(view){
    document.querySelectorAll('.mobile-nav-item').forEach(btn=>btn.classList.toggle('active',btn.dataset.view===view));
  }
  document.querySelectorAll('.mobile-nav-item').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const view=btn.dataset.view;
      if(typeof window.setView==='function')window.setView(view);
      syncMobileNav(view);
      window.scrollTo({top:0,behavior:'smooth'});
    });
  });
  let raf=0;
  function schedule(){cancelAnimationFrame(raf);raf=requestAnimationFrame(fitDocument)}
  new MutationObserver(schedule).observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(schedule,120),{passive:true});
  window.addEventListener('beforeprint',()=>{const s=document.querySelector('.a4-sheet,.a4-document');if(s)s.style.transform='scale(1)'});
  window.addEventListener('afterprint',schedule);
  schedule();
})();
