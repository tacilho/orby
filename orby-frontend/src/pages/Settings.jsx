import React, { useState, useEffect } from 'react';
import { Palette, Globe, Server, Check, Save, Mail, MessageCircle, Eye, Sparkles, Shield, Layers, Plus, Trash2, X, ChevronRight, Monitor, Settings as SettingsIcon } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import ColorPicker from '../components/ColorPicker';

const COLOR_PRESETS = ['#EAEAEA','#6366f1','#3b82f6','#10b981','#ef4444','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#f97316','#14b8a6','#a3e635'];

function isLightColor(hex) {
  if (!hex) return true;
  hex = hex.replace('#','');
  if (hex.length===3) hex = hex.split('').map(c=>c+c).join('');
  const r=parseInt(hex.substring(0,2),16), g=parseInt(hex.substring(2,4),16), b=parseInt(hex.substring(4,6),16);
  return (r*299+g*587+b*114)/1000>150;
}

function Settings() {
  const { 
    tenantConfig, updateTenantConfig, 
    activeThemeId, builtinThemes, customThemes, applyTheme, saveCustomTheme, deleteCustomTheme 
  } = useAppContext();
  
  const [config, setConfig] = useState(tenantConfig);
  const [activeTab, setActiveTab] = useState('brand');
  const [savedStatus, setSavedStatus] = useState('');
  
  // Theme Creator State
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [editingThemeId, setEditingThemeId] = useState(null);
  const [newThemeName, setNewThemeName] = useState('');
  const [newThemeVars, setNewThemeVars] = useState({
    '--bg-app': '#F3F4F6',
    '--bg-panel': '#FFFFFF',
    '--text-primary': '#111827',
    '--text-secondary': '#374151',
    '--border-color': '#D4D6DC'
  });

  useEffect(() => { setConfig(tenantConfig); }, [tenantConfig]);

  const handleSave = (e) => {
    if (e) e.preventDefault();
    updateTenantConfig(config);
    setSavedStatus('Configurações salvas!');
    setTimeout(() => setSavedStatus(''), 2500);
  };

  const handleChange = (field, value) => setConfig(prev => ({...prev, [field]: value}));

  const openThemeCreator = (themeId = null) => {
    if (themeId && customThemes[themeId]) {
      setEditingThemeId(themeId);
      setNewThemeName(customThemes[themeId].name);
      setNewThemeVars(customThemes[themeId].vars);
    } else {
      setEditingThemeId(null);
      setNewThemeName('');
      const currentTheme = builtinThemes[activeThemeId] || customThemes[activeThemeId] || builtinThemes.light;
      setNewThemeVars(currentTheme.vars);
    }
    setIsCreatorOpen(true);
  };

  const handleSaveTheme = () => {
    if (!newThemeName.trim()) return;
    const id = editingThemeId || `custom_${Date.now()}`;
    saveCustomTheme(id, {
      name: newThemeName,
      vars: newThemeVars,
      isLight: isLightColor(newThemeVars['--bg-app'])
    });
    setIsCreatorOpen(false);
  };

  const tabs = [
    { id: 'brand', label: 'Marca & Identidade', desc: 'Logotipo, cores e nome', icon: <Palette size={18}/> },
    { id: 'themes', label: 'Temas & Interface', desc: 'Motor de temas dinâmico', icon: <Layers size={18}/> },
    { id: 'domain', label: 'Domínio & Acesso', desc: 'URLs personalizadas e SSL', icon: <Globe size={18}/> },
    { id: 'email', label: 'E-mail (SMTP)', desc: 'Servidores de envio próprios', icon: <Mail size={18}/> },
    { id: 'widget', label: 'Widget de Chat', desc: 'Aparência do balão externo', icon: <MessageCircle size={18}/> },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Whitelabel & Configurações</h1>
          <p>Gerencie a identidade visual e as configurações globais da sua plataforma.</p>
        </div>
        <div style={{ display:'flex', gap:'0.75rem' }}>
           {savedStatus && (
             <div className="badge green" style={{ animation:'badgePop 0.3s ease', padding:'0.5rem 1rem' }}>
                <Check size={14} style={{ marginRight:'0.375rem' }}/> {savedStatus}
             </div>
           )}
           <button className="btn primary" onClick={handleSave} disabled={JSON.stringify(config) === JSON.stringify(tenantConfig)}>
             <Save size={16}/> Salvar Alterações
           </button>
        </div>
      </div>

      <div className="panel" style={{ padding:0, overflow:'hidden', display:'flex', minHeight:'640px', background:'var(--bg-panel)' }}>
        
        {/* Navigation Sidebar */}
        <div style={{ width:'280px', borderRight:'1px solid var(--border-color)', background:'var(--bg-app)', padding:'1.5rem 0', display:'flex', flexDirection:'column' }}>
          {tabs.map(t => (
            <div 
              key={t.id} 
              onClick={() => setActiveTab(t.id)}
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

          <div style={{ marginTop:'auto', padding:'2rem 1.5rem' }}>
            <div style={{ padding:'1rem', background:'var(--bg-panel)', border:'1px solid var(--border-color)', borderRadius:'var(--radius-md)' }}>
              <div style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.5rem' }}>Licença Ativa</div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <Shield size={14} style={{ color:'var(--success)' }}/>
                <span style={{ fontWeight:600, fontSize:'0.8125rem' }}>Enterprise Plan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex:1, padding:'2.5rem', overflowY:'auto', background:'var(--bg-panel)' }}>
          
          {/* ── Marca Tab ─── */}
          {activeTab==='brand' && (
            <div className="fade-in">
              <SectionHeader title="Identidade Visual" desc="Defina como sua marca aparece para os operadores e clientes." icon={<Sparkles size={18}/>}/>
              
              <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:'3rem', marginTop:'2rem' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Nome da Plataforma</label>
                    <input type="text" className="form-control" value={config.brandName} onChange={e=>handleChange('brandName',e.target.value)} placeholder="Ex: Orby Suporte"/>
                  </div>
                  
                  <div className="form-group">
                    <ColorPicker label="Cor de Destaque (Accent)" value={config.primaryColor} onChange={hex=>handleChange('primaryColor',hex)} presets={COLOR_PRESETS}/>
                  </div>
                </div>

                <div>
                   <label className="form-label">Visualização da Marca</label>
                   <div style={{ 
                     padding:'2.5rem', background:'var(--bg-app)', borderRadius:'var(--radius-lg)', border:'1px dashed var(--border-color)',
                     display:'flex', flexDirection:'column', alignItems:'center', gap:'1.5rem', textAlign:'center'
                   }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem 1.25rem', background:'var(--bg-panel)', border:'1px solid var(--border-color)', borderRadius:'var(--radius-md)', boxShadow:'var(--shadow-sm)' }}>
                         <div className="brand-icon" style={{ width:24, height:24, fontSize:12 }}>{config.brandName?.charAt(0) || 'O'}</div>
                         <span style={{ fontWeight:700, fontSize:'1rem' }}>{config.brandName || 'Orby'}</span>
                      </div>
                      <div style={{ width:'100%', height:'1px', background:'var(--border-color)' }}></div>
                      <button className="btn primary" style={{ width:'100%', maxWidth:'200px' }}>Exemplo de Botão</button>
                      <p style={{ fontSize:'0.75rem', maxWidth:'240px' }}>A cor será aplicada em botões, links, ícones de navegação e indicadores de status.</p>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Temas Tab ─── */}
          {activeTab==='themes' && (
            <div className="fade-in">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2rem' }}>
                <SectionHeader title="Motor de Temas" desc="Personalize a experiência visual completa da interface administrativa." icon={<Monitor size={18}/>}/>
                <button className="btn primary" onClick={() => openThemeCreator()}>
                  <Plus size={16}/> Criar Novo Tema
                </button>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:'1.25rem' }}>
                {Object.entries(builtinThemes).map(([id, theme]) => (
                  <ThemeOption 
                    key={id} id={id} theme={theme} 
                    isActive={activeThemeId === id} 
                    onSelect={() => applyTheme(id)}
                  />
                ))}
                
                {Object.entries(customThemes).map(([id, theme]) => (
                  <ThemeOption 
                    key={id} id={id} theme={theme} 
                    isActive={activeThemeId === id} 
                    onSelect={() => applyTheme(id)}
                    onEdit={() => openThemeCreator(id)}
                    onDelete={() => deleteCustomTheme(id)}
                    isCustom
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Domínio Tab ─── */}
          {activeTab==='domain' && (
            <div className="fade-in" style={{ maxWidth:'640px' }}>
              <SectionHeader title="Configurações de Domínio" desc="Acesse o painel administrativo através de uma URL customizada." icon={<Globe size={18}/>}/>
              
              <div className="form-group" style={{ marginTop:'2rem' }}>
                <label className="form-label">Endereço (Hostname)</label>
                <div style={{ position:'relative' }}>
                   <Globe size={16} style={{ position:'absolute', left:'1rem', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
                   <input type="text" className="form-control" style={{ paddingLeft:'2.75rem' }} placeholder="suporte.suaempresa.com" value={config.domain} onChange={e=>handleChange('domain',e.target.value)}/>
                </div>
              </div>
              
              <div style={{ marginTop:'1.5rem', padding:'1.5rem', background:'var(--bg-app)', border:'1px solid var(--border-color)', borderRadius:'var(--radius-md)' }}>
                <div style={{ fontWeight:700, fontSize:'0.7rem', color:'var(--info)', textTransform:'uppercase', letterSpacing:'0.05em', display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.75rem' }}>
                  <Shield size={14}/> Instrução de DNS
                </div>
                <p style={{ fontSize:'0.875rem', lineHeight:1.6, color:'var(--text-primary)' }}>
                  Para ativar seu domínio, aponte um registro <strong>CNAME</strong> no seu provedor de DNS para:
                </p>
                <div className="mono" style={{ padding:'0.75rem', background:'var(--bg-panel)', border:'1px solid var(--border-color)', borderRadius:'4px', marginTop:'0.75rem', color:'var(--info)', fontSize:'0.9rem' }}>
                  cname.orby.com
                </div>
                <p style={{ fontSize:'0.8125rem', marginTop:'1rem', color:'var(--text-muted)' }}>
                  O certificado SSL (HTTPS) será gerado automaticamente assim que a propagação for concluída.
                </p>
              </div>
            </div>
          )}

          {/* ── SMTP Tab ─── */}
          {activeTab==='email' && (
            <div className="fade-in" style={{ maxWidth:'640px' }}>
              <SectionHeader title="Servidor de E-mail" desc="Envie notificações de chamados através do seu próprio servidor SMTP." icon={<Mail size={18}/>}/>
              
              <div style={{ display:'grid', gridTemplateColumns:'1fr 120px', gap:'1rem', marginTop:'2rem' }}>
                <div className="form-group">
                  <label className="form-label">Host SMTP</label>
                  <input type="text" className="form-control" placeholder="smtp.gmail.com" value={config.smtpHost||''} onChange={e=>handleChange('smtpHost',e.target.value)}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Porta</label>
                  <input type="text" className="form-control" placeholder="587" value={config.smtpPort||''} onChange={e=>handleChange('smtpPort',e.target.value)}/>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Usuário (E-mail)</label>
                <input type="text" className="form-control" placeholder="contato@suaempresa.com" value={config.smtpUser||''} onChange={e=>handleChange('smtpUser',e.target.value)}/>
              </div>

              <div style={{ marginTop:'1.5rem', display:'flex', justifyContent:'flex-end' }}>
                <button className="btn outline" style={{ background:'transparent' }}>Testar Conexão</button>
              </div>
            </div>
          )}

          {/* ── Widget Tab ─── */}
          {activeTab==='widget' && (
            <div className="fade-in">
              <SectionHeader title="Customização do Widget" desc="Personalize o chat flutuante que seus clientes verão em seus sites." icon={<MessageCircle size={18}/>}/>
              
              <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:'3rem', marginTop:'2rem' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Mensagem de Boas-vindas</label>
                    <textarea className="form-control" rows={3} value={config.widgetWelcome} onChange={e=>handleChange('widgetWelcome',e.target.value)} placeholder="Olá! Como podemos te ajudar hoje?"/>
                  </div>
                  <ColorPicker label="Cor do Balão" value={config.widgetColor || config.primaryColor} onChange={hex=>handleChange('widgetColor',hex)} presets={COLOR_PRESETS}/>
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                   <label className="form-label">Preview do Widget</label>
                   <div style={{ 
                     height:'260px', background:'var(--bg-app)', borderRadius:'var(--radius-lg)', border:'1px solid var(--border-color)',
                     position:'relative', overflow:'hidden', padding:'1.5rem'
                   }}>
                      <div style={{ position:'absolute', bottom:'1.5rem', right:'1.5rem', display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'1rem' }}>
                         <div style={{ 
                           background:'var(--bg-panel)', padding:'1rem', borderRadius:'16px 16px 4px 16px', boxShadow:'var(--shadow-md)', border:'1px solid var(--border-color)', maxWidth:'200px'
                         }}>
                            <div style={{ fontSize:'0.7rem', color:'var(--text-secondary)', fontWeight:700, marginBottom:'0.25rem', textTransform:'uppercase' }}>{config.brandName}</div>
                            <div style={{ fontSize:'0.875rem', lineHeight:1.4 }}>{config.widgetWelcome}</div>
                         </div>
                         <div style={{ 
                           width:52, height:52, borderRadius:'50%', background:config.widgetColor || config.primaryColor,
                           display:'flex', alignItems:'center', justifyContent:'center', color:isLightColor(config.widgetColor || config.primaryColor)?'#000':'#fff',
                           boxShadow:`0 4px 16px ${(config.widgetColor || config.primaryColor)}50`
                         }}>
                            <MessageCircle size={24}/>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Theme Creator Modal ─── */}
      {isCreatorOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '900px', padding: 0, overflow:'hidden', display:'flex', flexDirection:'column', height:'85vh' }}>
            <div style={{ padding:'1.5rem', borderBottom:'1px solid var(--border-color)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'var(--bg-panel)' }}>
              <div>
                <h2 style={{ margin:0, fontSize:'1.125rem' }}>{editingThemeId ? 'Editar Tema' : 'Criar Novo Tema'}</h2>
                <p style={{ fontSize:'0.8125rem', margin:0, color:'var(--text-muted)' }}>Customize as cores estruturais do painel administrativo.</p>
              </div>
              <button className="close-btn" onClick={() => setIsCreatorOpen(false)}><X size={20}/></button>
            </div>
            
            <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
              {/* Controls */}
              <div style={{ width:'360px', padding:'1.75rem', overflowY:'auto', borderRight:'1px solid var(--border-color)', display:'flex', flexDirection:'column', gap:'1.5rem', background:'var(--bg-app)' }}>
                <div className="form-group">
                  <label className="form-label">Nome do Tema</label>
                  <input type="text" className="form-control" placeholder="Ex: Dark Mode Pro" value={newThemeName} onChange={e => setNewThemeName(e.target.value)}/>
                </div>
                
                <ColorPicker label="Fundo da Aplicação" value={newThemeVars['--bg-app']} onChange={v => setNewThemeVars(p => ({...p, '--bg-app': v}))} />
                <ColorPicker label="Fundo dos Painéis" value={newThemeVars['--bg-panel']} onChange={v => setNewThemeVars(p => ({...p, '--bg-panel': v}))} />
                <ColorPicker label="Bordas e Linhas" value={newThemeVars['--border-color']} onChange={v => setNewThemeVars(p => ({...p, '--border-color': v}))} />
                <ColorPicker label="Texto Principal" value={newThemeVars['--text-primary']} onChange={v => setNewThemeVars(p => ({...p, '--text-primary': v}))} />
                <ColorPicker label="Texto Secundário" value={newThemeVars['--text-secondary']} onChange={v => setNewThemeVars(p => ({...p, '--text-secondary': v}))} />
              </div>

              {/* Live Preview Shell - Real Orby Layout */}
              <div style={{ flex:1, padding:'2rem', background:newThemeVars['--bg-app'], overflow:'hidden', display:'flex', flexDirection:'column' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', marginBottom:'1.5rem', opacity:0.5 }}>
                  <Eye size={16} style={{ color:newThemeVars['--text-primary'] }}/> <span style={{ fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:newThemeVars['--text-primary'] }}>Preview ao Vivo (Orby UI)</span>
                </div>
                
                <div style={{ 
                  flex:1, background:newThemeVars['--bg-panel'], border:`1px solid ${newThemeVars['--border-color']}`, borderRadius:'var(--radius-lg)',
                  display:'flex', boxShadow:'var(--shadow-lg)', overflow:'hidden'
                }}>
                  {/* Mock Sidebar */}
                  <div style={{ width:'60px', background:newThemeVars['--bg-app'], borderRight:`1px solid ${newThemeVars['--border-color']}`, display:'flex', flexDirection:'column', alignItems:'center', padding:'1rem 0', gap:'1rem' }}>
                     <div style={{ width:24, height:24, background:'var(--accent-color)', borderRadius:6 }}/>
                     <div style={{ width:20, height:2, background:newThemeVars['--text-primary'], opacity:0.1 }}/>
                     {[1,2,3,4].map(i => (
                       <div key={i} style={{ width:24, height:24, background:newThemeVars['--text-primary'], opacity:i===1 ? 0.2 : 0.05, borderRadius:6 }}/>
                     ))}
                     <div style={{ marginTop:'auto', width:24, height:24, background:newThemeVars['--text-primary'], opacity:0.1, borderRadius:6 }}/>
                  </div>

                  {/* Mock Main Content */}
                  <div style={{ flex:1, display:'flex', flexDirection:'column', background:newThemeVars['--bg-app'] }}>
                    {/* Mock Header */}
                    <div style={{ height:'48px', background:newThemeVars['--bg-panel'], borderBottom:`1px solid ${newThemeVars['--border-color']}`, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 1.25rem' }}>
                       <div style={{ width:60, height:10, background:newThemeVars['--text-primary'], opacity:0.3, borderRadius:5 }}/>
                       <div style={{ width:24, height:24, background:newThemeVars['--text-primary'], opacity:0.1, borderRadius:'50%' }}/>
                    </div>

                    {/* Mock Dashboard Body */}
                    <div style={{ padding:'1.25rem', display:'flex', flexDirection:'column', gap:'1.25rem' }}>
                       {/* Metric Grid */}
                       <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.75rem' }}>
                          {[1,2,3].map(i => (
                            <div key={i} style={{ padding:'0.75rem', background:newThemeVars['--bg-panel'], border:`1px solid ${newThemeVars['--border-color']}`, borderRadius:8 }}>
                               <div style={{ width:40, height:6, background:newThemeVars['--text-secondary'], opacity:0.2, marginBottom:'8px' }}/>
                               <div style={{ width:30, height:12, background:newThemeVars['--text-primary'], opacity:0.8 }}/>
                            </div>
                          ))}
                       </div>

                       {/* List / Table */}
                       <div style={{ background:newThemeVars['--bg-panel'], border:`1px solid ${newThemeVars['--border-color']}`, borderRadius:10, overflow:'hidden' }}>
                          <div style={{ padding:'0.75rem 1rem', borderBottom:`1px solid ${newThemeVars['--border-color']}`, background:newThemeVars['--bg-panel'], display:'flex', justifyContent:'space-between' }}>
                             <div style={{ width:80, height:8, background:newThemeVars['--text-primary'], opacity:0.2 }}/>
                             <div style={{ width:40, height:8, background:newThemeVars['--text-primary'], opacity:0.1 }}/>
                          </div>
                          {[1,2,3].map(i => (
                             <div key={i} style={{ padding:'1rem', borderBottom:`1px solid ${newThemeVars['--border-color']}`, display:'flex', alignItems:'center', gap:'1rem' }}>
                                <div style={{ width:12, height:12, background:newThemeVars['--text-primary'], opacity:0.1, borderRadius:3 }}/>
                                <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'6px' }}>
                                   <div style={{ width:'60%', height:8, background:newThemeVars['--text-primary'], opacity:0.5 }}/>
                                   <div style={{ width:'30%', height:6, background:newThemeVars['--text-secondary'], opacity:0.3 }}/>
                                </div>
                                <div style={{ width:40, height:18, background:'var(--accent-color)', borderRadius:4 }}/>
                             </div>
                          ))}
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding:'1.25rem 1.5rem', borderTop:'1px solid var(--border-color)', display:'flex', justifyContent:'flex-end', gap:'0.875rem', background:'var(--bg-panel)' }}>
              <button className="btn" onClick={() => setIsCreatorOpen(false)} style={{ background:'transparent' }}>Cancelar</button>
              <button className="btn primary" onClick={handleSaveTheme} disabled={!newThemeName.trim()}>
                <Check size={18}/> Salvar Novo Tema
              </button>
            </div>
          </div>
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

function ThemeOption({ id, theme, isActive, onSelect, onEdit, onDelete, isCustom }) {
  const vars = theme.vars;
  return (
    <div 
      onClick={onSelect}
      style={{
        padding:'1.25rem', borderRadius:'var(--radius-lg)', cursor:'pointer',
        background: vars['--bg-panel'],
        border: isActive ? `2px solid var(--accent-color)` : `1px solid var(--border-color)`,
        boxShadow: isActive ? `0 8px 24px -4px ${isActive ? 'var(--accent-color)' : 'transparent'}20` : 'none',
        transition:'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        display:'flex', flexDirection:'column', gap:'1rem',
        position:'relative',
        transform: isActive ? 'translateY(-2px)' : 'none'
      }}
      onMouseEnter={e => !isActive && (e.currentTarget.style.borderColor = 'var(--border-focus)')}
      onMouseLeave={e => !isActive && (e.currentTarget.style.borderColor = 'var(--border-color)')}
    >
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div style={{ fontWeight:700, fontSize:'0.875rem', color:vars['--text-primary'] }}>{theme.name}</div>
        {isActive && (
          <div style={{ 
            background:'var(--accent-color)', color:'var(--accent-text)', borderRadius:'50%', width:20, height:20, 
            display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--shadow-sm)' 
          }}><Check size={14}/></div>
        )}
      </div>
      
      <div style={{ background:vars['--bg-app'], height:72, borderRadius:'var(--radius-md)', padding:'10px', display:'flex', gap:'8px' }}>
        <div style={{ flex:1, background:vars['--bg-panel'], border:`1px solid ${vars['--border-color']}`, borderRadius:4 }}></div>
        <div style={{ flex:2, display:'flex', flexDirection:'column', gap:'6px', justifyContent:'center' }}>
          <div style={{ width:'70%', height:5, background:vars['--text-primary'], opacity:0.2, borderRadius:1 }}></div>
          <div style={{ width:'40%', height:5, background:vars['--text-primary'], opacity:0.1, borderRadius:1 }}></div>
          <div style={{ width:'30%', height:8, background:'var(--accent-color)', borderRadius:2, marginTop:6 }}></div>
        </div>
      </div>

      <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
        <div style={{ width:14, height:14, borderRadius:'50%', background:vars['--bg-app'], border:'1px solid rgba(255,255,255,0.1)' }}/>
        <div style={{ width:14, height:14, borderRadius:'50%', background:vars['--bg-panel'], border:'1px solid rgba(255,255,255,0.1)' }}/>
        <div style={{ width:14, height:14, borderRadius:'50%', background:vars['--text-primary'], border:'1px solid rgba(255,255,255,0.1)' }}/>
      </div>

      {isCustom && (
        <div style={{ marginTop:'0.5rem', display:'flex', gap:'0.625rem', paddingTop:'0.875rem', borderTop:`1px solid ${vars['--border-color']}` }}>
          <button className="btn" style={{ padding:'4px 8px', fontSize:'11px', flex:1, background:'transparent' }} onClick={(e) => { e.stopPropagation(); onEdit(); }}>Editar</button>
          <button className="btn danger" style={{ padding:'4px 8px', background:'transparent', borderColor:'transparent' }} onClick={(e) => { e.stopPropagation(); onDelete(); }}><Trash2 size={14}/></button>
        </div>
      )}
    </div>
  );
}

export default Settings;
