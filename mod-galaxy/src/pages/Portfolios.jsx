import React, { useEffect, useMemo, useState } from "react";
import supabase from "../lib/supabaseClient";

/**
 * Portfolios
 * - List, search, create, edit, activate/deactivate
 * - Uses RLS-friendly patterns
 */

const PAGE_SIZE = 20;

function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? "—" : dt.toLocaleString();
}

function cx(...list) {
  return list.filter(Boolean).join(" ");
}

const BASE_CCY = [
  "USD","EUR","GBP","JPY","CHF","AUD","CAD","SEK","NOK","DKK","HKD","SGD","CNY","INR","BRL","ZAR"
];

export default function Portfolios() {
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const totalPages = useMemo(() => Math.max(1, Math.ceil(count / PAGE_SIZE)), [count]);

  useEffect(() => { load(page, search); }, [page, search]);

  async function load(p=0, q="") {
    setLoading(true); setErr("");
    try {
      let qy = supabase
        .from("portfolios")
        .select("id, code, name, base_currency, is_active, created_at", { count: "exact" })
        .order("created_at", { ascending: false });

      if (q) qy = qy.ilike("name", `%${q}%`);

      const from = p * PAGE_SIZE, to = from + PAGE_SIZE - 1;
      const { data, error, count: total } = await qy.range(from, to);
      if (error) throw error;
      setRows(data ?? []);
      setCount(total ?? 0);
    } catch (e) {
      setErr(e.message || String(e));
      setRows([]); setCount(0);
    } finally {
      setLoading(false);
    }
  }

  function onNew() {
    setEditing({ id:null, code:"", name:"", base_currency:"USD", is_active:true });
    setModalOpen(true);
  }
  function onEdit(r) {
    setEditing({ ...r });
    setModalOpen(true);
  }

  async function onSave(e) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true); setErr("");
    try {
      const payload = {
        code: editing.code.trim(),
        name: editing.name.trim(),
        base_currency: editing.base_currency,
        is_active: editing.is_active
      };
      let res;
      if (editing.id) res = await supabase.from("portfolios").update(payload).eq("id", editing.id).select();
      else res = await supabase.from("portfolios").insert(payload).select();
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
      const { error } = await supabase.from("portfolios").update({ is_active: !r.is_active }).eq("id", r.id);
      if (error) throw error;
      await load(page, search);
    } catch (e) {
      setErr(e.message || String(e));
    }
  }

  return (
    <div>
      <div className="section-header">
        <h2>Portfolios</h2>
        <div className="actions">
          <div className="btn-row">
            <input
              placeholder="Search by name…"
              value={search}
              onChange={(e) => { setPage(0); setSearch(e.target.value); }}
              style={{ background:"transparent", border:"1px solid var(--border)", borderRadius:12, color:"var(--text)", padding:"10px 12px", width:220 }}
            />
            <button className="btn" onClick={onNew}>New Portfolio</button>
            <button className="btn ghost" onClick={() => load(page, search)}>Refresh</button>
          </div>
        </div>
      </div>

      <div className="card glass">
        <div className="card-head">
          <h3>All Portfolios</h3>
          <div className="pill">Total: {count}</div>
        </div>

        <div className="card-body">
          {err && (
            <div className="empty glass" style={{ marginBottom: 12 }}>
              <div className="empty-title" style={{ color: "var(--danger)" }}>Error</div>
              <div className="empty-hint">{err}</div>
            </div>
          )}

          <div className="table" style={{ "--cols": "repeat(6, minmax(0, 1fr))" }}>
            <div className="table-head">
              <div className="th">Code</div>
              <div className="th">Name</div>
              <div className="th">Base CCY</div>
              <div className="th">Active</div>
              <div className="th">Created</div>
              <div className="th">Actions</div>
            </div>

            <div className="table-body">
              {loading ? (
                <div className="empty glass"><div className="empty-title">Loading…</div></div>
              ) : rows.length === 0 ? (
                <div className="empty glass">
                  <div className="empty-title">No portfolios</div>
                  <div className="empty-hint">Create your first portfolio to get started.</div>
                </div>
              ) : rows.map((r) => (
                <div key={r.id} className="tr">
                  <div className="td"><b>{r.code}</b></div>
                  <div className="td">{r.name}</div>
                  <div className="td">{r.base_currency}</div>
                  <div className="td">
                    <span className={cx("badge", r.is_active ? "badge-success" : "")}>
                      {r.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="td">{fmtDate(r.created_at)}</div>
                  <div className="td" style={{ display: "flex", gap: 8 }}>
                    <button className="btn tiny" onClick={() => onEdit(r)}>Edit</button>
                    <button className="btn tiny ghost" onClick={() => toggleActive(r)}>{r.is_active ? "Deactivate" : "Activate"}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card-foot" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ opacity: 0.8 }}>Page {page + 1} / {totalPages}</div>
          <div className="btn-row">
            <button className="btn tiny ghost" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>‹ Prev</button>
            <button className="btn tiny" disabled={(page + 1) >= totalPages} onClick={() => setPage(p => p + 1)}>Next ›</button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="cmd-backdrop" onClick={() => setModalOpen(false)} role="dialog" aria-modal="true">
          <div className="cmd glass" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <form onSubmit={onSave}>
              <div className="cmd-input" style={{ borderBottom: "none" }}>
                <h3 style={{ margin: 0 }}>{editing?.id ? "Edit Portfolio" : "New Portfolio"}</h3>
              </div>
              <div style={{ padding: 12, display: "grid", gap: 12 }}>
                <Field label="Code *"><input className="fld" value={editing?.code || ""} onChange={(e)=>setEditing(s=>({...s, code:e.target.value}))} required /></Field>
                <Field label="Name *"><input className="fld" value={editing?.name || ""} onChange={(e)=>setEditing(s=>({...s, name:e.target.value}))} required /></Field>
                <Field label="Base Currency *">
                  <select className="fld" value={editing?.base_currency || "USD"} onChange={(e)=>setEditing(s=>({...s, base_currency:e.target.value}))}>
                    {BASE_CCY.map(c=> <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Active">
                  <label style={{ display:"inline-flex", alignItems:"center", gap:8 }}>
                    <input type="checkbox" checked={!!editing?.is_active} onChange={(e)=>setEditing(s=>({...s, is_active:e.target.checked}))}/>
                    <span>Is Active</span>
                  </label>
                </Field>
                {err && <div className="empty glass" style={{ marginTop:6 }}>
                  <div className="empty-title" style={{ color:"var(--danger)" }}>Save Error</div>
                  <div className="empty-hint">{err}</div>
                </div>}
              </div>
              <div style={{ padding:12, display:"flex", justifyContent:"flex-end", gap:8 }}>
                <button type="button" className="btn ghost" onClick={()=>setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn">{saving ? "Saving…" : "Save"}</button>
              </div>
            </form>
            <style>{`.fld{width:100%;background:transparent;border:1px solid var(--border);border-radius:12px;color:var(--text);padding:10px 12px;outline:none}.fld:focus{border-color:var(--neon)}`}</style>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display:"grid", gap:6 }}>
      <span style={{ fontSize:12, opacity:0.8 }}>{label}</span>
      {children}
    </label>
  );
}
