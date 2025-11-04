document.addEventListener('DOMContentLoaded', () => {
  const inputs = {};
  const tabs = ['roposo', 'ecommerce', 'glowroad'];

  // collect all inputs (shared + roposo)
  document.querySelectorAll('input').forEach(i => {
    const id = i.dataset.id || i.id;
    if (id) {
      inputs[id] = i;
      i.addEventListener('input', calculateAll);
    }
  });

  // tab switching
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      document.getElementById(b.dataset.tab).classList.add('active');
      calculateAll();
    });
  });

  function getV() {
    return {
      productCost: parseFloat(inputs.productCost?.value) || 0,
      freight: parseFloat(inputs.freight?.value) || 0,
      sellingPrice: parseFloat(inputs.sellingPrice?.value) || 0,
      cancelRate: parseFloat(inputs.cancelRate?.value) || 0,
      totalOrders: parseFloat(inputs.totalOrders?.value) || 0,
      rtoCharges: parseFloat(inputs.rtoCharges?.value) || 0,
      adCost: parseFloat(inputs.adCost?.value) || 0,
      rtoPercent: parseFloat(inputs.rtoPercent?.value) || 0,
    };
  }

  function fmtCur(n) { return '₹ ' + n.toLocaleString('en-IN', {maximumFractionDigits:10}); }
  function fmtPct(n) { return n.toFixed(10) + ' %'; }

  function calculateAll() {
    const v = getV();
    const netOrders = v.totalOrders * (1 - v.cancelRate/100);
    const rtoOrders = netOrders * (v.rtoPercent/100);
    const delivered = netOrders - rtoOrders;

    const totalFreight = netOrders * v.freight;
    const totalAd = v.totalOrders * v.adCost;
    const avgAd = delivered ? totalAd / delivered : 0;

    const netRtoCost = rtoOrders * v.rtoCharges;
    const avgRto = delivered ? netRtoCost / delivered : 0;
    const avgFreight = delivered ? totalFreight / delivered : 0;

    const profitPer = v.sellingPrice - v.productCost - avgFreight - avgAd - avgRto;
    const revenue = v.totalOrders * v.sellingPrice;
    const cod = delivered * v.sellingPrice;
    const netProfit = delivered * profitPer;
    const netProfitReal = netProfit - rtoOrders * v.productCost;
    const profitPct = revenue ? (netProfit / revenue) * 100 : 0;
    const netCost = totalFreight + totalAd + v.totalOrders * v.productCost + netRtoCost;
    const roi = totalAd ? netProfit / totalAd : 0;

    // ---- Roposo ----
    set('#netOrders', netOrders.toFixed(0));
    set('#rtoOrders', rtoOrders.toFixed(0));
    set('#deliveredOrders', delivered.toFixed(0));
    set('#totalFreight', fmtCur(totalFreight));
    set('#totalAdCost', fmtCur(totalAd));
    set('#avgAdCost', avgAd.toFixed(10));
    set('#codRemittance', fmtCur(cod));
    set('#netRtoCost', fmtCur(netRtoCost));
    set('#profitPerProduct', profitPer.toFixed(10));
    set('#netProfitReal', netProfitReal.toFixed(10));
    set('#revenue', fmtCur(revenue));
    set('#netProfit', netProfit.toFixed(10));
    set('#profitPercent', fmtPct(profitPct));
    set('#roi', roi.toFixed(10));

    // ---- E‑Commerce & Glowroad (same logic) ----
    tabs.slice(1).forEach(p => {
      set(`#${p}-netOrders`, netOrders.toFixed(0));
      set(`#${p}-rtoOrders`, rtoOrders.toFixed(0));
      set(`#${p}-deliveredOrders`, delivered.toFixed(0));
      set(`#${p}-totalFreight`, fmtCur(totalFreight));
      set(`#${p}-totalAdCost`, fmtCur(totalAd));
      set(`#${p}-avgAdCost`, avgAd.toFixed(2));
      set(`#${p}-codRemittance`, fmtCur(cod));
      set(`#${p}-netRtoCost`, fmtCur(netRtoCost));
      set(`#${p}-avgRtoCost`, avgRto.toFixed(2));
      set(`#${p}-avgFreight`, avgFreight.toFixed(2));
      set(`#${p}-profitPerProduct`, profitPer.toFixed(2));
      set(`#${p}-netProfit`, netProfit.toFixed(0));
      set(`#${p}-netProfitReal`, netProfitReal.toFixed(0));
      set(`#${p}-revenue`, fmtCur(revenue));
      set(`#${p}-profitPercent`, profitPct.toFixed(2));
      set(`#${p}-netCost`, fmtCur(netCost));
      set(`#${p}-roi`, roi.toFixed(2));
    });

    function set(id, val) { const el = document.querySelector(id); if (el) el.textContent = val; }
  }

  calculateAll();
});
