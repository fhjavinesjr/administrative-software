"use client";

import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";
import { localStorageUtil } from "@/lib/utils/localStorageUtil";
import { runtimeConfig } from "@/lib/utils/runtimeConfig";
import styles from "./QualificationStandards.module.scss";

const feature = "administrative.qualification-standard";
const api = runtimeConfig.getApiUrl("administrative");
type Position = { jobPositionId: number; jobPositionName: string };
type Status = "DRAFT" | "ACTIVE" | "ARCHIVED";
type Standard = { id: number; jobPositionId: number; jobPositionName: string; definitionVersion: number;
  supersedesId: number | null; status: Status; education: string; training: string; experience: string;
  eligibility: string; licenseRequirement: string | null; sourceBasis: string | null;
  effectiveFrom: string | null; effectiveTo: string | null; publishedBy: string | null;
  publishedAt: string | null; recordVersion: number };
type Form = { education: string; training: string; experience: string; eligibility: string;
  licenseRequirement: string; sourceBasis: string; effectiveFrom: string; effectiveTo: string };
const empty: Form = { education: "", training: "", experience: "", eligibility: "",
  licenseRequirement: "", sourceBasis: "", effectiveFrom: "", effectiveTo: "" };

function canPublish(): boolean {
  if (localStorageUtil.getIsAdministrator()) return true;
  const raw = localStorage.getItem("permissionData");
  if (!raw || raw === "__superadmin__") return true;
  try { return (JSON.parse(raw) as Record<string, { canAccess?: boolean; canPublish?: boolean }>)[feature]?.canAccess === true &&
    (JSON.parse(raw) as Record<string, { canPublish?: boolean }>)[feature]?.canPublish === true; } catch { return false; }
}
async function detail(response: Response): Promise<string> {
  const body = await response.json().catch(() => null) as { message?: string; details?: string[] } | null;
  return body?.details?.[0] ?? body?.message ?? `Request failed (${response.status})`;
}

