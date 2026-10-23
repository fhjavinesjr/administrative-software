"use client";

import { localStorageUtil } from "@/lib/utils/localStorageUtil";

import { runtimeConfig } from "@/lib/utils/runtimeConfig";
import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import styles from "@/styles/EarningType.module.scss";
import modalStyles from "@/styles/Modal.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";
import { sanitizeText } from "@/lib/utils/inputSanitizers";

const API_BASE_URL = runtimeConfig.getApiUrl("administrative");

type EarningTypeEntry = {
  earningTypeId?: number;
  accountingCode: string;
  name: string;
  taxable: boolean;
  allowance: boolean;
  dailyBasis: boolean;
  basic: boolean;
  rata: boolean;
  honorarium: boolean;
  ecola: boolean;
  up: boolean;
  fixedHousing: boolean;
  representation: boolean;
  transportation: boolean;
  longevity: boolean;
  laundry: boolean;
  hazardPay: boolean;
  pera: boolean;
  subsistence: boolean;
  specialPayroll: boolean;
  bir2316ItemNo: string | null;
  benefitTaxProfileCode: string | null;
};

type BenefitTaxProfile = {
  id: number | null;
  profileCode: string;
  taxYear: number;
  label: string;
  guidanceCeiling: number | null;
  ceilingPeriod: "ANNUAL" | "MONTHLY" | "PER_EVENT" | null;
  sharedPoolCode: string | null;
  exemptBirItem: string | null;
  taxableBirItem: string | null;
  legalBasis: string;
  sourceUrl: string | null;
};

const bir2316Options = [
  { value: "29", label: "29 — Non-taxable basic salary / MWE", taxable: false },
  { value: "30", label: "30 — MWE holiday pay", taxable: false },
  { value: "31", label: "31 — MWE overtime pay", taxable: false },
  { value: "32", label: "32 — MWE night shift differential", taxable: false },
  { value: "33", label: "33 — MWE hazard pay", taxable: false },
  { value: "34", label: "34 — Non-taxable 13th month / other benefits", taxable: false },
  { value: "35", label: "35 — De minimis benefits", taxable: false },
  { value: "37", label: "37 — Other non-taxable compensation", taxable: false },
  { value: "39", label: "39 — Taxable basic salary", taxable: true },
  { value: "40", label: "40 — Representation", taxable: true },
  { value: "41", label: "41 — Transportation", taxable: true },
  { value: "42", label: "42 — COLA", taxable: true },
  { value: "43", label: "43 — Fixed housing allowance", taxable: true },
  { value: "44A", label: "44A — Other regular compensation A", taxable: true },
  { value: "44B", label: "44B — Other regular compensation B", taxable: true },
  { value: "45", label: "45 — Commission", taxable: true },
  { value: "46", label: "46 — Profit sharing", taxable: true },
  { value: "47", label: "47 — Fees / director's fees", taxable: true },
  { value: "48", label: "48 — Taxable 13th month benefits", taxable: true },
  { value: "49", label: "49 — Taxable hazard pay", taxable: true },
  { value: "50", label: "50 — Taxable overtime pay", taxable: true },
  { value: "51A", label: "51A — Other supplementary compensation A", taxable: true },
  { value: "51B", label: "51B — Other supplementary compensation B", taxable: true },
] as const;

const earningFields: {
  key: keyof ReturnType<typeof defaultFlags>;
  label: string;
}[] = [
  { key: "taxable", label: "Taxable" },
  { key: "allowance", label: "Allowance" },
  { key: "dailyBasis", label: "Daily Basis" },
  { key: "basic", label: "Basic" },
  { key: "rata", label: "RATA" },
  { key: "honorarium", label: "Honorarium" },
  { key: "ecola", label: "ECOLA" },
  { key: "up", label: "UP" },
  { key: "fixedHousing", label: "Fixed Housing" },
  { key: "representation", label: "Representation" },
  { key: "transportation", label: "Transportation" },
  { key: "longevity", label: "Longevity" },
  { key: "laundry", label: "Laundry" },
  { key: "hazardPay", label: "Hazard Pay" },
  { key: "pera", label: "PERA" },
  { key: "subsistence", label: "Subsistence" },
  { key: "specialPayroll", label: "Special Payroll" },
];

