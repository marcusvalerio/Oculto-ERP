/* Final hardening pass: consistency, persistence and safe study-lab behavior. */
(function(){
  const readDocs=()=>{try{return JSON.parse(localStorage.getItem('fiscal-documents')||'[]')}catch{return[]}};
  const saveDocs=d=>localStorage.setItem('fiscal-documents',JSON.stringify(d));
  const normalizeType=t=>{const s=String(t||'').toUpperCase();return s==='NF-E'||s==='NFE'?'NFE':s==='CT-E'||s==='CTE'?'CTE':s==='MD-FE'||s==='MDFE'?'MDFE':s};

  const docs=readDocs();
  let changed=false;
  docs.forEach(d=>{const n=normalizeType(d.type);if(n&&n!==d.type){d.type=n;changed=true}});
  if(changed)saveDocs(docs);

  // app.js keeps its state in a module-scoped const. Expose a live bridge for
  // document-renderer.js so previews always read the persisted document set.
  window.state=window.state||{};
  Object.defineProperty(window.state,'documents',{configurable:true,get:readDocs,set:saveDocs});

  window.addEventListener('storage',e=>{if(e.key==='fiscal-documents'&&window.state)window.state.documents=readDocs()});

  window.FiscalDrafts={
    key:t=>'fiscal-draft-'+normalizeType(t),
    save(t,data){localStorage.setItem(this.key(t),JSON.stringify(data));return data},
    load(t){try{return JSON.parse(localStorage.getItem(this.key(t))||'null')}catch{return null}},
    clear(t){localStorage.removeItem(this.key(t))}
  };

  window.copyFiscalText=async function(text){try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);return true}const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();const ok=document.execCommand('copy');ta.remove();return ok}catch{return false}};

  if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost')){
    window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
  }

  document.documentElement.dataset.environment='educational-simulation';
  window.FiscalHardening={normalizeType};
})();
