"use client";

import React, { useEffect, useState, useCallback } from "react";
import styles from "@/styles/EarningLeaveTable.module.scss";
import modalStyles from "@/styles/Modal.module.scss";
import Swal from "sweetalert2";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import { toCustomFormat, toDateInputValue } from "@/lib/utils/dateFormatUtils";

const API_BASE_URL_ADMINISTRATIVE =
  process.env.NEXT_PUBLIC_API_BASE_URL_ADMINISTRATIVE;

type EarningLeaveItem = {
  earningLeaveId?: number;
  effectivityDate?: string;
  day: string;
  earn: string;
};

type EarningLeaveHistory = {
  effectivityDate: string;
  totalRows: number;
};

export default function EarningLeaveTable() {
  const [rows, setRows] = useState<EarningLeaveItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [effectivityDate, setEffectivityDate] = useState<string>("");
  const [history, setHistory] = useState<EarningLeaveHistory[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd
    setEffectivityDate(today);
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL_ADMINISTRATIVE}/api/earningLeave/get-all`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch earning leave history");
      }

      const data: EarningLeaveItem[] = await response.json();

      const grouped = new Map<string, number>();

      data.forEach(item => {
        if (!item.effectivityDate) return;

        const dateKey = toDateInputValue(item.effectivityDate);
        grouped.set(dateKey, (grouped.get(dateKey) ?? 0) + 1);
      });

      const historyRows: EarningLeaveHistory[] = Array.from(grouped.entries())
        .map(([effectivityDate, totalRows]) => ({
          effectivityDate,
          totalRows,
        }))
        .sort((a, b) => b.effectivityDate.localeCompare(a.effectivityDate));

      setHistory(historyRows);
    } catch (err) {
      console.error(err);
    }
  }, []);

  /* ========================
     Fetch existing data
  ========================= */
  const fetchEarningLeave = useCallback(async () => {
    if (!effectivityDate) return;

    try {
      setLoading(true);

      const response = await fetchWithAuth(
        `${API_BASE_URL_ADMINISTRATIVE}/api/earningLeave/get-all`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch earning leave");
      }

      const data: EarningLeaveItem[] = await response.json();

      const filtered = data.filter(
        item => item.effectivityDate?.startsWith(effectivityDate)
      );

      if (filtered.length > 0) {
        setRows(
          filtered.map(item => ({
            earningLeaveId: item.earningLeaveId,
            effectivityDate: item.effectivityDate,
            day: item.day,
            earn: item.earn ?? "",
          }))
        );
      } else {
        setRows([{ day: "1", earn: "" }]);
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load Earning Leave table", "error");
    } finally {
      setLoading(false);
    }
  }, [effectivityDate]);

  useEffect(() => {
    fetchEarningLeave();
    fetchHistory();
  }, [fetchEarningLeave, fetchHistory]);

  /* ========================
     Handlers
  ========================= */

  const addRow = () => {
    setRows(prev => [
      ...prev,
      { day: String(prev.length + 1), earn: "" },
    ]);
  };

  const removeRow = () => {
    setRows(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  const checkExistingByEffectivityDate = async (date: string) => {
    const response = await fetchWithAuth(
      `${API_BASE_URL_ADMINISTRATIVE}/api/earningLeave/getBy/${toCustomFormat(date, false)}`
    );

    if (!response.ok) {
      throw new Error("Failed to validate effectivity date");
    }

    const data: EarningLeaveItem[] = await response.json();
    return data;
  };


  /* ========================
     Save (Create / Update)
  ========================= */
  const handleSave = async () => {
    try {
      if (!effectivityDate) {
        Swal.fire("Validation", "Effectivity Date is required", "warning");
        return;
      }

      if (rows.some(r => !r.day.trim() || !r.earn.trim())) {
        Swal.fire(
          "Validation",
          "Day(s) and Earned Leave cannot be empty",
          "warning"
        );
        return;
      }

      setLoading(true);

      // 🔍 CHECK EXISTING DATA FIRST
      const existingData = await checkExistingByEffectivityDate(effectivityDate);

      const isEditing = rows.some(r => r.earningLeaveId);

      // ❌ Prevent duplicate creation
      if (!isEditing && existingData.length > 0) {
        Swal.fire({
          icon: "warning",
          title: "Duplicate Effectivity Date",
          text: "Records already exist for this Effectivity Date. Please edit the existing data instead.",
        });
        return;
      }

      const payload = rows.map(row => ({
        ...row,
        effectivityDate: toCustomFormat(effectivityDate, false),
      }));

      const url = isEditing
        ? `${API_BASE_URL_ADMINISTRATIVE}/api/earningLeave/update`
        : `${API_BASE_URL_ADMINISTRATIVE}/api/earningLeave/create`;

      await fetchWithAuth(url, {
        method: isEditing ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      Swal.fire("Success", "Earning Leave saved successfully", "success");

      fetchEarningLeave();
      fetchHistory();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to save Earning Leave", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ========================
     Clear
  ========================= */
  const handleClear = async () => {
    if (!effectivityDate) return;

    const confirm = await Swal.fire({
      text: `Clear records for ${effectivityDate}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Clear",
    });

    if (!confirm.isConfirmed) {
      return;
    }

    try {
      Swal.fire("Cleared", "Records cleared successfully", "success");
      setRows([{ day: "1", earn: "" }]);

      fetchHistory();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to clear records", "error");
    }
  };

  const updateRow = (
    index: number,
    field: keyof EarningLeaveItem,
    value: string
    ) => {
    setRows(prev =>
        prev.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
        )
    );
  };

  const handleEditHistory = async (selectedDate: string) => {
    try {
      setLoading(true);

      // Use the effectivityDate from the clicked history row
      const response = await fetchWithAuth(
        `${API_BASE_URL_ADMINISTRATIVE}/api/earningLeave/getBy/${toCustomFormat(selectedDate, false)}`
      );

      if (!response.ok) throw new Error("Failed to fetch earning leave for the selected date");

      const data: EarningLeaveItem[] = await response.json();

      if (data.length > 0) {
        setEffectivityDate(selectedDate); // update date input with the selected date
        setRows(
          data.map(item => ({
            earningLeaveId: item.earningLeaveId,
            effectivityDate: item.effectivityDate,
            day: item.day,
            earn: item.earn ?? "",
          }))
        );
      } else {
        setRows([{ day: "1", earn: "" }]);
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load selected Earning Leave", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistory = async (date: string) => {
    const confirm = await Swal.fire({
      text: `Delete earning leave effective ${date}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });

    if (!confirm.isConfirmed) return;

    try {
      await fetchWithAuth(
        `${API_BASE_URL_ADMINISTRATIVE}/api/earningLeave/delete/${toCustomFormat(
          date,
          false
        )}`,
        { method: "DELETE" }
      );

      Swal.fire("Deleted", "History deleted successfully", "success");
      fetchHistory();

      if (date === effectivityDate) {
        setRows([{ day: "1", earn: "" }]);
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to delete history", "error");
    }
  };


  /* ========================
     Render
  ========================= */
  return (
    <div className={modalStyles.Modal}>
      <div className={modalStyles.modalContent}>
        <div className={modalStyles.modalHeader}>
          <h2 className={modalStyles.mainTitle}>Earning Leave Table</h2>
        </div>

        <div className={modalStyles.modalBody}>
          <div className={styles.EarningLeave}>
            <div className={styles.EarningLeaveTable}>
              <div className={styles.toolbar}>
                <button
                  className={styles.newButton}
                  onClick={handleSave}
                  disabled={loading}
                >
                  💾 Save
                </button>
                <button
                  className={styles.clearButton}
                  onClick={handleClear}
                >
                  ✖ Clear
                </button>
              </div>
              <div className={styles.effectivityDate}>
                <label>Effectivity Date</label>
                <input
                  type="date"
                  value={effectivityDate}
                  onChange={e => setEffectivityDate(e.target.value)}
                />
              </div>

              <div className={styles.tableContainer}>
                <table className={styles.earningTable}>
                  <thead>
                    <tr>
                      <th>Day(s)</th>
                      <th>Earned Leave</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr key={index}>
                        <td>
                          <input
                                type="number"
                                min="0"
                                step="0.01"
                                className={styles.earnedLeaveInput}
                                value={row.day}
                                onChange={e => updateRow(index, "day", e.target.value)}
                            />
                        </td>
                        <td>
                          <input
                                type="number"
                                min="0"
                                step="0.01"
                                className={styles.earnedLeaveInput}
                                value={row.earn}
                                onChange={e => updateRow(index, "earn", e.target.value)}
                            />
                        </td>
                      </tr>
                    ))}

                    <tr>
                      <td colSpan={2} className={styles.addTableRow}>
                        <button className={styles.myButton} onClick={addRow}>
                          + Add
                        </button>
                        &nbsp;&nbsp;&nbsp;
                        <button
                          className={styles.myButton}
                          onClick={removeRow}
                        >
                          − Remove
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>&nbsp;</div>
              <div className={styles.EarningLeaveTableHistory}>
                <h3 className={styles.historyTitle}>Earning Leave History</h3>

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

                    {history.map(item => (
                      <tr key={item.effectivityDate}>
                        <td>{item.effectivityDate}</td>
                        <td>{item.totalRows}</td>
                        <td className={styles.actionsCell}>
                          <button
                            className={`${styles.iconButton} ${styles.editIcon}`}
                            onClick={() => handleEditHistory(item.effectivityDate)}
                          >
                            <FaRegEdit />
                          </button>
                          <button
                            className={`${styles.iconButton} ${styles.deleteIcon}`}
                            onClick={() => handleDeleteHistory(item.effectivityDate)}
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