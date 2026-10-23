"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";
import { localStorageUtil } from "@/lib/utils/localStorageUtil";
import { runtimeConfig } from "@/lib/utils/runtimeConfig";
import styles from "@/styles/MinimumWageRates.module.scss";

interface MinimumWageRate {
  id: number;
  regionCode: string;
  regionName: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  dailyRate: number;
  monthlyRate: number;
  legalBasis: string;
  remarks: string | null;
}

interface RateForm {
  regionCode: string;
  regionName: string;
  effectiveFrom: string;
  effectiveTo: string;
  dailyRate: string;
  monthlyRate: string;
  legalBasis: string;
  remarks: string;
}

const PERMISSION = "payroll.annualization";
const API_URL = runtimeConfig.getApiUrl("administrative");

const emptyForm = (): RateForm => ({
  regionCode: "",
  regionName: "",
  effectiveFrom: "",
  effectiveTo: "",
  dailyRate: "",
  monthlyRate: "",
  legalBasis: "",
  remarks: "",
});

const money = (value: number): string =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(value);

const readableError = async (response: Response, fallback: string): Promise<string> => {
  const raw = await response.text();
  if (!raw.trim()) return fallback;
  try {
    const body = JSON.parse(raw) as { message?: string; error?: string };
    return body.message || body.error || fallback;
  } catch {
    return raw;
  }
};

const dateLabel = (value: string | null): string => value
  ? new Date(`${value}T00:00:00`).toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  : "Open-ended";

