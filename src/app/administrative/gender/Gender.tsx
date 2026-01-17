"use client";

import React, { useEffect, useState, useCallback } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/Gender.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";

const API_BASE_URL_ADMINISTRATIVE =
  process.env.NEXT_PUBLIC_API_BASE_URL_ADMINISTRATIVE;

type GenderItem = {
  genderId?: number;
  code: string;
  name: string;
};

export default function Gender() {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [datas, setData] = useState<GenderItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editItem, setEditItem] = useState<GenderItem | null>(null);

  /* ------------------ Toast Helper ------------------ */
  const toast = (icon: "success" | "error", title: string) =>
    Swal.mixin({
      toast: true,
      position: "bottom-end",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    }).fire({ icon, title });

  /* ------------------ Load Data ------------------ */
  const loadGenders = useCallback(async () => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL_ADMINISTRATIVE}/api/gender/get-all`
      );

      if (!response.ok) {
        throw new Error();
      }

      const data: GenderItem[] = await response.json();
      setData(data);
    } catch {
      toast("error", "Failed to load genders");
    }
  }, []);

  useEffect(() => {
    loadGenders();
  }, [loadGenders]);

  /* ------------------ Submit ------------------ */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = { code, name };

    try {
      if (!isEditing) {
        await fetchWithAuth(
          `${API_BASE_URL_ADMINISTRATIVE}/api/gender/create`,
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );

        toast("success", "Successfully Created!");
      } else if (editItem?.genderId) {
        await fetchWithAuth(
          `${API_BASE_URL_ADMINISTRATIVE}/api/gender/update/${editItem.genderId}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );

        toast("success", "Successfully Updated!");
      }

      handleClear();
      loadGenders();
    } catch {
      toast("error", "Operation failed");
    }
  };

  /* ------------------ Clear ------------------ */
  const handleClear = () => {
    setCode("");
    setName("");
    setIsEditing(false);
    setEditItem(null);
  };

  /* ------------------ Edit ------------------ */
  const handleEdit = (item: GenderItem) => {
    setEditItem(item);
    setCode(item.code);
    setName(item.name);
    setIsEditing(true);
  };

  /* ------------------ Delete ------------------ */
  const handleDelete = (item: GenderItem) => {
    Swal.fire({
      text: `Are you sure you want to delete "${item.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    }).then(async (result) => {
      if (result.isConfirmed && item.genderId) {
        try {
          await fetchWithAuth(
            `${API_BASE_URL_ADMINISTRATIVE}/api/gender/delete/${item.genderId}`,
            { method: "DELETE" }
          );

          toast("success", "Successfully Deleted!");
          loadGenders();
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
          <h2 className={modalStyles.mainTitle}>Gender</h2>
        </div>

        <div className={modalStyles.modalBody}>
          <form className={styles.GenderForm} onSubmit={onSubmit}>
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
            <div className={styles.GenderTable}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Gender</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {datas.map((item) => (
                    <tr key={item.genderId}>
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