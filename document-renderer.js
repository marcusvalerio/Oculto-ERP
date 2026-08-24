(function(){
  const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const digits=v=>String(v??'').replace(/\D/g,'');
  const money=v=>Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
  const pad=(v,n)=>String(v??'').padStart(n,'0');
  const today=()=>new Date().toLocaleDateString('pt-BR');

  function mod11(base){
    let weight=2,sum=0;
    for(let i=base.length-1;i>=0;i--){sum+=Number(base[i])*weight; weight=weight===9?2:weight+1;}
    const r=sum%11; return r===0||r===1?0:11-r;
  }
  function makeKey(d){
    const c=digits(d.cnpj||'00000000000000').padStart(14,'0').slice(-14);
    const yyMM=new Date().toISOString().slice(2,7).replace('-','');
    const base=('33'+yyMM+c+'55'+pad(d.series||1,3)+pad(d.number||1,9)+'1'+'00000000').slice(0,43);
    return base+mod11(base);
  }

  function pseudoBarcode(key){
    const seed=digits(key).slice(0,44); let x=0;
    for(let i=0;i<seed.length;i++) x=(x*31+Number(seed[i])+17)%1000003;
    const units=[]; const push=(n)=>units.push(n);
    push(2);push(1);push(2);push(1);
    for(let i=0;i<seed.length;i++){
      const n=Number(seed[i]);
      x=(x*1664525+1013904223)>>>0;
      const pattern=((n*17+(x%23))%8)+1;
      push(1+(pattern%3)); push(1+((pattern>>1)%3)); push(1+((pattern>>2)%3)); push(1+((pattern>>3)%2));
      if(i%2===1){push(1);push(2)}
    }
    push(2);push(1);push(3);
    let html='<div class="barcode-box"><div class="barcode-bars" aria-label="Código de barras da chave simulada">';
    let black=true;
    units.forEach(u=>{html+=`<span class="${black?'bar':'space'}" style="width:${u}px"></span>`;black=!black});
    return html+'</div><div class="barcode-digits">'+esc(seed)+'</div></div>';
  }

  const cell=(label,value,cls='')=>`<div class="danfe-cell ${cls}"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`;
  const section=t=>`<div class="danfe-section-title">${esc(t)}</div>`;
  const grid=(cells,cls='')=>`<div class="danfe-grid ${cls}">${cells.join('')}</div>`;

  function canhoto(d){return `<div class="canhoto">
    <div class="canhoto-main"><span>RECEBEMOS DE ${esc(d.issuer||'EMPRESA DE ESTUDO LTDA')} OS PRODUTOS E/OU SERVIÇOS CONSTANTES DA NOTA FISCAL ELETRÔNICA INDICADA AO LADO.</span></div>
    <div class="canhoto-date"><span>DATA DE RECEBIMENTO</span><b></b></div>
    <div class="canhoto-sign"><span>IDENTIFICAÇÃO E ASSINATURA DO RECEBEDOR</span><b></b></div>
    <div class="canhoto-nf"><strong>NF-e</strong><div>Nº <b>${pad(d.number||1,9)}</b></div><div>SÉRIE <b>${pad(d.series||1,3)}</b></div></div>
  </div>`}

  function header(d,key){return `<div class="danfe-header">
    <div class="issuer">
      <div class="issuer-logo">${esc((d.issuer||'ES').slice(0,2).toUpperCase())}</div>
      <div class="issuer-info"><strong>${esc(d.issuer||'EMPRESA DE ESTUDO LTDA')}</strong><span>${esc(d.cnpj||'00.000.000/0001-00')}</span><span>Endereço para fins de estudo, 100 · Rio de Janeiro · RJ · CEP 20000-000</span><span>Fone/Fax: (00) 0000-0000 · Inscrição Estadual: 000.000.000.000</span></div>
    </div>
    <div class="danfe-brand"><strong>DANFE</strong><span>DOCUMENTO AUXILIAR DA</span><span>NOTA FISCAL ELETRÔNICA</span><div class="operation"><b>0 - ENTRADA</b><b>1 - SAÍDA</b><strong>1</strong></div></div>
    <div class="key-block"><span>CHAVE DE ACESSO</span><strong>${key.replace(/(.{4})/g,'$1 ').trim()}</strong>${pseudoBarcode(key)}</div>
    <div class="doc-meta"><div><span>Nº</span><b>${pad(d.number||1,9)}</b></div><div><span>SÉRIE</span><b>${pad(d.series||1,3)}</b></div><div><span>FOLHA</span><b>1/1</b></div></div>
  </div>`}

  function danfe(d,key){
    const qty=Number(d.qty||1), unit=Number(d.unit||150), total=qty*unit;
    return `<div class="a4-document danfe-document">
      <div class="simulated-ribbon">DOCUMENTO SIMULADO · SEM VALIDADE FISCAL · AMBIENTE DE ESTUDO</div>
      ${canhoto(d)}
      ${header(d,key)}
      ${section('NATUREZA DA OPERAÇÃO')}
      ${grid([
        cell('NATUREZA DA OPERAÇÃO','VENDA DE MERCADORIA','c4'),
        cell('PROTOCOLO DE AUTORIZAÇÃO','000000000000000 · SIMULADO','c4'),
        cell('DATA DE EMISSÃO',today(),'c2'),
        cell('DATA DE SAÍDA/ENTRADA',today(),'c2')
      ],'natureza')}
      ${section('DESTINATÁRIO / REMETENTE')}
      ${grid([
        cell('NOME / RAZÃO SOCIAL',d.recipient||'CLIENTE DE ESTUDO LTDA','c6'),
        cell('CNPJ / CPF',d.recipientDoc||'11.111.111/0001-11','c2'),
        cell('DATA DA EMISSÃO',today(),'c2'),
        cell('ENDEREÇO','Endereço de estudo, 100','c5'),
        cell('BAIRRO / DISTRITO','Centro','c2'),
        cell('CEP','20000-000','c1'),
        cell('DATA DA ENTRADA/SAÍDA',today(),'c2'),
        cell('MUNICÍPIO','Rio de Janeiro','c3'),
        cell('FONE / FAX','(00) 0000-0000','c2'),
        cell('UF','RJ','c1'),
        cell('INSCRIÇÃO ESTADUAL','ISENTO','c2'),
        cell('HORA DE SAÍDA','16:00','c1')
      ],'destinatario')}
      ${section('FATURA / DUPLICATA')}
      ${grid([cell('FATURA','001','c2'),cell('VALOR ORIGINAL',money(total),'c2'),cell('VALOR DO DESCONTO','0,00','c2'),cell('VALOR LÍQUIDO',money(total),'c2'),cell('DUPLICATA','001 · Vencimento: '+today(),'c4')],'fatura')}
      ${section('CÁLCULO DO IMPOSTO')}
      ${grid([
        cell('BASE DE CÁLCULO DO ICMS','0,00','c2'),cell('VALOR DO ICMS','0,00','c2'),cell('BASE DE CÁLCULO ICMS ST','0,00','c2'),cell('VALOR DO ICMS SUBSTITUIÇÃO','0,00','c2'),cell('VALOR TOTAL DOS PRODUTOS',money(total),'c2'),
        cell('VALOR DO FRETE','0,00','c2'),cell('VALOR DO SEGURO','0,00','c2'),cell('DESCONTO','0,00','c2'),cell('OUTRAS DESPESAS ACESSÓRIAS','0,00','c2'),cell('VALOR TOTAL DO IPI','0,00','c2'),cell('VALOR TOTAL DA NOTA',money(total),'c2')
      ],'imposto')}
      ${section('TRANSPORTADOR / VOLUMES TRANSPORTADOS')}
      ${grid([
        cell('NOME / RAZÃO SOCIAL','TRANSPORTADOR DE ESTUDO','c4'),cell('FRETE POR CONTA','0 - Emitente','c2'),cell('CÓDIGO ANTT','00000000','c2'),cell('PLACA DO VEÍCULO','ABC1D23','c2'),cell('UF','RJ','c1'),cell('CNPJ / CPF','00.000.000/0001-00','c3'),
        cell('ENDEREÇO','Endereço de estudo','c4'),cell('MUNICÍPIO','Rio de Janeiro','c2'),cell('UF','RJ','c1'),cell('INSCRIÇÃO ESTADUAL','ISENTO','c3'),
        cell('QUANTIDADE','1','c1'),cell('ESPÉCIE','VOLUMES','c2'),cell('MARCA','ESTUDO','c2'),cell('NÚMERO','001','c1'),cell('PESO BRUTO','0,00 kg','c2'),cell('PESO LÍQUIDO','0,00 kg','c2')
      ],'transportador')}
      ${section('DADOS DOS PRODUTOS / SERVIÇOS')}
      <table class="products-table"><thead><tr><th class="w-code">CÓD. PROD.</th><th class="w-desc">DESCRIÇÃO DOS PRODUTOS / SERVIÇOS</th><th class="w-ncm">NCM/SH</th><th class="w-cst">CST</th><th class="w-cfop">CFOP</th><th class="w-un">UND.</th><th class="w-qty">QUANT.</th><th class="w-unit">VALOR UNITÁRIO</th><th class="w-total">VALOR TOTAL</th><th class="w-tax">BC ICMS</th><th class="w-tax">VALOR ICMS</th><th class="w-tax">VALOR IPI</th><th class="w-tax">ALÍQ. ICMS</th><th class="w-tax">ALÍQ. IPI</th></tr></thead><tbody><tr><td>001</td><td>${esc(d.product||'Mercadoria para estudo')}</td><td>${esc(d.ncm||'0000.00.00')}</td><td>00</td><td>${esc(d.cfop||'5102')}</td><td>UN</td><td>${qty}</td><td>${money(unit)}</td><td>${money(total)}</td><td>0,00</td><td>0,00</td><td>0,00</td><td>0,00</td><td>0,00</td></tr><tr class="blank-row"><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr></tbody></table>
      ${section('CÁLCULO DO ISSQN')}
      ${grid([cell('INSCRIÇÃO MUNICIPAL','00000000','c3'),cell('VALOR TOTAL DOS SERVIÇOS','0,00','c3'),cell('BASE DE CÁLCULO DO ISSQN','0,00','c3'),cell('VALOR DO ISSQN','0,00','c3')],'issqn')}
      ${section('DADOS ADICIONAIS')}
      <div class="additional-grid"><div><span>INFORMAÇÕES COMPLEMENTARES</span><p>Documento gerado exclusivamente para estudo e demonstração. Não possui validade fiscal, não foi transmitido à SEFAZ e não representa autorização real.</p></div><div><span>RESERVADO AO FISCO</span><p>AMBIENTE DE ESTUDO · SEM VALIDADE FISCAL</p></div></div>
      <div class="document-footer"><span>FISCAL GENERATOR · AMBIENTE DE ESTUDO</span><b>DOCUMENTO SIMULADO — SEM VALIDADE FISCAL</b><span>NF-e ${pad(d.number||1,9)} · Série ${pad(d.series||1,3)} · 1/1</span></div>
    </div>`;
  }

  function generic(d,key,type,title,model){
    return `<div class="a4-document generic-document"><div class="simulated-ribbon">DOCUMENTO SIMULADO · SEM VALIDADE FISCAL · AMBIENTE DE ESTUDO</div>${canhoto(d)}${header(d,key)}${section(type==='cte'?'DADOS DO CT-e':'DADOS DO MDF-e')}${grid([cell('TIPO',type==='cte'?'0 - NORMAL':'0 - NORMAL','c2'),cell('MODAL','RODOVIÁRIO','c2'),cell('DATA DE EMISSÃO',today(),'c2'),cell('NÚMERO',pad(d.number||1,9),'c2'),cell('SÉRIE',pad(d.series||1,3),'c2'),cell('FOLHA','1/1','c2')],'generic-top')}${section(type==='cte'?'EMITENTE / TOMADOR / DESTINATÁRIO':'EMITENTE / VEÍCULO / PERCURSO')}${grid([cell('RAZÃO SOCIAL',d.issuer||'TRANSPORTES DE ESTUDO LTDA','c5'),cell('CNPJ',d.cnpj||'00.000.000/0001-00','c3'),cell(type==='cte'?'TOMADOR':'VEÍCULO',type==='cte'?'REMETENTE':(d.vehicle||'ABC1D23'),'c2'),cell(type==='cte'?'DESTINATÁRIO':'CONDUTOR',type==='cte'?'CLIENTE DE ESTUDO LTDA':(d.driver||'MOTORISTA DE ESTUDO'),'c2'),cell('ORIGEM',d.origin||'RIO DE JANEIRO/RJ','c3'),cell('DESTINO',d.destination||'SÃO PAULO/SP','c3')],'generic-body')}${section(type==='cte'?'COMPONENTES DO VALOR DA PRESTAÇÃO':'DOCUMENTOS FISCAIS VINCULADOS')}<table class="products-table compact"><thead><tr><th>ITEM</th><th>DESCRIÇÃO</th><th>DOCUMENTO</th><th>VALOR</th></tr></thead><tbody><tr><td>001</td><td>${type==='cte'?'Frete rodoviário simulado':'NF-e vinculada para estudo'}</td><td>${esc(d.number||'000001')}</td><td>${money(d.value||d.freight||0)}</td></tr></tbody></table>${section('INFORMAÇÕES COMPLEMENTARES')}<div class="additional-grid"><div><span>OBSERVAÇÕES</span><p>Documento auxiliar simulado para fins educacionais. Nenhuma autorização, transmissão ou encerramento foi realizado perante a SEFAZ.</p></div><div><span>RESERVADO</span><p>SEM VALIDADE FISCAL</p></div></div><div class="document-footer"><span>FISCAL GENERATOR · AMBIENTE DE ESTUDO</span><b>${esc(title)} SIMULADO</b><span>1/1</span></div></div>`;
  }

  window.preview=function(id){
    const docs=(window.state&&window.state.documents)||JSON.parse(localStorage.getItem('fiscal-documents')||'[]');
    const doc=docs.find(x=>x.id===id); if(!doc)return;
    const type=(doc.type||'NF-e').toLowerCase().replace(/[^a-z]/g,'');
    const key=doc.key||makeKey(doc);
    const body=type==='nfe'?danfe(doc,key):generic(doc,key,type,type==='cte'?'DACTE':'DAMDFE',type==='cte'?'57':'58');
    const app=document.getElementById('app');
    app.innerHTML=`<div class="page-head"><div><div class="eyebrow">Documento auxiliar</div><h1>${esc(doc.type)}</h1><div class="muted">Representação para estudo · leiaute baseado nas especificações oficiais</div></div><div class="preview-actions"><button class="secondary" onclick="setView('documents')">Voltar</button><button class="primary" onclick="window.print()">Imprimir documento</button></div></div><div class="document-stage">${body}</div>`;
  };
  window.fiscalRendererReady=true;
})();
