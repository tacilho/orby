import React, { useState } from 'react';
import { Plus, X, Trash2, Users as UsersIcon, Briefcase, Search } from 'lucide-react';
import Select from '../components/Select';

function Team() {
  const [sectors, setSectors] = useState([
    { id: 1, name: 'Suporte N1' },
    { id: 2, name: 'Suporte N2' },
    { id: 3, name: 'Desenvolvimento' },
  ]);

  const [operators, setOperators] = useState([
    { id: 1, name: 'João Silva', email: 'joao@empresa.com', sector: 'Suporte N1', status: 'Ativo' },
    { id: 2, name: 'Carlos M.', email: 'carlos@empresa.com', sector: 'Suporte N2', status: 'Ativo' },
    { id: 3, name: 'Ana B.', email: 'ana@empresa.com', sector: 'Desenvolvimento', status: 'Ausente' },
  ]);

  const [showSectorModal, setShowSectorModal] = useState(false);
  const [showOperatorModal, setShowOperatorModal] = useState(false);
  
  const [newSector, setNewSector] = useState('');
  const [newOperator, setNewOperator] = useState({ name: '', email: '', sector: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ type: null, id: null, name: null });
  const [searchOperator, setSearchOperator] = useState('');
  const [searchSector, setSearchSector] = useState('');

  const handleAddSector = (e) => {
    e.preventDefault();
    if (!newSector) return;
    setSectors([...sectors, { id: Date.now(), name: newSector }]);
    setNewSector('');
    setShowSectorModal(false);
  };

  const handleAddOperator = (e) => {
    e.preventDefault();
    if (!newOperator.name || !newOperator.email || !newOperator.sector) return;
    setOperators([...operators, { ...newOperator, id: Date.now(), status: 'Ausente' }]);
    setNewOperator({ name: '', email: '', sector: '' });
    setShowOperatorModal(false);
  };

  const removeSector = (id) => setSectors(sectors.filter(s => s.id !== id));
  const removeOperator = (id) => setOperators(operators.filter(o => o.id !== id));

  const filteredOperators = operators.filter(op => op.name.toLowerCase().includes(searchOperator.toLowerCase()) || op.email.toLowerCase().includes(searchOperator.toLowerCase()));
  const filteredSectors = sectors.filter(s => s.name.toLowerCase().includes(searchSector.toLowerCase()));

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1>Equipe e Setores</h1>
        <p>Gerencie os operadores e departamentos da sua organização.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Operators Panel */}
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-app)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UsersIcon size={18} style={{ color: 'var(--text-secondary)' }} />
              <h2 style={{ margin: 0, fontSize: '1rem', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>Operadores</h2>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ position: 'relative', width: '250px' }}>
                <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Pesquisar operador..." 
                  value={searchOperator}
                  onChange={(e) => setSearchOperator(e.target.value)}
                  style={{ paddingLeft: '2rem', padding: '0.4rem 0.75rem 0.4rem 2.25rem', fontSize: '0.85rem' }}
                />
              </div>
              <button className="btn primary" onClick={() => setShowOperatorModal(true)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                <Plus size={14} /> Adicionar
              </button>
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Setor</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredOperators.map(op => (
                <tr key={op.id}>
                  <td style={{ fontWeight: 500 }}>{op.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{op.email}</td>
                  <td>{op.sector}</td>
                  <td>
                    <span className={`badge ${op.status === 'Ativo' ? 'green' : 'warning'}`}>{op.status}</span>
                  </td>
                  <td style={{ padding: '0.5rem 1.5rem', textAlign: 'right' }}>
                    <button className="btn danger" style={{ padding: '0.4rem' }} onClick={() => setDeleteConfirm({ type: 'operator', id: op.id, name: op.name })} title="Remover Operador">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOperators.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Nenhum operador encontrado.</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Sectors Panel */}
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-app)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase size={18} style={{ color: 'var(--text-secondary)' }} />
              <h2 style={{ margin: 0, fontSize: '1rem', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>Setores</h2>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ position: 'relative', width: '250px' }}>
                <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Pesquisar setor..." 
                  value={searchSector}
                  onChange={(e) => setSearchSector(e.target.value)}
                  style={{ paddingLeft: '2rem', padding: '0.4rem 0.75rem 0.4rem 2.25rem', fontSize: '0.85rem' }}
                />
              </div>
              <button className="btn primary" onClick={() => setShowSectorModal(true)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                <Plus size={14} /> Novo
              </button>
            </div>
          </div>
          <table className="data-table">
            <tbody>
              {filteredSectors.map(sector => (
                <tr key={sector.id}>
                  <td style={{ fontWeight: 500 }}>{sector.name}</td>
                  <td style={{ textAlign: 'right', padding: '0.5rem 1.5rem' }}>
                    <button className="btn danger" style={{ padding: '0.4rem' }} onClick={() => setDeleteConfirm({ type: 'sector', id: sector.id, name: sector.name })} title="Remover Setor">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSectors.length === 0 && <tr><td colSpan="2" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Nenhum setor encontrado.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showSectorModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Novo Setor</h2>
              <button className="close-btn" onClick={() => setShowSectorModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddSector}>
              <div className="form-group">
                <label className="form-label">Nome do Setor</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={newSector} 
                  onChange={(e) => setNewSector(e.target.value)} 
                  placeholder="Ex: Comercial B2B"
                  autoFocus
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
                <button type="button" className="btn" onClick={() => setShowSectorModal(false)}>Cancelar</button>
                <button type="submit" className="btn primary">Adicionar Setor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showOperatorModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Adicionar Operador</h2>
              <button className="close-btn" onClick={() => setShowOperatorModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddOperator}>
              <div className="form-group">
                <label className="form-label">Nome Completo</label>
                <input type="text" className="form-control" value={newOperator.name} onChange={(e) => setNewOperator({...newOperator, name: e.target.value})} placeholder="Ex: Maria Silva" required />
              </div>
              <div className="form-group">
                <label className="form-label">E-mail Corporativo</label>
                <input type="email" className="form-control" value={newOperator.email} onChange={(e) => setNewOperator({...newOperator, email: e.target.value})} placeholder="Ex: maria@empresa.com" required />
              </div>
              <div className="form-group">
                <label className="form-label">Setor de Atuação</label>
                <Select 
                  value={newOperator.sector} 
                  onChange={(val) => setNewOperator({...newOperator, sector: val})} 
                  options={sectors.map(s => ({ value: s.name, label: s.name }))}
                  placeholder="-- Selecione o Setor --"
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
                <button type="button" className="btn" onClick={() => setShowOperatorModal(false)}>Cancelar</button>
                <button type="submit" className="btn primary">Cadastrar Operador</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm.id && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 style={{ color: 'var(--danger)' }}>Confirmar Exclusão</h2>
              <button className="close-btn" onClick={() => setDeleteConfirm({ type: null, id: null, name: null })}>
                <X size={18} />
              </button>
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <p>Tem certeza que deseja excluir <strong>{deleteConfirm.name}</strong>? Esta ação não poderá ser desfeita.</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn" onClick={() => setDeleteConfirm({ type: null, id: null, name: null })}>
                Cancelar
              </button>
              <button 
                className="btn danger" 
                style={{ background: 'var(--danger)', color: 'white', borderColor: 'var(--danger)' }}
                onClick={() => {
                  if (deleteConfirm.type === 'operator') removeOperator(deleteConfirm.id);
                  if (deleteConfirm.type === 'sector') removeSector(deleteConfirm.id);
                  setDeleteConfirm({ type: null, id: null, name: null });
                }}
              >
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Team;
