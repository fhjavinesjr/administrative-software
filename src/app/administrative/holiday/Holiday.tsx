"use client";

import React, { useEffect, useState, useCallback } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/Holiday.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";

const API_BASE_URL_ADMINISTRATIVE =
  process.env.NEXT_PUBLIC_API_BASE_URL_ADMINISTRATIVE;

type Holiday = {
  holidayId?: number;
  code: string;
  name: string;
  holidayDate: string;
  observedDate: string;
  holidayType: string;
  holidayScope: string;
  localityCode: string;
  sourceReference: string;
  withPay: boolean;
  isWorkingHoliday: boolean;
  isActive: boolean;
};

const HOLIDAY_TYPES = [
  "REGULAR",
  "SPECIAL_NON_WORKING",
  "SPECIAL_WORKING",
  "LOCAL",
  "AGENCY_DECLARED",
];

const HOLIDAY_SCOPES = ["NATIONAL", "REGIONAL", "PROVINCIAL", "CITY", "AGENCY"];

const toInputDate = (value?: string) => {
  if (!value) return "";
  const parts = value.split("-");
  if (parts.length === 3) {
    return `${parts[2]}-${parts[0]}-${parts[1]}`;
  }
  return value;
};

const toBackendDate = (value?: string) => {
  if (!value) return "";
  const parts = value.split("-");
  if (parts.length === 3) {
    return `${parts[1]}-${parts[2]}-${parts[0]}`;
  }
  return value;
};

