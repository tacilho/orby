import React, { useState, useEffect } from 'react';
import { Palette, Globe, Server, Check, Save, Mail, MessageCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

function Settings() {
  const { tenantConfig, updateTenantConfig } = useAppContext();
  const [config, setConfig] = useState(tenantConfig);
  const [activeTab, setActiveTab] = useState('brand');
  const [savedStatus, setSavedStatus] = useState('');

  // Sincroniza se o contexto atualizar de fora
  useEffect(() => {
    setConfig(tenantConfig);
  }, [tenantConfig]);

  const handleSave = (e) => {
    e.preventDefault();
    updateTenantConfig(config);
    setSavedStatus('Configurações salvas com sucesso!');
    setTimeout(() => {
      setSavedStatus('');
    }, 2500);
  };

  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const colorPresets = ['#EAEAEA', '#6366f1', '#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1>Whitelabel & Configurações</h1>
        <p>Personalize a plataforma com a identidade da sua empresa e configure acessos.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(600px, 1fr) minmax(300px, 350px)', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Painel Principal de Configuração */}
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          
          {/* Navegação de Abas */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-app)' }}>
            <button 
              className="btn" 
              style={{ border: 'none', borderRadius: 0, borderBottom: activeTab === 'brand' ? '2px solid var(--accent-color)' : '2px solid transparent', background: 'transparent', color: activeTab === 'brand' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
              onClick={() => setActiveTab('brand')}
            >
              <Palette size={16} /> Marca
            </button>
            <button 
              className="btn" 
              style={{ border: 'none', borderRadius: 0, borderBottom: activeTab === 'domain' ? '2px solid var(--accent-color)' : '2px solid transparent', background: 'transparent', color: activeTab === 'domain' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
              onClick={() => setActiveTab('domain')}
            >
              <Globe size={16} /> Domínio
            </button>
            <button 
              className="btn" 
              style={{ border: 'none', borderRadius: 0, borderBottom: activeTab === 'email' ? '2px solid var(--accent-color)' : '2px solid transparent', background: 'transparent', color: activeTab === 'email' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
              onClick={() => setActiveTab('email')}
            >
              <Mail size={16} /> E-mail (SMTP)
            </button>
            <button 
              className="btn" 
              style={{ border: 'none', borderRadius: 0, borderBottom: activeTab === 'widget' ? '2px solid var(--accent-color)' : '2px solid transparent', background: 'transparent', color: activeTab === 'widget' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
              onClick={() => setActiveTab('widget')}
            >
              <MessageCircle size={16} /> Chat Widget
            </button>
          </div>

          <form onSubmit={handleSave} style={{ padding: '2rem' }}>
            
            {activeTab === 'brand' && (
              <div className="panel-slide-in">
                <div style={{ marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Identidade Visual</h2>
                  <p style={{ fontSize: '0.85rem' }}>Defina o nome da sua empresa e a cor principal que será usada em botões e destaques.</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Nome da Empresa</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={config.brandName}
                    onChange={(e) => handleChange('brandName', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Cor Principal (Whitelabel)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <input 
                      type="color" 
                      value={config.primaryColor}
                      onChange={(e) => handleChange('primaryColor', e.target.value)}
                      style={{ width: 48, height: 48, padding: 0, border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: 'transparent' }}
                    />
                    <span className="mono" style={{ color: 'var(--text-secondary)' }}>{config.primaryColor}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {colorPresets.map(color => (
                      <div 
                        key={color}
                        onClick={() => handleChange('primaryColor', color)}
                        style={{ 
                          width: 32, height: 32, background: color, cursor: 'pointer',
                          borderRadius: 'var(--radius-sm)',
                          border: config.primaryColor === color ? '2px solid var(--text-primary)' : '2px solid transparent',
                          transition: 'all 0.1s ease'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'domain' && (
              <div className="panel-slide-in">
                <div style={{ marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Domínio e Acesso</h2>
                  <p style={{ fontSize: '0.85rem' }}>Acesse a plataforma utilizando a sua própria URL, sem menções à marca original.</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Domínio Personalizado</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="suporte.minhaempresa.com.br"
                    value={config.domain}
                    onChange={(e) => handleChange('domain', e.target.value)}
                  />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-color)' }}>
                    Para ativar, acesse seu provedor de DNS (Cloudflare, Registro.br, etc.) e crie um registro <strong>CNAME</strong> apontando para <code>cname.orby.com</code>.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'email' && (
              <div className="panel-slide-in">
                <div style={{ marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Servidor de E-mail Próprio</h2>
                  <p style={{ fontSize: '0.85rem' }}>Configure seu servidor SMTP para que os alertas e tickets cheguem aos clientes no nome da sua empresa.</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Servidor SMTP</label>
                  <input type="text" className="form-control" placeholder="smtp.seudominio.com" value={config.smtpHost} onChange={(e) => handleChange('smtpHost', e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Usuário SMTP</label>
                    <input type="text" className="form-control" placeholder="suporte@seudominio.com" value={config.smtpUser} onChange={(e) => handleChange('smtpUser', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Porta</label>
                    <input type="text" className="form-control" placeholder="587" value={config.smtpPort} onChange={(e) => handleChange('smtpPort', e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'widget' && (
              <div className="panel-slide-in">
                <div style={{ marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Aparência do Widget de Chat</h2>
                  <p style={{ fontSize: '0.85rem' }}>Personalize o balão de chat que fica instalado no site dos seus clientes.</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Mensagem de Boas-vindas</label>
                  <input type="text" className="form-control" placeholder="Olá! Como podemos ajudar?" value={config.widgetWelcome} onChange={(e) => handleChange('widgetWelcome', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Cor do Balão do Widget</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input type="color" value={config.widgetColor} onChange={(e) => handleChange('widgetColor', e.target.value)} style={{ width: 48, height: 48, padding: 0, border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: 'transparent' }} />
                    <span className="mono" style={{ color: 'var(--text-secondary)' }}>{config.widgetColor}</span>
                  </div>
                </div>
                
                {/* Preview Mockup */}
                <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-app)', display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', height: 200, position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '1rem', left: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Preview no Site</div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
                    <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '12px 12px 0 12px', boxShadow: 'var(--shadow-md)', maxWidth: 220 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem' }}>{config.brandName || 'Suporte'}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{config.widgetWelcome || 'Olá! Como podemos ajudar?'}</div>
                    </div>
                    <div style={{ width: 50, height: 50, borderRadius: '50%', background: config.widgetColor, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)', color: '#000' }}>
                      <MessageCircle size={24} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <span style={{ color: 'var(--success)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: savedStatus ? 1 : 0, transition: 'opacity 0.2s ease' }}>
                {savedStatus && <Check size={16} />}
                {savedStatus}
              </span>
              <button type="submit" className="btn primary" style={{ padding: '0.6rem 1.5rem' }}>
                <Save size={16} /> Salvar Configurações
              </button>
            </div>
          </form>
        </div>

        {/* Painel Lateral - Conta */}
        <div className="panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <Server size={20} style={{ color: 'var(--text-secondary)' }} />
            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Informações da Licença</h2>
          </div>
          <table className="data-table" style={{ border: 'none' }}>
            <tbody>
              <tr>
                <td style={{ border: 'none', padding: '0.75rem 0', color: 'var(--text-secondary)', fontWeight: 500 }}>ID do Tenant</td>
                <td style={{ border: 'none', padding: '0.75rem 0', textAlign: 'right', fontWeight: 600 }} className="mono">TN-9283-A1BX</td>
              </tr>
              <tr>
                <td style={{ border: 'none', padding: '0.75rem 0', color: 'var(--text-secondary)', fontWeight: 500 }}>Status do Whitelabel</td>
                <td style={{ border: 'none', padding: '0.75rem 0', textAlign: 'right' }}>
                  <span className="badge green">Ativo</span>
                </td>
              </tr>
              <tr>
                <td style={{ border: 'none', padding: '0.75rem 0', color: 'var(--text-secondary)', fontWeight: 500 }}>Armazenamento</td>
                <td style={{ border: 'none', padding: '0.75rem 0', textAlign: 'right', fontWeight: 600 }} className="mono">1.2GB / 50GB</td>
              </tr>
            </tbody>
          </table>
          
          <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>URL DE SUPORTE ATUAL</div>
            <div className="mono" style={{ fontSize: '0.85rem', color: 'var(--accent-color)', wordBreak: 'break-all' }}>
              https://{config.domain || 'suporte.orby.com.br'}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Settings;
