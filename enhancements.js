/* Fiscal Generator 3.0 — integration, validation and study-lab enhancements. */
(function(){
  const app=document.getElementById('app');
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const docs=()=>JSON.parse(localStorage.getItem('fiscal-documents')||'[]');
  const saveDocs=d=>localStorage.setItem('fiscal-documents',JSON.stringify(d));
  const money=n=>Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});

  function validDemoScenario(){
    const now=new Date(), date=now.toLocaleDateString('pt-BR');
    const issuer='Empresa de Estudo LTDA', cnpj='00.000.000/0001-91';
    const recipient='Cliente de Estudo LTDA', recipientDoc='11.111.111/0001-91';
    const nf={id:'NFE-DEMO-000001',type:'NFE',number:'000001',series:'1',date,createdAt:now.toISOString(),issuer,cnpj,issuerIE:'ISENTO',recipient,recipientDoc,uf:'RJ',product:'Mercadoria para estudo',qty:'2',unit:'150',ncm:'0000.00.00',cfop:'5102',cst:'102',payment:'À vista',status:'SIMULADO',model:'55'};
    nf.key=FiscalEngine.key({uf:'RJ',date:now,cnpj,model:'55',series:'1',number:'000000001',code:'12345678'});
    const ct={id:'CTE-DEMO-000001',type:'CTE',number:'000001',series:'1',date,createdAt:now.toISOString(),issuer:'Transportes de Estudo LTDA',cnpj:'22.222.222/0001-91',issuerIE:'ISENTO',recipient,recipientDoc,uf:'RJ',sender:issuer,receiver:recipient,origin:'Rio de Janeiro/RJ',destination:'São Paulo/SP',freight:'450',cargo:'300',weight:'120',nature:'Carga geral',relatedNfeId:nf.id,status:'SIMULADO',model:'57'};
    ct.key=FiscalEngine.key({uf:'RJ',date:now,cnpj:ct.cnpj,model:'57',series:'1',number:'000000001',code:'22345678'});
    const md={id:'MDFE-DEMO-000001',type:'MDFE',number:'000001',series:'1',date,createdAt:now.toISOString(),issuer:'Transportes de Estudo LTDA',cnpj:ct.cnpj,issuerIE:'ISENTO',uf:'RJ',vehicle:'ABC1D23',driver:'Motorista de Estudo',origin:'RJ',destination:'SP',route:'RJ → SP',documents:'NF-e 000001 / CT-e 000001',weight:'120',value:'300',relatedNfeId:nf.id,relatedCteId:ct.id,status:'SIMULADO',model:'58'};
    md.key=FiscalEngine.key({uf:'RJ',date:now,cnpj:md.cnpj,model:'58',series:'1',number:'000000001',code:'32345678'});
    return [nf,ct,md];
  }

  window.createStudyScenario=function(){const existing=docs().filter(d=>!String(d.id).startsWith('NFE-DEMO-')&&!String(d.id).startsWith('CTE-DEMO-')&&!String(d.id).startsWith('MDFE-DEMO-'));saveDocs(existing.concat(validDemoScenario()));if(window.toast)toast('Cenário completo criado com NF-e, CT-e e MDF-e relacionados.');if(window.setView)window.setView('documents')};

  function submitDoc(type){
    const form=document.getElementById('doc-form');if(!form)return;
    const d=Object.fromEntries(new FormData(form).entries());
    const errors=[];
    if(!d.number||!d.series)errors.push('Número e série são obrigatórios.');
    if(!d.issuer)errors.push('Emitente é obrigatório.');
    if(!d.cnpj||!FiscalEngine.validCNPJ(d.cnpj))errors.push('Informe um CNPJ estruturalmente válido para o estudo.');
    if(d.recipientDoc&&FiscalEngine.onlyDigits(d.recipientDoc).length===14&&!FiscalEngine.validCNPJ(d.recipientDoc))errors.push('CNPJ do destinatário inválido.');
    if(type==='nfe'&&(!d.product||Number(d.qty)<=0||Number(d.unit)<0))errors.push('Produto, quantidade e valor unitário precisam ser válidos.');
    if(type==='cte'&&Number(d.freight)<0)errors.push('Frete não pode ser negativo.');
    if(type==='mdfe'&&!d.vehicle)errors.push('Veículo é obrigatório.');
    if(errors.length){if(window.toast)toast(errors[0]);return}
    const now=new Date(), model=type==='nfe'?'55':type==='cte'?'57':'58', internal=type.toUpperCase(), number=String(d.number).replace(/\D/g,'').padStart(9,'0');
    const key=FiscalEngine.key({uf:d.uf||'RJ',date:now,cnpj:d.cnpj,model,series:d.series,number,code:String(Math.floor(Math.random()*90000000)+10000000)});
    const productLines=type==='nfe'?[{code:'001',description:d.product,ncm:d.ncm||'',cfop:d.cfop||'',unit:'UN',qty:Number(d.qty||0),unitPrice:Number(d.unit||0),total:Number(d.qty||0)*Number(d.unit||0)}]:[];
    const doc={...d,id:`${internal}-${Date.now()}`,type:internal,date:now.toLocaleDateString('pt-BR'),createdAt:now.toISOString(),key,status:'VALIDADO — SIMULAÇÃO',model,productLines,totalProducts:productLines.reduce((a,p)=>a+p.total,0)};
    const all=docs();all.push(doc);saveDocs(all);if(window.toast)toast('Documento validado e gerado em modo simulação.');setTimeout(()=>window.preview&&window.preview(doc.id),100);
  }
  window.submitDoc=submitDoc;

  function injectNfeProducts(){
    if(window.state?.view!=='nfe'||document.querySelector('.product-lab'))return;
    const form=document.getElementById('doc-form');if(!form)return;
    const first=form.querySelector('#product')?.closest('.field');
    if(!first)return;
    const box=document.createElement('div');box.className='card product-lab';box.style.gridColumn='1 / -1';box.innerHTML=`<div class="card-head"><div><div class="card-title">Itens da NF-e</div><span class="muted">Adicione vários produtos para o estudo do DANFE.</span></div><button class="secondary" type="button" id="add-product">Adicionar item</button></div><div class="table-scroll"><table class="table"><thead><tr><th>Código</th><th>Descrição</th><th>NCM</th><th>CFOP</th><th>Qtd.</th><th>Unit.</th><th>Total</th><th></th></tr></thead><tbody id="product-rows"></tbody></table></div>`;
    form.parentElement.insertBefore(box,form);
    const rows=box.querySelector('#product-rows');
    function addRow(p={}){const tr=document.createElement('tr');tr.innerHTML=`<td><input class="mini" value="${esc(p.code||'001')}"></td><td><input class="mini" value="${esc(p.description||document.getElementById('product')?.value||'Mercadoria para estudo')}"></td><td><input class="mini" value="${esc(p.ncm||document.getElementById('ncm')?.value||'0000.00.00')}"></td><td><input class="mini" value="${esc(p.cfop||document.getElementById('cfop')?.value||'5102')}"></td><td><input class="mini" type="number" min="0" step="0.01" value="${p.qty||document.getElementById('qty')?.value||1}"></td><td><input class="mini" type="number" min="0" step="0.01" value="${p.unitPrice||document.getElementById('unit')?.value||0}"></td><td class="line-total">R$ 0,00</td><td><button class="icon-btn" type="button">Remover</button></td>`;const inputs=[...tr.querySelectorAll('input')];const calc=()=>tr.querySelector('.line-total').textContent=money(Number(inputs[4].value)*Number(inputs[5].value));inputs.forEach(i=>i.addEventListener('input',calc));tr.querySelector('button').onclick=()=>{tr.remove()};rows.appendChild(tr);calc()}
    addRow();box.querySelector('#add-product').onclick=()=>addRow();
  }

  function renderCadastros(){
    const data=LabStore.load();
    const defs=[['companies','Empresas',['name','cnpj','ie','city','uf']],['customers','Clientes',['name','doc','city','uf']],['products','Produtos',['code','description','ncm','cfop','unit','price']],['carriers','Transportadoras',['name','cnpj']],['vehicles','Veículos',['plate','renavam','uf']],['drivers','Motoristas',['name','doc']]];
    app.innerHTML=`<div class="page-head"><div><div class="eyebrow">Base de estudo</div><h1>Cadastros</h1><div class="muted">Dados reutilizáveis pelos documentos simulados.</div></div><div class="toolbar-actions"><button class="secondary" onclick="LabStore.export();toast('Ambiente exportado.')">Exportar</button><label class="secondary file-label">Importar<input type="file" accept="application/json" hidden></label></div></div><div class="grid">${defs.map(([key,title,fields])=>`<div class="card registry" data-registry="${key}"><div class="card-head"><div><div class="card-title">${title}</div><span class="muted">${data[key]?.length||0} registros</span></div><button class="secondary add-reg" data-key="${key}">Adicionar</button></div><div class="registry-list">${(data[key]||[]).map((item,i)=>`<div class="registry-row"><div><strong>${esc(item.name||item.description||item.code||item.plate||'Registro')}</strong><span>${esc(item.cnpj||item.doc||item.city||item.uf||'')}</span></div><button class="icon-btn delete-reg" data-key="${key}" data-index="${i}">Excluir</button></div>`).join('')}</div></div>`).join('')}</div><div class="card"><div class="card-title">Cenário completo</div><p class="muted">Gera uma NF-e, um CT-e e um MDF-e com relacionamentos entre os documentos.</p><button class="primary" onclick="createStudyScenario()">Gerar cenário completo</button></div>`;
    app.querySelector('.file-label input').onchange=e=>LabStore.import(e.target.files[0]).then(()=>renderCadastros()).catch(()=>toast('Arquivo inválido.'));
    app.querySelectorAll('.add-reg').forEach(b=>b.onclick=()=>addRegistry(b.dataset.key));
    app.querySelectorAll('.delete-reg').forEach(b=>b.onclick=()=>{const d=LabStore.load();d[b.dataset.key].splice(Number(b.dataset.index),1);LabStore.save(d);renderCadastros()});
  }
  function addRegistry(key){const fields={companies:['name','cnpj','ie','city','uf'],customers:['name','doc','city','uf'],products:['code','description','ncm','cfop','unit','price'],carriers:['name','cnpj'],vehicles:['plate','renavam','uf'],drivers:['name','doc']}[key];const title=key==='companies'?'Empresa':key==='customers'?'Cliente':key==='products'?'Produto':key==='carriers'?'Transportadora':key==='vehicles'?'Veículo':'Motorista';const values={};for(const f of fields){const v=prompt(`${title} — ${f}`);if(v===null)return;values[f]=v}values.id=`${key}-${Date.now()}`;const d=LabStore.load();d[key].push(values);LabStore.save(d);renderCadastros()}

  function injectXmlButtons(){
    if(window.state?.view!=='documents')return;
    document.querySelectorAll('.table tbody tr').forEach(tr=>{if(tr.querySelector('.xml-row-btn'))return;const button=tr.querySelector('button');if(!button)return;const text=tr.querySelector('td:nth-child(2)')?.textContent?.trim();const d=docs().find(x=>String(x.number)===String(text));if(!d)return;const b=document.createElement('button');b.className='secondary xml-row-btn';b.textContent='XML';b.onclick=()=>showXml(d.id);button.parentElement.appendChild(b)})
  }
  function showXml(id){const d=docs().find(x=>x.id===id);if(!d)return;const xml=XmlEngine.generate(d);app.innerHTML=`<div class="document-toolbar"><div><div class="eyebrow">Laboratório fiscal</div><h1>XML simulado</h1><div class="muted">Documento ${esc(d.type)} ${esc(d.number)} · sem assinatura e sem transmissão.</div></div><div class="toolbar-actions"><button class="secondary" onclick="setView('documents')">Voltar</button><button class="primary" onclick="navigator.clipboard.writeText(${JSON.stringify(xml)});toast('XML copiado.')">Copiar XML</button></div></div><div class="card"><pre class="xml-viewer">${esc(xml)}</pre></div>`}
  window.showXml=showXml;

  const oldSetView=window.setView;
  window.setView=function(view){if(view==='cadastros'){renderCadastros();window.scrollTo(0,0);return}oldSetView(view);setTimeout(()=>{injectNfeProducts();injectXmlButtons()},50)};
  new MutationObserver(()=>setTimeout(()=>{injectNfeProducts();injectXmlButtons()},0)).observe(app,{childList:true,subtree:true});
})();
