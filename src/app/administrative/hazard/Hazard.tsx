"use client";

import { localStorageUtil } from "@/lib/utils/localStorageUtil";

import { runtimeConfig } from "@/lib/utils/runtimeConfig";
import React, { useEffect, useState, useCallback, useRef } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/Hazard.module.scss";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import { toCustomFormat, toDateInputValue } from "@/lib/utils/dateFormatUtils";
import Swal from "sweetalert2";

const API_BASE_URL_ADMINISTRATIVE = runtimeConfig.getApiUrl("administrative");

type HazardPayItem = {
  hazardPayId?: number;
  effectivityDate?: string;
  salaryGrade: string;
  basicPayPercentage: string;
};

type HazardPayHistory = {
  effectivityDate: string;
  totalRows: number;
};

export default function Hazard() {
  const canAdd = localStorageUtil.canAdd("admin.hazardPay");
  const canEdit = localStorageUtil.canEdit("admin.hazardPay");
  const canDelete = localStorageUtil.canDelete("admin.hazardPay");
  const [rows, setRows] = useState<HazardPayItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [effectivityDate, setEffectivityDate] = useState<string>("");
  const [history, setHistory] = useState<HazardPayHistory[]>([]);
  const [deletedRows, setDeletedRows] = useState<HazardPayItem[]>([]);
  const [autoComputeHazardPay, setAutoComputeHazardPay] = useState(false);
  const skipFetchRef = useRef(false);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setEffectivityDate(today);
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL_ADMINISTRATIVE}/api/hazardPay/get-all`,
      );
      if (!res.ok) throw new Error("Failed to fetch hazard pay history");
      const data: HazardPayItem[] = await res.json();

      const grouped = new Map<string, number>();
      data.forEach((item) => {
        if (!item.effectivityDate) return;
        const dateKey = toDateInputValue(item.effectivityDate);
        grouped.set(dateKey, (grouped.get(dateKey) ?? 0) + 1);
      });

      const historyRows: HazardPayHistory[] = Array.from(grouped.entries())
        .map(([effectivityDate, totalRows]) => ({ effectivityDate, totalRows }))
        .sort((a, b) => b.effectivityDate.localeCompare(a.effectivityDate));

      setHistory(historyRows);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchAutoComputeSetting = useCallback(async () => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL_ADMINISTRATIVE}/api/payrollSettings/get-all`,
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.length > 0) {
        setAutoComputeHazardPay(data[0].autoComputeHazardPay ?? false);
      }
    } catch (err) {
      console.error("Failed to load auto-compute setting:", err);
    }
  }, []);

  const handleAutoComputeToggle = async (checked: boolean) => {
    if (!canEdit) {
      void Swal.fire({
        icon: "warning",
        title: "Permission denied",
        text: "You do not have permission to edit this setting.",
      });
      return;
    }
    try {
      setAutoComputeHazardPay(checked);
      const res = await fetchWithAuth(
        `${API_BASE_URL_ADMINISTRATIVE}/api/payrollSettings/update-hazard-auto-compute`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ autoComputeHazardPay: checked }),
        },
      );
      if (!res.ok) throw new Error("Failed to update setting");
      Swal.fire({
        icon: "success",
        title: checked ? "Auto-compute enabled" : "Auto-compute disabled",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      setAutoComputeHazardPay(!checked); // revert on error
      Swal.fire("Error", "Failed to update auto-compute setting", "error");
    }
  };

  const fetchHazardPay = useCallback(
    async (dateToFetch?: string) => {
      const dateValue = dateToFetch || effectivityDate;
      if (!dateValue) return;

      try {
        setLoading(true);
        const res = await fetchWithAuth(
          `${API_BASE_URL_ADMINISTRATIVE}/api/hazardPay/get-all`,
        );
        if (!res.ok) throw new Error("Failed to fetch hazard pay");
        const data: HazardPayItem[] = await res.json();

        const filtered = data.filter((item) =>
          item.effectivityDate?.startsWith(dateValue),
        );

        if (filtered.length > 0) {
          setRows(
            filtered.map((item) => ({
              hazardPayId: item.hazardPayId,
              effectivityDate: item.effectivityDate,
              salaryGrade: item.salaryGrade ?? "",
              basicPayPercentage: item.basicPayPercentage ?? "",
            })),
          );
        } else {
          setRows([{ salaryGrade: "", basicPayPercentage: "" }]);
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load Hazard Pay table", "error");
      } finally {
        setLoading(false);
      }
    },
    [effectivityDate],
  );

  useEffect(() => {
    if (skipFetchRef.current) {
      skipFetchRef.current = false;
      return;
    }
    fetchHazardPay();
    fetchHistory();
    fetchAutoComputeSetting();
  }, [fetchHazardPay, fetchHistory, fetchAutoComputeSetting]);

  const addRow = () => {
    if (!canAdd && !canEdit) return;
    setRows((prev) => [...prev, { salaryGrade: "", basicPayPercentage: "" }]);
  };

  const removeRow = () => {
    setRows((prev) => {
      if (prev.length <= 1) return prev;
      const removed = prev[prev.length - 1];
      if (removed?.hazardPayId && !canDelete) {
        void Swal.fire({
          icon: "warning",
          title: "Permission denied",
          text: "Deleting a saved row requires Delete permission.",
        });
        return prev;
      }
      if (removed && removed.hazardPayId) {
        setDeletedRows((d) => [...d, removed]);
      }
      return prev.slice(0, -1);
    });
  };

  const updateRow = (
    index: number,
    field: keyof HazardPayItem,
    value: string,
  ) => {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    );
  };

  const checkExistingByEffectivityDate = async (date: string) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL_ADMINISTRATIVE}/api/hazardPay/getBy/${toCustomFormat(date, false)}`,
    );
    if (!res.ok) throw new Error("Failed to validate effectivity date");
    const data: HazardPayItem[] = await res.json();
    return data;
  };

  const handleSave = async () => {
    const editingExisting = rows.some((r) => r.hazardPayId);
    if (editingExisting ? !canEdit : !canAdd) {
      void Swal.fire({
        icon: "warning",
        title: "Permission denied",
        text: editingExisting
          ? "You do not have permission to edit this table."
          : "You do not have permission to add this table.",
      });
      return;
    }
    if (deletedRows.length > 0 && !canDelete) {
      void Swal.fire({
        icon: "warning",
        title: "Permission denied",
        text: "Deleting saved rows requires Delete permission.",
      });
      return;
    }
    try {
      if (!effectivityDate) {
        Swal.fire("Validation", "Effectivity Date is required", "warning");
        return;
      }

      if (
        rows.some((r) => !r.salaryGrade.trim() || !r.basicPayPercentage.trim())
      ) {
        Swal.fire(
          "Validation",
          "Salary Grade and Percentage cannot be empty",
          "warning",
        );
        return;
      }

      setLoading(true);
      const existingData =
        await checkExistingByEffectivityDate(effectivityDate);
      const isEditing = rows.some((r) => r.hazardPayId);

      if (!isEditing && existingData.length > 0) {
        Swal.fire({
          icon: "warning",
          title: "Duplicate Effectivity Date",
          text: "Records already exist for this Effectivity Date. Please edit the existing data instead.",
        });
        return;
      }

      const payload = rows.map((row) => ({
        ...row,
        effectivityDate: toCustomFormat(effectivityDate, false),
      }));

      const url = isEditing
        ? `${API_BASE_URL_ADMINISTRATIVE}/api/hazardPay/update`
        : `${API_BASE_URL_ADMINISTRATIVE}/api/hazardPay/create`;

      await fetchWithAuth(url, {
        method: isEditing ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      // If there are removed rows that have persisted IDs, call deleteById endpoint
      if (deletedRows.length > 0) {
        try {
          const delPayload = deletedRows.map((r) => ({
            hazardPayId: r.hazardPayId,
          }));
          await fetchWithAuth(
            `${API_BASE_URL_ADMINISTRATIVE}/api/hazardPay/deleteById`,
            {
              method: "DELETE",
              body: JSON.stringify(delPayload),
            },
          );
          // clear deleted rows after successful deletion
          setDeletedRows([]);
        } catch (err) {
          console.error("Failed to delete removed rows:", err);
        }
      }

      Swal.fire("Success", "Hazard Pay saved successfully", "success");

      await fetchHazardPay(effectivityDate);
      fetchHistory();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to save Hazard Pay", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!effectivityDate) return;
    const confirm = await Swal.fire({
      text: `Clear records for ${effectivityDate}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Clear",
    });
    if (!confirm.isConfirmed) return;
    try {
      setRows([{ salaryGrade: "", basicPayPercentage: "" }]);
      fetchHistory();
      Swal.fire("Cleared", "Records cleared successfully", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to clear records", "error");
    }
  };

  const handleEditHistory = async (selectedDate: string) => {
    if (!canEdit) {
      void Swal.fire({
        icon: "warning",
        title: "Permission denied",
        text: "You do not have permission to edit this table.",
      });
      return;
    }
    try {
      setLoading(true);
      const res = await fetchWithAuth(
        `${API_BASE_URL_ADMINISTRATIVE}/api/hazardPay/getBy/${toCustomFormat(selectedDate, false)}`,
      );
      if (!res.ok)
        throw new Error("Failed to fetch hazard pay for the selected date");
      const data: HazardPayItem[] = await res.json();
      if (data.length > 0) {
        setRows(
          data.map((item) => ({
            hazardPayId: item.hazardPayId,
            effectivityDate: item.effectivityDate,
            salaryGrade: item.salaryGrade ?? "",
            basicPayPercentage: item.basicPayPercentage ?? "",
          })),
        );
        skipFetchRef.current = true;
        setEffectivityDate(selectedDate);
      } else {
        setRows([{ salaryGrade: "", basicPayPercentage: "" }]);
        skipFetchRef.current = true;
        setEffectivityDate(selectedDate);
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load selected Hazard Pay", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistory = async (date: string) => {
    if (!canDelete) {
      void Swal.fire({
        icon: "warning",
        title: "Permission denied",
        text: "You do not have permission to delete this table.",
      });
      return;
    }
    const confirm = await Swal.fire({
      text: `Delete hazard pay effective ${date}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });
    if (!confirm.isConfirmed) return;
    try {
      await fetchWithAuth(
        `${API_BASE_URL_ADMINISTRATIVE}/api/hazardPay/delete/${toCustomFormat(date, false)}`,
        { method: "DELETE" },
      );
      Swal.fire("Deleted", "History deleted successfully", "success");
      fetchHistory();
      if (date === effectivityDate)
        setRows([{ salaryGrade: "", basicPayPercentage: "" }]);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to delete history", "error");
    }
  };

  return (
    <div className={modalStyles.Modal}>
      <div className={modalStyles.modalContent}>
        <div className={modalStyles.modalHeader}>
          <h2 className={modalStyles.mainTitle}>Hazard Pay Table</h2>
        </div>
        <div className={modalStyles.modalBody}>
          <div className={styles.Hazard}>
            {/* Auto-Compute Setting */}
            <div
              style={{
                padding: "15px",
                background: "#e3f2fd",
                borderLeft: "4px solid #2196f3",
                marginBottom: "20px",
                borderRadius: "4px",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                <input
                  type="checkbox"
                  checked={autoComputeHazardPay}
                  disabled={!canEdit}
                  onChange={(e) => handleAutoComputeToggle(e.target.checked)}
                  style={{
                    width: "18px",
                    height: "18px",
                    cursor: "pointer",
                  }}
                />
                <span>☑ Auto-Compute Hazard Pay in Payroll</span>
              </label>
              <p
                style={{
                  margin: "8px 0 0 28px",
                  fontSize: "12px",
                  color: "#666",
                }}
              >
                When enabled, hazard pay will be automatically calculated during
                payroll processing using the percentage rates defined below.
              </p>
            </div>

            <div className={styles.HazardTable}>
              <div className={styles.toolbar}>
                <button
                  className={styles.newButton}
                  onClick={handleSave}
                  disabled={
                    loading ||
                    (rows.some((r) => r.hazardPayId) ? !canEdit : !canAdd)
                  }
                >
                  💾 Save
                </button>
                <button className={styles.clearButton} onClick={handleClear}>
                  ✖ Clear
                </button>
              </div>

              <div className={styles.formGroup}>
                <label>Effectivity Date</label>
                <input
                  type="date"
                  value={effectivityDate}
                  onChange={(e) => setEffectivityDate(e.target.value)}
                  required
                />
              </div>

              <div className={styles.tableContainer}>
                <table className={styles.hazTable}>
                  <thead>
                    <tr>
                      <th>Salary Grade</th>
                      <th>% Percentage of Basic Salary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr key={idx}>
                        <td>
                          <input
                            type="text"
                            className={styles.hazInput}
                            value={row.salaryGrade}
                            onChange={(e) =>
                              updateRow(idx, "salaryGrade", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className={styles.hazInput}
                            value={row.basicPayPercentage}
                            onChange={(e) =>
                              updateRow(
                                idx,
                                "basicPayPercentage",
                                e.target.value,
                              )
                            }
                          />
                          <span className={styles.percent}>%</span>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={2} className={styles.addTableRow}>
                        <button
                          className={styles.myButton}
                          onClick={addRow}
                          disabled={!canAdd && !canEdit}
                        >
                          + Add
                        </button>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <button
                          className={styles.myButton}
                          onClick={removeRow}
                          disabled={!canAdd && !canEdit}
                        >
                          − Remove
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* History */}
              <div>&nbsp;</div>
              <div className={styles.HazardPayTableHistory}>
                <h3 className={styles.historyTitle}>Hazard Pay History</h3>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Effectivity Date</th>
                      <th>Total Rows</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length === 0 && (
                      <tr>
                        <td colSpan={3} style={{ textAlign: "center" }}>
                          No history available
                        </td>
                      </tr>
                    )}

                    {history.map((item) => (
                      <tr key={item.effectivityDate}>
                        <td>{item.effectivityDate}</td>
                        <td>{item.totalRows}</td>
                        <td className={styles.actionsCell}>
                          <button
                            className={`${styles.iconButton} ${styles.editIcon}`}
                            onClick={() =>
                              handleEditHistory(item.effectivityDate)
                            }
                            title="Edit"
                            disabled={!canEdit}
                          >
                            <FaRegEdit />
                          </button>
                          <button
                            className={`${styles.iconButton} ${styles.deleteIcon}`}
                            onClick={() =>
                              handleDeleteHistory(item.effectivityDate)
                            }
                            title="Delete"
                            disabled={!canDelete}
                          >
                            <FaTrashAlt />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
