import React, { useState, useEffect } from 'react';
import { Palette, Globe, Server, Check, Save, Mail, MessageCircle, Eye, Sparkles, Shield, Layers } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import ColorPicker from '../components/ColorPicker';

const COLOR_PRESETS = ['#EAEAEA','#6366f1','#3b82f6','#10b981','#ef4444','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#f97316','#14b8a6','#a3e635'];

const THEMES = [
  { id: 'default', name: 'Padrão', desc: 'Monocromático profissional', primary: '#EAEAEA', widget: '#EAEAEA', sidebar: '#0A0A0B', panelBg: '#131316', appBg: '#0A0A0B', accent2: '#6390FF' },
  { id: 'ocean', name: 'Oceano', desc: 'Azul moderno e confiável', primary: '#3b82f6', widget: '#3b82f6', sidebar: '#0B1120', panelBg: '#0F1729', appBg: '#080E1A', accent2: '#60a5fa' },
  { id: 'emerald', name: 'Esmeralda', desc: 'Verde sofisticado', primary: '#10b981', widget: '#10b981', sidebar: '#06100D', panelBg: '#0B1A15', appBg: '#060F0B', accent2: '#34d399' },
  { id: 'violet', name: 'Violeta', desc: 'Roxo premium e elegante', primary: '#8b5cf6', widget: '#8b5cf6', sidebar: '#0D0A18', panelBg: '#13102A', appBg: '#0A0816', accent2: '#a78bfa' },
  { id: 'sunset', name: 'Pôr do Sol', desc: 'Laranja vibrante e quente', primary: '#f97316', widget: '#f97316', sidebar: '#140C06', panelBg: '#1A1008', appBg: '#110B05', accent2: '#fb923c' },
  { id: 'rose', name: 'Rosé', desc: 'Rosa moderno e criativo', primary: '#ec4899', widget: '#ec4899', sidebar: '#14060E', panelBg: '#1C0B16', appBg: '#10050B', accent2: '#f472b6' },
];

function isLightColor(hex) {
  if (!hex) return true;
  hex = hex.replace('#','');
  if (hex.length===3) hex = hex.split('').map(c=>c+c).join('');
  const r=parseInt(hex.substring(0,2),16), g=parseInt(hex.substring(2,4),16), b=parseInt(hex.substring(4,6),16);
  return (r*299+g*587+b*114)/1000>150;
}

