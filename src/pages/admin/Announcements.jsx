// src/pages/admin/Announcements.jsx
import { useState } from 'react';
import PillNavbar from '../../components/PillNavbar';
import BottomPillNav from '../../components/BottomPillNav';

const TEMPLATES = [
  {
    category: '📦 Order & Service',
    items: [
      {
        label: 'Service back online',
        title: '✅ RunIt is back!',
        message: 'Our delivery service is fully operational again. You can now place orders and runners are ready to deliver. Thank you for your patience!',
        audience: 'all',
      },
      {
        label: 'Service downtime',
        title: '⚠️ Temporary Service Disruption',
        message: 'We are currently experiencing a brief disruption to our service. Our team is working to resolve this as quickly as possible. We apologize for any inconvenience.',
        audience: 'all',
      },
      {
        label: 'High demand alert',
        title: '🔥 High Demand Right Now!',
        message: 'We are experiencing unusually high order volume. Delivery times may be slightly longer than usual. Thank you for your patience and continued support!',
        audience: 'users',
      },
      {
        label: 'New category available',
        title: '🆕 New Service Available!',
        message: 'We have just added a new delivery category to RunIt. Check it out in the app and place your first order today!',
        audience: 'users',
      },
    ],
  },
  {
    category: '🏃 Runner Alerts',
    items: [
      {
        label: 'Busy period — earn more',
        title: '💰 High Earning Opportunity!',
        message: 'Orders are coming in fast right now! Go online and start accepting deliveries to maximize your earnings this period.',
        audience: 'runners',
      },
      {
        label: 'Settlement reminder',
        title: '💳 Weekly Settlement Reminder',
        message: 'This is a reminder that your weekly platform commission is due by Sunday. Please send your outstanding balance via Mobile Money to avoid account suspension.',
        audience: 'runners',
      },
      {
        label: 'Safety reminder',
        title: '🛡️ Safety Reminder for Runners',
        message: 'Please remember to always verify the order details with the customer before leaving. Stay safe, wear your helmet if riding, and keep your phone charged!',
        audience: 'runners',
      },
      {
        label: 'New runner welcome',
        title: '🎉 Welcome to RunIt!',
        message: 'Your account has been approved! You can now start accepting orders. Head to the feed to see available deliveries. Good luck and earn well!',
        audience: 'runners',
      },
    ],
  },
  {
    category: '🎉 Promotions',
    items: [
      {
        label: 'Special offer for users',
        title: '🎁 Special Offer This Weekend!',
        message: 'Place an order this weekend and enjoy priority matching with our top-rated runners. Open the app and place your order now!',
        audience: 'users',
      },
      {
        label: 'App update',
        title: '🚀 RunIt Just Got Better!',
        message: 'We have rolled out exciting new features to improve your experience. Open the app to discover what is new. Thank you for being part of RunIt!',
        audience: 'all',
      },
      {
        label: 'Maintenance notice',
        title: '🔧 Scheduled Maintenance Tonight',
        message: 'RunIt will undergo scheduled maintenance tonight from 12:00 AM to 2:00 AM. The service will be temporarily unavailable during this time. We apologize for any inconvenience.',
        audience: 'all',
      },
    ],
  },
];

const AUDIENCE_OPTIONS = [
  { value: 'all',     label: '👥 Everyone',         desc: 'All users and runners' },
  { value: 'users',   label: '👤 Users only',        desc: 'Only customers' },
  { value: 'runners', label: '🏃 Runners only',      desc: 'Only delivery runners' },
];

