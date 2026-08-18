const express = require('express');
const router = express.Router();

function config(){
  const url=String(process.env.SUPABASE_URL||'').replace(/\/$/,'');
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key) throw new Error('SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di Vercel.');
  return {url,key};
}
async function sb(path,opt={}){
  const {url,key}=config();
  const r=await fetch(url+'/rest/v1/'+path,{...opt,headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',...(opt.headers||{})}});
  const text=await r.text(); let data=null; try{data=text?JSON.parse(text):null}catch{}
  if(!r.ok) throw new Error(data?.message||data?.hint||data?.error_description||'Supabase error '+r.status);
  return data;
}

router.get('/products',async(req,res)=>{
  try{
    const rows=await sb('products?select=id,sku,name,category,unit,sell_price,stock,min_stock,is_active&is_active=eq.true&order=name.asc');
    res.json(rows.map(p=>({...p,price:Number(p.sell_price),cat:p.category||'Lainnya',icon:'🛒'})));
  }catch(e){res.status(503).json({error:e.message});}
});

router.post('/sales',async(req,res)=>{
  try{
    const {items,paid,member_id}=req.body||{};
    if(!Array.isArray(items)||!items.length) return res.status(400).json({error:'Keranjang kosong'});
    const clean=items.map(x=>({product_id:String(x.product_id),qty:Number(x.qty)}));
    if(clean.some(x=>!x.product_id||!Number.isFinite(x.qty)||x.qty<=0)) return res.status(400).json({error:'Item transaksi tidak valid'});
    const data=await sb('rpc/create_sale',{method:'POST',body:JSON.stringify({p_items:clean,p_paid:Number(paid),p_member_id:member_id||null})});
    res.status(201).json(data);
  }catch(e){res.status(400).json({error:e.message});}
});

module.exports=router;
