import React, { useEffect, useState } from 'react';
import { Plus, Users, Settings, Trash2, Key, Globe, UserCheck, ShieldAlert } from 'lucide-react';

function MasterTenants() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [tenantId, setTenantId] = useState('');
  const [brandName, setBrandName] = useState('');
  const [whatsAppPhoneNumberId, setWhatsAppPhoneNumberId] = useState('');
  const [whatsAppApiToken, setWhatsAppApiToken] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('123456');

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove acentos
      .trim()
      .replace(/\s+/g, '-') // substitui espaços por -
      .replace(/[^\w\-]+/g, '') // remove caracteres especiais
      .replace(/\-\-+/g, '-'); // reduz múltiplos hifens para um único
  };

  const handleBrandNameChange = (e) => {
    const val = e.target.value;
    setBrandName(val);
    if (!isEditing) {
      setTenantId(slugify(val));
    }
  };

  const handleStartEdit = (t) => {
    setIsEditing(true);
    setTenantId(t.tenantId);
    setBrandName(t.brandName);
    setWhatsAppPhoneNumberId(t.whatsAppPhoneNumberId || '');
    setWhatsAppApiToken(t.whatsAppApiToken || '');
    
    // Reseta credenciais de admin para que fiquem vazias/opcionais durante a edição
    setAdminName('');
    setAdminEmail('');
    setAdminPassword('');
    setSuccessMsg(null);
    setError(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setTenantId('');
    setBrandName('');
    setWhatsAppPhoneNumberId('');
    setWhatsAppApiToken('');
    setAdminName('');
    setAdminEmail('');
    setAdminPassword('123456');
    setSuccessMsg(null);
    setError(null);
  };

  const fetchTenants = () => {
    setLoading(true);
    fetch('http://localhost:8080/api/master/tenants', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error("Sem permissão ou servidor offline.");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setTenants(data);
        }
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    if (!tenantId || !brandName) return;

    setSubmitting(true);
    setSuccessMsg(null);
    setError(null);

    try {
      const res = await fetch('http://localhost:8080/api/master/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          tenantId: tenantId.toLowerCase().trim(),
          brandName,
          whatsAppPhoneNumberId,
          whatsAppApiToken,
          adminName,
          adminEmail,
          adminPassword
        })
      });

      if (!res.ok) {
        throw new Error("Erro ao criar empresa. Verifique as credenciais.");
      }

      const data = await res.json();
      setSuccessMsg(isEditing ? "Configurações da empresa atualizadas com sucesso!" : "Empresa cadastrada e administradora criada com sucesso!");
      setIsEditing(false);
      
      // Clear form
      setTenantId('');
      setBrandName('');
      setWhatsAppPhoneNumberId('');
      setWhatsAppApiToken('');
      setAdminName('');
      setAdminEmail('');
      setAdminPassword('123456');

      // Reload list
      fetchTenants();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTenant = async (id) => {
    if (!confirm("Tem certeza que deseja excluir esta empresa? Todos os tickets e dados serão excluídos do banco!")) return;

    try {
      const res = await fetch(`http://localhost:8080/api/master/tenants/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        fetchTenants();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ 
      height: 'calc(100vh - 4rem)', 
      display: 'grid', 
      gridTemplateColumns: '1.2fr 0.8fr', 
      gap: '1.25rem',
      overflow: 'hidden'
    }}>
      {/* Left side: Tenants List */}
      <div className="panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="section-header-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} /> Empresas Cadastradas (SaaS)
          </h3>
          <button className="btn" onClick={fetchTenants} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Atualizar</button>
        </div>

        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Carregando empresas...
          </div>
        ) : error && tenants.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
            <ShieldAlert size={32} />
            <span>Erro: {error}</span>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>Tenant ID</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>Marca</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>WhatsApp ID</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700, textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)', hover: { background: 'var(--bg-app)' } }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: 'var(--accent-color)' }}>{t.tenantId}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>{t.brandName}</td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {t.whatsAppPhoneNumberId ? t.whatsAppPhoneNumberId : 'Não configurado'}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                      <button 
                        onClick={() => handleStartEdit(t)} 
                        className="btn" 
                        style={{ background: 'var(--accent-color)20', color: 'var(--accent-color)', border: 'none', padding: '0.375rem', borderRadius: '6px', cursor: 'pointer' }}
                        title="Editar Empresa"
                      >
                        <Settings size={15} />
                      </button>
                      <button 
                        onClick={() => handleDeleteTenant(t.id)} 
                        className="btn" 
                        style={{ background: '#ef444420', color: '#ef4444', border: 'none', padding: '0.375rem', borderRadius: '6px', cursor: 'pointer' }}
                        title="Deletar Empresa"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {tenants.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      Nenhuma empresa cadastrada além do tenant master.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Right side: Register Tenant Form */}
      <div className="panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          {isEditing ? <Settings size={20} style={{ color: 'var(--accent-color)' }} /> : <Plus size={20} style={{ color: 'var(--accent-color)' }} />}
          {isEditing ? `Editar Empresa: ${brandName}` : 'Cadastrar Nova Empresa'}
        </h3>

        {successMsg && (
          <div style={{ background: '#22c55e20', color: '#22c55e', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
            {successMsg}
          </div>
        )}

        {error && (
          <div style={{ background: '#ef444420', color: '#ef4444', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleCreateTenant} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Tenant Config Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Globe size={14} /> Dados do Sistema
            </h4>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>Nome da Marca (Empresa Contratante)</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="ex: Acme Corp" 
                value={brandName}
                onChange={handleBrandNameChange}
                required
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-muted)' }}>Tenant ID (Gerado automaticamente)</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Gerado a partir do nome da marca..." 
                value={tenantId}
                readOnly
                required
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-active, #f1f5f9)', color: 'var(--text-muted)', cursor: 'not-allowed', opacity: 0.8 }}
              />
            </div>
          </div>

          {/* WhatsApp API Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Key size={14} /> Integração WhatsApp Cloud (Meta)
            </h4>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>Phone Number ID</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="ex: 109283749283749" 
                value={whatsAppPhoneNumberId}
                onChange={e => setWhatsAppPhoneNumberId(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>Access Token da Meta API</label>
              <input 
                type="password" 
                className="form-control" 
                placeholder="Token permanente ou temporário" 
                value={whatsAppApiToken}
                onChange={e => setWhatsAppApiToken(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          {/* Admin User Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <UserCheck size={14} /> Usuário Administrador da Empresa
            </h4>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>Nome do Admin</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="ex: Ana Silva" 
                value={adminName}
                onChange={e => setAdminName(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>E-mail de Login do Admin</label>
              <input 
                type="email" 
                className="form-control" 
                placeholder="ex: ana@acme.com" 
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>Senha Inicial</label>
              <input 
                type="password" 
                className="form-control" 
                placeholder="Padrão: 123456" 
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            {isEditing && (
              <button 
                type="button"
                onClick={handleCancelEdit} 
                className="btn" 
                style={{ flex: 1, padding: '0.75rem', fontWeight: 700, borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer', background: 'var(--bg-app)', color: 'var(--text-primary)' }}
              >
                Cancelar
              </button>
            )}
            <button 
              type="submit" 
              className="btn active" 
              disabled={submitting} 
              style={{ flex: 2, padding: '0.75rem', fontWeight: 700, borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'var(--accent-color)', color: 'var(--accent-text)' }}
            >
              {submitting ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Cadastrar Empresa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MasterTenants;