export default function AdminAnnouncements() {
  var [title, setTitle]       = useState('');
  var [message, setMessage]   = useState('');
  var [audience, setAudience] = useState('all');
  var [url, setUrl]           = useState('/');
  var [sending, setSending]   = useState(false);
  var [result, setResult]     = useState(null);
  var [error, setError]       = useState('');
  var [activeTab, setActiveTab] = useState('compose');

  var applyTemplate = function(tpl) {
    setTitle(tpl.title);
    setMessage(tpl.message);
    setAudience(tpl.audience);
    setActiveTab('compose');
  };

  var send = async function() {
    if (!title.trim() || !message.trim()) {
      setError('Title and message are required.');
      return;
    }
    if (title.length > 100) { setError('Title must be under 100 characters.'); return; }
    if (message.length > 500) { setError('Message must be under 500 characters.'); return; }

    setSending(true);
    setError('');
    setResult(null);

    try {
      var token = localStorage.getItem('runit_token');
      var res   = await fetch('http://localhost/runit-backend/api/push/announce.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ title, message, audience, url }),
      });
      var data = await res.json();
      if (res.ok) {
        setResult(data);
        setTitle('');
        setMessage('');
        setUrl('/');
      } else {
        setError(data.error || 'Failed to send');
      }
    } catch {
      setError('Connection error. Make sure XAMPP is running.');
    }
    setSending(false);
  };

  var inputStyle = { width: '100%', padding: '11px 14px', borderRadius: 12, background: 'var(--runit-elevated)', color: 'var(--runit-text)', border: '1px solid var(--runit-border)', fontSize: 14, outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s' };

  return (
    <div style={{ background: 'var(--runit-bg)', minHeight: '100vh', color: 'var(--runit-text)', paddingBottom: 100 }}>
      <PillNavbar title="Announcements" subtitle="Send push notifications" />

      <div className="page-content" style={{ maxWidth: 560, margin: '0 auto' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            { key: 'compose',   label: '✍️ Compose' },
            { key: 'templates', label: '📋 Templates' },
          ].map(function(t) {
            return (
              <button key={t.key} onClick={function() { setActiveTab(t.key); }}
                style={{ flex: 1, padding: '10px', borderRadius: 50, border: '1px solid', borderColor: activeTab === t.key ? 'var(--runit-accent)' : 'var(--runit-border)', background: activeTab === t.key ? 'rgba(0,201,167,0.12)' : 'transparent', color: activeTab === t.key ? 'var(--runit-accent)' : 'var(--runit-muted)', fontWeight: activeTab === t.key ? 700 : 400, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ── Compose tab ── */}
        {activeTab === 'compose' && (
          <div>

            {result && (
              <div style={{ background: 'rgba(0,201,167,0.1)', border: '1px solid var(--runit-border-strong)', borderRadius: 14, padding: '14px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 24 }}>🎉</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--runit-accent)', marginBottom: 2 }}>Announcement sent!</div>
                  <div style={{ fontSize: 13, color: 'var(--runit-muted)' }}>{'Delivered to ' + result.sent + ' subscriber' + (result.sent !== 1 ? 's' : '') + '.'}</div>
                </div>
              </div>
            )}

            {error && (
              <div style={{ background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.25)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, color: '#ff8080', fontSize: 13 }}>
                {'⚠ ' + error}
              </div>
            )}

            {/* Audience */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: 'var(--runit-muted)', display: 'block', marginBottom: 8, fontWeight: 500 }}>Who receives this? *</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {AUDIENCE_OPTIONS.map(function(opt) {
                  var active = audience === opt.value;
                  return (
                    <button key={opt.value} type="button" onClick={function() { setAudience(opt.value); }}
                      style={{ padding: '12px 16px', borderRadius: 14, border: '1px solid', borderColor: active ? 'var(--runit-accent)' : 'var(--runit-border)', background: active ? 'rgba(0,201,167,0.08)' : 'var(--runit-elevated)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: active ? 'var(--runit-accent)' : 'var(--runit-text)' }}>{opt.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--runit-muted)', marginTop: 2 }}>{opt.desc}</div>
                      </div>
                      {active && <span style={{ color: 'var(--runit-accent)', fontSize: 18 }}>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: 'var(--runit-muted)', display: 'block', marginBottom: 6, fontWeight: 500 }}>
                Notification title * <span style={{ fontSize: 10 }}>({title.length}/100)</span>
              </label>
              <input
                type="text" maxLength={100}
                placeholder="e.g. ✅ RunIt is back online!"
                value={title} onChange={function(e) { setTitle(e.target.value); }}
                style={inputStyle}
                onFocus={function(e) { e.target.style.borderColor = 'var(--runit-accent)'; }}
                onBlur={function(e) { e.target.style.borderColor = 'var(--runit-border)'; }}
              />
            </div>

            {/* Message */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: 'var(--runit-muted)', display: 'block', marginBottom: 6, fontWeight: 500 }}>
                Message body * <span style={{ fontSize: 10 }}>({message.length}/500)</span>
              </label>
              <textarea
                rows={4} maxLength={500}
                placeholder="Write a clear, friendly message. Keep it short and actionable."
                value={message} onChange={function(e) { setMessage(e.target.value); }}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                onFocus={function(e) { e.target.style.borderColor = 'var(--runit-accent)'; }}
                onBlur={function(e) { e.target.style.borderColor = 'var(--runit-border)'; }}
              />
              <div style={{ fontSize: 10, color: 'var(--runit-muted)', marginTop: 4 }}>
                💡 Tip: Start with an emoji, be specific, and include a call to action.
              </div>
            </div>

            {/* Deep link URL */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: 'var(--runit-muted)', display: 'block', marginBottom: 6, fontWeight: 500 }}>
                Open this page when tapped (optional)
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['/', '/orders', '/place-order', '/shops', '/runner/feed', '/runner/earnings', '/admin'].map(function(u) {
                  var active = url === u;
                  return (
                    <button key={u} type="button" onClick={function() { setUrl(u); }}
                      style={{ padding: '6px 12px', borderRadius: 50, fontSize: 11, border: '1px solid', borderColor: active ? 'var(--runit-accent)' : 'var(--runit-border)', background: active ? 'rgba(0,201,167,0.12)' : 'transparent', color: active ? 'var(--runit-accent)' : 'var(--runit-muted)', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      {u}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preview */}
            {(title || message) && (
              <div style={{ background: 'var(--runit-surface)', border: '1px solid var(--runit-border)', borderRadius: 16, padding: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: 'var(--runit-muted)', marginBottom: 10, fontWeight: 600 }}>Preview</div>
                <div style={{ background: 'var(--runit-elevated)', borderRadius: 12, padding: '12px 14px', display: 'flex', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--runit-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: '#0a1f1c', flexShrink: 0 }}>R</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{title || 'Title...'}</div>
                    <div style={{ fontSize: 12, color: 'var(--runit-muted)', lineHeight: 1.4 }}>{message || 'Message...'}</div>
                    <div style={{ fontSize: 10, color: 'var(--runit-muted)', marginTop: 4 }}>RunIt · now</div>
                  </div>
                </div>
              </div>
            )}

            <button onClick={send} disabled={sending || !title || !message}
              style={{ width: '100%', padding: '14px', borderRadius: 50, background: sending || !title || !message ? 'var(--runit-accent-dark)' : 'var(--runit-accent)', color: '#0a1f1c', fontWeight: 700, fontSize: 15, border: 'none', cursor: sending || !title || !message ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: !title || !message ? 'none' : '0 4px 20px rgba(0,201,167,0.25)' }}
            >
              {sending ? (
                <>
                  <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#0a1f1c', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
                  Sending...
                </>
              ) : '📣 Send Announcement'}
            </button>

          </div>
        )}

        {/* ── Templates tab ── */}
        {activeTab === 'templates' && (
          <div>
            <div style={{ fontSize: 13, color: 'var(--runit-muted)', marginBottom: 16, lineHeight: 1.5 }}>
              Pick a ready-made template and customise it before sending.
            </div>

            {TEMPLATES.map(function(group) {
              return (
                <div key={group.category} style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--runit-accent)', marginBottom: 10 }}>
                    {group.category}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {group.items.map(function(tpl) {
                      return (
                        <div key={tpl.label} style={{ background: 'var(--runit-surface)', border: '1px solid var(--runit-border)', borderRadius: 16, padding: 16, transition: 'border-color 0.2s' }}
                          onMouseEnter={function(e) { e.currentTarget.style.borderColor = 'var(--runit-border-strong)'; }}
                          onMouseLeave={function(e) { e.currentTarget.style.borderColor = 'var(--runit-border)'; }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{tpl.label}</div>
                            <span style={{ background: 'rgba(0,201,167,0.1)', color: 'var(--runit-accent)', border: '1px solid var(--runit-border)', borderRadius: 50, padding: '2px 10px', fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap', marginLeft: 8 }}>
                              {tpl.audience === 'all' ? '👥 All' : tpl.audience === 'users' ? '👤 Users' : '🏃 Runners'}
                            </span>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{tpl.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--runit-muted)', lineHeight: 1.5, marginBottom: 12 }}>{tpl.message}</div>
                          <button onClick={function() { applyTemplate(tpl); }}
                            style={{ width: '100%', padding: '9px', borderRadius: 50, background: 'rgba(0,201,167,0.1)', border: '1px solid var(--runit-border)', color: 'var(--runit-accent)', fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
                          >
                            Use this template →
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
      <BottomPillNav />
    </div>
  );
}