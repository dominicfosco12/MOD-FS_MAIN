import React, { useEffect, useMemo, useState } from "react";
import supabase from "../lib/supabaseClient";

/**
 * Exec Broker Accounts
 * - Minimal admin to create/edit broker accounts
 * - Optional fields (commission/fee schedules) left nullable
 */

const PAGE_SIZE = 20;

export default function ExecBrokerAccounts() {
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(count / PAGE_SIZE)), [count]);

  useEffect(() => { load(page, search); }, [page, search]);

  async function load(p=0, q="") {
    setLoading(true); setErr("");
    try {
      let qy = supabase
        .from("exec_broker_accounts")
        .select("id, broker_name, account_code, dtc_number, clearing_broker, cmta_account, firm_id")
        .order("broker_name", { ascending: true }, { count: "exact" });

      if (q) qy = qy.or(`broker_name.ilike.%${q}%,account_code.ilike.%${q}%`);

      const from = p * PAGE_SIZE, to = from + PAGE_SIZE - 1;
      const { data, error, count: total } = await qy.range(from, to);
      if (error) throw error;
      setRows(data ?? []); setCount(total ?? 0);
    } catch (e) {
      setErr(e.message || String(e)); setRows([]); setCount(0);
    } finally {
      setLoading(false);
    }
  }

  function onNew() {
    setEditing({ id:null, broker_name:"", account_code:"", dtc_number:"", clearing_broker:"", cmta_account:"" });
    setModalOpen(true);
  }
  function onEdit(r) { setEditing({ ...r }); setModalOpen(true); }

  async function onSave(e) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true); setErr("");
    try {
      const payload = {
        broker_name: editing.broker_name.trim(),
        account_code: editing.account_code.trim(),
        dtc_number: editing.dtc_number?.trim() || null,
        clearing_broker: editing.clearing_broker?.trim() || null,
        cmta_account: editing.cmta_account?.trim() || null
      };
      let res;
      if (editing.id) res = await supabase.from("exec_broker_accounts").update(payload).eq("id", editing.id).select();
      else res = await supabase.from("exec_broker_accounts").insert(payload).select();
      if (res.error) throw res.error;
      setModalOpen(false); setEditing(null); await load(page, search);
    } catch (e2) { setErr(e2.message || String(e2)); } finally { setSaving(false); }
  }

  return (
    <div>
      <div className="section-header">
        <h2>Exec Broker Accounts</h2>
        <div className="actions">
          <div className="btn-row">
            <input
              placeholder="Search broker/account…"
              value={search}
              onChange={(e)=>{ setPage(0); setSearch(e.target.value); }}
              style={{ background:"transparent", border:"1px solid var(--border)", borderRadius:12, color:"var(--text)", padding:"10px 12px", width:260 }}
            />
            <button className="btn" onClick={onNew}>New Exec Account</button>
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
          {err && <div className="empty glass" style={{ marginBottom: 12 }}>
            <div className="empty-title" style={{ color:"var(--danger)" }}>Error</div>
            <div className="empty-hint">{err}</div>
          </div>}

          <div className="table" style={{ "--cols": "repeat(6, minmax(0, 1fr))" }}>
            <div className="table-head">
              <div className="th">Broker</div>
              <div className="th">Account Code</div>
              <div className="th">DTC</div>
              <div className="th">Clearing</div>
              <div className="th">CMTA</div>
              <div className="th">Actions</div>
            </div>
            <div className="table-body">
              {loading ? (
                <div className="empty glass"><div className="empty-title">Loading…</div></div>
              ) : rows.length === 0 ? (
                <div className="empty glass"><div className="empty-title">No exec broker accounts</div></div>
              ) : rows.map(r => (
                <div className="tr" key={r.id}>
                  <div className="td"><b>{r.broker_name}</b></div>
                  <div className="td">{r.account_code}</div>
                  <div className="td">{r.dtc_number || "—"}</div>
                  <div className="td">{r.clearing_broker || "—"}</div>
                  <div className="td">{r.cmta_account || "—"}</div>
                  <div className="td" style={{ display:"flex", gap:6 }}>
                    <button className="btn tiny" onClick={() => onEdit(r)}>Edit</button>
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

      {modalOpen && (
        <div className="cmd-backdrop" onClick={() => setModalOpen(false)} role="dialog" aria-modal="true">
          <div className="cmd glass" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <form onSubmit={onSave}>
              <div className="cmd-input" style={{ borderBottom:"none" }}>
                <h3 style={{ margin:0 }}>{editing?.id ? "Edit Exec Broker Account" : "New Exec Broker Account"}</h3>
              </div>
              <div style={{ padding:12, display:"grid", gap:12, gridTemplateColumns:"1fr 1fr" }}>
                <Field label="Broker Name *"><input className="fld" value={editing?.broker_name || ""} onChange={(e)=>setEditing(s=>({...s, broker_name:e.target.value}))} required /></Field>
                <Field label="Account Code *"><input className="fld" value={editing?.account_code || ""} onChange={(e)=>setEditing(s=>({...s, account_code:e.target.value}))} required /></Field>
                <Field label="DTC #"><input className="fld" value={editing?.dtc_number || ""} onChange={(e)=>setEditing(s=>({...s, dtc_number:e.target.value}))} /></Field>
                <Field label="Clearing Broker"><input className="fld" value={editing?.clearing_broker || ""} onChange={(e)=>setEditing(s=>({...s, clearing_broker:e.target.value}))} /></Field>
                <Field label="CMTA Account"><input className="fld" value={editing?.cmta_account || ""} onChange={(e)=>setEditing(s=>({...s, cmta_account:e.target.value}))} /></Field>
              </div>
              {err && <div className="empty glass" style={{ margin:"6px 12px 0" }}>
                <div className="empty-title" style={{ color:"var(--danger)" }}>Save Error</div>
                <div className="empty-hint">{err}</div>
              </div>}
              <div style={{ padding:12, display:"flex", justifyContent:"flex-end", gap:8 }}>
                <button type="button" className="btn ghost" onClick={()=>setModalOpen(false)} disabled={saving}>Cancel</button>
                <button type="submit" className="btn" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
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
      <span style={{ fontSize:12, opacity:0.85 }}>{label}</span>
      {children}
    </label>
  );
}
