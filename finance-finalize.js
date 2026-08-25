/* OCULTO ERP — Fase 3: acabamento funcional do Financeiro */
(function(){
  const KEY='oculto-finance-v1';
  const getData=()=>{try{return JSON.parse(localStorage.getItem(KEY))||[]}catch{return[]}};
  const saveData=(data)=>localStorage.setItem(KEY,JSON.stringify(data));
  const money=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(v)||0);
  const today=()=>new Date().toISOString().slice(0,10);
  const originalRender=window.render;
  function enhance(){
    if(window.current!=='financial' && !document.querySelector('.finance-page')) return;
    const page=document.querySelector('.finance-page'); if(!page) return;
    const list=page.querySelector('.finance-list'); if(!list || list.dataset.finalized) return;
    list.dataset.finalized='1';
    const head=list.querySelector('.card-head');
    const filters=list.querySelector('.finance-filters');
    const search=document.createElement('input');
    search.className='finance-search'; search.type='search'; search.placeholder='Pesquisar lançamento...'; search.setAttribute('aria-label','Pesquisar lançamento');
    head.insertBefore(search,filters);
    const rows=[...list.querySelectorAll('.finance-row')];
    const apply=()=>{
      const q=search.value.trim().toLowerCase();
      rows.forEach(r=>{
        const text=r.textContent.toLowerCase();
        r.style.display=!q||text.includes(q)?'grid':'none';
      });
    };
    search.addEventListener('input',apply);
    rows.forEach(r=>{
      const due=r.children[2]?.textContent||'';
      const id=(r.children[0]?.querySelector('small')?.textContent||'').split(' · ')[0];
      const data=getData().find(x=>x.id===id);
      if(data?.status==='open' && data.due && data.due<today()){
        const pill=r.querySelector('.status-pill');
        if(pill){pill.textContent='Vencido';pill.classList.add('overdue');}
      }
      const action=r.querySelector('.row-action');
      if(action){
        const remove=document.createElement('button');
        remove.className='row-delete'; remove.type='button'; remove.textContent='Excluir'; remove.setAttribute('aria-label','Excluir lançamento');
        remove.onclick=()=>{
          const current=getData(); const next=current.filter(x=>x.id!==id);
          if(next.length===current.length)return;
          if(confirm('Excluir este lançamento?')){saveData(next);window.render();}
        };
        action.after(remove);
      }
    });
    const footer=document.createElement('div'); footer.className='finance-summary';
    const data=getData();
    const open=data.filter(x=>x.status==='open').reduce((s,x)=>s+Number(x.value||0),0);
    const overdue=data.filter(x=>x.status==='open'&&x.due&&x.due<today()).reduce((s,x)=>s+Number(x.value||0),0);
    footer.innerHTML=`<span><b>${data.length}</b> lançamentos</span><span>Em aberto <b>${money(open)}</b></span><span>Vencido <b>${money(overdue)}</b></span>`;
    list.appendChild(footer);
  }
  window.render=function(){originalRender();setTimeout(enhance,0)};
  const boot=()=>setTimeout(enhance,50);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
