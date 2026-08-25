/* Educational demo data: structurally valid CNPJ identifiers, not assigned to real companies. */
(function(){
  const DEMO={
    issuer:'12.345.678/0001-95',
    customer:'98.765.432/0001-98',
    carrier:'11.222.333/0001-81'
  };
  function patchForm(){
    const form=document.getElementById('doc-form');
    if(!form)return;
    const type=String(document.querySelector('h1')?.textContent||'').toUpperCase();
    const cnpj=form.querySelector('[name="cnpj"]');
    const recipient=form.querySelector('[name="recipientDoc"]');
    if(cnpj)cnpj.value=type.includes('NF')?DEMO.issuer:DEMO.carrier;
    if(recipient)recipient.value=DEMO.customer;
  }
  const original=window.setView;
  if(original){
    window.setView=function(view){const result=original(view);if(view==='nfe'||view==='cte'||view==='mdfe')setTimeout(patchForm,0);return result};
  }
  window.FiscalDemoIdentifiers=DEMO;
})();
