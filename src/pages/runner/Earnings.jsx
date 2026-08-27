// src/pages/runner/Earnings.jsx
import API_BASE from '../../api/config';
import { useState, useEffect } from 'react';
import PillNavbar from '../../components/PillNavbar';
import BottomPillNav from '../../components/BottomPillNav';
import Spinner from '../../components/Spinner';

export default function RunnerEarnings() {
  const [data, setData]             = useState(null);
  const [ratingStats, setRatingStats] = useState(null);
  const [ratingList, setRatingList]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState('summary');

  useEffect(() => { fetchAll(); }, []); // eslint-disable-line

  const fetchAll = async () => {
    try {
      const token = localStorage.getItem('runit_token');

      const [eRes, rRes] = await Promise.all([
        fetch('${API_BASE}/api/runner/earnings.php', {
          headers: { Authorization: 'Bearer ' + token },
        }),
        fetch('${API_BASE}/api/feedback/runner_ratings.php', {
          headers: { Authorization: 'Bearer ' + token },
        }),
      ]);

      const eData = await eRes.json();
      const rData = await rRes.json();

      if (eRes.ok) setData(eData);
      if (rRes.ok) {
        setRatingStats(rData.stats);
        setRatingList(rData.ratings || []);
      }
    } catch { /* silent */ }
    setLoading(false);
  };

  const outstanding = Math.max(0,
    parseFloat(data?.totals?.total_platform_cut || 0) -
    parseFloat(data?.totals?.total_settled || 0)
  );

  const avgStars = ratingStats && parseFloat(ratingStats.total_ratings) > 0
    ? parseFloat(ratingStats.avg_stars).toFixed(1)
    : null;

  const TABS = [
    { key: 'summary',     label: 'Orders' },
    { key: 'ratings',     label: 'Ratings' + (ratingStats?.total_ratings > 0 ? ' (' + ratingStats.total_ratings + ')' : '') },
    { key: 'settlements', label: 'Settlements' },
  ];

  return (
    <div style={{
      background: 'var(--runit-bg)', minHeight: '100vh',
      color: 'var(--runit-text)', paddingBottom: 100,
    }}>
      <PillNavbar title="My Earnings" subtitle="Delivery income tracker" />

      <div className="page-content">

        {loading ? <Spinner /> : (
          <div>

            {/* ── Debt alert ── */}
            {outstanding > 0.01 && (
              <div style={{ background: 'rgba(255,180,0,0.08)', border: '1px solid rgba(255,180,0,0.25)', borderRadius: 16, padding: '14px 16px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>⚠️</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#ffb400', marginBottom: 4 }}>
                    {'GH₵ ' + outstanding.toFixed(2) + ' platform commission owed'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--runit-muted)', lineHeight: 1.5 }}>
                    Send via Mobile Money to settle before Sunday. Unsettled accounts are auto-suspended.
                  </div>
                </div>
              </div>
            )}

            {outstanding < 0.01 && data?.totals?.total_orders > 0 && (
              <div style={{ background: 'rgba(0,201,167,0.07)', border: '1px solid rgba(0,201,167,0.2)', borderRadius: 16, padding: '14px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 20 }}>✅</span>
                <div style={{ fontSize: 13, color: 'var(--runit-accent)', fontWeight: 600 }}>All commissions settled — you are clear!</div>
              </div>
            )}

            {/* ── Summary stats ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'Total Earned',   value: 'GH₵ ' + parseFloat(data?.totals?.total_runner_cut || 0).toFixed(2), sub: 'Your 80% across all orders', color: 'var(--runit-accent)' },
                { label: 'Orders Done',    value: data?.totals?.total_orders || 0,                                       sub: 'Completed deliveries',      color: 'var(--runit-text)'   },
                { label: 'Platform Owed',  value: 'GH₵ ' + parseFloat(data?.totals?.total_platform_cut || 0).toFixed(2), sub: '20% commission total',     color: '#ffb400'             },
                { label: 'Settled',        value: 'GH₵ ' + parseFloat(data?.totals?.total_settled || 0).toFixed(2),      sub: 'Amount paid to platform',  color: '#00c9a7'             },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--runit-surface)', border: '1px solid var(--runit-border)', borderRadius: 16, padding: '16px 14px' }}>
                  <div style={{ fontSize: 11, color: 'var(--runit-muted)', marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: s.color, marginBottom: 2 }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: 'var(--runit-muted)', lineHeight: 1.4 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* ── Rating snapshot (only shown if rated) ── */}
            {avgStars && (
              <div style={{ background: 'var(--runit-surface)', border: '1px solid var(--runit-border)', borderRadius: 16, padding: '14px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--runit-accent)', lineHeight: 1 }}>{avgStars}</div>
                  <div style={{ fontSize: 10, color: 'var(--runit-muted)', marginTop: 2 }}>avg rating</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 2, marginBottom: 4 }}>
                    {[1,2,3,4,5].map(i => (
                      <span key={i} style={{ fontSize: 16, filter: parseFloat(avgStars) >= i ? 'none' : 'grayscale(1) opacity(0.3)' }}>⭐</span>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--runit-muted)' }}>
                    {ratingStats.total_ratings + ' rating' + (ratingStats.total_ratings !== '1' ? 's' : '') + ' from customers'}
                  </div>
                </div>
                <button onClick={() => setTab('ratings')} style={{ padding: '7px 14px', borderRadius: 50, background: 'rgba(0,201,167,0.1)', border: '1px solid var(--runit-border)', color: 'var(--runit-accent)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                  See all
                </button>
              </div>
            )}

            {/* ── Outstanding balance ── */}
            <div style={{ background: 'var(--runit-surface)', border: '1px solid ' + (outstanding > 0 ? 'rgba(255,180,0,0.3)' : 'var(--runit-border)'), borderRadius: 20, padding: 20, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>Outstanding Balance</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: outstanding > 0 ? '#ffb400' : '#00c9a7' }}>
                  {'GH₵ ' + outstanding.toFixed(2)}
                </span>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--runit-muted)', marginBottom: 4 }}>
                  <span>Settled</span>
                  <span>{data?.totals?.total_platform_cut > 0 ? Math.round((parseFloat(data.totals.total_settled) / parseFloat(data.totals.total_platform_cut)) * 100) : 100}%</span>
                </div>
                <div style={{ height: 8, background: 'var(--runit-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 4, background: outstanding > 0 ? '#ffb400' : '#00c9a7', width: data?.totals?.total_platform_cut > 0 ? Math.min(100, Math.round((parseFloat(data.totals.total_settled) / parseFloat(data.totals.total_platform_cut)) * 100)) + '%' : '100%', transition: 'width 0.5s' }} />
                </div>
              </div>
              {outstanding > 0 && (
                <div style={{ fontSize: 12, color: 'var(--runit-muted)', lineHeight: 1.5 }}>
                  Send <strong style={{ color: '#ffb400' }}>{'GH₵ ' + outstanding.toFixed(2)}</strong> via Mobile Money to admin to clear your balance.
                </div>
              )}
            </div>

            {/* ── Tabs ── */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {TABS.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)} style={{ flex: 1, padding: '10px 6px', borderRadius: 50, border: '1px solid', borderColor: tab === t.key ? 'var(--runit-accent)' : 'var(--runit-border)', background: tab === t.key ? 'rgba(0,201,167,0.12)' : 'transparent', color: tab === t.key ? 'var(--runit-accent)' : 'var(--runit-muted)', fontWeight: tab === t.key ? 700 : 400, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── Order History tab ── */}
            {tab === 'summary' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(data?.earnings || []).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--runit-muted)' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>No deliveries yet</div>
                    <div style={{ fontSize: 13, marginTop: 4 }}>Accept orders from the feed to start earning</div>
                  </div>
                ) : (data.earnings || []).map(e => (
                  <div key={e.id} style={{ background: 'var(--runit-surface)', border: '1px solid var(--runit-border)', borderRadius: 16, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ flex: 1, marginRight: 10 }}>
                        <div style={{ fontSize: 11, color: 'var(--runit-muted)', marginBottom: 3 }}>
                          {'Order #' + e.order_id + ' · ' + e.category}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>
                          {e.description ? (e.description.length > 55 ? e.description.slice(0, 55) + '...' : e.description) : 'Delivery'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--runit-accent)' }}>
                          {'+GH₵ ' + parseFloat(e.runner_cut).toFixed(2)}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--runit-muted)' }}>
                          {'Platform: GH₵ ' + parseFloat(e.platform_cut).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--runit-border)', paddingTop: 8, fontSize: 11, color: 'var(--runit-muted)' }}>
                      <span>{'Total fee: GH₵ ' + parseFloat(e.delivery_fee).toFixed(2)}</span>
                      <span>{new Date(e.created_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Ratings tab ── */}
            {tab === 'ratings' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {!avgStars ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--runit-muted)' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>No ratings yet</div>
                    <div style={{ fontSize: 13 }}>Complete deliveries to start receiving ratings</div>
                  </div>
                ) : (
                  <>
                    {/* Rating summary card */}
                    <div style={{ background: 'var(--runit-surface)', border: '1px solid var(--runit-border)', borderRadius: 20, padding: 20, textAlign: 'center', marginBottom: 4 }}>
                      <div style={{ fontSize: 56, fontWeight: 800, color: 'var(--runit-accent)', lineHeight: 1 }}>{avgStars}</div>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 4, margin: '10px 0 4px' }}>
                        {[1,2,3,4,5].map(i => (
                          <span key={i} style={{ fontSize: 22, filter: parseFloat(avgStars) >= i ? 'none' : 'grayscale(1) opacity(0.3)' }}>⭐</span>
                        ))}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--runit-muted)', marginBottom: 16 }}>
                        {ratingStats.total_ratings + ' rating' + (ratingStats.total_ratings !== '1' ? 's' : '')}
                      </div>

                      {/* Star breakdown bars */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left' }}>
                        {[5,4,3,2,1].map(star => {
                          const keyMap = { 5: 'five_star', 4: 'four_star', 3: 'three_star', 2: 'two_star', 1: 'one_star' };
                          const count  = parseInt(ratingStats[keyMap[star]] || 0);
                          const total  = parseInt(ratingStats.total_ratings || 1);
                          const pct    = Math.round((count / total) * 100);
                          return (
                            <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 11, color: 'var(--runit-muted)', width: 22, textAlign: 'right', flexShrink: 0 }}>{star}⭐</span>
                              <div style={{ flex: 1, height: 6, background: 'var(--runit-elevated)', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: pct + '%', background: 'var(--runit-accent)', borderRadius: 3, transition: 'width 0.5s' }} />
                              </div>
                              <span style={{ fontSize: 11, color: 'var(--runit-muted)', width: 20, flexShrink: 0 }}>{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Individual reviews */}
                    {ratingList.map(r => (
                      <div key={r.id} style={{ background: 'var(--runit-surface)', border: '1px solid var(--runit-border)', borderRadius: 16, padding: '14px 16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{r.user_name}</div>
                            <div style={{ fontSize: 11, color: 'var(--runit-muted)' }}>{'Order #' + r.order_id}</div>
                          </div>
                          <div style={{ display: 'flex', gap: 1 }}>
                            {[1,2,3,4,5].map(i => (
                              <span key={i} style={{ fontSize: 14, filter: r.stars >= i ? 'none' : 'grayscale(1) opacity(0.3)' }}>⭐</span>
                            ))}
                          </div>
                        </div>
                        {r.comment && (
                          <div style={{ fontSize: 13, color: 'var(--runit-muted)', fontStyle: 'italic', lineHeight: 1.5, marginBottom: 6 }}>
                            {'"' + r.comment + '"'}
                          </div>
                        )}
                        {r.order_description && (
                          <div style={{ fontSize: 11, color: 'var(--runit-muted)', marginBottom: 4, padding: '6px 10px', background: 'var(--runit-elevated)', borderRadius: 8 }}>
                            {r.order_description.length > 50 ? r.order_description.slice(0, 50) + '...' : r.order_description}
                          </div>
                        )}
                        <div style={{ fontSize: 10, color: 'var(--runit-muted)' }}>
                          {new Date(r.created_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* ── Settlements tab ── */}
            {tab === 'settlements' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(data?.settlements || []).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--runit-muted)' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>💳</div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>No settlements yet</div>
                    <div style={{ fontSize: 13, marginTop: 4 }}>Admin will record your MoMo payments here</div>
                  </div>
                ) : (data.settlements || []).map(s => (
                  <div key={s.id} style={{ background: 'var(--runit-surface)', border: '1px solid var(--runit-border)', borderRadius: 16, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{'GH₵ ' + parseFloat(s.amount).toFixed(2)}</div>
                      <div style={{ fontSize: 11, color: 'var(--runit-muted)' }}>
                        {new Date(s.period_start).toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })}
                        {' – '}
                        {new Date(s.period_end).toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })}
                      </div>
                      {s.marked_at && (
                        <div style={{ fontSize: 11, color: 'var(--runit-muted)', marginTop: 2 }}>
                          {'Recorded: ' + new Date(s.marked_at).toLocaleDateString('en-GH')}
                        </div>
                      )}
                    </div>
                    <span style={{ background: 'rgba(0,201,167,0.1)', border: '1px solid rgba(0,201,167,0.3)', color: '#00c9a7', borderRadius: 50, padding: '4px 14px', fontSize: 11, fontWeight: 600 }}>
                      Settled
                    </span>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}
      </div>
      <BottomPillNav />
    </div>
  );
}