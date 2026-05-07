import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, X, Trash2, Users as UsersIcon, Briefcase, Search, ChevronDown, Check, Shield, Edit2 } from 'lucide-react';
import Select from '../components/Select';
import { useAppContext } from '../context/AppContext';

const API_BASE = 'http://localhost:8080';

/* ── Chip multi-select ── */
function ChipMultiSelect({ icon: Icon, allLabel, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const toggle = (val) => {
    if (selected.includes(val)) onChange(selected.filter(v => v !== val));
    else onChange([...selected, val]);
  };

  const displayLabel = selected.length === 0
    ? allLabel
    : selected.length === 1
      ? (options.find(o => o.value === selected[0])?.label || selected[0])
      : `${selected.length} selecionados`;
  const has = selected.length > 0;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(!open)} style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
        padding: '0.375rem 0.75rem', borderRadius: '100px',
        fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer',
        border: `1px solid ${has ? 'var(--accent-color)' : 'var(--border-color)'}`,
        background: has ? 'var(--accent-color)' : 'var(--bg-panel)',
        color: has ? 'var(--accent-text)' : 'var(--text-secondary)',
        fontFamily: 'var(--font-sans)', transition: 'all 0.15s ease',
      }}>
        <Icon size={13} /> {displayLabel}
        <ChevronDown size={12} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 100,
          minWidth: '200px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-lg)', animation: 'fadeIn 0.15s ease-out',
        }}>
          {has && (
            <div onClick={() => { onChange([]); setOpen(false); }}
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <X size={12} /> Limpar filtro
            </div>
          )}
          {options.map(opt => {
            const isSel = selected.includes(opt.value);
            return (
              <div key={opt.value} onClick={() => toggle(opt.value)}
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: isSel ? 'var(--text-primary)' : 'var(--text-secondary)', background: isSel ? 'var(--bg-active)' : 'transparent', transition: 'background 0.1s' }}
                onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}>
                <div style={{ width: 16, height: 16, borderRadius: '3px', border: `1px solid ${isSel ? 'var(--accent-color)' : 'var(--border-focus)'}`, background: isSel ? 'var(--accent-color)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {isSel && <Check size={10} style={{ color: 'var(--accent-text)' }} />}
                </div>
                {opt.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Team() {
  const { showToast } = useAppContext();
  const [sectors, setSectors] = useState([]);
  const [operators, setOperators] = useState([]);

  const [showSectorModal, setShowSectorModal] = useState(false);
  const [showOperatorModal, setShowOperatorModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newSector, setNewSector] = useState('');
  const [newOperator, setNewOperator] = useState({ name: '', email: '', sectorId: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ type: null, id: null, name: null });

  const [searchOperator, setSearchOperator] = useState('');
  const [searchSector, setSearchSector] = useState('');
  const [filterStatus, setFilterStatus] = useState([]);
  const [filterSector, setFilterSector] = useState([]);

  const fetchData = async () => {
    try {
      const [sRes, oRes] = await Promise.all([
        fetch(`${API_BASE}/management/sectors`),
        fetch(`${API_BASE}/management/operators`)
      ]);
      if (sRes.ok) setSectors(await sRes.json());
      if (oRes.ok) setOperators(await oRes.json());
    } catch (err) {
      showToast("Erro ao carregar dados", "danger");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSector = async (e) => { 
    e.preventDefault(); 
    if (!newSector) return; 
    try {
      const method = editingItem?.type === 'sector' ? 'PUT' : 'POST';
      const url = editingItem?.type === 'sector' ? `${API_BASE}/management/sectors/${editingItem.id}` : `${API_BASE}/management/sectors`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSector })
      });
      if (res.ok) {
        showToast(editingItem ? 'Setor atualizado' : 'Setor criado');
        fetchData();
        setNewSector(''); setEditingItem(null); setShowSectorModal(false); 
      }
    } catch (err) {
      showToast("Erro ao salvar setor", "danger");
    }
  };
  
  const handleAddOperator = async (e) => { 
    e.preventDefault(); 
    if (!newOperator.name || !newOperator.email || !newOperator.sectorId) return; 
    try {
      const method = editingItem?.type === 'operator' ? 'PUT' : 'POST';
      const url = editingItem?.type === 'operator' ? `${API_BASE}/management/operators/${editingItem.id}` : `${API_BASE}/management/operators`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newOperator.name, 
          email: newOperator.email, 
          sectorId: newOperator.sectorId,
          password: 'password123' // Default for new ops
        })
      });
      if (res.ok) {
        showToast(editingItem ? 'Operador atualizado' : 'Operador criado');
        fetchData();
        setNewOperator({ name: '', email: '', sectorId: '' }); setEditingItem(null); setShowOperatorModal(false); 
      }
    } catch (err) {
      showToast("Erro ao salvar operador", "danger");
    }
  };

  const startEditOperator = (op) => {
    setEditingItem({ type: 'operator', id: op.id });
    setNewOperator({ name: op.name, email: op.email, sectorId: op.sectorId });
    setShowOperatorModal(true);
  };

  const startEditSector = (sector) => {
    setEditingItem({ type: 'sector', id: sector.id });
    setNewSector(sector.name);
    setShowSectorModal(true);
  };

  const removeSector = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/management/sectors/${id}`, { method: 'DELETE' });
      if (res.ok) { showToast('Setor removido'); fetchData(); }
    } catch (err) { showToast("Erro ao remover", "danger"); }
  };

  const removeOperator = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/management/operators/${id}`, { method: 'DELETE' });
      if (res.ok) { showToast('Operador removido'); fetchData(); }
    } catch (err) { showToast("Erro ao remover", "danger"); }
  };

  const filteredOperators = useMemo(() => {
    return operators.filter(op => {
      const opSector = sectors.find(s => s.id === op.sectorId)?.name || '';
      if (searchOperator && !op.name.toLowerCase().includes(searchOperator.toLowerCase()) && !op.email.toLowerCase().includes(searchOperator.toLowerCase())) return false;
      if (filterStatus.length > 0 && !filterStatus.includes(op.status)) return false;
      if (filterSector.length > 0 && !filterSector.includes(opSector)) return false;
      return true;
    });
  }, [operators, sectors, searchOperator, filterStatus, filterSector]);

  const filteredSectors = sectors.filter(s => s.name.toLowerCase().includes(searchSector.toLowerCase()));
  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const sectorOptions = sectors.map(s => ({ value: s.name, label: s.name }));
  const statusOptions = [{ value: 'ONLINE', label: 'Online' }, { value: 'OFFLINE', label: 'Offline' }, { value: 'AWAY', label: 'Ausente' }];

  return (
    <div>
      <div className="page-header">
        <h1>Equipe e Setores</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Operators Panel */}
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="section-header">
            <div className="section-header-title">
              <UsersIcon size={16} /> Operadores
              <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({filteredOperators.length})</span>
            </div>
            <div className="section-header-actions">
              <ChipMultiSelect icon={Shield} allLabel="Status" options={statusOptions} selected={filterStatus} onChange={setFilterStatus} />
              <ChipMultiSelect icon={Briefcase} allLabel="Setor" options={sectorOptions} selected={filterSector} onChange={setFilterSector} />
              <div className="search-input-wrap">
                <Search size={13} />
                <input type="text" placeholder="Pesquisar operador..." value={searchOperator} onChange={(e) => setSearchOperator(e.target.value)} />
              </div>
              <button className="btn primary" onClick={() => setShowOperatorModal(true)}>
                <Plus size={14} /> Adicionar
              </button>
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Operador</th>
                <th>E-mail</th>
                <th>Setor</th>
                <th>Status</th>
                <th style={{ width: '48px' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredOperators.map(op => {
                const sectorName = sectors.find(s => s.id === op.sectorId)?.name || '—';
                return (
                  <tr key={op.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-active)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-secondary)', flexShrink: 0 }}>
                          {getInitials(op.name)}
                        </div>
                        <span style={{ fontWeight: 500 }}>{op.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{op.email}</td>
                    <td>{sectorName}</td>
                    <td><span className={`badge ${op.status === 'ONLINE' ? 'green' : 'warning'}`}>{op.status}</span></td>
                    <td style={{ display: 'flex', gap: '0.375rem' }}>
                      <button className="btn" style={{ padding: '0.3rem' }} onClick={() => startEditOperator(op)} title="Editar"><Edit2 size={14} /></button>
                      <button className="btn danger" style={{ padding: '0.3rem' }} onClick={() => setDeleteConfirm({ type: 'operator', id: op.id, name: op.name })} title="Remover"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                );
              })}
              {filteredOperators.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Nenhum operador encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Sectors Panel */}
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="section-header">
            <div className="section-header-title">
              <Briefcase size={16} /> Setores
              <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({filteredSectors.length})</span>
            </div>
            <div className="section-header-actions">
              <div className="search-input-wrap">
                <Search size={13} />
                <input type="text" placeholder="Pesquisar setor..." value={searchSector} onChange={(e) => setSearchSector(e.target.value)} />
              </div>
              <button className="btn primary" onClick={() => setShowSectorModal(true)}>
                <Plus size={14} /> Novo
              </button>
            </div>
          </div>
          <table className="data-table">
            <tbody>
              {filteredSectors.map(sector => (
                <tr key={sector.id}>
                  <td style={{ fontWeight: 500 }}>{sector.name}</td>
                  <td style={{ textAlign: 'right', width: '80px', display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                    <button className="btn" style={{ padding: '0.3rem' }} onClick={() => startEditSector(sector)} title="Editar"><Edit2 size={14} /></button>
                    <button className="btn danger" style={{ padding: '0.3rem' }} onClick={() => setDeleteConfirm({ type: 'sector', id: sector.id, name: sector.name })} title="Remover"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
              {filteredSectors.length === 0 && (
                <tr><td colSpan="2" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Nenhum setor encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showSectorModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header"><h2>{editingItem ? 'Editar Setor' : 'Novo Setor'}</h2><button className="close-btn" onClick={() => { setShowSectorModal(false); setEditingItem(null); setNewSector(''); }}><X size={18} /></button></div>
            <form onSubmit={handleAddSector}>
              <div className="form-group"><label className="form-label">Nome do Setor</label><input type="text" className="form-control" value={newSector} onChange={(e) => setNewSector(e.target.value)} placeholder="Ex: Comercial B2B" autoFocus required /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn" onClick={() => setShowSectorModal(false)}>Cancelar</button>
                <button type="submit" className="btn primary">{editingItem ? 'Salvar Alterações' : 'Adicionar Setor'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showOperatorModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header"><h2>{editingItem ? 'Editar Operador' : 'Adicionar Operador'}</h2><button className="close-btn" onClick={() => { setShowOperatorModal(false); setEditingItem(null); setNewOperator({ name: '', email: '', sectorId: '' }); }}><X size={18} /></button></div>
            <form onSubmit={handleAddOperator}>
              <div className="form-group"><label className="form-label">Nome Completo</label><input type="text" className="form-control" value={newOperator.name} onChange={(e) => setNewOperator({...newOperator, name: e.target.value})} placeholder="Ex: Maria Silva" required /></div>
              <div className="form-group"><label className="form-label">E-mail Corporativo</label><input type="email" className="form-control" value={newOperator.email} onChange={(e) => setNewOperator({...newOperator, email: e.target.value})} placeholder="Ex: maria@empresa.com" required /></div>
              <div className="form-group"><label className="form-label">Setor de Atuação</label>
                <Select 
                  value={newOperator.sectorId} 
                  onChange={(val) => setNewOperator({...newOperator, sectorId: val})} 
                  options={sectors.map(s => ({ value: s.id, label: s.name }))} 
                  placeholder="— Selecione o Setor —" 
                  required 
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn" onClick={() => setShowOperatorModal(false)}>Cancelar</button>
                <button type="submit" className="btn primary">{editingItem ? 'Salvar Alterações' : 'Cadastrar Operador'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteConfirm.id && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '380px' }}>
            <div className="modal-header"><h2 style={{ color: 'var(--danger)' }}>Confirmar Exclusão</h2><button className="close-btn" onClick={() => setDeleteConfirm({ type: null, id: null, name: null })}><X size={18} /></button></div>
            <div style={{ marginBottom: '1.5rem' }}><p>Tem certeza que deseja excluir <strong style={{ color: 'var(--text-primary)' }}>{deleteConfirm.name}</strong>?</p></div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button className="btn" onClick={() => setDeleteConfirm({ type: null, id: null, name: null })}>Cancelar</button>
              <button className="btn danger" style={{ background: 'var(--danger)', color: 'white', borderColor: 'var(--danger)' }} onClick={() => { if (deleteConfirm.type === 'operator') removeOperator(deleteConfirm.id); if (deleteConfirm.type === 'sector') removeSector(deleteConfirm.id); setDeleteConfirm({ type: null, id: null, name: null }); }}>Sim, excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Team;
