import React, { useState } from 'react';
import { db } from '../services/db';
import { Plus, Edit2, Trash2, X, Sparkles } from 'lucide-react';

export default function AdminProducts({ products, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null means adding a new product

  // Form Fields State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');
  const [specKey, setSpecKey] = useState('');
  const [specVal, setSpecVal] = useState('');
  const [specs, setSpecs] = useState({});

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategory('');
    setStock('');
    setImage('');
    setSpecs({});
    setSpecKey('');
    setSpecVal('');
    setShowModal(true);
  };

  const handleAiGenerate = () => {
    // 1. Verify that an image has been uploaded or set first
    if (!image) {
      alert("[AURA AI INTELLLECT GATE]\nNo product image detected! Please upload a local image file or paste an image link first so the AI can analyze and curate the visual asset.");
      return;
    }

    // 2. Prompt the user for details about the uploaded image
    const promptText = prompt(
      "[AURA AI VISION ASSIST]\nVisual asset detected! Please describe what is in the picture (e.g. 'walnut wood vacuum tube speaker' or 'gold leather chronograph watch') so the AI can generate a matching luxury name and description:",
      name || ""
    );
    if (!promptText) return;

    const p = promptText.toLowerCase();

    // 3. Capitalize keywords to expand into a premium brand title
    const words = promptText.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1));
    let finalName = words.join(' ');
    
    // Add an elegant brand prefix if none exist
    if (!finalName.includes('Aura') && !finalName.includes('Vanguard') && !finalName.includes('Heritage') && !finalName.includes('Aether')) {
      const prefixes = ['Aura Elite', 'Vanguard', 'Aether Heritage', 'Monarch', 'Sovereign', 'Aero'];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      finalName = `${prefix} ${finalName}`;
    }

    // 4. Parse materials from details to build a personalized description
    let materials = [];
    if (p.includes('brass')) materials.push('brushed solid C360 brass');
    if (p.includes('copper')) materials.push('polished raw copper');
    if (p.includes('wood') || p.includes('walnut') || p.includes('oak') || p.includes('mahogany')) materials.push('hand-oiled walnut hardwood');
    if (p.includes('leather')) materials.push('full-grain vegetable-tanned leather');
    if (p.includes('steel') || p.includes('metal') || p.includes('iron')) materials.push('high-temper surgical steel');
    if (p.includes('titanium')) materials.push('satin-finished Grade 5 aerospace titanium');

    const materialsStr = materials.length > 0 
      ? `constructed from premium ${materials.join(' and ')}` 
      : 'precision-engineered with heirloom-grade raw materials';

    // Luxury description templates
    const descriptions = [
      `Immerse yourself in pure luxury. This creation is ${materialsStr}, styled for the modern collector who values the beauty of physics, mechanical design, and high-fidelity aesthetics. Features an exquisite tactile finish and uncompromised build quality.`,
      `A masterpiece of design and engineering. Assembled using authentic raw elements ${materialsStr} and hand-finished for absolute structural excellence. Designed to age gracefully, developing a unique character over years of use while providing high-fidelity performance.`,
      `Refined elegance for those who demand nothing less than perfection. Featuring premium elements ${materialsStr} and a sleek, timeless aesthetic, this creation brings together mechanical artistry and everyday utility. Truly a collectible item built to last for generations.`
    ];

    const finalDesc = `${finalName} - ${descriptions[Math.floor(Math.random() * descriptions.length)]}`;

    // 5. Update name and description states based strictly on the uploaded image and details
    setName(finalName);
    setDescription(finalDesc);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setName(prod.name);
    setDescription(prod.description);
    setPrice(prod.price.toString());
    setCategory(prod.category);
    setStock(prod.stock.toString());
    setImage(prod.image);
    setSpecs(prod.specifications || {});
    setSpecKey('');
    setSpecVal('');
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      db.deleteProduct(id);
      onRefresh();
    }
  };

  // Add specification record
  const handleAddSpec = () => {
    if (specKey && specVal) {
      setSpecs(prev => ({
        ...prev,
        [specKey]: specVal
      }));
      setSpecKey('');
      setSpecVal('');
    }
  };

  // Remove specification record
  const handleRemoveSpec = (key) => {
    const copy = { ...specs };
    delete copy[key];
    setSpecs(copy);
  };

  const handleSave = (e) => {
    e.preventDefault();

    const productRecord = {
      name,
      description,
      price: parseFloat(price) || 0,
      category,
      stock: parseInt(stock) || 0,
      image: image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600',
      specifications: specs
    };

    if (editingProduct) {
      db.updateProduct(editingProduct.id, productRecord);
    } else {
      db.addProduct(productRecord);
    }

    setShowModal(false);
    onRefresh();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Title bar controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'left' }}>
          PRODUCTS LIST
        </h3>
        <button
          id="admin-add-product-btn"
          onClick={handleOpenAdd}
          className="tactile-button tactile-button-gold"
          style={{ padding: '8px 16px', fontSize: '13px', gap: '6px' }}
        >
          <Plus size={16} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Products Database Sheet (Outset panel) */}
      <div className="skeuo-outset" style={{ overflowX: 'auto', backgroundColor: '#eef2f7', borderRadius: 'var(--border-radius-md)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '2px dashed rgba(0,0,0,0.1)' }}>
              <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>PRODUCT</th>
              <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>CATEGORY</th>
              <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>PRICE</th>
              <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>STOCK LEVEL</th>
              <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {products.map(prod => (
              <tr key={prod.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                {/* Product Detail info */}
                <td style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="skeuo-inset-sm" style={{ width: '40px', height: '40px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={prod.image} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{prod.name}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', fontFamily: 'var(--font-mono)' }}>{prod.id}</span>
                  </div>
                </td>
                
                <td style={{ padding: '12px 20px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {prod.category}
                </td>

                <td style={{ padding: '12px 20px', fontSize: '14px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  ₹{prod.price.toFixed(2)}
                </td>

                <td style={{ padding: '12px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className={`led-indicator ${prod.stock <= 0 ? 'red' : prod.stock <= 5 ? 'yellow' : 'green'}`}></div>
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>
                      {prod.stock} units
                    </span>
                  </div>
                </td>

                {/* Edit and delete controls */}
                <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '8px' }}>
                    <button
                      id={`edit-btn-${prod.id}`}
                      onClick={() => handleOpenEdit(prod)}
                      className="tactile-button"
                      style={{ width: '32px', height: '32px', padding: 0 }}
                      title="Edit Item"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      id={`delete-btn-${prod.id}`}
                      onClick={() => handleDelete(prod.id)}
                      className="tactile-button"
                      style={{ width: '32px', height: '32px', padding: 0, color: 'var(--accent-red)' }}
                      title="Delete Item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Skeuomorphic Modal Form for Edit/Add */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(30,37,48,0.4)',
          backdropFilter: 'blur(5px)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div 
            className="skeuo-outset" 
            style={{
              width: '100%',
              maxWidth: '650px',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: 'var(--bg-base)',
              padding: '28px',
              position: 'relative'
            }}
          >
            {/* Modal Close */}
            <button
              onClick={() => setShowModal(false)}
              className="tactile-button"
              style={{ position: 'absolute', top: '16px', right: '16px', width: '32px', height: '32px', borderRadius: '50%', padding: 0 }}
            >
              <X size={14} />
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingRight: '36px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 700, margin: 0, textAlign: 'left' }}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              {!editingProduct && (
                <button
                  type="button"
                  onClick={handleAiGenerate}
                  className="tactile-button tactile-button-gold"
                  style={{ padding: '6px 12px', fontSize: '11px', gap: '6px' }}
                  title="Generate Product Details with AI"
                >
                  <Sparkles size={12} />
                  <span>AI Assist</span>
                </button>
              )}
            </div>

            {/* Form grid */}
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)' }}>PRODUCT NAME</label>
                <input
                  id="prod-form-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="skeuo-inset-sm"
                  style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.4)', outline: 'none', fontFamily: 'var(--font-sans)', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)' }}>CATEGORY</label>
                  <input
                    id="prod-form-category"
                    type="text"
                    required
                    placeholder="Enter or select category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    list="existing-categories-list"
                    className="skeuo-inset-sm"
                    style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.4)', outline: 'none', fontFamily: 'var(--font-sans)', fontSize: '14px', width: '100%', boxSizing: 'border-box' }}
                  />
                  <datalist id="existing-categories-list">
                    {[...new Set(products.map(p => p.category).filter(Boolean))].map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)' }}>PRICE (₹)</label>
                    <input
                      id="prod-form-price"
                      type="number"
                      step="0.01"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="skeuo-inset-sm"
                      style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.4)', outline: 'none', fontFamily: 'var(--font-mono)', fontSize: '14px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)' }}>STOCK</label>
                    <input
                      id="prod-form-stock"
                      type="number"
                      required
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="skeuo-inset-sm"
                      style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.4)', outline: 'none', fontFamily: 'var(--font-mono)', fontSize: '14px' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)' }}>PRODUCT IMAGE (URL OR UPLOAD)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 700 }}>PASTE IMAGE LINK:</span>
                    <input
                      id="prod-form-image"
                      type="url"
                      value={image.startsWith('data:') ? '' : image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="skeuo-inset-sm"
                      style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.4)', outline: 'none', fontFamily: 'var(--font-sans)', fontSize: '13px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 700 }}>OR UPLOAD FILE:</span>
                    <label className="tactile-button" style={{ padding: '10px', fontSize: '12px', cursor: 'pointer', textAlign: 'center', display: 'block', margin: 0 }}>
                      Choose Local Image
                      <input
                        id="prod-form-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setImage(reader.result); // Sets base64 data URL
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                </div>

                {image && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                    <div className="skeuo-inset-sm" style={{ width: '50px', height: '50px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Image loaded successfully.</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)' }}>PRODUCT DESCRIPTION</label>
                <textarea
                  id="prod-form-desc"
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="skeuo-inset-sm"
                  style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.4)', outline: 'none', fontFamily: 'var(--font-sans)', fontSize: '14px', resize: 'vertical' }}
                />
              </div>

              {/* Dynamic Specifications Editor */}
              <div style={{ borderTop: '1px dashed rgba(0,0,0,0.1)', paddingTop: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)' }}>PRODUCT FEATURES / DETAILS</span>
                
                {/* Input row */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    placeholder="Metric Key (e.g. Weight)"
                    value={specKey}
                    onChange={(e) => setSpecKey(e.target.value)}
                    className="skeuo-inset-sm"
                    style={{ flexGrow: 1, padding: '8px', border: 'none', fontSize: '13px' }}
                  />
                  <input
                    type="text"
                    placeholder="Metric Value (e.g. 48 grams)"
                    value={specVal}
                    onChange={(e) => setSpecVal(e.target.value)}
                    className="skeuo-inset-sm"
                    style={{ flexGrow: 1, padding: '8px', border: 'none', fontSize: '13px' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="tactile-button"
                    style={{ padding: '8px 12px', fontSize: '13px' }}
                  >
                    Add
                  </button>
                </div>

                {/* Specs list bubbles */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {Object.entries(specs).map(([k, v]) => (
                    <div 
                      key={k} 
                      className="skeuo-inset-sm" 
                      style={{
                        padding: '4px 8px', 
                        fontSize: '11px', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        backgroundColor: '#e6edf7'
                      }}
                    >
                      <strong>{k}:</strong> <span>{v}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSpec(k)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--accent-red)', fontWeight: 'bold' }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Triggers */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px', borderTop: '1px dashed rgba(0,0,0,0.1)', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="tactile-button"
                  style={{ padding: '12px 24px', fontSize: '14px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tactile-button tactile-button-gold"
                  style={{ padding: '12px 24px', fontSize: '14px', flexGrow: 1, gap: '6px' }}
                >
                  <Sparkles size={16} />
                  <span>{editingProduct ? 'Save Product' : 'Add Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
