"use client";

import React, { useEffect, useState, useCallback } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/Leave.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";

const API_BASE_URL_ADMINISTRATIVE =
  process.env.NEXT_PUBLIC_API_BASE_URL_ADMINISTRATIVE;

type LeaveType = {
  leaveTypesId?: number;
  code: string;
  name: string;
};

export default function LeaveTypes() {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [arr, setArr] = useState<LeaveType[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editItem, setEditItem] = useState<LeaveType | null>(null);

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
  const loadLeaveTypes = useCallback(async () => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL_ADMINISTRATIVE}/api/leaveTypes/get-all`
      );

      if (!response.ok) {
        throw new Error();
      }

      const data: LeaveType[] = await response.json();
      setArr(data);
    } catch {
      toast("error", "Failed to load leave types");
    }
  }, []);

  useEffect(() => {
    loadLeaveTypes();
  }, [loadLeaveTypes]);

  /* ------------------ Submit ------------------ */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = { code, name };

    try {
      if (!isEditing) {
        await fetchWithAuth(
          `${API_BASE_URL_ADMINISTRATIVE}/api/leaveTypes/create`,
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );

        toast("success", "Successfully Created!");
      } else if (editItem?.leaveTypesId) {
        await fetchWithAuth(
          `${API_BASE_URL_ADMINISTRATIVE}/api/leaveTypes/update/${editItem.leaveTypesId}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );

        toast("success", "Successfully Updated!");
      }

      handleClear();
      loadLeaveTypes();
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
  const handleEdit = (item: LeaveType) => {
    setEditItem(item);
    setCode(item.code);
    setName(item.name);
    setIsEditing(true);
  };

  /* ------------------ Delete ------------------ */
  const handleDelete = (item: LeaveType) => {
    Swal.fire({
      text: `Are you sure you want to delete "${item.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    }).then(async (result) => {
      if (result.isConfirmed && item.leaveTypesId) {
        try {
          await fetchWithAuth(
            `${API_BASE_URL_ADMINISTRATIVE}/api/leaveTypes/delete/${item.leaveTypesId}`,
            { method: "DELETE" }
          );

          toast("success", "Successfully Deleted!");
          loadLeaveTypes();
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
          <h2 className={modalStyles.mainTitle}>Leave</h2>
        </div>

        <div className={modalStyles.modalBody}>
          <form className={styles.LeaveForm} onSubmit={onSubmit}>
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

          {arr.length > 0 && (
            <div className={styles.LeaveTable}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Leave Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {arr.map((item) => (
                    <tr key={item.leaveTypesId}>
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