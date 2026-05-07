package com.orby.orby.admin.model;

import com.orby.orby.shared.model.TenantAwareEntity;
import jakarta.persistence.*;

@Entity
public class TenantConfig extends TenantAwareEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String brandName;
    private String primaryColor;
    private String accent2;
    private String sidebarColor;
    private String panelBg;
    private String appBg;
    private String domain;
    private String widgetWelcome;
    private String widgetColor;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getBrandName() { return brandName; }
    public void setBrandName(String brandName) { this.brandName = brandName; }
    public String getPrimaryColor() { return primaryColor; }
    public void setPrimaryColor(String primaryColor) { this.primaryColor = primaryColor; }
    public String getAccent2() { return accent2; }
    public void setAccent2(String accent2) { this.accent2 = accent2; }
    public String getSidebarColor() { return sidebarColor; }
    public void setSidebarColor(String sidebarColor) { this.sidebarColor = sidebarColor; }
    public String getPanelBg() { return panelBg; }
    public void setPanelBg(String panelBg) { this.panelBg = panelBg; }
    public String getAppBg() { return appBg; }
    public void setAppBg(String appBg) { this.appBg = appBg; }
    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }
    public String getWidgetWelcome() { return widgetWelcome; }
    public void setWidgetWelcome(String widgetWelcome) { this.widgetWelcome = widgetWelcome; }
    public String getWidgetColor() { return widgetColor; }
    public void setWidgetColor(String widgetColor) { this.widgetColor = widgetColor; }
}
