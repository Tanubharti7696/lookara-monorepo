// src/views/Support.jsx
import { useState, useMemo } from 'react';
import {
  SYSTEM_STATUS,
  QUICK_ACTIONS,
  FAQ,
  RECENT_TICKETS,
  POPULAR_ARTICLES,
  SUPPORT_CHANNELS,
} from '../data/supportData';
import ContactSupportDrawer from './support/ContactSupportDrawer';
import './Support.css';
import './properties/PropertyOverlays.css';

const TICKET_STATUS_CLS = {
  open:     'sup-tkt--open',
  pending:  'sup-tkt--pending',
  resolved: 'sup-tkt--resolved',
  closed:   'sup-tkt--closed',
};

export default function Support({ onToast }) {
  const [search, setSearch]           = useState('');
  const [openIds, setOpenIds]         = useState(() => new Set());
  const [contactOpen, setContactOpen] = useState(false);
  const [contactReason, setContactReason] = useState(null);

  const toggle = (key) => {
    setOpenIds(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const filteredFaq = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return FAQ;
    return FAQ
      .map(cat => ({
        ...cat,
        questions: cat.questions.filter(
          x => x.q.toLowerCase().includes(q) || x.a.toLowerCase().includes(q)
        ),
      }))
      .filter(cat => cat.questions.length > 0);
  }, [search]);

  const openContact = (reason = null) => {
    setContactReason(reason);
    setContactOpen(true);
  };

  return (
    <div className="sup-shell">
      <header className="sup-head">
        <div>
          <div className="sup-head__eyebrow">Help Center</div>
          <h1 className="sup-head__title">Support</h1>
          <p className="sup-head__sub">
            Answers, guides, and a direct line to our team. Most questions get resolved in under an hour.
          </p>
        </div>
        <div className="sup-head__search">
          <span className="sup-head__search-icon">🔍</span>
          <input
            type="search"
            className="sup-search"
            placeholder="Search help articles, FAQs, troubleshooting…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {/* Status strip */}
      <div className={`sup-status sup-status--${SYSTEM_STATUS.state}`}>
        <span className="sup-status__dot" />
        <span className="sup-status__label">{SYSTEM_STATUS.label}</span>
        <span className="sup-status__sep">·</span>
        <span className="sup-status__updated">{SYSTEM_STATUS.updated}</span>
        <a className="sup-status__link" href="#status">View status page →</a>
      </div>

      {/* Quick actions */}
      <div className="sup-quick">
        {QUICK_ACTIONS.map(a => (
          <button
            key={a.key}
            type="button"
            className={`sup-quick__card sup-quick__card--${a.tone}`}
            onClick={() => {
              if (a.key === 'contact') openContact();
              else if (a.key === 'bug') openContact('Bug report');
              else if (a.key === 'feature') openContact('Feature request');
              else onToast?.('Live chat will open when integrated', 'info');
            }}
          >
            <span className="sup-quick__icon">{a.icon}</span>
            <span className="sup-quick__body">
              <span className="sup-quick__title">{a.title}</span>
              <span className="sup-quick__sub">{a.sub}</span>
            </span>
            <span className="sup-quick__arrow">→</span>
          </button>
        ))}
      </div>

      {/* Two-column: FAQ + right rail */}
      <div className="sup-layout">
        <main className="sup-main">
          <div className="sup-main__head">
            <h2 className="sup-main__title">
              {search ? `Results for "${search}"` : 'Frequently asked questions'}
            </h2>
            <span className="sup-main__count">
              {filteredFaq.reduce((n, c) => n + c.questions.length, 0)} article
              {filteredFaq.reduce((n, c) => n + c.questions.length, 0) === 1 ? '' : 's'}
            </span>
          </div>

          {filteredFaq.length === 0 && (
            <div className="sup-empty">
              <div className="sup-empty__icon">🔎</div>
              <div className="sup-empty__title">No articles match "{search}"</div>
              <div className="sup-empty__sub">
                Try a different keyword or{' '}
                <button className="sup-link" onClick={() => openContact()}>
                  contact support
                </button>.
              </div>
            </div>
          )}

          {filteredFaq.map(cat => (
            <section key={cat.category} className="sup-cat">
              <div className="sup-cat__head">
                <span className="sup-cat__icon">{cat.icon}</span>
                <span className="sup-cat__name">{cat.category}</span>
                <span className="sup-cat__count">{cat.questions.length}</span>
              </div>

              <div className="sup-faq">
                {cat.questions.map((item, i) => {
                  const key = `${cat.category}::${i}`;
                  const isOpen = openIds.has(key);
                  return (
                    <div key={key} className={`sup-faq__item ${isOpen ? 'open' : ''}`}>
                      <button
                        type="button"
                        className="sup-faq__q"
                        onClick={() => toggle(key)}
                        aria-expanded={isOpen}
                      >
                        <span>{item.q}</span>
                        <span className="sup-faq__chev">{isOpen ? '−' : '+'}</span>
                      </button>
                      {isOpen && <div className="sup-faq__a">{item.a}</div>}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          <div className="sup-cta">
            <div>
              <div className="sup-cta__title">Still need help?</div>
              <div className="sup-cta__sub">Our team replies to every ticket within 4 business hours.</div>
            </div>
            <button className="stg-btn stg-btn--primary" onClick={() => openContact()}>
              Contact Support
            </button>
          </div>
        </main>

        <aside className="sup-rail">
          {/* Recent tickets */}
          <div className="sup-rail__block">
            <div className="sup-rail__title-row">
              <div className="sup-rail__title">Your recent tickets</div>
              <button className="sup-rail__link" onClick={() => onToast?.('Full ticket history opens when integrated', 'info')}>
                View all
              </button>
            </div>
            {RECENT_TICKETS.map(t => (
              <div key={t.id} className="sup-tkt">
                <div className="sup-tkt__row">
                  <span className="sup-tkt__id">{t.id}</span>
                  <span className={`sup-tkt__status ${TICKET_STATUS_CLS[t.status]}`}>{t.status}</span>
                </div>
                <div className="sup-tkt__subject">{t.subject}</div>
                <div className="sup-tkt__meta">
                  {t.agent} · {t.updated}
                  <span className={`sup-tkt__pri sup-tkt__pri--${t.priority}`}>{t.priority}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Popular articles */}
          <div className="sup-rail__block">
            <div className="sup-rail__title">Popular articles</div>
            <ol className="sup-pop">
              {POPULAR_ARTICLES.map((a, i) => (
                <li key={a.title} className="sup-pop__item">
                  <span className="sup-pop__rank">{i + 1}</span>
                  <span className="sup-pop__title">{a.title}</span>
                  <span className="sup-pop__views">{a.views.toLocaleString()}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Channels */}
          <div className="sup-rail__block">
            <div className="sup-rail__title">Other ways to reach us</div>
            <div className="sup-channels">
              {SUPPORT_CHANNELS.map(c => (
                <div key={c.label} className="sup-channel">
                  <span className="sup-channel__icon">{c.icon}</span>
                  <div>
                    <div className="sup-channel__label">{c.label}</div>
                    <div className="sup-channel__value">{c.value}</div>
                    <div className="sup-channel__note">{c.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {contactOpen && (
        <ContactSupportDrawer
          defaultReason={contactReason}
          onClose={() => setContactOpen(false)}
          onToast={onToast}
        />
      )}
    </div>
  );
}