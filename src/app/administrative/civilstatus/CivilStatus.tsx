"use client";

import React, { useEffect, useState, useCallback } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/CivilStatus.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";

const API_BASE_URL_ADMINISTRATIVE =
  process.env.NEXT_PUBLIC_API_BASE_URL_ADMINISTRATIVE;

type CivilStatusItem = {
  civilStatusId?: number;
  code: string;
  name: string;
};

export default function CivilStatus() {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [datas, setDatas] = useState<CivilStatusItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editItem, setEditItem] = useState<CivilStatusItem | null>(null);

  /* ------------------ Toast ------------------ */
  const toast = (icon: "success" | "error", title: string) =>
    Swal.mixin({
      toast: true,
      position: "bottom-end",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    }).fire({ icon, title });

  /* ------------------ Load Data ------------------ */
  const loadCivilStatus = useCallback(async () => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL_ADMINISTRATIVE}/api/civilStatus/get-all`
      );

      if (!res.ok) throw new Error("Fetch failed");

      const data: CivilStatusItem[] = await res.json();
      setDatas(data);
    } catch {
      toast("error", "Failed to load records");
    }
  }, []);

  useEffect(() => {
    loadCivilStatus();
  }, [loadCivilStatus]);

  /* ------------------ Clear ------------------ */
  const handleClear = () => {
    setCode("");
    setName("");
    setIsEditing(false);
    setEditItem(null);
  };

  /* ------------------ Submit ------------------ */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = { code, name };

    try {
      if (!isEditing) {
        await fetchWithAuth(
          `${API_BASE_URL_ADMINISTRATIVE}/api/civilStatus/create`,
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );
        toast("success", "Successfully Created!");
      } else if (editItem?.civilStatusId) {
        await fetchWithAuth(
          `${API_BASE_URL_ADMINISTRATIVE}/api/civilStatus/update/${editItem.civilStatusId}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );
        toast("success", "Successfully Updated!");
      }

      handleClear();
      loadCivilStatus();
    } catch {
      toast("error", "Operation failed");
    }
  };

  /* ------------------ Edit ------------------ */
  const handleEdit = (item: CivilStatusItem) => {
    setEditItem(item);
    setCode(item.code);
    setName(item.name);
    setIsEditing(true);
  };

  /* ------------------ Delete ------------------ */
  const handleDelete = (item: CivilStatusItem) => {
    Swal.fire({
      text: `Are you sure you want to delete "${item.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    }).then(async (result) => {
      if (result.isConfirmed && item.civilStatusId) {
        try {
          await fetchWithAuth(
            `${API_BASE_URL_ADMINISTRATIVE}/api/civilStatus/delete/${item.civilStatusId}`,
            { method: "DELETE" }
          );
          toast("success", "Successfully Deleted!");
          loadCivilStatus();
        } catch {
          toast("error", "Delete failed");
        }
      }
    });
  };

  return (
    <div className={modalStyles.Modal}>
      <div className={modalStyles.modalContent}>
        <div className={modalStyles.modalHeader}>
          <h2 className={modalStyles.mainTitle}>Civil Status</h2>
        </div>

        <div className={modalStyles.modalBody}>
          <form className={styles.CivilStatusForm} onSubmit={onSubmit}>
            <label>Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />

            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

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

          {datas.length > 0 && (
            <div className={styles.CivilStatusTable}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {datas.map((item) => (
                    <tr key={item.civilStatusId}>
                      <td>{item.code}</td>
                      <td>{item.name}</td>
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