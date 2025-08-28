import React, { useEffect, useMemo, useState } from "react";
import supabase from "../lib/supabaseClient";

/**
 * Custody Accounts
 * - List/search/paging
 * - Create/Edit/Activate
 * - Link/Unlink Exec Broker Accounts
 * - Custodian field uses a datalist with suggestions from active counterparties
 */

const PAGE_SIZE = 20;
const TAX_STATUS = ["TAXABLE", "TAX_DEFERRED", "TAX_EXEMPT"]; // adjust if your enum differs
const TAX_LOT_METHOD = ["FIFO", "LIFO", "HIFO", "SPEC_ID"];   // adjust if your enum differs

function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? "—" : dt.toLocaleDateString();
}
function cx(...a) { return a.filter(Boolean).join(" "); }

export default function CustodyAccounts() {
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [search, setSearch] = useState("");
  const totalPages = useMemo(() => Math.max(1, Math.ceil(count / PAGE_SIZE)), [count]);

  // refs
  const [portfolios, setPortfolios] = useState([]);
  const [portfolioMap, setPortfolioMap] = useState({});
  const [execBrokers, setExecBrokers] = useState([]);
  const [custodianOptions, setCustodianOptions] = useState([]);

  // modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkingFor, setLinkingFor] = useState(null);
  const [selectedExecIds, setSelectedExecIds] = useState(new Set());
  const [linkBusy, setLinkBusy] = useState(false);

  useEffect(() => { loadRefs(); }, []);
  useEffect(() => { load(page, search); }, [page, search]);

  async function loadRefs() {
    // Portfolios
    const p = await supabase.from("portfolios").select("id, code, name").order("created_at", { ascending: false });
    if (!p.error) {
      setPortfolios(p.data ?? []);
      const map = {};
      for (const r of p.data ?? []) map[r.id] = r;
      setPortfolioMap(map);
    }

    // Exec brokers
    const e = await supabase.from("exec_broker_accounts").select("id, broker_name, account_code").order("broker_name", { ascending: true });
    if (!e.error) setExecBrokers(e.data ?? []);

    // Custodian suggestions = distinct(custody_accounts.custodian_name) ∪ exec_broker_accounts.broker_name
    const c1 = await supabase
      .from("custody_accounts")
      .select("custodian_name")
      .not("custodian_name", "is", null)
      .neq("custodian_name", "");
    const c2 = await supabase.from("exec_broker_accounts").select("broker_name");
    const setNames = new Set();
    for (const r of c1.data || []) if (r.custodian_name) setNames.add(r.custodian_name);
    for (const r of c2.data || []) if (r.broker_name) setNames.add(r.broker_name);
    setCustodianOptions(Array.from(setNames).sort((a,b)=>a.localeCompare(b)));
  }

  async function load(p=0, q="") {
    setLoading(true); setErr("");
    try {
      let base = supabase
        .from("custody_accounts")
        .select("id, portfolio_id, name, account_number, custodian_name, tax_status, tax_lot_method, currency, is_active, opened_at, closed_at, created_at", { count: "exact" })
        .order("created_at", { ascending: false });

      if (q) base = base.or(`name.ilike.%${q}%,account_number.ilike.%${q}%,custodian_name.ilike.%${q}%`);

      const from = p * PAGE_SIZE, to = from + PAGE_SIZE - 1;
      const { data, error, count: total } = await base.range(from, to);
      if (error) throw error;

      // load links for visible rows
      const ids = (data ?? []).map(r => r.id);
      let linkMap = {};
      if (ids.length) {
        const linkRes = await supabase
          .from("custody_exec_accounts")
          .select("custody_account_id, exec_broker_account_id")
          .in("custody_account_id", ids);
        if (!linkRes.error) {
          linkMap = linkRes.data.reduce((acc, l) => {
            (acc[l.custody_account_id] ||= []).push(l.exec_broker_account_id);
            return acc;
          }, {});
        }
      }

      const merged = (data ?? []).map(r => ({ ...r, exec_ids: new Set(linkMap[r.id] || []) }));
      setRows(merged);
      setCount(total ?? 0);
    } catch (e) {
      setErr(e.message || String(e));
      setRows([]); setCount(0);
    } finally {
      setLoading(false);
    }
  }

  function onNew() {
    setEditing({
      id: null,
      portfolio_id: portfolios[0]?.id || null,
      name: "",
      account_number: "",
      custodian_name: "",
      tax_status: TAX_STATUS[0],
      tax_lot_method: TAX_LOT_METHOD[0],
      currency: "USD",
      opened_at: "",
      closed_at: "",
      is_active: true,
    });
    setModalOpen(true);
  }
  function onEdit(r) {
    setEditing({
      id: r.id,
      portfolio_id: r.portfolio_id || null,
      name: r.name || "",
      account_number: r.account_number || "",
      custodian_name: r.custodian_name || "",
      tax_status: r.tax_status || TAX_STATUS[0],
      tax_lot_method: r.tax_lot_method || TAX_LOT_METHOD[0],
      currency: r.currency || "USD",
      opened_at: r.opened_at || "",
      closed_at: r.closed_at || "",
      is_active: !!r.is_active,
    });
    setModalOpen(true);
  }

  async function onSave(e) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true); setErr("");

    const payload = {
      portfolio_id: editing.portfolio_id,
      name: editing.name.trim(),
      account_number: editing.account_number.trim() || null,
      custodian_name: editing.custodian_name.trim() || null,
      tax_status: editing.tax_status,
      tax_lot_method: editing.tax_lot_method,
      currency: editing.currency,
      opened_at: editing.opened_at || null,
      closed_at: editing.closed_at || null,
      is_active: editing.is_active,
    };

    try {
      let res;
      if (editing.id) res = await supabase.from("custody_accounts").update(payload).eq("id", editing.id).select();
      else res = await supabase.from("custody_accounts").insert(payload).select();
      if (res.error) throw res.error;

      setModalOpen(false); setEditing(null);
      await load(page, search);
    } catch (e2) {
      setErr(e2.message || String(e2));
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(r) {
    try {
      const { error } = await supabase.from("custody_accounts").update({ is_active: !r.is_active }).eq("id", r.id);
      if (error) throw error;
      await load(page, search);
    } catch (e) {
      setErr(e.message || String(e));
    }
  }

  async function openLinkModal(row) {
    const linkRes = await supabase.from("custody_exec_accounts").select("exec_broker_account_id").eq("custody_account_id", row.id);
    const current = new Set((linkRes.data || []).map(l => l.exec_broker_account_id));
    setSelectedExecIds(current);
    setLinkingFor(row);
    setLinkModalOpen(true);
  }

  async function saveLinks() {
    if (!linkingFor) return;
    setLinkBusy(true); setErr("");
    try {
      const accId = linkingFor.id;

      const existingRes = await supabase
        .from("custody_exec_accounts")
        .select("exec_broker_account_id")
        .eq("custody_account_id", accId);
      if (existingRes.error) throw existingRes.error;
      const existing = new Set((existingRes.data || []).map(l => l.exec_broker_account_id));

      const toAdd = [...selectedExecIds].filter(id => !existing.has(id));
      const toRemove = [...existing].filter(id => !selectedExecIds.has(id));

      if (toAdd.length) {
        const rowsToAdd = toAdd.map(id => ({ custody_account_id: accId, exec_broker_account_id: id }));
        const ins = await supabase.from("custody_exec_accounts").insert(rowsToAdd);
        if (ins.error) throw ins.error;
      }
      if (toRemove.length) {
        const del = await supabase.from("custody_exec_accounts")
          .delete()
          .eq("custody_account_id", accId)
          .in("exec_broker_account_id", toRemove);
        if (del.error) throw del.error;
      }

      setLinkBusy(false); setLinkModalOpen(false); setLinkingFor(null);
      await load(page, search);
    } catch (e) {
      setErr(e.message || String(e));
      setLinkBusy(false);
    }
  }

  return (
    <div>
      <div className="section-header">
        <h2>Custody Accounts</h2>
        <div className="actions">
          <div className="btn-row">
            <input
              placeholder="Search name / # / custodian…"
              value={search}
              onChange={(e) => { setPage(0); setSearch(e.target.value); }}
              style={{ background:"transparent", border:"1px solid var(--border)", borderRadius:12, color:"var(--text)", padding:"10px 12px", width:260 }}
            />
            <button className="btn" onClick={onNew}>New Account</button>
            <button className="btn ghost" onClick={() => load(page, search)}>Refresh</button>
          </div>
        </div>
      </div>

      <div className="card glass">
        <div className="card-head">
          <h3>Accounts</h3>
          <div className="pill">Total: {count}</div>
        </div>

        <div className="card-body">
          {err && (
            <div className="empty glass" style={{ marginBottom: 12 }}>
              <div className="empty-title" style={{ color:"var(--danger)" }}>Error</div>
              <div className="empty-hint">{err}</div>
            </div>
          )}

          <div className="table" style={{ "--cols": "repeat(8, minmax(0, 1fr))" }}>
            <div className="table-head">
              <div className="th">Name</div>
              <div className="th">Account #</div>
              <div className="th">Custodian</div>
              <div className="th">Portfolio</div>
              <div className="th">Tax Status</div>
              <div className="th">Active</div>
              <div className="th">Opened</div>
              <div className="th">Actions</div>
            </div>

            <div className="table-body">
              {loading ? (
                <div className="empty glass"><div className="empty-title">Loading…</div></div>
              ) : rows.length === 0 ? (
                <div className="empty glass"><div className="empty-title">No accounts</div></div>
              ) : rows.map(r => (
                <div className="tr" key={r.id}>
                  <div className="td"><b>{r.name}</b></div>
                  <div className="td">{r.account_number || "—"}</div>
                  <div className="td">{r.custodian_name || "—"}</div>
                  <div className="td">{portfolioMap[r.portfolio_id]?.code || "—"}</div>
                  <div className="td">{r.tax_status}</div>
                  <div className="td">
                    <span className={cx("badge", r.is_active ? "badge-success" : "")}>
                      {r.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="td">{fmtDate(r.opened_at)}</div>
                  <div className="td" style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    <button className="btn tiny" onClick={() => onEdit(r)}>Edit</button>
                    <button className="btn tiny ghost" onClick={() => toggleActive(r)}>{r.is_active ? "Deactivate" : "Activate"}</button>
                    <button className="btn tiny" onClick={() => openLinkModal(r)}>Link Brokers</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card-foot" style={{ display:"flex", justifyContent:"space-between" }}>
          <div style={{ opacity:0.8 }}>Page {page + 1} / {totalPages}</div>
          <div className="btn-row">
            <button className="btn tiny ghost" disabled={page===0} onClick={() => setPage(p=>Math.max(0,p-1))}>‹ Prev</button>
            <button className="btn tiny" disabled={(page+1)>=totalPages} onClick={() => setPage(p=>p+1)}>Next ›</button>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="cmd-backdrop" onClick={() => !saving && setModalOpen(false)}>
          <div className="cmd glass" onClick={(e)=>e.stopPropagation()} style={{ maxWidth: 720 }}>
            <form onSubmit={onSave}>
              <div className="cmd-input" style={{ borderBottom:"none" }}>
                <h3 style={{ margin:0 }}>{editing?.id ? "Edit Custody Account" : "New Custody Account"}</h3>
              </div>

              <div style={{ padding:12, display:"grid", gap:12, gridTemplateColumns:"1fr 1fr" }}>
                <Field label="Portfolio *">
                  <select className="fld" value={editing?.portfolio_id || ""} onChange={(e)=>setEditing(s=>({...s, portfolio_id:e.target.value||null}))} required>
                    {portfolios.length===0 && <option value="">—</option>}
                    {portfolios.map(p=> <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
                  </select>
                </Field>

                <Field label="Currency *">
                  <input className="fld" value={editing?.currency || "USD"} onChange={(e)=>setEditing(s=>({...s, currency:e.target.value}))} required />
                </Field>

                <Field label="Name *">
                  <input className="fld" value={editing?.name || ""} onChange={(e)=>setEditing(s=>({...s, name:e.target.value}))} required />
                </Field>

                <Field label="Account #">
                  <input className="fld" value={editing?.account_number || ""} onChange={(e)=>setEditing(s=>({...s, account_number:e.target.value}))} />
                </Field>

                {/* Custodian uses datalist suggestions (counterparties) */}
                <Field label="Custodian">
                  <input
                    className="fld"
                    list="custodianOptions"
                    placeholder="Start typing…"
                    value={editing?.custodian_name || ""}
                    onChange={(e)=>setEditing(s=>({...s, custodian_name:e.target.value}))}
                  />
                  <datalist id="custodianOptions">
                    {custodianOptions.map(n => <option key={n} value={n} />)}
                  </datalist>
                </Field>

                <Field label="Tax Status *">
                  <select className="fld" value={editing?.tax_status || TAX_STATUS[0]} onChange={(e)=>setEditing(s=>({...s, tax_status:e.target.value}))} required>
                    {TAX_STATUS.map(x=> <option key={x} value={x}>{x}</option>)}
                  </select>
                </Field>

                <Field label="Tax Lot Method *">
                  <select className="fld" value={editing?.tax_lot_method || TAX_LOT_METHOD[0]} onChange={(e)=>setEditing(s=>({...s, tax_lot_method:e.target.value}))} required>
                    {TAX_LOT_METHOD.map(x=> <option key={x} value={x}>{x}</option>)}
                  </select>
                </Field>

                <Field label="Opened At">
                  <input type="date" className="fld" value={editing?.opened_at || ""} onChange={(e)=>setEditing(s=>({...s, opened_at:e.target.value}))} />
                </Field>

                <Field label="Closed At">
                  <input type="date" className="fld" value={editing?.closed_at || ""} onChange={(e)=>setEditing(s=>({...s, closed_at:e.target.value}))} />
                </Field>

                <Field label="Active">
                  <label style={{ display:"inline-flex", alignItems:"center", gap:8 }}>
                    <input type="checkbox" checked={!!editing?.is_active} onChange={(e)=>setEditing(s=>({...s, is_active:e.target.checked}))} />
                    <span>Is Active</span>
                  </label>
                </Field>
              </div>

              {err && (
                <div className="empty glass" style={{ margin:"6px 12px 0" }}>
                  <div className="empty-title" style={{ color:"var(--danger)" }}>Save Error</div>
                  <div className="empty-hint">{err}</div>
                </div>
              )}

              <div style={{ padding:12, display:"flex", justifyContent:"flex-end", gap:8 }}>
                <button type="button" className="btn ghost" onClick={()=>setModalOpen(false)} disabled={saving}>Cancel</button>
                <button type="submit" className="btn" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
              </div>
            </form>

            <style>{`.fld{width:100%;background:transparent;border:1px solid var(--border);border-radius:12px;color:var(--text);padding:10px 12px;outline:none}.fld:focus{border-color:var(--neon)}`}</style>
          </div>
        </div>
      )}

      {/* Link Brokers Modal */}
      {linkModalOpen && linkingFor && (
        <div className="cmd-backdrop" onClick={() => !linkBusy && setLinkModalOpen(false)}>
          <div className="cmd glass" onClick={(e)=>e.stopPropagation()} style={{ maxWidth: 680 }}>
            <div className="cmd-input" style={{ borderBottom:"none" }}>
              <h3 style={{ margin:0 }}>Link Exec Brokers — {linkingFor.name}</h3>
            </div>

            <div style={{ padding:12, display:"grid", gap:8 }}>
              {execBrokers.length === 0 ? (
                <div className="empty glass"><div className="empty-title">No exec broker accounts found</div></div>
              ) : execBrokers.map(b => {
                const checked = selectedExecIds.has(b.id);
                return (
                  <label key={b.id} className="chip" style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        setSelectedExecIds(s => {
                          const next = new Set(s);
                          if (e.target.checked) next.add(b.id);
                          else next.delete(b.id);
                          return next;
                        });
                      }}
                    />
                    <span><b>{b.broker_name}</b> — {b.account_code}</span>
                  </label>
                );
              })}
            </div>

            <div style={{ padding:12, display:"flex", justifyContent:"flex-end", gap:8 }}>
              <button className="btn ghost" onClick={()=>setLinkModalOpen(false)} disabled={linkBusy}>Cancel</button>
              <button className="btn" onClick={saveLinks} disabled={linkBusy}>{linkBusy ? "Saving…" : "Save Links"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display:"grid", gap:6 }}>
      <span style={{ fontSize:12, opacity:0.85 }}>{label}</span>
      {children}
    </label>
  );
}
