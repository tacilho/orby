import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, X, Trash2, Users as UsersIcon, Briefcase, Search, ChevronDown, Check, Shield, Edit2, Key, UserCog, User, ChevronRight } from 'lucide-react';
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

function SectionHeader({ title, desc, icon }) {
  return (
    <div style={{ marginBottom:'1.5rem' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.375rem' }}>
        <div style={{ color:'var(--accent-color)' }}>{icon}</div>
        <h2 style={{ margin:0, fontSize:'1.25rem' }}>{title}</h2>
      </div>
      <p style={{ margin:0, fontSize:'0.9rem', color:'var(--text-secondary)' }}>{desc}</p>
    </div>
  );
}

function Team() {
  const { showToast } = useAppContext();
  const [activeTab, setActiveTab] = useState('operators');

  const [sectors, setSectors] = useState([]);
  const [operators, setOperators] = useState([]);
  // In a real scenario, you'd fetch admins separately or use a role field.
  // For now, let's mock admins or filter them if the backend supports it in the future.
  const [admins, setAdmins] = useState([]);

  const [showSectorModal, setShowSectorModal] = useState(false);
  const [showOperatorModal, setShowOperatorModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  
  const [editingItem, setEditingItem] = useState(null);
  const [newSector, setNewSector] = useState('');
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', sectorId: '' });
  
  const [deleteConfirm, setDeleteConfirm] = useState({ type: null, id: null, name: null });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState([]);
  const [filterSector, setFilterSector] = useState([]);

  const fetchData = async () => {
    try {
      const [sRes, oRes] = await Promise.all([
        fetch(`${API_BASE}/management/sectors`, { credentials: 'include' }),
        fetch(`${API_BASE}/management/operators`, { credentials: 'include' })
      ]);
      if (sRes.ok) setSectors(await sRes.json());
      if (oRes.ok) {
        const ops = await oRes.json();
        setOperators(ops.filter(o => o.role === 'OPERATOR'));
        setAdmins(ops.filter(o => o.role === 'ADMIN'));
      }
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
        credentials: 'include',
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
  
  const handleAddUser = async (e, role) => { 
    e.preventDefault(); 
    if (!newUser.name || !newUser.email) return; 
    try {
      const method = editingItem?.type === role ? 'PUT' : 'POST';
      // using operators endpoint for both for now until backend distinguishes
      const url = editingItem?.type === role ? `${API_BASE}/management/operators/${editingItem.id}` : `${API_BASE}/management/operators`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          name: newUser.name, 
          email: newUser.email, 
          sectorId: newUser.sectorId || (sectors.length > 0 ? sectors[0].id : null),
          password: newUser.password || 'password123',
          role: role === 'admin' ? 'ADMIN' : 'OPERATOR'
        })
      });
      if (res.ok) {
        showToast(editingItem ? 'Usuário atualizado' : 'Usuário criado');
        fetchData();
        setNewUser({ name: '', email: '', password: '', sectorId: '' }); 
        setEditingItem(null); 
        setShowOperatorModal(false); 
        setShowAdminModal(false);
      }
    } catch (err) {
      showToast("Erro ao salvar usuário", "danger");
    }
  };

  const startEditUser = (user, type) => {
    setEditingItem({ type, id: user.id });
    setNewUser({ name: user.name, email: user.email, password: '', sectorId: user.sectorId });
    if (type === 'admin') setShowAdminModal(true);
    else setShowOperatorModal(true);
  };

  const startEditSector = (sector) => {
    setEditingItem({ type: 'sector', id: sector.id });
    setNewSector(sector.name);
    setShowSectorModal(true);
  };

  const removeSector = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/management/sectors/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) { showToast('Setor removido'); fetchData(); }
    } catch (err) { showToast("Erro ao remover", "danger"); }
  };

  const removeOperator = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/management/operators/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) { showToast('Operador removido'); fetchData(); }
    } catch (err) { showToast("Erro ao remover", "danger"); }
  };

  const filteredOperators = useMemo(() => {
    return operators.filter(op => {
      const opSector = sectors.find(s => s.id === op.sectorId)?.name || '';
      if (searchQuery && !op.name.toLowerCase().includes(searchQuery.toLowerCase()) && !op.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterStatus.length > 0 && !filterStatus.includes(op.status)) return false;
      if (filterSector.length > 0 && !filterSector.includes(opSector)) return false;
      return true;
    });
  }, [operators, sectors, searchQuery, filterStatus, filterSector]);

  const filteredAdmins = admins; // Apply filtering if needed

  const filteredSectors = sectors.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const sectorOptions = sectors.map(s => ({ value: s.name, label: s.name }));
  const statusOptions = [{ value: 'ONLINE', label: 'Online' }, { value: 'OFFLINE', label: 'Offline' }, { value: 'AWAY', label: 'Ausente' }];

  const tabs = [
    { id: 'admins', label: 'Administradores', desc: 'Acesso total e configurações', icon: <UserCog size={18}/> },
    { id: 'operators', label: 'Operadores', desc: 'Atendentes e suporte', icon: <User size={18}/> },
    { id: 'sectors', label: 'Setores', desc: 'Departamentos e filas', icon: <Briefcase size={18}/> },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Controle de Acesso</h1>
          <p>Gerencie quem tem acesso ao sistema e configure logins, permissões e setores.</p>
        </div>
      </div>

      <div className="panel" style={{ padding:0, overflow:'hidden', display:'flex', minHeight:'640px', background:'var(--bg-panel)' }}>
        
        {/* Navigation Sidebar */}
        <div style={{ width:'280px', borderRight:'1px solid var(--border-color)', background:'var(--bg-app)', padding:'1.5rem 0', display:'flex', flexDirection:'column' }}>
          {tabs.map(t => (
            <div 
              key={t.id} 
              onClick={() => { setActiveTab(t.id); setSearchQuery(''); setFilterStatus([]); setFilterSector([]); }}
              style={{
                padding:'1rem 1.5rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'1rem',
                borderLeft:`3px solid ${activeTab === t.id ? 'var(--accent-color)' : 'transparent'}`,
                background: activeTab === t.id ? 'var(--bg-active)' : 'transparent',
                transition:'all 0.2s ease',
              }}
              onMouseEnter={e => activeTab !== t.id && (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={e => activeTab !== t.id && (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ color: activeTab === t.id ? 'var(--accent-color)' : 'var(--text-muted)' }}>{t.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'0.875rem', fontWeight:600, color: activeTab === t.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{t.label}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:'0.125rem' }}>{t.desc}</div>
              </div>
              {activeTab === t.id && <ChevronRight size={14} style={{ color:'var(--accent-color)' }}/>}
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ flex:1, padding:'2.5rem', overflowY:'auto', background:'var(--bg-panel)' }}>
          
          {/* ── Admins Tab ─── */}
          {activeTab === 'admins' && (
            <div className="fade-in">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2rem' }}>
                <SectionHeader title="Administradores" desc="Usuários com permissões globais para configurar a plataforma." icon={<UserCog size={18}/>}/>
                <button className="btn primary" onClick={() => { setNewUser({name:'', email:'', password:'', sectorId:''}); setEditingItem(null); setShowAdminModal(true); }}>
                  <Plus size={16}/> Novo Administrador
                </button>
              </div>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Administrador</th>
                      <th>E-mail</th>
                      <th>Status</th>
                      <th style={{ width: '80px' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdmins.length === 0 ? (
                      <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Nenhum administrador cadastrado.</td></tr>
                    ) : (
                      filteredAdmins.map(admin => (
                        <tr key={admin.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-active)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                {getInitials(admin.name)}
                              </div>
                              <span style={{ fontWeight: 500 }}>{admin.name}</span>
                            </div>
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{admin.email}</td>
                          <td><span className="badge green">Ativo</span></td>
                          <td style={{ display: 'flex', gap: '0.375rem' }}>
                            <button className="btn" style={{ padding: '0.3rem' }} onClick={() => startEditUser(admin, 'admin')} title="Editar"><Edit2 size={14} /></button>
                            <button className="btn danger" style={{ padding: '0.3rem' }} onClick={() => setDeleteConfirm({ type: 'admin', id: admin.id, name: admin.name })} title="Remover"><Trash2 size={14} /></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Operators Tab ─── */}
          {activeTab === 'operators' && (
            <div className="fade-in">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2rem' }}>
                <SectionHeader title="Operadores de Atendimento" desc="Atendentes responsáveis por gerenciar chamados e clientes." icon={<User size={18}/>}/>
                <button className="btn primary" onClick={() => { setNewUser({name:'', email:'', password:'', sectorId:''}); setEditingItem(null); setShowOperatorModal(true); }}>
                  <Plus size={16}/> Novo Operador
                </button>
              </div>

              <div style={{ display:'flex', gap:'1rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
                <ChipMultiSelect icon={Shield} allLabel="Qualquer Status" options={statusOptions} selected={filterStatus} onChange={setFilterStatus} />
                <ChipMultiSelect icon={Briefcase} allLabel="Todos os Setores" options={sectorOptions} selected={filterSector} onChange={setFilterSector} />
                <div className="search-input-wrap" style={{ flex:1, minWidth:'200px' }}>
                  <Search size={14} />
                  <input type="text" placeholder="Pesquisar por nome ou e-mail..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
              </div>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Operador</th>
                      <th>E-mail</th>
                      <th>Setor</th>
                      <th>Status</th>
                      <th style={{ width: '80px' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOperators.length === 0 ? (
                      <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Nenhum operador encontrado.</td></tr>
                    ) : (
                      filteredOperators.map(op => {
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
                              <button className="btn" style={{ padding: '0.3rem' }} onClick={() => startEditUser(op, 'operator')} title="Editar"><Edit2 size={14} /></button>
                              <button className="btn danger" style={{ padding: '0.3rem' }} onClick={() => setDeleteConfirm({ type: 'operator', id: op.id, name: op.name })} title="Remover"><Trash2 size={14} /></button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Sectors Tab ─── */}
          {activeTab === 'sectors' && (
            <div className="fade-in">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2rem' }}>
                <SectionHeader title="Gerenciamento de Setores" desc="Crie departamentos para organizar seus atendentes e fluxos de trabalho." icon={<Briefcase size={18}/>}/>
                <button className="btn primary" onClick={() => { setNewSector(''); setEditingItem(null); setShowSectorModal(true); }}>
                  <Plus size={16}/> Novo Setor
                </button>
              </div>

              <div className="search-input-wrap" style={{ marginBottom:'1.5rem', maxWidth:'300px' }}>
                <Search size={14} />
                <input type="text" placeholder="Pesquisar setor..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nome do Setor</th>
                      <th style={{ width: '80px', textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSectors.length === 0 ? (
                      <tr><td colSpan="2" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Nenhum setor cadastrado.</td></tr>
                    ) : (
                      filteredSectors.map(sector => (
                        <tr key={sector.id}>
                          <td style={{ fontWeight: 500 }}>{sector.name}</td>
                          <td style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                            <button className="btn" style={{ padding: '0.3rem' }} onClick={() => startEditSector(sector)} title="Editar"><Edit2 size={14} /></button>
                            <button className="btn danger" style={{ padding: '0.3rem' }} onClick={() => setDeleteConfirm({ type: 'sector', id: sector.id, name: sector.name })} title="Remover"><Trash2 size={14} /></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Modals */}
      {showSectorModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth:'400px' }}>
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
          <div className="modal-content" style={{ maxWidth:'450px' }}>
            <div className="modal-header"><h2>{editingItem ? 'Editar Operador' : 'Adicionar Operador'}</h2><button className="close-btn" onClick={() => { setShowOperatorModal(false); setEditingItem(null); setNewUser({ name: '', email: '', password: '', sectorId: '' }); }}><X size={18} /></button></div>
            <form onSubmit={(e) => handleAddUser(e, 'operator')}>
              <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
                <div className="form-group"><label className="form-label">Nome Completo</label><input type="text" className="form-control" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} placeholder="Ex: Maria Silva" required /></div>
                <div className="form-group"><label className="form-label">E-mail (Login)</label><input type="email" className="form-control" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} placeholder="Ex: maria@empresa.com" required /></div>
                <div className="form-group">
                  <label className="form-label">Senha {editingItem && <span style={{color:'var(--text-muted)', fontWeight:400}}>(opcional se não for alterar)</span>}</label>
                  <div style={{ position:'relative' }}>
                    <Key size={14} style={{ position:'absolute', left:'1rem', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
                    <input type="password" className="form-control" style={{ paddingLeft:'2.5rem' }} value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} placeholder="********" required={!editingItem} minLength={6} />
                  </div>
                </div>
                <div className="form-group"><label className="form-label">Setor de Atuação</label>
                  <Select 
                    value={newUser.sectorId} 
                    onChange={(val) => setNewUser({...newUser, sectorId: val})} 
                    options={sectors.map(s => ({ value: s.id, label: s.name }))} 
                    placeholder="— Selecione o Setor —" 
                    required 
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.75rem' }}>
                <button type="button" className="btn" onClick={() => setShowOperatorModal(false)}>Cancelar</button>
                <button type="submit" className="btn primary">{editingItem ? 'Salvar Alterações' : 'Cadastrar Operador'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAdminModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth:'450px' }}>
            <div className="modal-header"><h2>{editingItem ? 'Editar Admin' : 'Adicionar Administrador'}</h2><button className="close-btn" onClick={() => { setShowAdminModal(false); setEditingItem(null); setNewUser({ name: '', email: '', password: '', sectorId: '' }); }}><X size={18} /></button></div>
            <form onSubmit={(e) => handleAddUser(e, 'admin')}>
              <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
                <div className="form-group"><label className="form-label">Nome Completo</label><input type="text" className="form-control" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} placeholder="Ex: João Admin" required /></div>
                <div className="form-group"><label className="form-label">E-mail (Login Master)</label><input type="email" className="form-control" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} placeholder="Ex: admin@empresa.com" required /></div>
                <div className="form-group">
                  <label className="form-label">Senha {editingItem && <span style={{color:'var(--text-muted)', fontWeight:400}}>(opcional se não for alterar)</span>}</label>
                  <div style={{ position:'relative' }}>
                    <Key size={14} style={{ position:'absolute', left:'1rem', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
                    <input type="password" className="form-control" style={{ paddingLeft:'2.5rem' }} value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} placeholder="********" required={!editingItem} minLength={6} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.75rem' }}>
                <button type="button" className="btn" onClick={() => setShowAdminModal(false)}>Cancelar</button>
                <button type="submit" className="btn primary">{editingItem ? 'Salvar Alterações' : 'Cadastrar Admin'}</button>
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
              <button className="btn danger" style={{ background: 'var(--danger)', color: 'white', borderColor: 'var(--danger)' }} onClick={() => { if (deleteConfirm.type === 'operator' || deleteConfirm.type === 'admin') removeOperator(deleteConfirm.id); if (deleteConfirm.type === 'sector') removeSector(deleteConfirm.id); setDeleteConfirm({ type: null, id: null, name: null }); }}>Sim, excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Team;