export default function HolidayModule() {
  const [arr, setArr] = useState<Holiday[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editItem, setEditItem] = useState<Holiday | null>(null);

  const [form, setForm] = useState<Holiday>({
    code: "",
    name: "",
    holidayDate: "",
    observedDate: "",
    holidayType: "REGULAR",
    holidayScope: "NATIONAL",
    localityCode: "",
    sourceReference: "",
    withPay: true,
    isWorkingHoliday: false,
    isActive: true,
  });

  const toast = (icon: "success" | "error", title: string) =>
    Swal.mixin({
      toast: true,
      position: "bottom-end",
      showConfirmButton: false,
      timer: 2200,
      timerProgressBar: true,
    }).fire({ icon, title });

  const loadHolidays = useCallback(async () => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL_ADMINISTRATIVE}/api/holiday/get-all`
      );

      if (!response.ok) {
        throw new Error();
      }

      const data: Holiday[] = await response.json();
      setArr(data || []);
    } catch {
      toast("error", "Failed to load holidays");
    }
  }, []);

  useEffect(() => {
    loadHolidays();
  }, [loadHolidays]);

  const handleClear = () => {
    setForm({
      code: "",
      name: "",
      holidayDate: "",
      observedDate: "",
      holidayType: "REGULAR",
      holidayScope: "NATIONAL",
      localityCode: "",
      sourceReference: "",
      withPay: true,
      isWorkingHoliday: false,
      isActive: true,
    });
    setIsEditing(false);
    setEditItem(null);
  };

  const handleEdit = (item: Holiday) => {
    setEditItem(item);
    setIsEditing(true);
    setForm({
      ...item,
      holidayDate: toInputDate(item.holidayDate),
      observedDate: toInputDate(item.observedDate),
    });
  };

  const handleDelete = (item: Holiday) => {
    Swal.fire({
      text: `Are you sure you want to delete "${item.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    }).then(async (result) => {
      if (result.isConfirmed && item.holidayId) {
        try {
          const response = await fetchWithAuth(
            `${API_BASE_URL_ADMINISTRATIVE}/api/holiday/delete/${item.holidayId}`,
            { method: "DELETE" }
          );

          if (!response.ok) {
            throw new Error();
          }

          toast("success", "Successfully deleted holiday");
          loadHolidays();
        } catch {
          toast("error", "Delete failed");
        }
      }
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...form,
      holidayDate: toBackendDate(form.holidayDate),
      observedDate: form.observedDate ? toBackendDate(form.observedDate) : null,
      localityCode: form.localityCode || null,
      sourceReference: form.sourceReference || null,
    };

    try {
      if (!isEditing) {
        const response = await fetchWithAuth(
          `${API_BASE_URL_ADMINISTRATIVE}/api/holiday/create`,
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          throw new Error();
        }

        toast("success", "Successfully created holiday");
      } else if (editItem?.holidayId) {
        const response = await fetchWithAuth(
          `${API_BASE_URL_ADMINISTRATIVE}/api/holiday/update/${editItem.holidayId}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          throw new Error();
        }

        toast("success", "Successfully updated holiday");
      }

      handleClear();
      loadHolidays();
    } catch {
      toast("error", "Operation failed");
    }
  };

  return (
    <div className={modalStyles.Modal}>
      <div className={modalStyles.modalContent}>
        <div className={modalStyles.modalHeader}>
          <h2 className={modalStyles.mainTitle}>Holiday Calendar</h2>
        </div>

        <div className={modalStyles.modalBody}>
          <form className={styles.HolidayForm} onSubmit={onSubmit}>
            <label>Holiday Code</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
              required
            />

            <label>Holiday Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />

            <label>Holiday Date</label>
            <input
              type="date"
              value={form.holidayDate}
              onChange={(e) => setForm((prev) => ({ ...prev, holidayDate: e.target.value }))}
              required
            />

            <label>Observed Date</label>
            <input
              type="date"
              value={form.observedDate || ""}
              onChange={(e) => setForm((prev) => ({ ...prev, observedDate: e.target.value }))}
            />

            <label>Holiday Type</label>
            <select
              value={form.holidayType}
              onChange={(e) => setForm((prev) => ({ ...prev, holidayType: e.target.value }))}
              required
            >
              {HOLIDAY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.replaceAll("_", " ")}
                </option>
              ))}
            </select>

            <label>Scope</label>
            <select
              value={form.holidayScope}
              onChange={(e) => setForm((prev) => ({ ...prev, holidayScope: e.target.value }))}
              required
            >
              {HOLIDAY_SCOPES.map((scope) => (
                <option key={scope} value={scope}>
                  {scope}
                </option>
              ))}
            </select>

            <label>Locality Code (optional)</label>
            <input
              type="text"
              value={form.localityCode}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, localityCode: e.target.value }))
              }
            />

            <label>Source Reference (CSC/Proclamation)</label>
            <input
              type="text"
              value={form.sourceReference}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, sourceReference: e.target.value }))
              }
            />

            <div className={styles.checkGroup}>
              <label>
                <input
                  type="checkbox"
                  checked={form.withPay}
                  onChange={(e) => setForm((prev) => ({ ...prev, withPay: e.target.checked }))}
                />
                With Pay
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={form.isWorkingHoliday}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, isWorkingHoliday: e.target.checked }))
                  }
                />
                Working Holiday
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                />
                Active
              </label>
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="submit"
                className={isEditing ? styles.updateButton : styles.saveButton}
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

          {arr.length > 0 && (
            <div className={styles.HolidayTable}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Date</th>
                    <th>Observed</th>
                    <th>Type</th>
                    <th>Scope</th>
                    <th>With Pay</th>
                    <th>Working</th>
                    <th>Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {arr.map((item) => (
                    <tr key={item.holidayId}>
                      <td>{item.code}</td>
                      <td>{item.name}</td>
                      <td>{item.holidayDate}</td>
                      <td>{item.observedDate || "-"}</td>
                      <td>{item.holidayType?.replaceAll("_", " ")}</td>
                      <td>{item.holidayScope}</td>
                      <td>{item.withPay ? "Yes" : "No"}</td>
                      <td>{item.isWorkingHoliday ? "Yes" : "No"}</td>
                      <td>{item.isActive ? "Yes" : "No"}</td>
                      <td>
                        <button
                          className={`${styles.iconButton} ${styles.editIcon}`}
                          onClick={() => handleEdit(item)}
                        >
                          <FaRegEdit />
                        </button>
                        <button
                          className={`${styles.iconButton} ${styles.deleteIcon}`}
                          onClick={() => handleDelete(item)}
                        >
                          <FaTrashAlt />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
