/* Fiscal Generator 2.0 — single document core. Educational simulation only. */
(function(){
  const KEY='fiscal-documents-v2';
  const TYPES={NFE:{label:'NF-e',model:'55'},CTE:{label:'CT-e',model:'57'},MDFE:{label:'MDF-e',model:'58'}};
  const digits=v=>String(v??'').replace(/\D/g,'');
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  function cnpjValid(v){const d=digits(v);if(d.length!==14||/^([0-9])\1+$/.test(d))return false;let s=0;for(let i=0;i<12;i++)s+=+d[i]*(i<4?5-i:13-i);let r=s%11;let x=r<2?0:11-r;if(x!==+d[12])return false;s=0;for(let i=0;i<13;i++)s+=+d[i]*(i<5?6-i:14-i);r=s%11;x=r<2?0:11-r;return x===+d[13]}
  function dv44(k){let sum=0,w=2;for(let i=k.length-1;i>=0;i--){sum+=+k[i]*w;w=w===9?2:w+1}const r=sum%11;return r===0||r===1?0:11-r}
  function key(d){const date=new Date(d.date||Date.now()),uf='33',yy=String(date.getFullYear()).slice(-2),mm=String(date.getMonth()+1).padStart(2,'0'),cnpj=digits(d.cnpj).padStart(14,'0').slice(-14),model=String(d.model||'55').padStart(2,'0'),series=String(d.series||1).padStart(3,'0'),num=digits(d.number).padStart(9,'0').slice(-9),code=digits(d.code||'12345678').padStart(8,'0').slice(-8);const base=`${uf}${yy}${mm}${cnpj}${model}1${series}${num}1${code}`;return base+dv44(base)}
  function load(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}}
  function save(list){localStorage.setItem(KEY,JSON.stringify(list));return list}
  function add(doc){const list=load();list.push(doc);save(list);return doc}
  function get(id){return load().find(x=>x.id===id)}
  function validate(type,d,items=[]){const e=[];if(!d.number)e.push('Informe o número.');if(!d.series)e.push('Informe a série.');if(!d.issuer)e.push('Informe o emitente.');if(!cnpjValid(d.cnpj))e.push('CNPJ do emitente inválido. Use o CNPJ educacional exibido no formulário.');if(type==='NFE'&&!items.length)e.push('Adicione pelo menos um produto.');if(type==='MDFE'&&(!d.vehicle||!d.driver))e.push('Informe veículo e motorista.');return e}
  function create(type,d,items=[]){const errors=validate(type,d,items);if(errors.length)throw new Error(errors[0]);const meta=TYPES[type],now=new Date();const doc={...d,id:`${type}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,type,model:meta.model,createdAt:now.toISOString(),status:'SIMULADO',productLines:items,totalProducts:items.reduce((s,p)=>s+Number(p.total||0),0)};doc.key=key({...doc,code:Math.floor(10000000+Math.random()*89999999)});return add(doc)}
  window.FGCore={TYPES,digits,esc,money,cnpjValid,key,load,save,add,get,validate,create};
})();