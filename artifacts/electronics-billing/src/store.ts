export type Product = { id:string; name:string; category:string; sku:string; barcode:string; costPrice:number; sellingPrice:number; stock:number; lowStockAt:number; warrantyMonths:number; imeis:string[] };
export type Customer = { id:string; name:string; phone:string; email:string; dues:number };
export type Supplier = { id:string; name:string; phone:string; email:string; balance:number };
export type InvoiceItem = { productId:string; name:string; quantity:number; unitPrice:number; costPrice:number; discount:number; imei:string };
export type Invoice = { id:string; number:string; date:string; customerId:string; items:InvoiceItem[]; discount:number; paymentMethod:string; paymentAmount:number; total:number; due:number; customerName?:string; customerPhone?:string; customerAddress?:string; paymentReference?:string };
export type ReceiptPaperSize = 'a4'|'a5'|'thermal80'|'thermal58';
export type ReceiptLayout = 'standard'|'compact';
export type Purchase = { id:string; supplierId:string; date:string; items:{productId:string; name:string; quantity:number; unitPrice:number}[]; total:number };
export type ReturnRecord = { id:string; invoiceId:string; productId:string; quantity:number; reason:string; amount:number; date:string };
export type Expense = { id:string; title:string; category:string; amount:number; date:string };
export type Warranty = { id:string; invoiceNumber:string; product:string; customer:string; phone:string; imei:string; expires:string; status:string };
export type DataState = { products:Product[]; customers:Customer[]; suppliers:Supplier[]; invoices:Invoice[]; purchases:Purchase[]; returns:ReturnRecord[]; expenses:Expense[]; warranties:Warranty[]; syncQueue:any[]; settings:Record<string,string> };
const today = new Date().toISOString().slice(0,10);
export const seed:DataState = {
 products:[
  {id:'p1',name:'Samsung Galaxy A35 5G · 128GB',category:'Smartphones',sku:'SAM-A35-128',barcode:'8806095467034',costPrice:23800,sellingPrice:26999,stock:7,lowStockAt:3,warrantyMonths:12,imeis:['354812340001829','354812340001837']},
  {id:'p2',name:'boAt Airdopes 141',category:'Audio',sku:'BOAT-141',barcode:'8905505009012',costPrice:799,sellingPrice:1299,stock:18,lowStockAt:5,warrantyMonths:12,imeis:[]},
  {id:'p3',name:'Portronics 20W USB-C Charger',category:'Accessories',sku:'POR-20W-C',barcode:'8906120692441',costPrice:520,sellingPrice:899,stock:4,lowStockAt:6,warrantyMonths:6,imeis:[]},
  {id:'p4',name:'Apple iPhone 15 · 128GB',category:'Smartphones',sku:'APL-IP15-128',barcode:'195949036407',costPrice:61000,sellingPrice:69900,stock:2,lowStockAt:2,warrantyMonths:12,imeis:['359812340012112','359812340012120']},
  {id:'p5',name:'JBL Go 4 Bluetooth Speaker',category:'Audio',sku:'JBL-GO4',barcode:'1200130009876',costPrice:2900,sellingPrice:3499,stock:9,lowStockAt:3,warrantyMonths:12,imeis:[]},
  {id:'p6',name:'USB-C to Lightning Cable 1m',category:'Accessories',sku:'CBL-C2L-1M',barcode:'8906112340054',costPrice:180,sellingPrice:399,stock:31,lowStockAt:8,warrantyMonths:3,imeis:[]}
 ],
 customers:[{id:'c1',name:'Aarav Mehta',phone:'+91 98765 43210',email:'aarav.m@example.in',dues:2499},{id:'c2',name:'Priya Nair',phone:'+91 99870 12345',email:'priya.n@example.in',dues:0},{id:'c3',name:'Rohit Kulkarni',phone:'+91 98202 55431',email:'',dues:18500},{id:'c4',name:'Walk-in customer',phone:'',email:'',dues:0}],
 suppliers:[{id:'s1',name:'Metro Digital Distributors',phone:'+91 22 4012 8800',email:'orders@metrodigital.in',balance:38400},{id:'s2',name:'Brightline Mobiles Pvt Ltd',phone:'+91 80 4123 7700',email:'sales@brightline.in',balance:0},{id:'s3',name:'Sound & Circuit Wholesale',phone:'+91 22 2268 4010',email:'hello@soundcircuit.in',balance:12600}],
 invoices:[
  {id:'i1',number:'CC-2025-0418',date:today,customerId:'c2',items:[{productId:'p1',name:'Samsung Galaxy A35 5G · 128GB',quantity:1,unitPrice:26999,costPrice:23800,discount:0,imei:'354812340001829'}],discount:500,paymentMethod:'UPI',paymentAmount:26499,total:26499,due:0},
  {id:'i2',number:'CC-2025-0417',date:today,customerId:'c1',items:[{productId:'p2',name:'boAt Airdopes 141',quantity:2,unitPrice:1299,costPrice:799,discount:0,imei:''}],discount:99,paymentMethod:'Cash',paymentAmount:2499,total:2499,due:0},
  {id:'i3',number:'CC-2025-0416',date:today,customerId:'c3',items:[{productId:'p4',name:'Apple iPhone 15 · 128GB',quantity:1,unitPrice:69900,costPrice:61000,discount:1400,imei:'359812340012112'}],discount:0,paymentMethod:'Credit',paymentAmount:50000,total:68500,due:18500},
  {id:'i4',number:'CC-2025-0415',date:today,customerId:'c4',items:[{productId:'p5',name:'JBL Go 4 Bluetooth Speaker',quantity:1,unitPrice:3499,costPrice:2900,discount:0,imei:''}],discount:0,paymentMethod:'Card',paymentAmount:3499,total:3499,due:0}
 ],
 purchases:[{id:'pu1',supplierId:'s1',date:today,items:[{productId:'p3',name:'Portronics 20W USB-C Charger',quantity:10,unitPrice:520}],total:5200},{id:'pu2',supplierId:'s2',date:today,items:[{productId:'p1',name:'Samsung Galaxy A35 5G · 128GB',quantity:3,unitPrice:23800}],total:71400}],
 returns:[{id:'r1',invoiceId:'CC-2025-0409',productId:'p2',quantity:1,reason:'Left earbud not pairing',amount:1299,date:today}],
 expenses:[{id:'e1',title:'Shop rent · May',category:'Rent',amount:28000,date:today},{id:'e2',title:'Broadband & phone',category:'Utilities',amount:1899,date:today},{id:'e3',title:'Courier supplies',category:'Operations',amount:740,date:today}],
 warranties:[{id:'w1',invoiceNumber:'CC-2025-0418',product:'Samsung Galaxy A35 5G',customer:'Priya Nair',phone:'+91 99870 12345',imei:'354812340001829',expires:new Date(Date.now()+31536000000).toISOString().slice(0,10),status:'Active'},{id:'w2',invoiceNumber:'CC-2025-0402',product:'JBL Go 4 Bluetooth Speaker',customer:'Aarav Mehta',phone:'+91 98765 43210',imei:'—',expires:new Date(Date.now()+86400000*24).toISOString().slice(0,10),status:'Expiring soon'}],
 syncQueue:[],settings:{shopName:'Circuit & Co.',phone:'+91 22 4012 1948',address:'Shop 14, Lamington Road, Mumbai 400004',workspaceKey:'',receiptPaperSize:'thermal80',receiptLayout:'standard'}
};
const dbName='circuit-and-co-local'; const dbVersion=1;
function openDb():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const req=indexedDB.open(dbName,dbVersion);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains('state'))db.createObjectStore('state')};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
export async function loadState():Promise<DataState>{try{if(!('indexedDB'in window))throw new Error('IndexedDB unavailable');const db=await openDb();const value=await new Promise<DataState|undefined>((resolve,reject)=>{const r=db.transaction('state','readonly').objectStore('state').get('main');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});if(value)return{...value,settings:{...seed.settings,...value.settings}};await saveState(seed);return seed}catch{try{const raw=localStorage.getItem('circuit-state');if(raw){const value=JSON.parse(raw) as DataState;return{...value,settings:{...seed.settings,...value.settings}}}}catch{}return seed}}
export async function saveState(state:DataState):Promise<void>{try{if(!('indexedDB'in window))throw new Error();const db=await openDb();await new Promise<void>((resolve,reject)=>{const r=db.transaction('state','readwrite').objectStore('state').put(state,'main');r.onsuccess=()=>resolve();r.onerror=()=>reject(r.error)})}catch{try{localStorage.setItem('circuit-state',JSON.stringify(state))}catch{}}}
export const uid=()=>`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