export default function MinimumWageRates() {
  const canAccess = localStorageUtil.canAccess(PERMISSION);
  const canAdd = localStorageUtil.canAdd(PERMISSION);
  const canEdit = localStorageUtil.canEdit(PERMISSION);
  const canDelete = localStorageUtil.canDelete(PERMISSION);
  const [rates, setRates] = useState<MinimumWageRate[]>([]);
  const [form, setForm] = useState<RateForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadRates = useCallback(async () => {
    if (!canAccess) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth(`${API_URL}/api/minimum-wage-rates`);
      if (!response.ok) {
        throw new Error(await readableError(response, "Minimum-wage rates could not be loaded."));
      }
      setRates((await response.json()) as MinimumWageRate[]);
    } catch (loadError: unknown) {
      setError(loadError instanceof Error ? loadError.message : "Minimum-wage rates could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [canAccess]);

  useEffect(() => {
    void loadRates();
  }, [loadRates]);

  const visibleRates = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rates;
    return rates.filter((rate) =>
      [rate.regionCode, rate.regionName, rate.legalBasis]
        .some((value) => value.toLowerCase().includes(query)),
    );
  }, [rates, search]);

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId(null);
  };

  const editRate = (rate: MinimumWageRate) => {
    if (!canEdit) return;
    setEditingId(rate.id);
    setForm({
      regionCode: rate.regionCode,
      regionName: rate.regionName,
      effectiveFrom: rate.effectiveFrom,
      effectiveTo: rate.effectiveTo ?? "",
      dailyRate: String(rate.dailyRate),
      monthlyRate: String(rate.monthlyRate),
      legalBasis: rate.legalBasis,
      remarks: rate.remarks ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveRate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editingId === null ? !canAdd : !canEdit) return;
    if (form.effectiveTo && form.effectiveTo < form.effectiveFrom) {
      await Swal.fire("Check effectivity", "Effective to cannot be earlier than effective from.", "warning");
      return;
    }
    setSaving(true);
    try {
      const response = await fetchWithAuth(
        `${API_URL}/api/minimum-wage-rates${editingId === null ? "" : `/${editingId}`}`,
        {
          method: editingId === null ? "POST" : "PUT",
          body: JSON.stringify({
            regionCode: form.regionCode.trim(),
            regionName: form.regionName.trim(),
            effectiveFrom: form.effectiveFrom,
            effectiveTo: form.effectiveTo || null,
            dailyRate: Number(form.dailyRate),
            monthlyRate: Number(form.monthlyRate),
            legalBasis: form.legalBasis.trim(),
            remarks: form.remarks.trim() || null,
          }),
        },
      );
      if (!response.ok) {
        throw new Error(await readableError(response, "Minimum-wage rate could not be saved."));
      }
      const wasEditing = editingId !== null;
      resetForm();
      await loadRates();
      await Swal.fire({
        icon: "success",
        title: wasEditing ? "Rate updated" : "Rate added",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (saveError: unknown) {
      await Swal.fire({
        icon: "error",
        title: "Unable to save",
        text: saveError instanceof Error ? saveError.message : "Minimum-wage rate could not be saved.",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteRate = async (rate: MinimumWageRate) => {
    if (!canDelete) return;
    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Delete this statutory rate?",
      text: `${rate.regionCode} beginning ${dateLabel(rate.effectiveFrom)} will be removed. Finalized annualizations retain their snapshot.`,
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#b91c1c",
    });
    if (!confirmation.isConfirmed) return;
    try {
      const response = await fetchWithAuth(`${API_URL}/api/minimum-wage-rates/${rate.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(await readableError(response, "Minimum-wage rate could not be deleted."));
      }
      if (editingId === rate.id) resetForm();
      await loadRates();
      await Swal.fire({ icon: "success", title: "Rate deleted", timer: 1200, showConfirmButton: false });
    } catch (deleteError: unknown) {
      await Swal.fire({
        icon: "error",
        title: "Unable to delete",
        text: deleteError instanceof Error ? deleteError.message : "Minimum-wage rate could not be deleted.",
      });
    }
  };

  if (!canAccess) {
    return <div className={styles.unauthorized}>You do not have permission to access minimum-wage rates.</div>;
  }

  const maySave = editingId === null ? canAdd : canEdit;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Payroll master data</p>
          <h1>Minimum Wage Rates</h1>
          <p>Maintain official regional rates used to validate MWE annualization by payroll date.</p>
        </div>
      </header>

      {error && <div className={styles.errorBanner}>{error}</div>}

      {maySave && (
        <form className={styles.editor} onSubmit={saveRate}>
          <div className={styles.editorTitle}>
            <div>
              <h2>{editingId === null ? "Add statutory rate" : "Edit statutory rate"}</h2>
              <p>Use the exact region and legal basis shown in the applicable wage order.</p>
            </div>
            {editingId !== null && <button type="button" onClick={resetForm}>Cancel edit</button>}
          </div>
          <div className={styles.formGrid}>
            <label>Region code<input required maxLength={30} placeholder="e.g. NCR" value={form.regionCode} onChange={(event) => setForm((current) => ({ ...current, regionCode: event.target.value.toUpperCase() }))} /></label>
            <label>Region name<input required maxLength={150} placeholder="Official region name" value={form.regionName} onChange={(event) => setForm((current) => ({ ...current, regionName: event.target.value }))} /></label>
            <label>Effective from<input required type="date" value={form.effectiveFrom} onChange={(event) => setForm((current) => ({ ...current, effectiveFrom: event.target.value }))} /></label>
            <label>Effective to <span>(optional)</span><input type="date" min={form.effectiveFrom || undefined} value={form.effectiveTo} onChange={(event) => setForm((current) => ({ ...current, effectiveTo: event.target.value }))} /></label>
            <label>Daily rate<input required type="number" min="0.01" step="0.01" placeholder="0.00" value={form.dailyRate} onChange={(event) => setForm((current) => ({ ...current, dailyRate: event.target.value }))} /></label>
            <label>Monthly equivalent<input required type="number" min="0.01" step="0.01" placeholder="0.00" value={form.monthlyRate} onChange={(event) => setForm((current) => ({ ...current, monthlyRate: event.target.value }))} /></label>
            <label className={styles.fullWidth}>Legal basis<input required maxLength={200} placeholder="Wage order or applicable issuance" value={form.legalBasis} onChange={(event) => setForm((current) => ({ ...current, legalBasis: event.target.value }))} /></label>
            <label className={styles.fullWidth}>Remarks <span>(optional)</span><textarea maxLength={500} rows={2} value={form.remarks} onChange={(event) => setForm((current) => ({ ...current, remarks: event.target.value }))} /></label>
          </div>
          <div className={styles.formActions}>
            <button type="button" onClick={resetForm} disabled={saving}>Clear</button>
            <button type="submit" disabled={saving}>{saving ? "Saving…" : editingId === null ? "Add rate" : "Save changes"}</button>
          </div>
        </form>
      )}

      <section className={styles.listPanel}>
        <div className={styles.listHeader}>
          <div><h2>Rate history</h2><p>{rates.length} configured rate{rates.length === 1 ? "" : "s"}</p></div>
          <input aria-label="Search minimum-wage rates" placeholder="Search region or legal basis" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        {loading ? <div className={styles.empty}>Loading rates…</div> : visibleRates.length === 0 ? (
          <div className={styles.empty}>{search ? "No matching rates." : "No statutory minimum-wage rates configured yet."}</div>
        ) : (
          <div className={styles.tableWrap}>
            <table>
              <thead><tr><th>Region</th><th>Effectivity</th><th>Daily</th><th>Monthly</th><th>Legal basis</th>{(canEdit || canDelete) && <th>Actions</th>}</tr></thead>
              <tbody>{visibleRates.map((rate) => (
                <tr key={rate.id}>
                  <td><strong>{rate.regionCode}</strong><span>{rate.regionName}</span></td>
                  <td>{dateLabel(rate.effectiveFrom)}<span>to {dateLabel(rate.effectiveTo)}</span></td>
                  <td>{money(rate.dailyRate)}</td>
                  <td>{money(rate.monthlyRate)}</td>
                  <td><strong>{rate.legalBasis}</strong>{rate.remarks && <span>{rate.remarks}</span>}</td>
                  {(canEdit || canDelete) && <td className={styles.actions}>{canEdit && <button type="button" onClick={() => editRate(rate)}>Edit</button>}{canDelete && <button type="button" onClick={() => deleteRate(rate)}>Delete</button>}</td>}
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