function Settings() {
  const { tenantConfig, updateTenantConfig } = useAppContext();
  const [config, setConfig] = useState(tenantConfig);
  const [activeTab, setActiveTab] = useState('brand');
  const [savedStatus, setSavedStatus] = useState('');

  useEffect(() => { setConfig(tenantConfig); }, [tenantConfig]);

  const handleSave = (e) => {
    e.preventDefault();
    updateTenantConfig(config);
    // CSS vars are now applied centrally by AppContent (theme-aware)
    setSavedStatus('Configurações salvas!');
    setTimeout(() => setSavedStatus(''), 2500);
  };

  const handleChange = (field, value) => setConfig(prev => ({...prev, [field]: value}));

  const applyTheme = (theme) => {
    setConfig(prev => ({
      ...prev,
      primaryColor: theme.primary,
      widgetColor: theme.widget,
      sidebarColor: theme.sidebar,
      panelBg: theme.panelBg,
      appBg: theme.appBg,
      accent2: theme.accent2,
      activeTheme: theme.id,
    }));
  };

  const tabs = [
    { id: 'brand', label: 'Marca', icon: <Palette size={15}/> },
    { id: 'themes', label: 'Temas', icon: <Layers size={15}/> },
    { id: 'domain', label: 'Domínio', icon: <Globe size={15}/> },
    { id: 'email', label: 'SMTP', icon: <Mail size={15}/> },
    { id: 'widget', label: 'Widget', icon: <MessageCircle size={15}/> },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Whitelabel & Configurações</h1>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:'1rem', alignItems:'start' }}>
        <div className="panel" style={{ padding:0, overflow:'hidden' }}>
          <div className="tabs">
            {tabs.map(t => (
              <button key={t.id} className={`tab-btn ${activeTab===t.id?'active':''}`} onClick={()=>setActiveTab(t.id)}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSave} style={{ padding:'1.5rem' }}>

            {/* ── Marca Tab ─── */}
            {activeTab==='brand' && (
              <div className="panel-slide-in">
                <div style={{ marginBottom:'1.5rem' }}>
                  <h2 style={{ fontSize:'1rem', marginBottom:'0.25rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <Sparkles size={16} style={{ color:'var(--warning)' }}/> Identidade Visual
                  </h2>
                  <p>Defina o nome e as cores da sua marca. Aplicado em tempo real.</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Nome da Empresa</label>
                  <input type="text" className="form-control" value={config.brandName} onChange={e=>handleChange('brandName',e.target.value)} required/>
                </div>

                <div className="form-group">
                  <ColorPicker label="Cor Principal" value={config.primaryColor} onChange={hex=>handleChange('primaryColor',hex)} presets={COLOR_PRESETS}/>
                  <p style={{ fontSize:'0.75rem', marginTop:'0.375rem', color:'var(--text-muted)' }}>Botões, links ativos e destaques.</p>
                </div>

                <div className="form-group">
                  <ColorPicker label="Cor Secundária" value={config.accent2||'#6390FF'} onChange={hex=>handleChange('accent2',hex)} presets={COLOR_PRESETS}/>
                  <p style={{ fontSize:'0.75rem', marginTop:'0.375rem', color:'var(--text-muted)' }}>Gráficos, indicadores e badges.</p>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                  <div className="form-group">
                    <ColorPicker label="Fundo da Sidebar" value={config.sidebarColor||'#0A0A0B'} onChange={hex=>handleChange('sidebarColor',hex)} presets={[]}/>
                  </div>
                  <div className="form-group">
                    <ColorPicker label="Fundo dos Painéis" value={config.panelBg||'#131316'} onChange={hex=>handleChange('panelBg',hex)} presets={[]}/>
                  </div>
                </div>

                {/* Live Preview */}
                <div style={{ marginTop:'1rem', padding:'1rem', background:'var(--bg-app)', border:'1px solid var(--border-color)', borderRadius:'var(--radius-md)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.375rem', fontSize:'0.6875rem', color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.75rem' }}>
                    <Eye size={12}/> Preview
                  </div>
                  <div style={{ display:'flex', gap:'0.625rem', alignItems:'center', flexWrap:'wrap' }}>
                    <button type="button" style={{ background:config.primaryColor, color:isLightColor(config.primaryColor)?'#000':'#fff', border:'none', padding:'0.4375rem 0.875rem', borderRadius:'var(--radius-sm)', fontWeight:600, fontSize:'0.8125rem', fontFamily:'var(--font-sans)', cursor:'default' }}>
                      Botão Primário
                    </button>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.375rem 0.625rem', background:config.panelBg||'var(--bg-panel)', border:'1px solid var(--border-color)', borderRadius:'var(--radius-sm)', borderLeft:`3px solid ${config.primaryColor}` }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:config.primaryColor }}/>
                      <span style={{ fontSize:'0.8125rem', fontWeight:500 }}>{config.brandName||'Empresa'}</span>
                    </div>
                    <span className="badge" style={{ background:(config.accent2||'#6390FF')+'18', color:config.accent2||'#6390FF', borderColor:(config.accent2||'#6390FF')+'30' }}>Indicador</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Temas Tab ─── */}
            {activeTab==='themes' && (
              <div className="panel-slide-in">
                <div style={{ marginBottom:'1.5rem' }}>
                  <h2 style={{ fontSize:'1rem', marginBottom:'0.25rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <Layers size={16} style={{ color:'var(--info)' }}/> Temas Predefinidos
                  </h2>
                  <p>Selecione um tema como ponto de partida. Todas as cores podem ser ajustadas depois na aba Marca.</p>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'0.75rem' }}>
                  {THEMES.map(theme => {
                    const isActive = config.activeTheme === theme.id;
                    return (
                      <div key={theme.id} onClick={()=>applyTheme(theme)} style={{
                        padding:'1rem', borderRadius:'var(--radius-md)', cursor:'pointer',
                        border: isActive ? `2px solid ${theme.primary}` : '1px solid var(--border-color)',
                        background: isActive ? theme.primary+'08' : 'var(--bg-app)',
                        transition:'all 0.2s ease',
                      }}>
                        {/* Color preview bar */}
                        <div style={{ display:'flex', gap:'3px', marginBottom:'0.75rem', height:'24px', borderRadius:'var(--radius-sm)', overflow:'hidden' }}>
                          <div style={{ flex:3, background:theme.sidebar }}/>
                          <div style={{ flex:6, background:theme.appBg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <div style={{ width:'60%', height:'50%', background:theme.panelBg, borderRadius:'2px', border:`1px solid ${theme.primary}30` }}/>
                          </div>
                        </div>
                        {/* Swatches */}
                        <div style={{ display:'flex', gap:'0.25rem', marginBottom:'0.625rem' }}>
                          <div style={{ width:16, height:16, borderRadius:'50%', background:theme.primary, border:'1px solid rgba(255,255,255,0.1)' }}/>
                          <div style={{ width:16, height:16, borderRadius:'50%', background:theme.accent2, border:'1px solid rgba(255,255,255,0.1)' }}/>
                          <div style={{ width:16, height:16, borderRadius:'50%', background:theme.sidebar, border:'1px solid rgba(255,255,255,0.15)' }}/>
                        </div>
                        <div style={{ fontWeight:600, fontSize:'0.8125rem', color:'var(--text-primary)', marginBottom:'0.125rem' }}>{theme.name}</div>
                        <div style={{ fontSize:'0.6875rem', color:'var(--text-muted)' }}>{theme.desc}</div>
                        {isActive && (
                          <div style={{ marginTop:'0.5rem', display:'inline-flex', alignItems:'center', gap:'0.25rem', fontSize:'0.6875rem', color:theme.primary, fontWeight:600 }}>
                            <Check size={12}/> Selecionado
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Domínio Tab ─── */}
            {activeTab==='domain' && (
              <div className="panel-slide-in">
                <div style={{ marginBottom:'1.5rem' }}>
                  <h2 style={{ fontSize:'1rem', marginBottom:'0.25rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <Shield size={16} style={{ color:'var(--info)' }}/> Domínio e Acesso
                  </h2>
                  <p>Acesse a plataforma com a sua própria URL.</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Domínio Personalizado</label>
                  <input type="text" className="form-control" placeholder="suporte.minhaempresa.com.br" value={config.domain} onChange={e=>handleChange('domain',e.target.value)}/>
                  <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:'0.75rem', padding:'0.75rem', background:'var(--bg-app)', borderRadius:'var(--radius-sm)', border:'1px dashed var(--border-color)', lineHeight:1.6 }}>
                    Crie um registro <strong style={{ color:'var(--text-secondary)' }}>CNAME</strong> apontando para <code style={{ color:'var(--info)', background:'rgba(99,144,255,0.08)', padding:'0.125rem 0.375rem', borderRadius:'3px' }}>cname.orby.com</code>.
                  </div>
                </div>
              </div>
            )}

            {/* ── SMTP Tab ─── */}
            {activeTab==='email' && (
              <div className="panel-slide-in">
                <div style={{ marginBottom:'1.5rem' }}>
                  <h2 style={{ fontSize:'1rem', marginBottom:'0.25rem' }}>Servidor de E-mail Próprio</h2>
                  <p>Configure seu SMTP para alertas no nome da sua empresa.</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Servidor SMTP</label>
                  <input type="text" className="form-control" placeholder="smtp.seudominio.com" value={config.smtpHost} onChange={e=>handleChange('smtpHost',e.target.value)}/>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 100px', gap:'0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Usuário SMTP</label>
                    <input type="text" className="form-control" placeholder="suporte@seudominio.com" value={config.smtpUser} onChange={e=>handleChange('smtpUser',e.target.value)}/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Porta</label>
                    <input type="text" className="form-control" placeholder="587" value={config.smtpPort} onChange={e=>handleChange('smtpPort',e.target.value)}/>
                  </div>
                </div>
              </div>
            )}

            {/* ── Widget Tab ─── */}
            {activeTab==='widget' && (
              <div className="panel-slide-in">
                <div style={{ marginBottom:'1.5rem' }}>
                  <h2 style={{ fontSize:'1rem', marginBottom:'0.25rem' }}>Aparência do Widget de Chat</h2>
                  <p>Personalize o balão de chat do site dos seus clientes.</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Mensagem de Boas-vindas</label>
                  <input type="text" className="form-control" placeholder="Olá! Como podemos ajudar?" value={config.widgetWelcome} onChange={e=>handleChange('widgetWelcome',e.target.value)}/>
                </div>
                <div className="form-group">
                  <ColorPicker label="Cor do Widget" value={config.widgetColor} onChange={hex=>handleChange('widgetColor',hex)} presets={COLOR_PRESETS}/>
                </div>
                {/* Widget Preview */}
                <div style={{ marginTop:'1rem', padding:'1.25rem', border:'1px solid var(--border-color)', borderRadius:'var(--radius-md)', background:'var(--bg-app)', display:'flex', justifyContent:'flex-end', alignItems:'flex-end', height:180, position:'relative' }}>
                  <div style={{ position:'absolute', top:'0.75rem', left:'0.75rem', display:'flex', alignItems:'center', gap:'0.375rem', color:'var(--text-muted)', fontSize:'0.6875rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>
                    <Eye size={12}/> Preview
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'0.75rem' }}>
                    <div style={{ background:'var(--bg-panel)', border:'1px solid var(--border-color)', padding:'0.875rem', borderRadius:'12px 12px 4px 12px', boxShadow:'var(--shadow-md)', maxWidth:200 }}>
                      <div style={{ fontSize:'0.8125rem', fontWeight:600, marginBottom:'0.125rem' }}>{config.brandName||'Suporte'}</div>
                      <div style={{ fontSize:'0.75rem', color:'var(--text-secondary)', lineHeight:1.4 }}>{config.widgetWelcome||'Olá! Como podemos ajudar?'}</div>
                    </div>
                    <div style={{ width:48, height:48, borderRadius:'50%', background:config.widgetColor, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 4px 16px ${config.widgetColor}40`, color:isLightColor(config.widgetColor)?'#000':'#fff' }}>
                      <MessageCircle size={20}/>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Bar */}
            <div style={{ marginTop:'2rem', display:'flex', alignItems:'center', justifyContent:'space-between', borderTop:'1px solid var(--border-color)', paddingTop:'1.25rem' }}>
              <span style={{ color:'var(--success)', fontSize:'0.8125rem', display:'flex', alignItems:'center', gap:'0.375rem', opacity:savedStatus?1:0, transition:'opacity 0.2s', fontWeight:500 }}>
                {savedStatus && <Check size={14}/>} {savedStatus}
              </span>
              <button type="submit" className="btn primary"><Save size={14}/> Salvar</button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div className="panel">
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1rem', paddingBottom:'0.75rem', borderBottom:'1px solid var(--border-color)' }}>
              <Server size={15} style={{ color:'var(--text-secondary)' }}/>
              <h2 style={{ margin:0, fontSize:'0.875rem' }}>Licença</h2>
            </div>
            <div className="info-row"><span className="info-row-label">ID</span><span className="info-row-value mono">TN-9283-A1BX</span></div>
            <div className="info-row"><span className="info-row-label">Whitelabel</span><span className="badge green">Ativo</span></div>
            <div className="info-row"><span className="info-row-label">Armazenamento</span><span className="info-row-value mono">1.2GB / 50GB</span></div>
            <div style={{ marginTop:'1rem', padding:'0.75rem', background:'var(--bg-app)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border-color)' }}>
              <div style={{ fontSize:'0.6875rem', color:'var(--text-muted)', marginBottom:'0.25rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em' }}>URL Atual</div>
              <div className="mono" style={{ fontSize:'0.75rem', color:'var(--info)', wordBreak:'break-all' }}>https://{config.domain||'suporte.orby.com.br'}</div>
            </div>
          </div>

          <div className="panel">
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1rem', paddingBottom:'0.75rem', borderBottom:'1px solid var(--border-color)' }}>
              <Palette size={15} style={{ color:'var(--text-secondary)' }}/>
              <h2 style={{ margin:0, fontSize:'0.875rem' }}>Paleta Ativa</h2>
            </div>
            {[
              { label:'Principal', hex:config.primaryColor },
              { label:'Secundária', hex:config.accent2||'#6390FF' },
              { label:'Widget', hex:config.widgetColor },
              { label:'Sidebar', hex:config.sidebarColor||'#0A0A0B' },
              { label:'Painéis', hex:config.panelBg||'#131316' },
            ].map((c,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.625rem', marginBottom: i<4 ? '0.5rem' : 0 }}>
                <div style={{ width:24, height:24, borderRadius:'var(--radius-sm)', background:c.hex, border:'1px solid rgba(255,255,255,0.06)', flexShrink:0 }}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'0.75rem', fontWeight:500, color:'var(--text-primary)' }}>{c.label}</div>
                </div>
                <span className="mono" style={{ fontSize:'0.6875rem', color:'var(--text-muted)' }}>{c.hex}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
