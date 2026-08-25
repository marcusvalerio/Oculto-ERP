window.LAB_DATA={
  version:1,
  companies:[{id:'company-demo',name:'Empresa de Estudo LTDA',cnpj:'00.000.000/0001-00',ie:'ISENTO',address:'Av. Atlântica, 1000',city:'Rio de Janeiro',uf:'RJ',cep:'22000-000'}],
  customers:[{id:'customer-demo',name:'Cliente de Estudo LTDA',doc:'11.111.111/0001-11',address:'Rua Augusta, 100',city:'São Paulo',uf:'SP',cep:'01300-000'}],
  carriers:[{id:'carrier-demo',name:'Transportes de Estudo LTDA',cnpj:'22.222.222/0001-22'}],
  products:[
    {id:'product-1',code:'001',description:'Mercadoria para estudo',ncm:'0000.00.00',cfop:'5102',unit:'UN',price:150},
    {id:'product-2',code:'002',description:'Produto demonstrativo B',ncm:'0000.00.00',cfop:'5102',unit:'UN',price:85},
    {id:'product-3',code:'003',description:'Produto demonstrativo C',ncm:'0000.00.00',cfop:'5102',unit:'UN',price:42.5}
  ],
  vehicles:[{id:'vehicle-demo',plate:'ABC1D23',renavam:'00000000000',uf:'RJ'}],
  drivers:[{id:'driver-demo',name:'Motorista de Estudo',doc:'000.000.000-00'}]
};

window.LabStore={
  key:'fiscal-lab-data',
  load(){try{return JSON.parse(localStorage.getItem(this.key))||structuredClone(window.LAB_DATA)}catch(e){return structuredClone(window.LAB_DATA)}},
  save(data){localStorage.setItem(this.key,JSON.stringify(data));return data},
  reset(){localStorage.removeItem(this.key);return this.load()},
  export(){const blob=new Blob([JSON.stringify(this.load(),null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='fiscal-generator-ambiente.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)},
  import(file){return file.text().then(t=>{const data=JSON.parse(t);if(!data||typeof data!=='object')throw new Error('Arquivo inválido');this.save(data);return data})}
};
