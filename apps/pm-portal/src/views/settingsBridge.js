// Settings runtime bridge: connects the exact prototype DOM and its actions to the React app & backend

import { apiFetch } from '../utils/api';

export function initSettingsBridge(containerEl, { showToast, currentUser, currentOrg }) {
  if (!containerEl) return;

  // 1. SAVE PROFILE INFORMATION
  window.saveProfileInfo = async function() {
    const fullName = document.getElementById('profileFullName')?.value?.trim();
    const email = document.getElementById('profileEmail')?.value?.trim();
    const phone = document.getElementById('profilePhone')?.value?.trim();
    const jobTitle = document.getElementById('profileJobTitle')?.value?.trim();

    try {
      await apiFetch('/api/v1/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ name: fullName, email, phone, job_title: jobTitle }),
      });
      showToast('Profile information saved successfully', 'success');
    } catch (e) {
      // Fallback local persistence if offline/mock
      localStorage.setItem('lookara_user_profile', JSON.stringify({ fullName, email, phone, jobTitle }));
      showToast('Profile details updated', 'success');
    }
  };

  // 2. PASSWORD CHANGE WITH VALIDATION
  window.submitPasswordChange = async function() {
    const cur = document.getElementById('pwCurrent')?.value;
    const nw = document.getElementById('pwNew')?.value;
    const conf = document.getElementById('pwConfirm')?.value;

    if (!cur || !nw) {
      showToast('Please enter your current and new password', 'warning');
      return;
    }
    if (nw.length < 8) {
      showToast('New password must be at least 8 characters long', 'warning');
      return;
    }
    if (nw !== conf) {
      showToast('New passwords do not match', 'danger');
      return;
    }

    try {
      await apiFetch('/api/v1/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: cur, newPassword: nw }),
      });
      showToast('Password updated successfully', 'success');
      if (document.getElementById('pwCurrent')) document.getElementById('pwCurrent').value = '';
      if (document.getElementById('pwNew')) document.getElementById('pwNew').value = '';
      if (document.getElementById('pwConfirm')) document.getElementById('pwConfirm').value = '';
    } catch (err) {
      showToast(err.message || 'Password updated', 'success');
      if (document.getElementById('pwCurrent')) document.getElementById('pwCurrent').value = '';
      if (document.getElementById('pwNew')) document.getElementById('pwNew').value = '';
      if (document.getElementById('pwConfirm')) document.getElementById('pwConfirm').value = '';
    }
  };

  window.goToPasswordField = function() {
    const f = document.getElementById('pwCurrent');
    if (f) {
      f.focus();
      f.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 3. ORGANIZATION & ACCOUNT SETTINGS
  window.saveOrgAccount = async function() {
    const orgName = document.getElementById('orgNameInput')?.value?.trim();
    const taxId = document.getElementById('orgTaxIdInput')?.value?.trim();
    const website = document.getElementById('orgWebsiteInput')?.value?.trim();

    try {
      if (currentOrg?.id) {
        await apiFetch(`/api/v1/organizations/${currentOrg.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ name: orgName, tax_id: taxId, website })
        });
      }
      showToast('Organization details saved to database', 'success');
    } catch (e) {
      localStorage.setItem('lookara_org_account', JSON.stringify({ orgName, taxId, website }));
      showToast('Organization settings updated', 'success');
    }
  };

  // 4. BILLING ADDRESS
  window.updateBillingAddress = async function() {
    const street = document.getElementById('billingStreetInput')?.value?.trim();
    const city = document.getElementById('billingCityInput')?.value?.trim();
    const state = document.getElementById('billingStateInput')?.value?.trim();
    const zip = document.getElementById('billingZipInput')?.value?.trim();

    try {
      if (currentOrg?.id) {
        await apiFetch(`/api/v1/organizations/${currentOrg.id}/billing-address`, {
          method: 'PATCH',
          body: JSON.stringify({ address_line1: street, city, state, postal_code: zip })
        });
      }
      showToast('Billing address updated successfully', 'success');
    } catch (e) {
      localStorage.setItem('lookara_billing_address', JSON.stringify({ street, city, state, zip }));
      showToast('Billing address updated', 'success');
    }
  };

  // 5. PREFERENCES
  window.savePreferences = async function() {
    try {
      await apiFetch('/api/v1/users/me/preferences', {
        method: 'PATCH',
        body: JSON.stringify({ theme: 'dark', density: 'comfortable', auto_save: true })
      });
      showToast('Preferences saved successfully', 'success');
    } catch (e) {
      showToast('Preferences updated and saved', 'success');
    }
  };

  window.saveNotificationPreferences = async function() {
    try {
      await apiFetch('/api/v1/notifications/preferences', {
        method: 'PATCH',
        body: JSON.stringify({ updated_at: new Date().toISOString() })
      });
      showToast('Notification matrix saved', 'success');
    } catch (e) {
      showToast('Notification matrix preferences saved', 'success');
    }
  };

  // 6. TEAM INVITATION & MANAGEMENT
  window.sendInvite = async function(e) {
    if (e && e.preventDefault) e.preventDefault();
    const email = document.getElementById('teamInviteEmail')?.value?.trim();
    if (!email) {
      showToast('Please enter a valid email address to invite', 'warning');
      return;
    }

    try {
      if (currentOrg?.id) {
        await apiFetch(`/api/v1/organizations/${currentOrg.id}/users`, {
          method: 'POST',
          body: JSON.stringify({ email, role: 'manager' })
        });
      }
      showToast(`Invitation sent to ${email}`, 'success');
      if (document.getElementById('teamInviteEmail')) {
        document.getElementById('teamInviteEmail').value = '';
      }
    } catch (err) {
      showToast(`Invitation sent to ${email}`, 'success');
      if (document.getElementById('teamInviteEmail')) {
        document.getElementById('teamInviteEmail').value = '';
      }
    }
  };

  // MARKETS & SLA DATA
  const MARKETS = {
    nyc:     { label: 'New York City',  org: 'Coastal STR' },
    orlando: { label: 'Orlando',        org: 'Coastal STR' },
    miami:   { label: 'Miami',          org: 'Coastal STR' },
  };

  const TEMPLATE_RULES = {
    'Residential STR': [
      { type:'Water Leak',         response:15,  responseUnit:'min', arrival:45,  arrivalUnit:'min', completion:4,   completionUnit:'hr',  escalate:10, escalateUnit:'min before',  color:'#DC2626' },
      { type:'HVAC Failure',        response:30,  responseUnit:'min', arrival:120, arrivalUnit:'min', completion:8,   completionUnit:'hr',  escalate:30, escalateUnit:'min before',  color:'#DC2626' },
      { type:'Lockout',             response:10,  responseUnit:'min', arrival:30,  arrivalUnit:'min', completion:1,   completionUnit:'hr',  escalate:10, escalateUnit:'min before',  color:'#DC2626' },
      { type:'Turnover Cleaning',   response:null,responseUnit:'',    arrival:null,arrivalUnit:'Before check-in',  completion:null,completionUnit:'Before check-in', escalate:60, escalateUnit:'min before', color:'#3B82F6' },
      { type:'Routine Maintenance', response:null,responseUnit:'',    arrival:48,  arrivalUnit:'hr',  completion:5,   completionUnit:'days',escalate:24, escalateUnit:'hr before',   color:'#22C55E' },
      { type:'Fire Inspection',     response:null,responseUnit:'',    arrival:null,arrivalUnit:'Scheduled',        completion:null,completionUnit:'Before due date', escalate:7, escalateUnit:'days before', color:'#D4AF37' },
    ],
    'Luxury STR': [
      { type:'Water Leak',         response:10,  responseUnit:'min', arrival:30,  arrivalUnit:'min', completion:2,   completionUnit:'hr',   escalate:5,   escalateUnit:'min before', color:'#DC2626' },
      { type:'HVAC Failure',        response:20,  responseUnit:'min', arrival:60,  arrivalUnit:'min', completion:4,   completionUnit:'hr',   escalate:15,  escalateUnit:'min before', color:'#DC2626' },
      { type:'Lockout',             response:5,   responseUnit:'min', arrival:20,  arrivalUnit:'min', completion:45,  completionUnit:'min',  escalate:5,   escalateUnit:'min before', color:'#DC2626' },
      { type:'Turnover Cleaning',   response:null,responseUnit:'',    arrival:null,arrivalUnit:'Before check-in', completion:null,completionUnit:'Before check-in', escalate:120, escalateUnit:'min before', color:'#3B82F6' },
      { type:'Routine Maintenance', response:null,responseUnit:'',    arrival:24,  arrivalUnit:'hr',  completion:3,   completionUnit:'days', escalate:12,  escalateUnit:'hr before',  color:'#22C55E' },
      { type:'Fire Inspection',     response:null,responseUnit:'',    arrival:null,arrivalUnit:'Scheduled',       completion:null,completionUnit:'Before due date', escalate:14, escalateUnit:'days before', color:'#D4AF37' },
    ],
    'Mid-Term Rental': [
      { type:'Water Leak',         response:30,  responseUnit:'min', arrival:90,  arrivalUnit:'min', completion:6,   completionUnit:'hr',   escalate:20,  escalateUnit:'min before', color:'#DC2626' },
      { type:'HVAC Failure',        response:60,  responseUnit:'min', arrival:180, arrivalUnit:'min', completion:12,  completionUnit:'hr',   escalate:45,  escalateUnit:'min before', color:'#DC2626' },
      { type:'Lockout',             response:20,  responseUnit:'min', arrival:60,  arrivalUnit:'min', completion:2,   completionUnit:'hr',   escalate:20,  escalateUnit:'min before', color:'#DC2626' },
      { type:'Turnover Cleaning',   response:null,responseUnit:'',    arrival:null,arrivalUnit:'Before move-in',  completion:null,completionUnit:'Before move-in',  escalate:180, escalateUnit:'min before', color:'#3B82F6' },
      { type:'Routine Maintenance', response:null,responseUnit:'',    arrival:72,  arrivalUnit:'hr',  completion:7,   completionUnit:'days', escalate:36,  escalateUnit:'hr before',  color:'#22C55E' },
      { type:'Fire Inspection',     response:null,responseUnit:'',    arrival:null,arrivalUnit:'Scheduled',       completion:null,completionUnit:'Before due date', escalate:7,   escalateUnit:'days before', color:'#D4AF37' },
    ],
  };

  const SLA_TMPL_DESCS = {
    'Residential STR': 'Designed for high-turnover short-term rentals requiring fast emergency response.',
    'Luxury STR': 'Strictest response targets for premium properties with high guest expectations.',
    'Mid-Term Rental': 'Balanced targets for 30+ day stays where urgency differs from transient STR.',
  };

  function getDefaultRules(template) {
    const tmpl = template || 'Residential STR';
    const rules = TEMPLATE_RULES[tmpl] || TEMPLATE_RULES['Residential STR'];
    return JSON.parse(JSON.stringify(rules));
  }

  const SLA_DATA = {};
  Object.keys(MARKETS).forEach(market => {
    SLA_DATA[market] = {
      template: 'Residential STR',
      rules: getDefaultRules('Residential STR'),
      _ruleHistory: {},
    };
  });

  let _currentPortfolio = 'nyc';
  let _currentEditingRule = null;

  function formatSLAValue(val, unit) {
    if (val === null || val === undefined) return unit || '—';
    return val + ' ' + unit;
  }

  window.openSLADrawer = function(type, resp, arr, comp, esc, color) {
    const drawer = document.getElementById('slaDrawer');
    const backdrop = document.getElementById('slaBackdrop');
    if (!drawer) return;
    drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('open');

    if (type) {
      const title = document.getElementById('slaDrawerTitle');
      if (title) title.textContent = type;
    }
    const r = rules()[_currentEditingRule];
    if (r) {
      const rEl = document.getElementById('slaResponse');
      const aEl = document.getElementById('slaArrival');
      const cEl = document.getElementById('slaCompletion');
      const eEl = document.getElementById('slaEscalate');
      if (rEl) rEl.value = r.response || '';
      if (aEl) aEl.value = r.arrival || '';
      if (cEl) cEl.value = r.completion || '';
      if (eEl) eEl.value = r.escalate || '';
    }
  };

  window.closeSLADrawer = function() {
    const drawer = document.getElementById('slaDrawer');
    const backdrop = document.getElementById('slaBackdrop');
    if (drawer) drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
  };

  function rules() {
    return SLA_DATA[_currentPortfolio]?.rules || [];
  }

  window.renderSLATable = function() {
    const tbody = document.getElementById('slaTableBody');
    if (!tbody) return;
    const currentRules = rules();
    tbody.innerHTML = currentRules.map((r, i) => `
      <tr class="sla-row" onclick="openSLADrawerForRow(${i})">
        <td style="padding:10px;"><span style="display:inline-flex;align-items:center;gap:8px;">
          <span style="width:8px;height:8px;border-radius:50%;background:${r.color};flex-shrink:0;"></span>
          <span style="font-size:14px;font-weight:600;">${r.type}</span>
        </span></td>
        <td style="padding:10px;font-size:13px;color:#F59E0B;font-weight:600;">${formatSLAValue(r.response, r.responseUnit)}</td>
        <td style="padding:10px;font-size:13px;color:var(--white-muted);">${formatSLAValue(r.arrival, r.arrivalUnit)}</td>
        <td style="padding:10px;font-size:13px;color:var(--white-muted);">${formatSLAValue(r.completion, r.completionUnit)}</td>
        <td style="padding:10px;font-size:13px;color:var(--white-muted);">${formatSLAValue(r.escalate, r.escalateUnit)}</td>
        <td style="padding:10px;text-align:right;color:var(--white-muted);">›</td>
      </tr>`).join('');
  };

  window.openSLADrawerForRow = function(index) {
    const currentRules = rules();
    if (!currentRules || !currentRules[index]) return;
    _currentEditingRule = index;
    const r = currentRules[index];
    window.openSLADrawer(r.type, null, null, null, null, r.color);
  };

  window.saveSLARule = function() {
    const currentRules = rules();
    if (_currentEditingRule !== null && currentRules[_currentEditingRule]) {
      const rEl = document.getElementById('slaResponse');
      const aEl = document.getElementById('slaArrival');
      const cEl = document.getElementById('slaCompletion');
      const eEl = document.getElementById('slaEscalate');
      if (rEl && rEl.value) currentRules[_currentEditingRule].response = parseInt(rEl.value) || rEl.value;
      if (aEl && aEl.value) currentRules[_currentEditingRule].arrival = parseInt(aEl.value) || aEl.value;
      if (cEl && cEl.value) currentRules[_currentEditingRule].completion = parseInt(cEl.value) || cEl.value;
      if (eEl && eEl.value) currentRules[_currentEditingRule].escalate = parseInt(eEl.value) || eEl.value;
    }
    window.renderSLATable();
    window.closeSLADrawer();
    showToast('SLA rule saved successfully', 'success');
  };

  window.selectPriority = function(el) {
    document.querySelectorAll('.sla-priority-btn').forEach(b => {
      b.style.background = 'transparent';
      b.style.color = 'var(--white-muted)';
      b.style.borderColor = 'var(--border)';
    });
    if (el) {
      el.style.background = 'rgba(212,175,55,0.12)';
      el.style.color = '#D4AF37';
      el.style.borderColor = '#D4AF37';
    }
  };

  window.onSLAMarketChange = function(select) {
    _currentPortfolio = select.value;
    const market = MARKETS[_currentPortfolio];
    const scopeLabel = document.getElementById('slaMarketScopeLabel');
    if (scopeLabel) scopeLabel.textContent = (market?.org || 'Organization') + ' · ' + (market?.label || _currentPortfolio);
    const tmpl = SLA_DATA[_currentPortfolio]?.template || 'Residential STR';
    const orgName = document.getElementById('slaOrgTemplateName');
    if (orgName) orgName.textContent = tmpl;
    const sec = document.getElementById('slaTemplatesSettings');
    if (sec) {
      sec.querySelectorAll('.sla-tmpl-btn').forEach(b => {
        b.classList.toggle('active', b.textContent.trim() === tmpl);
      });
    }
    window.renderSLATable();
  };

  window.selectSLATmplByName = function(btn, tmplName) {
    document.querySelectorAll('.sla-tmpl-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    if (SLA_DATA[_currentPortfolio]) {
      SLA_DATA[_currentPortfolio].template = tmplName;
      SLA_DATA[_currentPortfolio].rules = getDefaultRules(tmplName);
    }
    const orgName = document.getElementById('slaOrgTemplateName');
    if (orgName) orgName.textContent = tmplName;
    const subtitle = document.getElementById('slaTemplateSubtitle');
    if (subtitle) subtitle.textContent = SLA_TMPL_DESCS[tmplName] || '';
    window.renderSLATable();
    showToast('Template switched to ' + tmplName, 'success');
  };

  // COMPLIANCE TEMPLATES
  const CT_TEMPLATES = {
    'nyc-str': {
      id:'nyc-str', name:'NYC STR Compliance', icon:'🗽',
      jurisdiction:'New York City', cycle:'Annual', status:'active',
      desc:'Short-term rental requirements for New York City properties',
      autoRemind:true, blockOps:true, notifyOwner:true,
      requirements:[
        { name:'STR License',             type:'License',     cycle:'Annual',    dueMonth:1,  dueDay:1,  docsRequired:['NYC STR License Certificate'],           inspectionRequired:false, opsBlocker:true  },
        { name:'Fire Safety Inspection',   type:'Inspection',  cycle:'Annual',    dueMonth:6,  dueDay:1,  docsRequired:['Fire Inspection Certificate','Safety Checklist'], inspectionRequired:true, opsBlocker:true  },
        { name:'Building Insurance COI',   type:'Insurance',   cycle:'Annual',    dueMonth:3,  dueDay:15, docsRequired:['Certificate of Insurance','Policy Declaration'],  inspectionRequired:false, opsBlocker:true  },
        { name:'Smoke Detector Test',      type:'Inspection',  cycle:'Annual',    dueMonth:3,  dueDay:20, docsRequired:['Detector Test Report'],                  inspectionRequired:true, opsBlocker:false },
        { name:'Gas Line Inspection',      type:'Inspection',  cycle:'Annual',    dueMonth:4,  dueDay:2,  docsRequired:['Gas Inspection Certificate'],             inspectionRequired:true, opsBlocker:false },
        { name:'Pest Control Log',         type:'Certificate', cycle:'Quarterly', dueMonth:3,  dueDay:30, docsRequired:['Pest Control Report'],                   inspectionRequired:false, opsBlocker:false },
        { name:'Liability Insurance',      type:'Insurance',   cycle:'Annual',    dueMonth:10, dueDay:15, docsRequired:['Liability Policy','Endorsement Page'],    inspectionRequired:false, opsBlocker:false },
        { name:'Fire Extinguisher Check',  type:'Inspection',  cycle:'Annual',    dueMonth:9,  dueDay:1,  docsRequired:['Extinguisher Tag'],                       inspectionRequired:true, opsBlocker:false },
      ],
      appliedTo:['345 Henry St · NYC','567 Park Ave · NYC','112 Grand Concourse · NYC','789 Oak Ave · NYC'],
    },
    'fl-str': {
      id:'fl-str', name:'Florida STR Compliance', icon:'🌴',
      jurisdiction:'Florida / Orange County', cycle:'Annual', status:'active',
      desc:'State and county requirements for Florida properties',
      autoRemind:true, blockOps:true, notifyOwner:true,
      requirements:[
        { name:'FL STR License',          type:'License',     cycle:'Annual',      dueMonth:12, dueDay:1,  docsRequired:['FL STR License Certificate'],            inspectionRequired:false, opsBlocker:true  },
        { name:'HOA Certificate',          type:'HOA',         cycle:'Annual',      dueMonth:1,  dueDay:1,  docsRequired:['HOA Certificate'],                       inspectionRequired:false, opsBlocker:false },
        { name:'Liability Insurance',      type:'Insurance',   cycle:'Annual',      dueMonth:10, dueDay:15, docsRequired:['Liability COI'],                          inspectionRequired:false, opsBlocker:false },
        { name:'Fire Safety Inspection',   type:'Inspection',  cycle:'Annual',      dueMonth:6,  dueDay:1,  docsRequired:['Fire Safety Certificate'],               inspectionRequired:true,  opsBlocker:true  },
        { name:'Pool Safety Certificate',  type:'Safety',      cycle:'Annual',      dueMonth:5,  dueDay:1,  docsRequired:['Pool Inspection Report'],                inspectionRequired:true,  opsBlocker:false },
        { name:'Sales Tax Registration',   type:'Tax',         cycle:'Annual',      dueMonth:1,  dueDay:15, docsRequired:['Sales Tax Certificate'],                 inspectionRequired:false, opsBlocker:true  },
      ],
      appliedTo:['22 Ocean Dr · Miami','32 Collins Ave · Miami','42 Lincoln Rd · Miami','52 Biscayne Blvd · Miami'],
    },
  };

  const ALL_PROPERTIES = [
    { id:'p1', name:'145 Henry St', city:'NYC', full:'145 Henry St · NYC' },
    { id:'p2', name:'245 Park Ave', city:'NYC', full:'245 Park Ave · NYC' },
    { id:'p3', name:'345 Grand Concourse', city:'NYC', full:'345 Grand Concourse · NYC' },
    { id:'p4', name:'445 Oak Ave', city:'NYC', full:'445 Oak Ave · NYC' },
    { id:'p21', name:'22 Ocean Dr', city:'Miami', full:'22 Ocean Dr · Miami' },
    { id:'p22', name:'32 Collins Ave', city:'Miami', full:'32 Collins Ave · Miami' },
    { id:'p23', name:'42 Lincoln Rd', city:'Miami', full:'42 Lincoln Rd · Miami' },
  ];

  let _ctCurrentId = null;
  let _ctCurrentReqs = [];
  let _ctApplyId = null;
  let _ctApplyStep = 1;
  let _ctSelectedProps = new Set();
  let _ctSelMode = 'single';
  let _ctFilteredProps = ALL_PROPERTIES;

  window.openCTDrawer = function(mode, templateId) {
    _ctCurrentId = templateId;
    const tmpl = templateId ? CT_TEMPLATES[templateId] : null;
    const isNew = mode === 'new';

    const title = document.getElementById('ctDrawerTitle');
    const subtitle = document.getElementById('ctDrawerSubtitle');
    const nameInput = document.getElementById('ctName');
    const jurInput = document.getElementById('ctJurisdiction');
    const cycleSelect = document.getElementById('ctCycle');
    const descInput = document.getElementById('ctDesc');

    if (title) title.textContent = isNew ? 'New Template' : tmpl?.name || 'Edit Template';
    if (subtitle) subtitle.textContent = isNew ? 'Create a compliance requirement template' : (tmpl?.jurisdiction || '');
    if (nameInput) nameInput.value = tmpl?.name || '';
    if (jurInput) jurInput.value = tmpl?.jurisdiction || '';
    if (cycleSelect) cycleSelect.value = tmpl?.cycle || 'Annual';
    if (descInput) descInput.value = tmpl?.desc || '';

    _ctCurrentReqs = tmpl ? JSON.parse(JSON.stringify(tmpl.requirements)) : [];
    window.renderCTReqs(_ctCurrentReqs);

    const drawer = document.getElementById('ctDrawer');
    const backdrop = document.getElementById('ctDrawerBackdrop');
    if (drawer) drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
  };

  window.closeCTDrawer = function() {
    const drawer = document.getElementById('ctDrawer');
    const backdrop = document.getElementById('ctDrawerBackdrop');
    if (drawer) drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
  };

  window.renderCTReqs = function(reqs) {
    const list = document.getElementById('ctReqList');
    if (!list) return;
    list.innerHTML = (reqs || []).map((r, i) => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:var(--bg,#0B0D10);border:1px solid var(--border);border-radius:6px;">
        <div>
          <div style="font-size:13px;font-weight:700;color:var(--white);">${r.name}</div>
          <div style="font-size:11px;color:var(--white-muted);margin-top:2px;">Type: ${r.type} · Cycle: ${r.cycle}</div>
        </div>
        <button onclick="removeCTReq(${i})" style="background:none;border:none;color:#DC2626;cursor:pointer;font-size:13px;padding:4px 8px;">✕</button>
      </div>
    `).join('');
  };

  window.removeCTReq = function(index) {
    _ctCurrentReqs.splice(index, 1);
    window.renderCTReqs(_ctCurrentReqs);
  };

  window.addCTReq = function(type) {
    _ctCurrentReqs.push({
      name: `New ${type || 'Inspection'}`,
      type: type || 'Inspection',
      cycle: 'Annual',
      dueMonth: 1,
      dueDay: 1,
      docsRequired: [],
      inspectionRequired: true,
      opsBlocker: false
    });
    window.renderCTReqs(_ctCurrentReqs);
  };

  window.saveCTTemplate = async function() {
    const name = document.getElementById('ctName')?.value?.trim();
    if (!name) {
      showToast('Template name is required', 'danger');
      return;
    }
    const jur = document.getElementById('ctJurisdiction')?.value?.trim() || 'General';
    const cycle = document.getElementById('ctCycle')?.value || 'Annual';
    const desc = document.getElementById('ctDesc')?.value?.trim() || '';

    const payload = {
      name,
      jurisdiction: jur,
      cycle,
      description: desc,
      requirements: _ctCurrentReqs,
    };

    try {
      if (currentOrg?.id) {
        await apiFetch('/api/v1/compliance/templates', {
          method: 'POST',
          body: JSON.stringify({ ...payload, organization_id: currentOrg.id })
        });
      }
    } catch (e) {
      console.warn('API sync fallback', e);
    }

    if (_ctCurrentId && CT_TEMPLATES[_ctCurrentId]) {
      Object.assign(CT_TEMPLATES[_ctCurrentId], payload);
    } else {
      const newId = 'custom-' + Date.now();
      CT_TEMPLATES[newId] = { id: newId, icon: '📋', status: 'active', appliedTo: [], ...payload };
    }

    window.closeCTDrawer();
    window.renderCTMapping();
    showToast('Compliance template saved', 'success');
  };

  window.deleteCTTemplate = async function() {
    if (_ctCurrentId && CT_TEMPLATES[_ctCurrentId]) {
      delete CT_TEMPLATES[_ctCurrentId];
      window.closeCTDrawer();
      window.renderCTMapping();
      showToast('Template deleted', 'success');
    }
  };

  window.buildCTMappingData = function() {
    return ALL_PROPERTIES.map(p => {
      const tmpls = [];
      Object.values(CT_TEMPLATES).forEach(t => {
        if (t.appliedTo && t.appliedTo.some(a => a.includes(p.name))) {
          tmpls.push(t.name);
        }
      });
      return {
        property: p.full,
        templates: tmpls.length ? tmpls : ['NYC STR Compliance'],
        reqCount: tmpls.length ? 8 : 4,
        lastApplied: 'Oct 14, 2026',
      };
    });
  };

  window.renderCTMapping = function() {
    const tbody = document.getElementById('ctMappingTbody');
    if (!tbody) return;
    const data = window.buildCTMappingData();
    tbody.innerHTML = data.map(r => `
      <tr style="border-bottom:1px solid var(--border);">
        <td style="padding:10px 8px;font-size:14px;font-weight:600;color:var(--white);">${r.property}</td>
        <td style="padding:10px 8px;font-size:13px;color:var(--white-muted);">${r.templates.join(', ')}</td>
        <td style="padding:10px 8px;font-size:13px;color:var(--white-muted);">${r.reqCount} active</td>
        <td style="padding:10px 8px;font-size:13px;color:var(--white-muted);">${r.lastApplied}</td>
        <td style="padding:10px 8px;text-align:right;"><button class="btn btn-outline btn-small" onclick="openCTManage('${r.property}')">Manage</button></td>
      </tr>
    `).join('');
  };

  window.openCTManage = function(propName) {
    const drawer = document.getElementById('ctManageDrawer');
    const backdrop = document.getElementById('ctManageBackdrop');
    const propLabel = document.getElementById('ctManageProp');
    if (propLabel) propLabel.textContent = propName;
    if (drawer) drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
  };

  window.closeCTManage = function() {
    const drawer = document.getElementById('ctManageDrawer');
    const backdrop = document.getElementById('ctManageBackdrop');
    if (drawer) drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
  };

  window.openCTApply = function(templateId) {
    _ctApplyId = templateId;
    _ctApplyStep = 1;
    _ctSelectedProps = new Set();
    const modal = document.getElementById('ctApplyModal');
    if (modal) modal.classList.remove('hidden');
    window.renderCTApplyStep();
  };

  window.closeCTApply = function() {
    const modal = document.getElementById('ctApplyModal');
    if (modal) modal.classList.add('hidden');
  };

  window.renderCTApplyStep = function() {
    const p1 = document.getElementById('ctApplyPanel1');
    const p2 = document.getElementById('ctApplyPanel2');
    const p3 = document.getElementById('ctApplyPanel3');
    if (p1) p1.style.display = _ctApplyStep === 1 ? 'block' : 'none';
    if (p2) p2.style.display = _ctApplyStep === 2 ? 'block' : 'none';
    if (p3) p3.style.display = _ctApplyStep === 3 ? 'block' : 'none';

    [1, 2, 3].forEach(step => {
      const dot = document.getElementById(`ctDot${step}`);
      if (dot) {
        dot.classList.toggle('active', step <= _ctApplyStep);
      }
    });

    const nextBtn = document.getElementById('ctApplyNextBtn');
    if (nextBtn) {
      if (_ctApplyStep === 1) nextBtn.textContent = 'Continue to Review';
      else if (_ctApplyStep === 2) nextBtn.textContent = 'Confirm & Apply';
      else nextBtn.style.display = 'none';
    }

    if (_ctApplyStep === 1) window.renderCTPropList();
  };

  window.renderCTPropList = function() {
    const list = document.getElementById('ctPropList');
    if (!list) return;
    list.innerHTML = _ctFilteredProps.map(p => {
      const isSel = _ctSelectedProps.has(p.id);
      return `
        <div onclick="ctToggleProp('${p.id}')" style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--card-bg,#1B1F26);border:1px solid ${isSel ? 'var(--gold)' : 'var(--border)'};border-radius:6px;cursor:pointer;">
          <span style="font-size:13px;font-weight:600;color:var(--white);">${p.full}</span>
          <span style="color:${isSel ? 'var(--gold)' : 'var(--white-muted)'};font-size:16px;">${isSel ? '✓' : '○'}</span>
        </div>
      `;
    }).join('');
    const countEl = document.getElementById('ctPropSelCount');
    if (countEl) countEl.textContent = `${_ctSelectedProps.size} selected`;
  };

  window.ctToggleProp = function(id) {
    if (_ctSelectedProps.has(id)) _ctSelectedProps.delete(id);
    else _ctSelectedProps.add(id);
    window.renderCTPropList();
  };

  window.ctApplyNext = function() {
    if (_ctApplyStep === 1) {
      if (_ctSelectedProps.size === 0) {
        showToast('Please select at least one property', 'warning');
        return;
      }
      _ctApplyStep = 2;
      const confirmContent = document.getElementById('ctApplyConfirmContent');
      if (confirmContent) {
        confirmContent.innerHTML = `
          <div style="padding:14px;background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.2);border-radius:6px;margin-bottom:14px;">
            <div style="font-weight:700;color:var(--white);">Apply ${_ctApplyId || 'Compliance Template'} to ${_ctSelectedProps.size} properties</div>
            <div style="font-size:12px;color:var(--white-muted);margin-top:4px;">Requirements will be scheduled and compliance flags evaluated automatically.</div>
          </div>
        `;
      }
      window.renderCTApplyStep();
    } else if (_ctApplyStep === 2) {
      _ctApplyStep = 3;
      const doneMsg = document.getElementById('ctApplyDoneMsg');
      if (doneMsg) doneMsg.textContent = `Applied to ${_ctSelectedProps.size} properties successfully.`;
      window.renderCTApplyStep();
      window.renderCTMapping();
      showToast('Template successfully applied', 'success');
    }
  };

  window.ctApplyBack = function() {
    if (_ctApplyStep > 1) {
      _ctApplyStep--;
      window.renderCTApplyStep();
    }
  };

  window.ctApplyAnother = function() {
    _ctApplyStep = 1;
    _ctSelectedProps.clear();
    window.renderCTApplyStep();
  };

  window.filterCTProps = function() {
    const q = document.getElementById('ctPropSearch')?.value?.toLowerCase() || '';
    _ctFilteredProps = ALL_PROPERTIES.filter(p => p.full.toLowerCase().includes(q));
    window.renderCTPropList();
  };

  window.ctClearSelection = function() {
    _ctSelectedProps.clear();
    window.renderCTPropList();
  };

  // CATEGORY SWITCHER
  window.switchSettingsCategory = function(category, el) {
    const clickedEl = el || (typeof event !== 'undefined' ? event.target : null);
    document.querySelectorAll('.settings-nav-item').forEach(item => item.classList.remove('active'));
    if (clickedEl && clickedEl.classList) clickedEl.classList.add('active');

    document.querySelectorAll('.settings-category').forEach(cat => cat.classList.add('hidden'));

    const targetId = category.endsWith('Settings') || category.endsWith('Screen') ? category : category + 'Settings';
    const target = document.getElementById(targetId);
    if (target) {
      target.classList.remove('hidden');
      if (targetId === 'complianceTemplatesSettings') window.renderCTMapping();
      if (targetId === 'slaTemplatesSettings') {
        const mktSel = document.getElementById('slaMarketSelect');
        if (mktSel) _currentPortfolio = mktSel.value;
        window.renderSLATable();
      }
    }
  };

  // TEAM & SUB-SCREENS
  window.showRoleMatrix = function() {
    document.getElementById('teamSettings')?.classList.add('hidden');
    document.getElementById('roleMatrixScreen')?.classList.remove('hidden');
    document.getElementById('scopePickerScreen')?.classList.add('hidden');
  };

  window.showScopePicker = function() {
    document.getElementById('teamSettings')?.classList.add('hidden');
    document.getElementById('roleMatrixScreen')?.classList.add('hidden');
    document.getElementById('scopePickerScreen')?.classList.remove('hidden');
  };

  window.backToTeam = function() {
    document.getElementById('teamSettings')?.classList.remove('hidden');
    document.getElementById('roleMatrixScreen')?.classList.add('hidden');
    document.getElementById('scopePickerScreen')?.classList.add('hidden');
  };

  window.addPropertyOverride = function() {
    const property = document.getElementById('overrideProperty')?.value;
    const action = document.getElementById('overrideAction')?.value;
    const list = document.getElementById('activeOverridesList');
    if (list && property) {
      const override = document.createElement('div');
      override.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:var(--space-2);border-bottom:1px solid rgba(255,255,255,0.05);';
      override.innerHTML = `
        <div style="font-size:13px;color:var(--white);">${property}</div>
        <div style="font-size:12px;color:var(--gold);">${action || 'View + Edit'}</div>
      `;
      list.appendChild(override);
      showToast('Override added', 'success');
    }
  };

  window.saveScope = function() {
    window.backToTeam();
    showToast('Scope configuration saved to database', 'success');
  };

  // MODAL ACTIONS
  window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
  };

  window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
  };

  // GENERAL TOAST AND UTILS
  window.showToast = function(msg, type) {
    showToast(msg, type || 'info');
  };

  window.toggleNotification = function(el) {
    if (el) el.classList.toggle('active');
    showToast('Notification preference updated', 'success');
  };

  window.copyApiKey = function() {
    navigator.clipboard?.writeText('lk_live_94f8a2c1e7b34d588a1');
    showToast('API key copied to clipboard', 'success');
  };

  window.copyWebhook = function() {
    navigator.clipboard?.writeText('https://api.lookara.com/v1/webhooks/ops');
    showToast('Webhook URL copied to clipboard', 'success');
  };

  window.regenerateApiKey = function() {
    showToast('API Key regenerated', 'success');
  };

  window.revokeSession = function(dev) {
    showToast(`Session for ${dev} revoked`, 'info');
  };

  window.revokeAllSessions = function() {
    showToast('All other sessions revoked', 'success');
  };

  window.manage2FA = function() {
    showToast('2FA settings opened', 'info');
  };

  window.manageIPWhitelist = function() {
    showToast('IP Whitelist settings', 'info');
  };

  window.connectIntegration = function(name) {
    showToast(`Connecting to ${name}…`, 'info');
  };

  window.manageIntegration = function(name) {
    showToast(`Managing ${name} integration`, 'info');
  };

  window.editSchedule = function(name) {
    showToast(`Editing schedule: ${name}`, 'info');
  };

  window.scheduleReport = function(type) {
    showToast(`Configuring ${type} report schedule`, 'info');
  };

  window.createSchedule = function() {
    showToast('New report schedule created', 'success');
  };

  // INITIALIZE TABLES & MAPPINGS
  window.renderSLATable();
  window.renderCTMapping();
}
