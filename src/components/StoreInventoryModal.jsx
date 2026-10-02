import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, ShoppingCart, Plus, CheckCircle2, Clock, 
  DollarSign, FileText, X, AlertTriangle, Truck,
  UtensilsCrossed, Sparkles, Scale, RefreshCw, Layers, Check
} from 'lucide-react';
import { INITIAL_STORE_PURCHASES, INITIAL_KITCHEN_REQUISITIONS } from '../data/hotelData';
import UniversalDateFilterBar from './UniversalDateFilterBar';
import { SheetsEditableCell, SheetsColumnHeader, SheetsToolbarLegend } from './UniversalInlineEditor';

// Kitchen Recipe Bill of Materials (BOM) & Food Costing Data (Inspired by InvenTree & ERPNext)
const KITCHEN_RECIPE_BOM = [
  {
    dishCode: '215',
    dishName: 'Paneer Butter Masala',
    category: 'Food (Veg)',
    sellingPrice: 240,
    ingredients: [
      { name: 'Fresh Milk Paneer', qty: '200 g', cost: 70 },
      { name: 'Desi Ghee / Amul Butter', qty: '50 g', cost: 28 },
      { name: 'Tomato Cashew Gravy', qty: '150 g', cost: 22 },
      { name: 'Garam Masala & Kasuri Methi', qty: '10 g', cost: 8 }
    ],
    totalFoodCost: 128,
    grossMarginPct: 46.7,
    storeStockUnits: 32 // Can cook 32 portions with current store stock
  },
  {
    dishCode: '102',
    dishName: 'Chicken Dum Biryani (Chef Special)',
    category: 'Food (Non-Veg)',
    sellingPrice: 260,
    ingredients: [
      { name: 'Aged Basmati Rice', qty: '250 g', cost: 32 },
      { name: 'Fresh Country Poultry', qty: '300 g', cost: 75 },
      { name: 'Biryani Whole Spices & Saffron', qty: '25 g', cost: 25 },
      { name: 'Curd & Fried Onions Raita', qty: '80 g', cost: 16 }
    ],
    totalFoodCost: 148,
    grossMarginPct: 43.1,
    storeStockUnits: 28
  },
  {
    dishCode: '301',
    dishName: 'Special Satvik Thali (Pure Veg)',
    category: 'Satvik (No Onion/Garlic)',
    sellingPrice: 220,
    ingredients: [
      { name: 'Steamed Rice', qty: '180 g', cost: 18 },
      { name: 'Yellow Toor Dal Tadka', qty: '120 g', cost: 16 },
      { name: 'Seasonal Green Veggies', qty: '180 g', cost: 24 },
      { name: 'Desi Cow Ghee', qty: '25 g', cost: 18 },
      { name: 'Whole Wheat Phulkas (3 pcs)', qty: '90 g', cost: 9 }
    ],
    totalFoodCost: 85,
    grossMarginPct: 61.4,
    storeStockUnits: 45
  },
  {
    dishCode: '214',
    dishName: 'Mushroom Masala (Code 214)',
    category: 'Food (Veg)',
    sellingPrice: 220,
    ingredients: [
      { name: 'Fresh Button Mushrooms', qty: '200 g', cost: 55 },
      { name: 'Stone-Ground Mustard Gravy', qty: '140 g', cost: 20 },
      { name: 'Refined Sunflower Oil', qty: '30 ml', cost: 6 },
      { name: 'Ginger & Coriander', qty: '20 g', cost: 8 }
    ],
    totalFoodCost: 89,
    grossMarginPct: 59.5,
    storeStockUnits: 22
  },
  {
    dishCode: '308',
    dishName: 'Dal Fry (Yellow Lentils Tadka)',
    category: 'Food (Rice & Breads)',
    sellingPrice: 140,
    ingredients: [
      { name: 'Toor & Moong Dal', qty: '150 g', cost: 22 },
      { name: 'Desi Ghee Tadka', qty: '25 g', cost: 16 },
      { name: 'Tomatoes & Cumin Seeds', qty: '40 g', cost: 10 }
    ],
    totalFoodCost: 48,
    grossMarginPct: 65.7,
    storeStockUnits: 60
  },
  {
    dishCode: '306',
    dishName: 'Butter Tandoori Roti',
    category: 'Food (Rice & Breads)',
    sellingPrice: 30,
    ingredients: [
      { name: 'Chakki Fresh Atta', qty: '100 g', cost: 4.5 },
      { name: 'Amul Butter Glaze', qty: '15 g', cost: 7.5 }
    ],
    totalFoodCost: 12,
    grossMarginPct: 60.0,
    storeStockUnits: 180
  }
];

