/* OCULTO ERP — dashboard finance chart fix */
(function(){
  const financeChart = window.financeDashboardChart;
  const baseDashboard = window.dashboard;
  if (typeof financeChart !== 'function' || typeof baseDashboard !== 'function') return;

  window.dashboard = function(){
    let html = baseDashboard();
    html = html.replace(/<div class="chart">[\s\S]*?<div class="chart-x">[\s\S]*?<\/div>/, financeChart());

    try {
      const data = JSON.parse(localStorage.getItem('oculto-finance-v1') || '[]');
      const receivableOpen = data.filter(x => x.type === 'receivable' && x.status === 'open').reduce((s,x) => s + Number(x.value || 0), 0);
      const receivablePaid = data.filter(x => x.type === 'receivable' && x.status === 'paid').reduce((s,x) => s + Number(x.value || 0), 0);
      const receivableTotal = receivableOpen + receivablePaid;
      if (receivableTotal) html = html.replace('R$ 128.450', 'R$ ' + receivableTotal.toLocaleString('pt-BR', {minimumFractionDigits:0}));
      if (receivableOpen) html = html.replace('R$ 42.780', 'R$ ' + receivableOpen.toLocaleString('pt-BR', {minimumFractionDigits:0}));
    } catch (_) {}

    return html;
  };
})();
