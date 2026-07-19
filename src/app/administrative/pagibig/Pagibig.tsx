"use client";

import { localStorageUtil } from "@/lib/utils/localStorageUtil";

import { runtimeConfig } from "@/lib/utils/runtimeConfig";
import React, { useState, useEffect } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/PagIbig.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";
import { toCustomFormat, toDateInputValue } from "@/lib/utils/dateFormatUtils";
import Swal from "sweetalert2";

const API_BASE_URL_ADMINISTRATIVE = runtimeConfig.getApiUrl("administrative");

export default function Pagibig() {
  const canAdd = localStorageUtil.canAdd("admin.pagibig");
  const canEdit = localStorageUtil.canEdit("admin.pagibig");
  const canDelete = localStorageUtil.canDelete("admin.pagibig");
  type PagibigItem = {
    pagIbigContributionId: number;
    effectivityDate: string;
    employeeShare: number;
    employerShare: number;
  };

  const [data, setData] = useState<PagibigItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [effectivityDate, setEffectivityDate] = useState("");
  const [employeeShare, setEmployeeShare] = useState("");
  const [employerShare, setEmployerShare] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL_ADMINISTRATIVE}/api/pagibigContribution/get-all`,
      );
      if (!res.ok) throw new Error(await res.text());
      setData(await res.json());
    } catch (err) {
      console.error("Failed to load Pag-IBIG data:", err);
      Swal.fire("Error", "Failed to load Pag-IBIG contribution data.", "error");
    } finally {
      setLoading(false);
    }
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
    if (!effectivityDate || !employeeShare || !employerShare) {
      Swal.fire("Validation Error", "All fields are required.", "warning");
      return;
    }

    const payload = {
      effectivityDate: toCustomFormat(effectivityDate, false),
      employeeShare: parseFloat(employeeShare),
      employerShare: parseFloat(employerShare),
    };

    try {
      if (!isEditing) {
        const res = await fetchWithAuth(
          `${API_BASE_URL_ADMINISTRATIVE}/api/pagibigContribution/create`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
        if (!res.ok) throw new Error(await res.text());
        Swal.fire({
          icon: "success",
          title: "Saved!",
          text: "Pag-IBIG contribution created.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        const confirm = await Swal.fire({
          icon: "question",
          title: "Update Record?",
          text: "Are you sure you want to update this record?",
          showCancelButton: true,
          confirmButtonText: "Yes, update it!",
        });
        if (!confirm.isConfirmed) return;
        const res = await fetchWithAuth(
          `${API_BASE_URL_ADMINISTRATIVE}/api/pagibigContribution/update/${editId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
        if (!res.ok) throw new Error(await res.text());
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Pag-IBIG contribution updated.",
          timer: 1500,
          showConfirmButton: false,
        });
        setIsEditing(false);
        setEditId(null);
      }
      await loadData();
      handleClear();
    } catch (err) {
      console.error("Save failed:", err);
      Swal.fire("Error", "Failed to save record.", "error");
    }
  };

  const handleEdit = (item: PagibigItem) => {
    /* RBAC:handleEdit */

    if (!canEdit) {
      void Swal.fire({
        icon: "warning",
        title: "Permission denied",
        text: "You do not have permission to edit this record.",
      });

      return;
    }
    setEditId(item.pagIbigContributionId);
    setEffectivityDate(toDateInputValue(item.effectivityDate));
    setEmployeeShare(String(item.employeeShare));
    setEmployerShare(String(item.employerShare));
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    /* RBAC:handleDelete */

    if (!canDelete) {
      void Swal.fire({
        icon: "warning",
        title: "Permission denied",
        text: "You do not have permission to delete this record.",
      });

      return;
    }
    const result = await Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: "This action cannot be undone.",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL_ADMINISTRATIVE}/api/pagibigContribution/delete/${id}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error(await res.text());
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        timer: 1500,
        showConfirmButton: false,
      });
      await loadData();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to delete record.", "error");
    }
  };

  const handleClear = () => {
    setEffectivityDate("");
    setEmployeeShare("");
    setEmployerShare("");
    setIsEditing(false);
    setEditId(null);
  };

  return (
    <div className={modalStyles.Modal}>
      <div className={modalStyles.modalContent}>
        <div className={modalStyles.modalHeader}>
          <h2 className={modalStyles.mainTitle}>
            Pag-IBIG (HDMF) Mandatory Contribution
          </h2>
        </div>
        <div className={modalStyles.modalBody}>
          <form className={styles.PagibigForm} onSubmit={onSubmit}>
            <label>Effectivity Date</label>
            <input
              type="date"
              value={effectivityDate}
              onChange={(e) => setEffectivityDate(e.target.value)}
              required
            />

            <label className={styles.empLabel}>Employee Share ({"₱"})</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={employeeShare}
              onChange={(e) => setEmployeeShare(e.target.value)}
              placeholder="e.g. 100"
              required
            />

            <label className={styles.empLabel}>Employer Share ({"₱"})</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={employerShare}
              onChange={(e) => setEmployerShare(e.target.value)}
              placeholder="e.g. 100"
              required
            />

            <div className={styles.buttonGroup}>
              <button
                type="submit"
                className={isEditing ? styles.updateButton : styles.saveButton}
                disabled={loading}
              >
                {isEditing ? "Update" : "Save"}
              </button>
              <button
                type="button"
                className={styles.clearButton}
                onClick={handleClear}
                disabled={loading}
              >
                Clear
              </button>
            </div>
          </form>

          {data.length > 0 && (
            <div>
              <h4 className={styles.tableHeader}>
                PAG-IBIG MANDATORY CONTRIBUTION SCHEDULE
              </h4>
              <div className={styles.PagibigTable}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Effectivity Date</th>
                      <th>Employee Share ({"₱"})</th>
                      <th>Employer Share ({"₱"})</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item) => (
                      <tr key={item.pagIbigContributionId}>
                        <td>{item.effectivityDate}</td>
                        <td>
                          {item.employeeShare.toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td>
                          {item.employerShare.toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td>
                          <button
                            className={`${styles.iconButton} ${styles.editIcon}`}
                            onClick={() => handleEdit(item)}
                            title="Edit"
                            disabled={loading}
                          >
                            <FaRegEdit />
                          </button>
                          <button
                            className={`${styles.iconButton} ${styles.deleteIcon}`}
                            onClick={() =>
                              handleDelete(item.pagIbigContributionId)
                            }
                            title="Delete"
                            disabled={loading}
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
          )}
        </div>
      </div>
    </div>
  );
}
