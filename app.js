(() => {
  'use strict';
  const root = document.getElementById('root');
  const logo = '/logo.svg';
  const fmt = v => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(v)||0);
  const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const products = [
    ['Beras Premium 5kg','Sembako',64000,'🌾'],['Minyak Goreng 2L','Sembako',32000,'🫙'],['Gula Pasir 1kg','Sembako',15000,'🧂'],
    ['Tepung Terigu 1kg','Sembako',12000,'🥣'],['Indomie Goreng','Sembako',3000,'🍜'],['Sabun Mandi','Kebersihan',5000,'🧼'],
    ['Susu Kental Manis','Minuman',11000,'🥛'],['Air Mineral 600ml','Minuman',3000,'💧'],['Pasta Gigi','Kebersihan',8000,'🪥'],['Pulpen Standard','Alat Tulis',2500,'🖊️']
  ].map((p,i)=>({id:i+1,name:p[0],cat:p[1],price:p[2],icon:p[3]}));
  const state={user:null,view:'dashboard',cart:[],stats:{},error:''};

  async function api(path, options={}) {
    const headers=Object.assign({'Content-Type':'application/json'},options.headers||{});
    const token=localStorage.getItem('kmb_token'); if(token) headers.Authorization='Bearer '+token;
    const r=await fetch('/api'+path,{...options,headers});
    const text=await r.text(); let data={}; try{data=text?JSON.parse(text):{}}catch{}
    if(!r.ok) throw new Error(data.error||`Server ${r.status}`);
    return data;
  }
  function saveSession(user,token){localStorage.setItem('kmb_token',token);localStorage.setItem('kmb_user',JSON.stringify(user));state.user=user;}
  function logout(){localStorage.removeItem('kmb_token');localStorage.removeItem('kmb_user');state.user=null;state.cart=[];render();}
  function card(content,cls=''){return `<div class="card ${cls}">${content}</div>`;}
  function login(){
    root.innerHTML=`<main class="login-page"><section class="login-card">
      <div class="brand"><div class="logo-circle"><img src="${logo}" alt="Logo Koperasi Mitra Barokah"></div><h1>Koperasi Mitra Barokah</h1><p>Sistem informasi koperasi & kasir</p></div>
      <div id="login-error" class="alert danger hidden"></div>
      <form id="login-form" class="form">
        <label>Username<input id="username" autocomplete="username" placeholder="Username" required></label>
        <label>Password<input id="password" type="password" autocomplete="current-password" placeholder="Password" required></label>
        <button class="btn primary" type="submit">Masuk ke Sistem</button>
      </form>
      <div class="secure-note">🔒 Akses aman. Gunakan akun administrator yang sudah dikonfigurasi.</div>
    </section></main>`;
    document.getElementById('login-form').addEventListener('submit',async e=>{
      e.preventDefault(); const b=e.submitter; b.disabled=true;b.textContent='Memproses...';
      const err=document.getElementById('login-error');err.classList.add('hidden');
      try{const d=await api('/auth/login',{method:'POST',body:JSON.stringify({username:document.getElementById('username').value.trim(),password:document.getElementById('password').value})});saveSession(d.user,d.token);render();}
      catch(x){err.textContent=x.message;err.classList.remove('hidden');b.disabled=false;b.textContent='Masuk ke Sistem';}
    });
  }
  function nav(){return `<aside class="sidebar"><div class="side-brand"><div class="side-logo"><img src="${logo}" alt=""></div><b>KOPERASI MITRA BAROKAH</b><small>Bersama Berkarya, Menuju Sejahtera dan Barokah</small></div><nav>
    ${[['dashboard','⌂','Dashboard'],['anggota','👥','Anggota'],['simpanan','💰','Simpanan'],['pinjaman','💳','Pinjaman'],['kasir','🛒','Kasir'],['laporan','📊','Laporan'],['users','⚙️','Pengguna']].map(x=>`<button class="nav-item ${state.view===x[0]?'active':''}" data-view="${x[0]}"><span>${x[1]}</span>${x[2]}</button>`).join('')}</nav><div class="side-user"><b>${esc(state.user?.nama||state.user?.username||'Pengguna')}</b><small>${esc(state.user?.role||'User')}</small><button id="logout" class="logout">Keluar</button></div></aside>`;}
  function top(title){return `<header class="topbar"><div><b>${title}</b><small>Koperasi Mitra Barokah</small></div><div class="online">● Sistem online</div></header>`;}
  async function loadStats(){try{state.stats=await api('/laporan/ringkasan');}catch(e){state.error=e.message;}}
  function dashboard(){const s=state.stats||{};return `<div class="page"><div class="welcome"><div><span class="eyebrow">DASHBOARD</span><h1>Selamat datang, ${esc(state.user?.nama||'Anggota')} 👋</h1><p>Kelola operasional koperasi dengan cepat dan rapi.</p></div><button class="btn primary" data-view="kasir">🛒 Buka Kasir</button></div>
    <div class="stats">${[['👥','Anggota aktif',s.anggota_aktif??'-'],['💰','Total simpanan',s.total_simpanan!=null?fmt(s.total_simpanan):'-'],['🏦','Total transaksi',s.total_transaksi!=null?fmt(s.total_transaksi):'-'],['💳','Pinjaman aktif',s.pinjaman_aktif!=null?fmt(s.pinjaman_aktif):'-']].map(x=>card(`<div class="stat-icon">${x[0]}</div><div><small>${x[1]}</small><strong>${x[2]}</strong></div>`,'stat')).join('')}</div>
    <div class="two-col">${card(`<h2>Ringkasan Operasional</h2><div class="mini-grid"><div><small>Pendaftaran pending</small><b>${s.pendaftaran_pending??'-'}</b></div><div><small>Pinjaman menunggu</small><b>${s.pinjaman_pending??'-'}</b></div><div><small>Transaksi hari ini</small><b>${s.transaksi_hari_ini??'-'}</b></div></div>`)}${card(`<h2>Akses Cepat</h2><div class="quick">${[['kasir','🛒','Kasir'],['anggota','👥','Data Anggota'],['simpanan','💰','Simpanan'],['pinjaman','💳','Pinjaman']].map(x=>`<button data-view="${x[0]}"><span>${x[1]}</span>${x[2]}<b>›</b></button>`).join('')}</div>`)}</div>${state.error?`<div class="alert warning">API belum merespons: ${esc(state.error)}. Tampilan tetap dapat dibuka.</div>`:''}</div>`;}
  function kasir(){const q=state.q||'',cat=state.cat||'Semua';const shown=products.filter(p=>(cat==='Semua'||p.cat===cat)&&p.name.toLowerCase().includes(q.toLowerCase()));const total=state.cart.reduce((a,i)=>a+i.price*i.qty,0);return `<div class="page"><div class="pos-head"><div><span class="eyebrow">POINT OF SALE</span><h1>Kasir</h1><p>Pilih barang, atur jumlah, lalu simpan transaksi.</p></div><button class="btn ghost" id="clear-cart">Kosongkan</button></div><div class="pos"><section class="card products"><div class="search"><input id="product-search" value="${esc(q)}" placeholder="Cari nama produk..."><button class="btn ghost">▦ Barcode</button></div><div class="chips">${['Semua','Sembako','Minuman','Kebersihan','Alat Tulis'].map(c=>`<button class="chip ${cat===c?'selected':''}" data-cat="${c}">${c}</button>`).join('')}</div><div class="product-grid">${shown.map(p=>`<button class="product" data-add="${p.id}"><span>${p.icon}</span><b>${esc(p.name)}</b><small>${esc(p.cat)}</small><strong>${fmt(p.price)}</strong></button>`).join('')}</div></section><aside class="card checkout"><div class="checkout-title"><h2>Pesanan</h2><span>${state.cart.reduce((a,i)=>a+i.qty,0)} item</span></div><div class="cart">${state.cart.length?state.cart.map(i=>`<div class="cart-row"><div><b>${esc(i.name)}</b><small>${i.qty} × ${fmt(i.price)}</small></div><div><button data-dec="${i.id}">−</button><b>${fmt(i.qty*i.price)}</b><button data-add="${i.id}">+</button></div></div>`).join(''):'<div class="empty">Belum ada produk dipilih.</div>'}</div><div class="total"><span>Total</span><strong>${fmt(total)}</strong></div><input id="paid" type="number" placeholder="Uang diterima"><button id="pay" class="btn primary big" ${!state.cart.length?'disabled':''}>Bayar & Simpan</button><div id="pay-msg" class="pay-msg"></div></aside></div></div>`;}
  function generic(title,subtitle){return `<div class="page">${card(`<div class="empty-page"><div class="big-icon">${title==='Anggota'?'👥':title==='Simpanan'?'💰':title==='Pinjaman'?'💳':title==='Laporan'?'📊':'⚙️'}</div><h1>${title}</h1><p>${subtitle}</p><button class="btn primary" data-view="kasir">Buka Kasir</button></div>`)}</div>`;}
  function render(){if(!state.user){login();return;}const titles={dashboard:'Dashboard',kasir:'Kasir',anggota:'Anggota',simpanan:'Simpanan',pinjaman:'Pinjaman',laporan:'Laporan',users:'Pengguna'};root.innerHTML=`<div class="app">${nav()}<main class="main">${top(titles[state.view]||'Dashboard')}<div id="content">${state.view==='dashboard'?dashboard():state.view==='kasir'?kasir():generic(titles[state.view], 'Modul ini siap digunakan dan akan terhubung ke data server.')}</div></main></div>`;bind();}
  function bind(){document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',async()=>{state.view=b.dataset.view;if(state.view==='dashboard')await loadStats();render();}));document.getElementById('logout')?.addEventListener('click',logout);document.getElementById('clear-cart')?.addEventListener('click',()=>{state.cart=[];render();});
    document.querySelectorAll('[data-cat]').forEach(b=>b.addEventListener('click',()=>{state.cat=b.dataset.cat;render();}));
    document.querySelectorAll('[data-add]').forEach(b=>b.addEventListener('click',()=>{const p=products.find(x=>x.id===Number(b.dataset.add));if(!p)return;const old=state.cart.find(x=>x.id===p.id);state.cart=old?state.cart.map(x=>x.id===p.id?{...x,qty:x.qty+1}:x):[...state.cart,{...p,qty:1}];render();}));
    document.querySelectorAll('[data-dec]').forEach(b=>b.addEventListener('click',()=>{const id=Number(b.dataset.dec);state.cart=state.cart.flatMap(x=>x.id===id?(x.qty>1?[{...x,qty:x.qty-1}]:[]):[x]);render();}));
    document.getElementById('product-search')?.addEventListener('input',e=>{state.q=e.target.value;render();const el=document.getElementById('product-search');el?.focus();el?.setSelectionRange(el.value.length,el.value.length);});
    document.getElementById('pay')?.addEventListener('click',async()=>{const total=state.cart.reduce((a,i)=>a+i.price*i.qty,0),paid=Number(document.getElementById('paid').value||0),msg=document.getElementById('pay-msg');if(paid<total){msg.textContent='Uang diterima masih kurang.';return;}try{await api('/transaksi',{method:'POST',body:JSON.stringify({jenis:'penjualan',jumlah:total,keterangan:state.cart.map(i=>`${i.name} x${i.qty}`).join(', '),tanggal:new Date().toISOString()})});msg.textContent='✓ Transaksi tersimpan. Kembalian '+fmt(paid-total);state.cart=[];setTimeout(render,900);}catch(e){msg.textContent='Gagal menyimpan: '+e.message;}});
  }
  async function start(){try{const u=localStorage.getItem('kmb_user'),t=localStorage.getItem('kmb_token');if(u&&t){state.user=JSON.parse(u);await loadStats();}render();}catch(e){localStorage.removeItem('kmb_user');localStorage.removeItem('kmb_token');render();}}
  start();
})();
