import React, { useState } from 'react';
import { Plus, X, Ticket, CheckCircle2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Select from '../components/Select';
import { useAppContext } from '../context/AppContext';

function Dashboard() {
  const navigate = useNavigate();
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [sector, setSector] = useState('');
  
  const { tickets, addTicket, assumeTicket } = useAppContext();
  
  const handleNewTicket = (e) => {
    e.preventDefault();
    if (clientName && sector) {
      addTicket(clientName, sector);
      setShowNewTicketModal(false);
      navigate('/chat');
    }
  };

  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'closed').length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1>Dashboard</h1>
          <p>Visão geral de métricas e atendimentos em tempo real.</p>
        </div>
        <button className="btn primary" onClick={() => setShowNewTicketModal(true)}>
          <Plus size={16} /> Novo Atendimento
        </button>
      </div>
      
      <div className="dashboard-grid">
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
            <Ticket size={18} className="text-muted" />
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Chamados Abertos</span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>{openTickets.toString().padStart(2, '0')}</div>
        </div>

        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
            <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Resolvidos Hoje</span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 600, color: 'var(--success)', lineHeight: 1 }}>{resolvedTickets.toString().padStart(2, '0')}</div>
        </div>

        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
            <Clock size={18} style={{ color: 'var(--warning)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Tempo Médio de Resposta</span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>04:12</div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: '2rem', padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Setor</th>
              <th>Operador</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <tr key={ticket.id}>
                <td className="mono" style={{ color: 'var(--text-muted)' }}>{ticket.id}</td>
                <td style={{ fontWeight: 500 }}>{ticket.clientName}</td>
                <td>{ticket.sector === 'n1' ? 'Suporte N1' : ticket.sector === 'n2' ? 'Suporte N2' : ticket.sector === 'comercial' ? 'Comercial' : ticket.sector}</td>
                <td>{ticket.operator || <span style={{ color: 'var(--text-muted)' }}>Fila</span>}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      {ticket.status === 'open' && <span className="badge warning">Aguardando</span>}
                      {ticket.status === 'in_progress' && <span className="badge blue">Em Andamento</span>}
                      {ticket.status === 'closed' && <span className="badge green">Resolvido</span>}
                      {ticket.status === 'transferred' && <span className="badge warning">Transferido</span>}
                    </div>
                    {ticket.status === 'open' && (
                      <button 
                        className="btn primary" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} 
                        onClick={() => { assumeTicket(ticket.id); navigate('/chat'); }}
                      >
                        Assumir
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Nenhum chamado registrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showNewTicketModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Novo Atendimento</h2>
              <button className="close-btn" onClick={() => setShowNewTicketModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleNewTicket}>
              <div className="form-group">
                <label className="form-label">Nome do Cliente / Empresa</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={clientName} 
                  onChange={(e) => setClientName(e.target.value)} 
                  placeholder="Ex: Empresa Acme"
                  autoFocus
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Setor Inicial</label>
                <Select 
                  value={sector}
                  onChange={setSector}
                  options={[
                    { value: 'n1', label: 'Suporte N1' },
                    { value: 'n2', label: 'Suporte N2' },
                    { value: 'comercial', label: 'Comercial' }
                  ]}
                  placeholder="-- Selecione o Setor --"
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
                <button type="button" className="btn" onClick={() => setShowNewTicketModal(false)}>Cancelar</button>
                <button type="submit" className="btn primary">Iniciar Atendimento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