export default function QualificationStandards() {
  const [positions, setPositions] = useState<Position[]>([]); const [positionId, setPositionId] = useState("");
  const [items, setItems] = useState<Standard[]>([]); const [selected, setSelected] = useState<Standard | null>(null);
  const [form, setForm] = useState<Form>(empty); const [notice, setNotice] = useState(""); const [busy, setBusy] = useState(false);
  const access = localStorageUtil.canAccess(feature); const add = localStorageUtil.canAdd(feature);
  const edit = localStorageUtil.canEdit(feature); const remove = localStorageUtil.canDelete(feature); const publish = canPublish();

  const load = useCallback(async (id: string) => {
    if (!id) { setItems([]); return; }
    const response = await fetchWithAuth(`${api}/api/qualification-standards?jobPositionId=${encodeURIComponent(id)}`);
    if (!response.ok) throw new Error(await detail(response)); setItems(await response.json() as Standard[]);
  }, []);
  useEffect(() => { void (async () => { try { const response = await fetchWithAuth(`${api}/api/job-position/get-all`);
    if (!response.ok) throw new Error(await detail(response)); const data = await response.json() as Position[];
    setPositions(data.sort((a, b) => a.jobPositionName.localeCompare(b.jobPositionName))); } catch (error) { setNotice(error instanceof Error ? error.message : "Unable to load Job Positions"); } })(); }, []);
  useEffect(() => { if (access && positionId) void load(positionId).catch((error: unknown) => setNotice(error instanceof Error ? error.message : "Unable to load Qualification Standards")); }, [access, load, positionId]);

  function choose(item: Standard) { setSelected(item); setForm({ education: item.education, training: item.training,
    experience: item.experience, eligibility: item.eligibility, licenseRequirement: item.licenseRequirement ?? "",
    sourceBasis: item.sourceBasis ?? "", effectiveFrom: item.effectiveFrom ?? "", effectiveTo: item.effectiveTo ?? "" }); }
  async function save() { if (!positionId) return; setBusy(true); try { const payload = { jobPositionId: Number(positionId), ...form,
      effectiveFrom: form.effectiveFrom || null, effectiveTo: form.effectiveTo || null,
      recordVersion: selected?.recordVersion ?? null };
    const response = await fetchWithAuth(selected ? `${api}/api/qualification-standards/${selected.id}` : `${api}/api/qualification-standards`,
      { method: selected ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!response.ok) throw new Error(await detail(response)); setSelected(null); setForm(empty); await load(positionId);
    await Swal.fire("Saved", "The Qualification Standard draft was saved.", "success");
  } catch (error) { await Swal.fire("Unable to save", error instanceof Error ? error.message : "Request failed", "error"); } finally { setBusy(false); } }
  async function transition(item: Standard, action: "publish" | "archive" | "versions") { const needsReason = action === "archive";
    const prompt = await Swal.fire({ title: action === "versions" ? "Create successor version?" : `${action[0].toUpperCase()}${action.slice(1)} Qualification Standard?`,
      input: needsReason ? "text" : undefined, inputLabel: needsReason ? "Reason" : undefined, showCancelButton: true, confirmButtonText: "Continue" });
    if (!prompt.isConfirmed) return; setBusy(true); try { const response = await fetchWithAuth(`${api}/api/qualification-standards/${item.id}/${action}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recordVersion: item.recordVersion,
        reason: prompt.value || null, effectiveFrom: action === "versions" ? new Date().toISOString().slice(0, 10) : null }) });
      if (!response.ok) throw new Error(await detail(response)); await load(positionId); await Swal.fire("Completed", "The lifecycle action was recorded.", "success");
    } catch (error) { await Swal.fire("Action failed", error instanceof Error ? error.message : "Request failed", "error"); } finally { setBusy(false); } }

  if (!access) return <section className={styles.page}><h1>Access denied</h1><p>Your permission ruleset does not grant Qualification Standard access.</p></section>;
  return <section className={styles.page}><h1 className={styles.title}>Qualification Standards</h1>{notice && <div className={styles.notice}>{notice}</div>}
    <div className={styles.panel}><div className={styles.field}><label htmlFor="qs-position">Job Position</label><select id="qs-position" value={positionId} onChange={(event) => { setPositionId(event.target.value); setSelected(null); setForm(empty); }}><option value="">Select Job Position</option>{positions.map((item) => <option key={item.jobPositionId} value={item.jobPositionId}>{item.jobPositionName}</option>)}</select></div></div>
    {positionId && <><div className={styles.panel}><h2>{selected ? "Edit draft" : "New Qualification Standard draft"}</h2><div className={styles.grid}>
      {(["education", "training", "experience", "eligibility"] as const).map((key) => <div className={`${styles.field} ${styles.wide}`} key={key}><label htmlFor={`qs-${key}`}>{key[0].toUpperCase() + key.slice(1)} requirement</label><textarea id={`qs-${key}`} required value={form[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} /></div>)}
      <div className={`${styles.field} ${styles.wide}`}><label htmlFor="qs-license">License/other statutory requirement</label><textarea id="qs-license" value={form.licenseRequirement} onChange={(event) => setForm((current) => ({ ...current, licenseRequirement: event.target.value }))} /></div>
      <div className={`${styles.field} ${styles.wide}`}><label htmlFor="qs-basis">Source/legal basis</label><textarea id="qs-basis" value={form.sourceBasis} onChange={(event) => setForm((current) => ({ ...current, sourceBasis: event.target.value }))} /></div>
      <div className={styles.field}><label htmlFor="qs-from">Effective from</label><input id="qs-from" type="date" value={form.effectiveFrom} onChange={(event) => setForm((current) => ({ ...current, effectiveFrom: event.target.value }))} /></div>
      <div className={styles.field}><label htmlFor="qs-to">Effective to</label><input id="qs-to" type="date" value={form.effectiveTo} onChange={(event) => setForm((current) => ({ ...current, effectiveTo: event.target.value }))} /></div></div>
      <div className={styles.actions}><button disabled={busy || (selected ? !edit : !add)} onClick={() => void save()}>{selected ? "Update Draft" : "Save Draft"}</button>{selected && <button className={styles.muted} onClick={() => { setSelected(null); setForm(empty); }}>Cancel</button>}</div></div>
      <div className={styles.panel}><h2>Version history</h2><table className={styles.table}><thead><tr><th>Version</th><th>Status</th><th>Effective</th><th>Source</th><th>Actions</th></tr></thead><tbody>{items.length === 0 ? <tr><td colSpan={5}>No Qualification Standards found.</td></tr> : items.map((item) => <tr key={item.id}><td>v{item.definitionVersion}</td><td><span className={styles.badge}>{item.status}</span></td><td>{item.effectiveFrom ?? "Not set"} to {item.effectiveTo ?? "Open"}</td><td>{item.sourceBasis ?? "—"}</td><td><div className={styles.actions}>{item.status === "DRAFT" && edit && <button onClick={() => choose(item)}>Edit</button>}{item.status === "DRAFT" && publish && <button onClick={() => void transition(item, "publish")}>Publish</button>}{item.status === "DRAFT" && remove && <button className={styles.danger} onClick={() => void transition(item, "archive")}>Archive</button>}{item.status === "ACTIVE" && add && <button onClick={() => void transition(item, "versions")}>New Version</button>}</div></td></tr>)}</tbody></table></div></>}
  </section>;
}