const defaultFlags = (): Omit<
  EarningTypeEntry,
  "earningTypeId" | "accountingCode" | "name" | "bir2316ItemNo" | "benefitTaxProfileCode"
> => ({
  taxable: false,
  allowance: false,
  dailyBasis: false,
  basic: false,
  rata: false,
  honorarium: false,
  ecola: false,
  up: false,
  fixedHousing: false,
  representation: false,
  transportation: false,
  longevity: false,
  laundry: false,
  hazardPay: false,
  pera: false,
  subsistence: false,
  specialPayroll: false,
});

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function EarningTypes() {
  const canAdd = localStorageUtil.canAdd("admin.earningTypes");
  const canEdit = localStorageUtil.canEdit("admin.earningTypes");
  const canDelete = localStorageUtil.canDelete("admin.earningTypes");
  const [accountingCode, setAccountingCode] = useState("");
  const [name, setName] = useState("");
  const [flags, setFlags] = useState(defaultFlags());
  const [bir2316ItemNo, setBir2316ItemNo] = useState("");
  const [benefitTaxProfileCode, setBenefitTaxProfileCode] = useState("");
  const [profileYear, setProfileYear] = useState(new Date().getFullYear());
  const [profiles, setProfiles] = useState<BenefitTaxProfile[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editItem, setEditItem] = useState<EarningTypeEntry | null>(null);
  const [arr, setArr] = useState<EarningTypeEntry[]>([]);

  // ── Pagination / search ───────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const toast = (icon: "success" | "error", title: string) =>
    Swal.mixin({
      toast: true,
      position: "bottom-end",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    }).fire({ icon, title });

  const loadData = useCallback(async () => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/api/earningType/get-all`,
      );
      if (!res.ok) throw new Error();
      const data: EarningTypeEntry[] = await res.json();
      setArr([...data].sort((a, b) => a.name.localeCompare(b.name)));
    } catch {
      toast("error", "Failed to load earning types");
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadProfiles = useCallback(async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/benefit-tax-profiles?year=${profileYear}`);
      if (!response.ok) throw new Error();
      setProfiles((await response.json()) as BenefitTaxProfile[]);
    } catch {
      setProfiles([]);
      toast("error", "Could not load benefit tax profiles");
    }
  }, [profileYear]);

  useEffect(() => { void loadProfiles(); }, [loadProfiles]);

  // Reset to page 1 whenever search term or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, itemsPerPage]);

  const filteredArr = arr.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.accountingCode.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q)
    );
  });
  const totalPages = Math.ceil(filteredArr.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedArr = filteredArr.slice(startIndex, startIndex + itemsPerPage);

  const handleCheckboxChange = (key: keyof typeof flags) => {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
    if (key === "taxable") setBir2316ItemNo("");
  };

  const handleClear = () => {
    setAccountingCode("");
    setName("");
    setFlags(defaultFlags());
    setBir2316ItemNo("");
    setBenefitTaxProfileCode("");
    setIsEditing(false);
    setEditItem(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    /* RBAC:onSubmit */

    if (isEditing ? !canEdit : !canAdd) {
      e.preventDefault();

      void Swal.fire({
        icon: "warning",
        title: "Permission denied",
        text: isEditing
          ? "You do not have permission to edit this record."
          : "You do not have permission to add a record.",
      });

      return;
    }
    e.preventDefault();
    const payload: EarningTypeEntry = {
      accountingCode: accountingCode.trim(),
      name: name.trim(),
      bir2316ItemNo: bir2316ItemNo || null,
      benefitTaxProfileCode: benefitTaxProfileCode || null,
      ...flags,
    };

    try {
      if (!isEditing) {
        const res = await fetchWithAuth(
          `${API_BASE_URL}/api/earningType/create`,
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
        );
        if (!res.ok) throw new Error();
        toast("success", "Successfully Added!");
      } else if (editItem?.earningTypeId) {
        const confirmed = await Swal.fire({
          text: "Are you sure you want to update this record?",
          icon: "info",
          showCancelButton: true,
          confirmButtonText: "Update",
        });
        if (!confirmed.isConfirmed) return;

        const res = await fetchWithAuth(
          `${API_BASE_URL}/api/earningType/update/${editItem.earningTypeId}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          },
        );
        if (!res.ok) throw new Error();
        toast("success", "Successfully Updated!");
      }
      handleClear();
      loadData();
    } catch {
      toast("error", "Operation failed");
    }
  };

  const handleEdit = (item: EarningTypeEntry) => {
    /* RBAC:handleEdit */

    if (!canEdit) {
      void Swal.fire({
        icon: "warning",
        title: "Permission denied",
        text: "You do not have permission to edit this record.",
      });

      return;
    }
    setEditItem(item);
    setAccountingCode(item.accountingCode);
    setName(item.name);
    setBir2316ItemNo(item.bir2316ItemNo ?? "");
    setBenefitTaxProfileCode(item.benefitTaxProfileCode ?? "");
    setFlags({
      taxable: item.taxable,
      allowance: item.allowance,
      dailyBasis: item.dailyBasis,
      basic: item.basic,
      rata: item.rata,
      honorarium: item.honorarium,
      ecola: item.ecola,
      up: item.up,
      fixedHousing: item.fixedHousing,
      representation: item.representation,
      transportation: item.transportation,
      longevity: item.longevity,
      laundry: item.laundry,
      hazardPay: item.hazardPay,
      pera: item.pera,
      subsistence: item.subsistence,
      specialPayroll: item.specialPayroll,
    });
    setIsEditing(true);
  };

  const handleDelete = (item: EarningTypeEntry) => {
    /* RBAC:handleDelete */

    if (!canDelete) {
      void Swal.fire({
        icon: "warning",
        title: "Permission denied",
        text: "You do not have permission to delete this record.",
      });

      return;
    }
    Swal.fire({
      text: `Are you sure you want to delete "${item.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    }).then(async (result) => {
      if (result.isConfirmed && item.earningTypeId) {
        try {
          const res = await fetchWithAuth(
            `${API_BASE_URL}/api/earningType/delete/${item.earningTypeId}`,
            { method: "DELETE" },
          );
          if (!res.ok) throw new Error();
          toast("success", "Successfully Deleted!");
          loadData();
        } catch {
          toast("error", "Delete failed");
        }
      }
    });
  };

  const editProfile = async (existing?: BenefitTaxProfile) => {
    if (existing ? !canEdit : !canAdd) return;
    const result = await Swal.fire<BenefitTaxProfile>({
      title: existing ? "Edit benefit tax profile" : "Add benefit tax profile",
      width: 620,
      html: `<div style="display:grid;gap:8px;text-align:left">
        <label>Profile code<input id="bt-code" class="swal2-input" style="margin:0;width:100%"></label>
        <label>Label<input id="bt-label" class="swal2-input" style="margin:0;width:100%"></label>
        <label>Guidance ceiling (blank if none)<input id="bt-ceiling" type="number" min="0" step="0.01" class="swal2-input" style="margin:0;width:100%"></label>
        <label>Ceiling period<select id="bt-period" class="swal2-select" style="margin:0;width:100%"><option value="">None</option><option value="ANNUAL">Annual</option><option value="MONTHLY">Monthly</option><option value="PER_EVENT">Per event</option></select></label>
        <label>Shared pool code (optional)<input id="bt-pool" class="swal2-input" style="margin:0;width:100%"></label>
        <label>Exempt BIR item (optional)<input id="bt-exempt" class="swal2-input" style="margin:0;width:100%"></label>
        <label>Taxable BIR item (optional)<input id="bt-taxable" class="swal2-input" style="margin:0;width:100%"></label>
        <label>Legal basis<input id="bt-basis" class="swal2-input" style="margin:0;width:100%"></label>
        <label>Official source URL<input id="bt-url" class="swal2-input" style="margin:0;width:100%"></label>
      </div>`,
      didOpen: () => {
        const set = (id: string, value: string) => {
          const input = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
          if (input) input.value = value;
        };
        if (!existing) return;
        set("bt-code", existing.profileCode);
        set("bt-label", existing.label);
        set("bt-ceiling", existing.guidanceCeiling?.toString() ?? "");
        set("bt-period", existing.ceilingPeriod ?? "");
        set("bt-pool", existing.sharedPoolCode ?? "");
        set("bt-exempt", existing.exemptBirItem ?? "");
        set("bt-taxable", existing.taxableBirItem ?? "");
        set("bt-basis", existing.legalBasis);
        set("bt-url", existing.sourceUrl ?? "");
      },
      showCancelButton: true,
      confirmButtonText: "Save profile",
      preConfirm: () => {
        const value = (id: string) => (document.getElementById(id) as HTMLInputElement | null)?.value.trim() ?? "";
        const code = value("bt-code").toUpperCase();
        const label = value("bt-label");
        const basis = value("bt-basis");
        const ceilingText = value("bt-ceiling");
        const period = value("bt-period") as BenefitTaxProfile["ceilingPeriod"] | "";
        if (!code || !label || !basis || (ceilingText && (!period || Number(ceilingText) < 0))) {
          Swal.showValidationMessage("Code, label and legal basis are required; choose a period for a ceiling.");
          return false;
        }
        return {
          id: existing?.id ?? null,
          profileCode: code,
          taxYear: profileYear,
          label,
          guidanceCeiling: ceilingText ? Number(ceilingText) : null,
          ceilingPeriod: period || null,
          sharedPoolCode: value("bt-pool") || null,
          exemptBirItem: value("bt-exempt").toUpperCase() || null,
          taxableBirItem: value("bt-taxable").toUpperCase() || null,
          legalBasis: basis,
          sourceUrl: value("bt-url") || null,
        };
      },
    });
    if (!result.isConfirmed || !result.value) return;
    const response = await fetchWithAuth(
      `${API_BASE_URL}/api/benefit-tax-profiles${existing ? `/${existing.id}` : ""}`,
      { method: existing ? "PUT" : "POST", body: JSON.stringify(result.value) },
    );
    if (!response.ok) {
      const data = await response.json().catch(() => null) as { message?: string } | null;
      await Swal.fire({ icon: "error", title: "Profile not saved", text: data?.message ?? "Check the profile values." });
      return;
    }
    await loadProfiles();
    toast("success", "Benefit tax profile saved");
  };

  return (
    <div className={modalStyles.Modal}>
      <div className={modalStyles.modalContent}>
        <div className={modalStyles.modalHeader}>
          <h2 className={modalStyles.mainTitle}>Earning Types</h2>
        </div>
        <div className={modalStyles.modalBody}>
          <form className={styles.EarningTypeForm} onSubmit={onSubmit}>
            <label>Accounting Code</label>
            <input
              type="text"
              value={accountingCode}
              maxLength={50}
              onChange={(e) => setAccountingCode(sanitizeText(e.target.value))}
              required
            />

            <label>BIR Form 2316 Item</label>
            <select
              value={bir2316ItemNo}
              onChange={(e) => setBir2316ItemNo(e.target.value)}
            >
              <option value="">Not classified</option>
              {bir2316Options
                .filter((option) => option.taxable === flags.taxable)
                .map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
            <label>Annual benefit tax profile (optional)</label>
            <select value={benefitTaxProfileCode} onChange={(e) => setBenefitTaxProfileCode(e.target.value)}>
              <option value="">No annual benefit review required</option>
              {profiles.map((profile) => <option key={profile.profileCode} value={profile.profileCode}>
                {profile.label} ({profile.profileCode})
              </option>)}
            </select>
            <small>Set this on the Earning Type that payroll uses. Annualization matches its ID or accounting code, not its name. This does not change payroll.</small>
            <label>Name</label>
            <input
              type="text"
              value={name}
              maxLength={100}
              onChange={(e) => setName(sanitizeText(e.target.value))}
              required
            />

            <h4 className={styles.settings}>EARNING SETTINGS</h4>

            <div className={styles.checkboxGroup}>
              {earningFields.map(({ key, label }) => (
                <div key={key} className={styles.checkboxItem}>
                  <label>{label}:</label>
                  <input
                    type="checkbox"
                    checked={flags[key] as boolean}
                    onChange={() => handleCheckboxChange(key)}
                  />
                </div>
              ))}
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="submit"
                className={isEditing ? styles.updateButton : styles.saveButton}
                disabled={isEditing ? !canEdit : !canAdd}
              >
                {isEditing ? "Update" : "Save"}
              </button>
              <button
                type="button"
                className={styles.clearButton}
                onClick={handleClear}
              >
                Clear
              </button>
            </div>
          </form>

          <section className={styles.EarningTypeTable} aria-label="Annual benefit tax profiles">
            <h3>Annual benefit tax profiles</h3>
            <p>Ceilings are BIR guidance for review, not automatic amounts or payroll changes.</p>
            <label>Tax year <input type="number" min="2018" max="9999" value={profileYear}
              onChange={(e) => setProfileYear(Number(e.target.value))} /></label>
            <button type="button" onClick={() => void editProfile()} disabled={!canAdd}>Add profile</button>
            <table className={styles.table}>
              <thead><tr><th>Profile</th><th>Guidance ceiling</th><th>BIR items</th><th>Legal basis</th><th>Action</th></tr></thead>
              <tbody>{profiles.map((profile) => <tr key={profile.id}>
                <td>{profile.label}<br /><small>{profile.profileCode}</small></td>
                <td>{profile.guidanceCeiling == null ? "None" : `${profile.guidanceCeiling.toLocaleString("en-PH")} / ${profile.ceilingPeriod?.toLowerCase()}`}</td>
                <td>{profile.exemptBirItem ?? "Choose at review"} / {profile.taxableBirItem ?? "Choose at review"}</td>
                <td>{profile.sourceUrl ? <a href={profile.sourceUrl} target="_blank" rel="noopener noreferrer">{profile.legalBasis}</a> : profile.legalBasis}</td>
                <td><button type="button" disabled={!canEdit} onClick={() => void editProfile(profile)}>Edit</button></td>
              </tr>)}</tbody>
            </table>
          </section>

          {arr.length > 0 && (
            <div className={styles.EarningTypeTable}>
              {/* Search + Pagination controls */}
              <div className={styles.searchBar}>
                <input
                  type="text"
                  placeholder="Search by code or name…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className={styles.paginationControls}>
                  <label>Rows:</label>
                  <select
                    className={styles.rowSelect}
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  >
                    {PAGE_SIZE_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <span className={styles.recordInfo}>
                    {filteredArr.length === 0 ? "0" : startIndex + 1}–
                    {Math.min(startIndex + itemsPerPage, filteredArr.length)} of{" "}
                    {filteredArr.length}
                  </span>
                  <button
                    className={styles.pageBtn}
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(1)}
                  >
                    First
                  </button>
                  <button
                    className={styles.pageBtn}
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    Prev
                  </button>
                  <span className={styles.pageIndicator}>
                    Page {currentPage} of {totalPages || 1}
                  </span>
                  <button
                    className={styles.pageBtn}
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next
                  </button>
                  <button
                    className={styles.pageBtn}
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                  >
                    Last
                  </button>
                </div>
              </div>

              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Accounting Code</th>
                    <th>Name</th>
                    <th>BIR 2316 Item</th>
                    <th>Annual tax profile</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedArr.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          textAlign: "center",
                          color: "#6b7280",
                          padding: "1rem",
                        }}
                      >
                        No records found.
                      </td>
                    </tr>
                  ) : (
                    paginatedArr.map((m) => (
                      <tr key={m.earningTypeId}>
                        <td>{m.accountingCode}</td>
                        <td>{m.name}</td>
                        <td>{m.bir2316ItemNo || "Not classified"}</td>
                        <td>{m.benefitTaxProfileCode || "None"}</td>
                        <td>
                          <button
                            className={`${styles.iconButton} ${styles.editIcon}`}
                            onClick={() => handleEdit(m)}
                            title="Edit"
                            disabled={!canEdit}
                          >
                            <FaRegEdit />
                          </button>
                          <button
                            className={`${styles.iconButton} ${styles.deleteIcon}`}
                            onClick={() => handleDelete(m)}
                            title="Delete"
                            disabled={!canDelete}
                          >
                            <FaTrashAlt />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