export default function StoreInventoryModal({
  isOpen,
  onClose
}) {
  const [activeTab, setActiveTab] = useState('purchases'); // 'purchases', 'requisitions', 'vendor-payables', 'recipe-bom'
  const [purchases, setPurchases] = useState(INITIAL_STORE_PURCHASES);
  const [requisitions, setRequisitions] = useState(INITIAL_KITCHEN_REQUISITIONS);
  const [selectedRecipeCode, setSelectedRecipeCode] = useState('215');
  const [depletionSimulated, setDepletionSimulated] = useState(false);
  const [voucherGenerated, setVoucherGenerated] = useState(false);
  const [recipeBom, setRecipeBom] = useState(KITCHEN_RECIPE_BOM);
  const [vendorBalances, setVendorBalances] = useState([
    { id: 1, name: 'Maa Majhighariani Daily Sabzi Mandi', cat: 'Fresh Vegetables & Herbs', contact: 'Kishore Sahu (+91 94371 88201)', supplies: 24800, paid: 18000 },
    { id: 2, name: 'Rayagada Broiler & Mutton Center', cat: 'Poultry, Chicken & Mutton Cuts', contact: 'M. Ramesh (+91 98612 44902)', supplies: 46500, paid: 32000 },
    { id: 3, name: 'Om Sai Dairy & Milk Cooperative', cat: 'Pure Milk, Paneer, Curd, Butter', contact: 'G. Patnaik (+91 82490 33811)', supplies: 18400, paid: 12000 },
    { id: 4, name: 'Pooja Grocery & Spices Wholesale', cat: 'Basmati Rice, Dal, Edible Oil, Spices', contact: 'Suresh Agarwal (+91 94370 22105)', supplies: 35900, paid: 20000 },
    { id: 5, name: 'Rayagada Commercial Gas Agency', cat: 'Commercial 19kg LPG Cylinders', contact: 'Delivery Desk (+91 06856 22214)', supplies: 12450, paid: 7400 }
  ]);

  // Sync live D1 store purchases and kitchen requisitions on open
  useEffect(() => {
    if (!isOpen) return;
    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      headers: { 'X-Admin-Key': adminPin }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          if (data.data.storePurchases && data.data.storePurchases.length > 0) {
            const mapped = data.data.storePurchases.map(p => ({
              purchaseId: p.purchase_id || p.purchaseId,
              vendorName: p.vendor_name || p.vendorName,
              invoiceNo: p.invoice_no || p.invoiceNo,
              date: p.purchase_date || p.date,
              category: p.category,
              itemsSummary: p.items_summary || p.itemsSummary,
              totalAmount: p.total_amount !== undefined ? p.total_amount : p.totalAmount,
              paymentStatus: p.payment_status || p.paymentStatus,
              receivedBy: p.received_by || p.receivedBy
            }));
            setPurchases(mapped);
          }
          if (data.data.kitchenRequisitions && data.data.kitchenRequisitions.length > 0) {
            const mappedReq = data.data.kitchenRequisitions.map(r => ({
              requisitionId: r.requisition_id || r.requisitionId,
              issueDate: r.issue_date || r.issueDate,
              targetOutlet: r.target_outlet || r.targetOutlet,
              itemName: r.item_name || r.itemName,
              quantityIssued: r.quantity_issued !== undefined ? r.quantity_issued : r.quantityIssued,
              unit: r.unit,
              approxCost: r.approx_cost !== undefined ? r.approx_cost : r.approxCost,
              issuedTo: r.issued_to || r.issuedTo,
              issuedBy: r.issued_by || r.issuedBy
            }));
            setRequisitions(mappedReq);
          }
        }
      })
      .catch(err => console.warn('Store inventory sync error:', err));
  }, [isOpen]);

  // Authentic Mysoft Universal Date Range Selector States
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [filterFromDate, setFilterFromDate] = useState(todayStr);
  const [filterToDate, setFilterToDate] = useState(todayStr);
  const [isDateFilterActive, setIsDateFilterActive] = useState(false);

  // New Purchase State
  const [newPurchaseOpen, setNewPurchaseOpen] = useState(false);
  const [vendorName, setVendorName] = useState('Rayagada Daily Sabzi Mandi');
  const [category, setCategory] = useState('Vegetables');
  const [itemsSummary, setItemsSummary] = useState('');
  const [amount, setAmount] = useState('');
  const [payStatus, setPayStatus] = useState('Cash Paid');

  const parseDateToIso = (dStr) => {
    if (!dStr || typeof dStr !== 'string') return null;
    if (dStr.includes('/')) {
      const parts = dStr.split(' ')[0].split('/');
      if (parts.length === 3) {
        return parts[0].length === 4 ? `${parts[0]}-${parts[1]}-${parts[2]}` : `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    } else if (dStr.includes('T')) {
      return dStr.split('T')[0];
    } else if (dStr.includes('-')) {
      return dStr.split(' ')[0];
    }
    return null;
  };

  const isDateInRange = (dStr) => {
    const iso = parseDateToIso(dStr);
    if (!iso) return true;
    return iso >= filterFromDate && iso <= filterToDate;
  };

  const filteredPurchases = useMemo(() => {
    if (!isDateFilterActive) return purchases;
    return purchases.filter(p => isDateInRange(p.date));
  }, [purchases, isDateFilterActive, filterFromDate, filterToDate]);

  const filteredRequisitions = useMemo(() => {
    if (!isDateFilterActive) return requisitions;
    return requisitions.filter(r => isDateInRange(r.issueDate || r.date));
  }, [requisitions, isDateFilterActive, filterFromDate, filterToDate]);

  const totalPurchases = filteredPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const creditPayables = filteredPurchases.filter(p => p.paymentStatus === 'Credit Payable').reduce((sum, p) => sum + p.totalAmount, 0);

  const handleAddPurchase = (e) => {
    e.preventDefault();
    if (!itemsSummary || !amount) return;

    const newP = {
      purchaseId: `PUR-202609-00${purchases.length + 1}`,
      vendorName,
      invoiceNo: `MND-${Date.now().toString().slice(-3)}`,
      date: new Date().toISOString().split('T')[0],
      category,
      itemsSummary,
      totalAmount: parseFloat(amount),
      paymentStatus: payStatus,
      receivedBy: "Chef Jagabandhu Sahu"
    };

    setPurchases([newP, ...purchases]);

    // Dispatch to Cloudflare Edge D1
    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminPin
      },
      body: JSON.stringify({
        action: 'record_store_purchase',
        payload: {
          purchaseId: newP.purchaseId,
          vendorName: newP.vendorName,
          invoiceNo: newP.invoiceNo,
          date: newP.date,
          category: newP.category,
          itemsSummary: newP.itemsSummary,
          totalAmount: newP.totalAmount,
          paymentStatus: newP.paymentStatus,
          receivedBy: newP.receivedBy
        }
      })
    }).catch(err => console.warn('Offline store purchase sync:', err));

    setNewPurchaseOpen(false);
    setItemsSummary('');
    setAmount('');
  };

  const handleGenerateDepletionVoucher = () => {
    const newVoucher = {
      requisitionId: `REQ-202609-${Date.now().toString().slice(-3)}`,
      issueDate: new Date().toISOString().split('T')[0],
      targetOutlet: 'Cannon Kitchen & Satvik Dining',
      itemName: 'Daily Recipe Depletion: Paneer (6.4kg), Basmati Rice (17.5kg), Desi Ghee (3.8kg), Poultry (11.4kg)',
      quantityIssued: 39.1,
      unit: 'kg (Aggregated)',
      approxCost: 4890.00,
      issuedTo: 'Head Chef Jagabandhu Sahu',
      issuedBy: 'Storekeeper Lingaraj'
    };

    setRequisitions([newVoucher, ...requisitions]);
    setVoucherGenerated(true);

    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminPin },
      body: JSON.stringify({
        action: 'record_kitchen_requisition',
        payload: newVoucher
      })
    }).catch(err => console.warn('Offline requisition sync:', err));
  };

  if (!isOpen) return null;

  const currentRecipe = KITCHEN_RECIPE_BOM.find(r => r.dishCode === selectedRecipeCode) || KITCHEN_RECIPE_BOM[0];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 7, 15, 0.9)',
      backdropFilter: 'blur(10px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: 1180,
        height: '90vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        border: '1px solid rgba(16, 185, 129, 0.35)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 2rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'linear-gradient(90deg, rgba(15,30,25,0.95), rgba(10,20,15,0.98))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid #10b981' }}>
                FOOD COST CONTROL
              </span>
              <h2 style={{ fontSize: '1.3rem', color: '#fff', margin: 0, fontWeight: 700 }}>
                Store Inventory &amp; Mandi Raw Material Purchases
              </h2>
            </div>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Daily local vegetable, dairy &amp; poultry inward register • Kitchen consumption requisition vouchers • Recipe BOM costing
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              color: '#fff',
              width: 36,
              height: 36,
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '0.75rem 2rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(10, 14, 25, 0.5)',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setActiveTab('purchases')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: activeTab === 'purchases' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: activeTab === 'purchases' ? '#34d399' : 'var(--text-muted)',
              border: activeTab === 'purchases' ? '1px solid #34d399' : '1px solid transparent'
            }}
          >
            <ShoppingCart size={15} /> Inward Purchases Register ({purchases.length})
          </button>

          <button
            onClick={() => setActiveTab('requisitions')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: activeTab === 'requisitions' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              color: activeTab === 'requisitions' ? '#38bdf8' : 'var(--text-muted)',
              border: activeTab === 'requisitions' ? '1px solid #38bdf8' : '1px solid transparent'
            }}
          >
            <Package size={15} /> Kitchen Issue Requisitions ({requisitions.length})
          </button>

          <button
            onClick={() => setActiveTab('vendor-payables')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: activeTab === 'vendor-payables' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
              color: activeTab === 'vendor-payables' ? '#fbbf24' : 'var(--text-muted)',
              border: activeTab === 'vendor-payables' ? '1px solid #fbbf24' : '1px solid transparent'
            }}
          >
            <DollarSign size={15} /> 🏪 Rayagada Vendor Credit Ledger (₹48,650)
          </button>

          <button
            onClick={() => setActiveTab('recipe-bom')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: activeTab === 'recipe-bom' ? 'rgba(168, 85, 247, 0.25)' : 'transparent',
              color: activeTab === 'recipe-bom' ? '#c084fc' : 'var(--text-muted)',
              border: activeTab === 'recipe-bom' ? '1px solid #c084fc' : '1px solid transparent'
            }}
          >
            <UtensilsCrossed size={15} /> Recipe BOM &amp; Depletion Engine (InvenTree)
          </button>
        </div>

        {/* Body Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
          {/* Authentic Mysoft Universal Date Range Selector Bar (Screenshot Identical) */}
          <UniversalDateFilterBar
            fromDate={filterFromDate}
            toDate={filterToDate}
            moduleType={
              activeTab === 'purchases' ? 'store' :
              activeTab === 'requisitions' ? 'store-requisitions' :
              activeTab === 'vendor-payables' ? 'store-vendors' :
              activeTab === 'recipe-bom' ? 'store-bom' :
              'store'
            }
            auditItems={
              activeTab === 'purchases' ? filteredPurchases :
              activeTab === 'requisitions' ? filteredRequisitions :
              activeTab === 'vendor-payables' ? vendorBalances.map(v => ({
                id: v.id,
                vendor: v.vendor,
                vendorName: v.vendor,
                category: v.category || 'General Supplies',
                terms: 'Net 15 Days',
                totalInvoiced: v.supplies || 0,
                amountPaid: v.paid || 0,
                balanceDue: (v.supplies || 0) - (v.paid || 0),
                status: ((v.supplies || 0) - (v.paid || 0)) > 0 ? 'Pending' : 'Settled'
              })) :
              activeTab === 'recipe-bom' ? recipeBom.map(b => ({
                id: b.id,
                dishName: b.dishName || b.dish,
                itemName: b.dishName || b.dish,
                category: b.category || 'Kitchen F&B',
                portionYield: b.portionYield || '1 Portion',
                rawIngredients: b.ingredientsSummary || b.rawIngredients || (b.ingredients || []).map(i => i.name).join(', '),
                baseCost: b.cost || b.baseCost || 0,
                sellingPrice: b.price || b.sellingPrice || 0,
                status: 'Active'
              })) :
              filteredPurchases
            }
            onUpdateItem={(item, field, newVal) => {
              if (activeTab === 'purchases') {
                setPurchases(prev => prev.map(p => (p.purchaseId === item.purchaseId || p.id === item.id) ? { ...p, [field]: newVal } : p));
              } else if (activeTab === 'requisitions') {
                setRequisitions(prev => prev.map(r => (r.requisitionId === item.requisitionId || r.id === item.id) ? { ...r, [field]: newVal } : r));
              } else if (activeTab === 'vendor-payables') {
                setVendorBalances(prev => prev.map(v => (v.id === item.id || v.vendor === item.vendor) ? {
                  ...v,
                  [field]: field === 'amountPaid' || field === 'totalInvoiced' || field === 'balanceDue' ? Number(newVal) : newVal,
                  paid: field === 'amountPaid' ? Number(newVal) : v.paid,
                  supplies: field === 'totalInvoiced' ? Number(newVal) : v.supplies
                } : v));
              } else if (activeTab === 'recipe-bom') {
                setRecipeBom(prev => prev.map(b => (b.id === item.id || b.dishName === item.dishName) ? {
                  ...b,
                  [field]: field === 'baseCost' || field === 'sellingPrice' ? Number(newVal) : newVal,
                  cost: field === 'baseCost' ? Number(newVal) : b.cost,
                  price: field === 'sellingPrice' ? Number(newVal) : b.price
                } : b));
              }
            }}
            onDateChange={(from, to) => {
              setFilterFromDate(from);
              setFilterToDate(to);
            }}
            onDisplay={(from, to) => {
              setFilterFromDate(from);
              setFilterToDate(to);
              setIsDateFilterActive(true);
            }}
            title={`STORE INVENTORY & PURCHASING (${activeTab.toUpperCase()})`}
            totalCount={
              activeTab === 'purchases' ? filteredPurchases.length :
              activeTab === 'requisitions' ? filteredRequisitions.length :
              activeTab === 'vendor-payables' ? vendorBalances.length :
              recipeBom.length
            }
            totalAmount={
              activeTab === 'purchases' ? filteredPurchases.reduce((s, p) => s + p.totalAmount, 0) :
              activeTab === 'requisitions' ? filteredRequisitions.reduce((s, r) => s + (r.approxCost || 0), 0) :
              activeTab === 'vendor-payables' ? vendorBalances.reduce((s, v) => s + ((v.supplies || 0) - (v.paid || 0)), 0) :
              recipeBom.reduce((s, b) => s + (b.cost || 0), 0)
            }
            onExportCSV={() => {
              let csv = "";
              if (activeTab === 'purchases') {
                csv = "PurchaseID,Vendor,Date,Category,Items,Amount,Status,ReceivedBy\n" +
                  filteredPurchases.map(p => `"${p.purchaseId}","${p.vendorName}","${p.date}","${p.category}","${p.itemsSummary}",${p.totalAmount},"${p.paymentStatus}","${p.receivedBy}"`).join('\n');
              } else {
                csv = "RequisitionID,Date,TargetOutlet,Item,Quantity,Cost,IssuedTo,IssuedBy\n" +
                  filteredRequisitions.map(r => `"${r.requisitionId}","${r.issueDate}","${r.targetOutlet}","${r.itemName}",${r.quantityIssued},${r.approxCost},"${r.issuedTo}","${r.issuedBy}"`).join('\n');
              }
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `Store_${activeTab}_${filterFromDate}_to_${filterToDate}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            onPrint={() => window.print()}
          />

          {activeTab === 'purchases' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Purchases Recorded:</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>₹{totalPurchases.toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vendor Credit Payables:</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f87171' }}>₹{creditPayables.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                <button
                  onClick={() => setNewPurchaseOpen(true)}
                  className="btn-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#10b981', color: '#000' }}
                >
                  <Plus size={16} /> Record Mandi Inward Purchase
                </button>
              </div>

              {/* Table */}
              <div className="enterprise-data-table-container">
                <SheetsToolbarLegend tableName="Store Inward Purchases & Mandi Ledger" subtitle="Daily Raw Material Procurement Register" />
                <table className="enterprise-data-table sheets-grid-table">
                  <thead>
                    <tr>
                      <SheetsColumnHeader title="Date / Purchase ID" badge="locked" style={{ padding: '0.75rem 1rem' }} />
                      <SheetsColumnHeader title="Vendor Name" badge="editable" style={{ padding: '0.75rem 1rem' }} />
                      <SheetsColumnHeader title="Category" badge="locked" style={{ padding: '0.75rem 1rem' }} />
                      <SheetsColumnHeader title="Items Summary" badge="editable" style={{ padding: '0.75rem 1rem' }} />
                      <SheetsColumnHeader title="Total (₹)" badge="editable" align="right" style={{ padding: '0.75rem 1rem' }} />
                      <SheetsColumnHeader title="Payment Mode" badge="editable" align="center" style={{ padding: '0.75rem 1rem' }} />
                    </tr>
                  </thead>
                <tbody>
                  {filteredPurchases.map(p => (
                    <tr key={p.purchaseId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{p.purchaseId}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.date} • {p.invoiceNo}</div>
                      </td>
                      <SheetsEditableCell
                        value={p.vendorName}
                        type="text"
                        cellStyle={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}
                        onSave={(newVal) => setPurchases(prev => prev.map(rec => rec.purchaseId === p.purchaseId ? { ...rec, vendorName: newVal } : rec))}
                      />
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          {p.category}
                        </span>
                      </td>
                      <SheetsEditableCell
                        value={p.itemsSummary}
                        type="text"
                        cellStyle={{ padding: '0.85rem 1rem', color: 'var(--text-primary)' }}
                        onSave={(newVal) => setPurchases(prev => prev.map(rec => rec.purchaseId === p.purchaseId ? { ...rec, itemsSummary: newVal } : rec))}
                      />
                      <SheetsEditableCell
                        value={p.totalAmount}
                        type="currency"
                        align="right"
                        className="cell-num"
                        cellStyle={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#38bdf8' }}
                        onSave={(newVal) => setPurchases(prev => prev.map(rec => rec.purchaseId === p.purchaseId ? { ...rec, totalAmount: Number(newVal) } : rec))}
                      />
                      <SheetsEditableCell
                        value={p.paymentStatus}
                        type="select"
                        align="center"
                        options={[
                          { value: 'Credit Payable', label: 'Credit Payable', badgeStyle: { background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' } },
                          { value: 'Paid In Cash', label: 'Paid In Cash', badgeStyle: { background: 'rgba(52, 211, 153, 0.2)', color: '#34d399' } },
                          { value: 'UPI Transferred', label: 'UPI Transferred', badgeStyle: { background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' } }
                        ]}
                        cellStyle={{ padding: '0.85rem 1rem' }}
                        onSave={(newVal) => setPurchases(prev => prev.map(rec => rec.purchaseId === p.purchaseId ? { ...rec, paymentStatus: newVal } : rec))}
                      />
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}

          {/* Tab 3: Local Rayagada Vendor Credit Ledger */}
          {activeTab === 'vendor-payables' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h4 style={{ color: '#fff', margin: 0, fontSize: '1.15rem' }}>Rayagada Local Vendor &amp; Supplier Credit Ledger</h4>
                  <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    Tracks purchases, payments, and outstanding balances to local vegetable, poultry, dairy &amp; grocery suppliers.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => alert('Printing Consolidated Vendor Payment Sheet for Managing Director Eswara')}
                    className="btn-outline"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <FileText size={14} /> Print Payment Advice
                  </button>
                </div>
              </div>

              <div className="enterprise-data-table-container">
                <SheetsToolbarLegend tableName="Vendor Outstandings & Mandi Sabzi Payables" subtitle="Creditor Accounts & Procurement Ledger" />
                <table className="enterprise-data-table sheets-grid-table">
                  <thead>
                    <tr>
                      <SheetsColumnHeader title="Supplier / Mandi Dealer" badge="locked" style={{ padding: '0.7rem 0.75rem' }} />
                      <SheetsColumnHeader title="Supplies Category" badge="locked" style={{ padding: '0.7rem 0.75rem' }} />
                      <SheetsColumnHeader title="Key Contact" badge="editable" style={{ padding: '0.7rem 0.75rem' }} />
                      <SheetsColumnHeader title="Total Supplies (₹)" badge="editable" align="right" style={{ padding: '0.7rem 0.75rem' }} />
                      <SheetsColumnHeader title="Paid (₹)" badge="editable" align="right" style={{ padding: '0.7rem 0.75rem' }} />
                      <SheetsColumnHeader title="Balance Due (₹)" badge="formula" align="right" style={{ padding: '0.7rem 0.75rem' }} />
                      <SheetsColumnHeader title="Action" badge="locked" align="center" style={{ padding: '0.7rem 0.75rem' }} />
                    </tr>
                  </thead>
                  <tbody>
                    {vendorBalances.map((v) => {
                      const balanceDue = (v.supplies || 0) - (v.paid || 0);
                      return (
                        <tr key={v.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '0.7rem 0.75rem', fontWeight: 600, color: '#fff' }}>{v.name}</td>
                          <td style={{ padding: '0.7rem 0.75rem', color: '#cbd5e1' }}>{v.cat}</td>
                          <SheetsEditableCell
                            value={v.contact}
                            type="text"
                            cellStyle={{ padding: '0.7rem 0.75rem', color: 'var(--text-muted)' }}
                            onSave={(newVal) => setVendorBalances(prev => prev.map(rec => rec.id === v.id ? { ...rec, contact: newVal } : rec))}
                          />
                          <SheetsEditableCell
                            value={v.supplies}
                            type="currency"
                            align="right"
                            className="cell-num"
                            cellStyle={{ padding: '0.7rem 0.75rem', color: '#38bdf8', fontWeight: 600 }}
                            onSave={(newVal) => setVendorBalances(prev => prev.map(rec => rec.id === v.id ? { ...rec, supplies: Number(newVal) } : rec))}
                          />
                          <SheetsEditableCell
                            value={v.paid}
                            type="currency"
                            align="right"
                            className="cell-num"
                            cellStyle={{ padding: '0.7rem 0.75rem', color: '#34d399', fontWeight: 600 }}
                            onSave={(newVal) => setVendorBalances(prev => prev.map(rec => rec.id === v.id ? { ...rec, paid: Number(newVal) } : rec))}
                          />
                          <td style={{ padding: '0.7rem 0.75rem', textAlign: 'right', fontWeight: 700, color: balanceDue > 0 ? '#f87171' : '#34d399' }}>
                            ₹{balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '0.7rem 0.75rem', textAlign: 'center' }}>
                            <button
                              onClick={() => alert(`Recording Cash/Cheque Payment Voucher for ${v.name}`)}
                              className="btn-outline-gold"
                              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                            >
                              Pay Voucher
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: 'rgba(255,255,255,0.05)', fontWeight: 800 }}>
                      <td colSpan={3} style={{ padding: '0.75rem', color: 'var(--gold-glow)' }}>TOTAL VENDOR OUTSTANDING</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', color: '#38bdf8' }}>
                        ₹{vendorBalances.reduce((s, v) => s + (v.supplies || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', color: '#34d399' }}>
                        ₹{vendorBalances.reduce((s, v) => s + (v.paid || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', color: '#f87171' }}>
                        ₹{vendorBalances.reduce((s, v) => s + ((v.supplies || 0) - (v.paid || 0)), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Requisitions */}
          {activeTab === 'requisitions' && (
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Cannon Kitchen Consumption Logs</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                Stock transferred from Main Store to Head Chef Jagabandhu Sahu to prevent raw material pilferage.
              </p>

              <SheetsToolbarLegend style={{ marginBottom: '0.6rem' }} />
              <div className="enterprise-data-table-container">
                <table className="enterprise-data-table sheets-grid-table">
                  <thead>
                    <tr>
                      <th style={{ padding: '0.75rem 1rem' }}><SheetsColumnHeader label="Requisition #" type="locked" /></th>
                      <th style={{ padding: '0.75rem 1rem' }}><SheetsColumnHeader label="Date" type="locked" /></th>
                      <th style={{ padding: '0.75rem 1rem' }}><SheetsColumnHeader label="Raw Material Item" type="editable" /></th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}><SheetsColumnHeader label="Quantity Issued" type="editable" align="center" /></th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}><SheetsColumnHeader label="Est. Cost (₹)" type="editable" align="right" /></th>
                      <th style={{ padding: '0.75rem 1rem' }}><SheetsColumnHeader label="Issued To" type="editable" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequisitions.map(r => (
                      <tr key={r.requisitionId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#fbbf24' }}>{r.requisitionId}</td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>{r.issueDate || r.date}</td>
                        <SheetsEditableCell
                          value={r.itemName}
                          type="text"
                          cellStyle={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#fff' }}
                          onSave={(newVal) => setRequisitions(prev => prev.map(rec => rec.requisitionId === r.requisitionId ? { ...rec, itemName: newVal } : rec))}
                        />
                        <SheetsEditableCell
                          value={r.quantityIssued || r.quantity}
                          type="text"
                          cellStyle={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#38bdf8', fontWeight: 600 }}
                          onSave={(newVal) => setRequisitions(prev => prev.map(rec => rec.requisitionId === r.requisitionId ? { ...rec, quantityIssued: newVal, quantity: newVal } : rec))}
                        />
                        <SheetsEditableCell
                          value={Number(r.approxCost || 0)}
                          type="number"
                          cellStyle={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#34d399', fontWeight: 600 }}
                          onSave={(newVal) => setRequisitions(prev => prev.map(rec => rec.requisitionId === r.requisitionId ? { ...rec, approxCost: parseFloat(newVal) || 0 } : rec))}
                        />
                        <SheetsEditableCell
                          value={r.issuedTo}
                          type="text"
                          cellStyle={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}
                          onSave={(newVal) => setRequisitions(prev => prev.map(rec => rec.requisitionId === r.requisitionId ? { ...rec, issuedTo: newVal } : rec))}
                        />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: KITCHEN RECIPE BOM & DEPLETION ENGINE (INVENTREE ARCHITECTURE) */}
          {activeTab === 'recipe-bom' && (
            <div>
              {/* Top Analytical KPI Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: 600 }}>ACTIVE RECIPE BOMS</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>6 Signature Dishes</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>100% ingredients mapped to dry store</div>
                </div>

                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>AVERAGE FOOD COST</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>44.2%</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Optimal threshold (&lt; 45% F&amp;B target)</div>
                </div>

                <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>AVERAGE GROSS MARGIN</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>55.8%</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Gross restaurant margin contribution</div>
                </div>

                <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600 }}>REORDER THRESHOLD</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24', marginTop: '4px' }}>2 Low Stock Items</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Desi Ghee (&lt; 5kg) &amp; Mushrooms (&lt; 4kg)</div>
                </div>
              </div>

              {/* Main Recipe BOM Interface: Left List + Right Detail */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                
                {/* Left: Recipe Catalog Table */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ margin: 0, color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Scale size={16} color="#c084fc" /> Cannon Kitchen Recipe Costing Matrix
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click dish to inspect BOM</span>
                  </div>

                  <div className="enterprise-data-table-container" style={{ margin: 0 }}>
                    <SheetsToolbarLegend tableName="Recipe BOM Costing Matrix" subtitle="Direct Kitchen Yield Margin Ledger" />
                    <table className="enterprise-data-table sheets-grid-table">
                      <thead>
                        <tr>
                          <SheetsColumnHeader title="Dish & Code" badge="locked" style={{ padding: '0.65rem 0.75rem' }} />
                          <SheetsColumnHeader title="Menu Price" badge="editable" align="right" style={{ padding: '0.65rem 0.75rem' }} />
                          <SheetsColumnHeader title="Raw Cost" badge="editable" align="right" style={{ padding: '0.65rem 0.75rem' }} />
                          <SheetsColumnHeader title="Food Cost %" badge="formula" align="center" style={{ padding: '0.65rem 0.75rem' }} />
                          <SheetsColumnHeader title="Stock Capacity" badge="locked" align="center" style={{ padding: '0.65rem 0.75rem' }} />
                        </tr>
                      </thead>
                    <tbody>
                      {recipeBom.map(dish => (
                        <tr 
                          key={dish.dishCode}
                          onClick={() => setSelectedRecipeCode(dish.dishCode)}
                          style={{
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            background: selectedRecipeCode === dish.dishCode ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
                            cursor: 'pointer'
                          }}
                        >
                          <td style={{ padding: '0.75rem' }}>
                            <div style={{ fontWeight: 700, color: '#fff' }}>{dish.dishName}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Code {dish.dishCode} • {dish.category}</div>
                          </td>
                          <SheetsEditableCell
                            value={dish.sellingPrice}
                            type="currency"
                            align="right"
                            min={1}
                            cellStyle={{ padding: '0.75rem', fontWeight: 700, color: '#fff' }}
                            onSave={(newVal) => setRecipeBom(prev => prev.map(d => d.dishCode === dish.dishCode ? { ...d, sellingPrice: Number(newVal) } : d))}
                          />
                          <SheetsEditableCell
                            value={dish.totalFoodCost}
                            type="currency"
                            align="right"
                            min={1}
                            cellStyle={{ padding: '0.75rem', color: '#f87171', fontWeight: 600 }}
                            onSave={(newVal) => setRecipeBom(prev => prev.map(d => d.dishCode === dish.dishCode ? { ...d, totalFoodCost: Number(newVal) } : d))}
                          />
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                            <span style={{
                              background: (dish.totalFoodCost / dish.sellingPrice) < 0.45 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                              color: (dish.totalFoodCost / dish.sellingPrice) < 0.45 ? '#34d399' : '#fbbf24',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: 700,
                              fontSize: '0.75rem'
                            }}>
                              {((dish.totalFoodCost / dish.sellingPrice) * 100).toFixed(1)}%
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                            <span style={{
                              background: dish.storeStockUnits < 30 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.15)',
                              color: dish.storeStockUnits < 30 ? '#f87171' : '#38bdf8',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontWeight: 700,
                              fontSize: '0.75rem'
                            }}>
                              {dish.storeStockUnits} Portions
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>

                {/* Right: Selected Dish BOM Specification (InvenTree Style) */}
                <div style={{
                  background: 'linear-gradient(145deg, #120e24, #0b0716)',
                  border: '1.5px solid rgba(168, 85, 247, 0.4)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', marginBottom: '0.85rem' }}>
                    <div>
                      <span style={{ background: '#7c3aed', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                        BOM Spec: Code {currentRecipe.dishCode}
                      </span>
                      <h4 style={{ margin: '4px 0 0 0', fontSize: '1.15rem', color: '#fff', fontWeight: 800 }}>
                        {currentRecipe.dishName}
                      </h4>
                      <div style={{ fontSize: '0.72rem', color: '#a78bfa' }}>
                        {currentRecipe.category}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Menu Selling Price</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--gold-glow)' }}>
                        ₹{currentRecipe.sellingPrice}
                      </div>
                    </div>
                  </div>

                  {/* Ingredient Breakdown */}
                  <div style={{ flex: 1, marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Layers size={13} color="#38bdf8" /> RAW MATERIAL INGREDIENTS CONSUMPTION PER PORTION
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      {currentRecipe.ingredients.map((ing, i) => (
                        <div key={i} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: 'rgba(255,255,255,0.03)',
                          padding: '0.45rem 0.65rem',
                          borderRadius: '6px',
                          fontSize: '0.78rem'
                        }}>
                          <div>
                            <span style={{ color: '#fff', fontWeight: 600 }}>{ing.name}</span>
                            <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>({ing.qty})</span>
                          </div>
                          <span style={{ color: '#34d399', fontWeight: 700 }}>₹{ing.cost.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Profitability Summary */}
                  <div style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    fontSize: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                      <span>Total Raw Material Cost:</span>
                      <span style={{ color: '#f87171', fontWeight: 700 }}>₹{currentRecipe.totalFoodCost.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                      <span>Gross Profit Contribution:</span>
                      <span style={{ color: '#34d399', fontWeight: 700 }}>₹{(currentRecipe.sellingPrice - currentRecipe.totalFoodCost).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dotted rgba(255,255,255,0.1)', paddingTop: '4px', marginTop: '2px', fontWeight: 800 }}>
                      <span style={{ color: '#fff' }}>Gross Profit Margin:</span>
                      <span style={{ color: '#c084fc' }}>{currentRecipe.grossMarginPct}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simulation: Automatic Kitchen Stock Depletion from Today's KDS Orders */}
              <div style={{
                background: 'linear-gradient(145deg, rgba(30, 27, 75, 0.4), rgba(15, 23, 42, 0.6))',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '12px',
                padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={16} color="#fbbf24" /> Live KDS Orders Depletion Engine (Simulated Today)
                    </h4>
                    <p style={{ margin: '2px 0 0', color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                      Aggregates 38 Biryani, 32 Paneer, 26 Mushroom, 42 Dal Fry, 55 Steamed Rice from today's dining orders into exact store inventory depletion.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => setDepletionSimulated(prev => !prev)}
                      style={{
                        background: 'rgba(139, 92, 246, 0.2)',
                        border: '1px solid #8b5cf6',
                        color: '#c4b5fd',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <RefreshCw size={13} /> {depletionSimulated ? 'Reset Calculation' : 'Recalculate Today\'s Burn'}
                    </button>

                    <button
                      onClick={handleGenerateDepletionVoucher}
                      disabled={voucherGenerated}
                      style={{
                        background: voucherGenerated ? 'rgba(16, 185, 129, 0.2)' : '#10b981',
                        border: voucherGenerated ? '1px solid #10b981' : 'none',
                        color: voucherGenerated ? '#34d399' : '#000',
                        padding: '0.4rem 0.9rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: voucherGenerated ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {voucherGenerated ? <Check size={14} /> : <FileText size={14} />}
                      {voucherGenerated ? 'Requisition Voucher Posted!' : 'Post Requisition Voucher to D1'}
                    </button>
                  </div>
                </div>

                {/* Depleted Ingredients Breakdown */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem', marginTop: '0.75rem' }}>
                  {[
                    { name: 'Fresh Paneer', burned: '6.4 kg', remaining: '8.6 kg', status: 'Optimal', color: '#34d399' },
                    { name: 'Aged Basmati Rice', burned: '17.5 kg', remaining: '32.5 kg', status: 'Optimal', color: '#34d399' },
                    { name: 'Fresh Country Poultry', burned: '11.4 kg', remaining: '14.6 kg', status: 'Optimal', color: '#34d399' },
                    { name: 'Desi Cow Ghee', burned: '3.8 kg', remaining: '4.2 kg', status: 'Low Stock', color: '#fbbf24' },
                    { name: 'Yellow Toor Dal', burned: '6.3 kg', remaining: '18.7 kg', status: 'Optimal', color: '#34d399' }
                  ].map((item, idx) => (
                    <div key={idx} style={{
                      background: 'rgba(0,0,0,0.35)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px'
                    }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>{item.name}</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
                        {item.burned} <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>consumed</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Stock: {item.remaining}</span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: item.color }}>{item.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal: New Purchase */}
        {newPurchaseOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2100
          }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: 480, padding: '1.5rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ color: '#fff', margin: 0 }}>Record Mandi Inward Purchase</h4>
                <button onClick={() => setNewPurchaseOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddPurchase}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Local Vendor</label>
                  <input
                    type="text"
                    required
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', background: '#0d111d', color: '#fff', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', background: '#0d111d', color: '#fff', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}
                  >
                    <option value="Vegetables">Vegetables &amp; Fresh Mandi Produce</option>
                    <option value="Poultry & Meat">Poultry &amp; Fresh Country Chicken</option>
                    <option value="Dairy & Paneer">Dairy, Milk &amp; Fresh Paneer</option>
                    <option value="Groceries & Rice">Groceries, Basmati Rice &amp; Spices</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Items Summary &amp; Quantities</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="e.g. Tomatoes (25kg), Potatoes (40kg), Fresh Coriander"
                    value={itemsSummary}
                    onChange={(e) => setItemsSummary(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', background: '#0d111d', color: '#fff', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Total Amount (₹)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 3500"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', background: '#0d111d', color: '#fff', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Payment Status</label>
                    <select
                      value={payStatus}
                      onChange={(e) => setPayStatus(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', background: '#0d111d', color: '#fff', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}
                    >
                      <option value="Cash Paid">Cash Paid</option>
                      <option value="UPI Paid">UPI Paid</option>
                      <option value="Credit Payable">Credit Payable (Vendor Ledger)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setNewPurchaseOpen(false)} className="btn-outline" style={{ padding: '0.4rem 0.8rem' }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ padding: '0.4rem 1rem', background: '#10b981', color: '#000' }}>
                    Save Inward Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
