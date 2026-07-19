"use client";

import { localStorageUtil } from "@/lib/utils/localStorageUtil";

import { runtimeConfig } from "@/lib/utils/runtimeConfig";
import React, { useState, useEffect } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/NatureOfAppointment.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";
import Swal from "sweetalert2";

const API_BASE_URL_ADMINISTRATIVE = runtimeConfig.getApiUrl("administrative");

export default function NatureOfAppointment() {
  const canAdd = localStorageUtil.canAdd("admin.natureAppointment");
  const canEdit = localStorageUtil.canEdit("admin.natureAppointment");
  const canDelete = localStorageUtil.canDelete("admin.natureAppointment");
  type NatureAPI = {
    natureOfAppointmentId: number;
    code: string;
    nature: string;
    isContractual: boolean;
  };

  const [slct_app, setApp] = useState<NatureAPI[]>([]);
  const [code, setCode] = useState("");
  const [nature, setNature] = useState(""); // <-- updated
  const [isContractual, setIsContractual] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // LOAD DATA
  useEffect(() => {
    loadAppointmentData();
  }, []);

  const loadAppointmentData = async () => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL_ADMINISTRATIVE}/api/natureOfAppointment/get-all`,
      );
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setApp(data);
    } catch (err) {
      console.error("Failed to load:", err);
    }
  };

  // SAVE + UPDATE
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

    const payload = { code, nature, isContractual };

    try {
      if (!isEditing) {
        const res = await fetchWithAuth(
          `${API_BASE_URL_ADMINISTRATIVE}/api/natureOfAppointment/create`,
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
          text: "Nature of Appointment created successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        const res = await fetchWithAuth(
          `${API_BASE_URL_ADMINISTRATIVE}/api/natureOfAppointment/update/${editId}`,
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
          text: "Nature of Appointment updated successfully.",
          timer: 1500,
          showConfirmButton: false,
        });

        setIsEditing(false);
        setEditId(null);
      }

      await loadAppointmentData();

      // Reset form
      setCode("");
      setNature("");
      setIsContractual(false);
    } catch (err) {
      console.error("Save failed:", err);
      Swal.fire("Error", "Failed to save record.", "error");
    }
  };

  // EDIT BUTTON
  const handleEdit = (obj: NatureAPI) => {
    /* RBAC:handleEdit */

    if (!canEdit) {
      void Swal.fire({
        icon: "warning",
        title: "Permission denied",
        text: "You do not have permission to edit this record.",
      });

      return;
    }
    setEditId(obj.natureOfAppointmentId);
    setCode(obj.code);
    setNature(obj.nature); // <-- updated
    setIsContractual(obj.isContractual);
    setIsEditing(true);
  };

  // DELETE with Swal confirm
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
        `${API_BASE_URL_ADMINISTRATIVE}/api/natureOfAppointment/delete/${id}`,
        { method: "DELETE" },
      );

      if (!res.ok) throw new Error(await res.text());

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Record has been deleted.",
        timer: 1500,
        showConfirmButton: false,
      });

      await loadAppointmentData();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to delete record.", "error");
    }
  };

  const handleClear = () => {
    setCode("");
    setNature("");
    setIsContractual(false);
    setIsEditing(false);
    setEditId(null);
  };

  return (
    <div className={modalStyles.Modal}>
      <div className={modalStyles.modalContent}>
        <div className={modalStyles.modalHeader}>
          <h2 className={modalStyles.mainTitle}>Nature of Appointment</h2>
        </div>

        <div className={modalStyles.modalBody}>
          <form className={styles.NatureOfAppointment} onSubmit={onSubmit}>
            <label>Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />

            <label>Nature</label>
            <input
              type="text"
              value={nature}
              onChange={(e) => setNature(e.target.value)} // <-- updated
              required
            />

            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="isContractual"
                checked={isContractual}
                onChange={(e) => setIsContractual(e.target.checked)}
              />
              <label htmlFor="isContractual">Contractual / Non-Career</label>
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

          {slct_app.length > 0 && (
            <div className={styles.AppointmentTable}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Nature</th>
                    <th>Contractual</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {slct_app.map((item) => (
                    <tr key={item.natureOfAppointmentId}>
                      <td>{item.code}</td>
                      <td>{item.nature}</td>
                      <td>{item.isContractual ? "Yes" : "No"}</td>
                      <td>
                        <button
                          className={`${styles.iconButton} ${styles.editIcon}`}
                          onClick={() => handleEdit(item)}
                        >
                          <FaRegEdit />
                        </button>

                        <button
                          className={`${styles.iconButton} ${styles.deleteIcon}`}
                          onClick={() =>
                            handleDelete(item.natureOfAppointmentId)
                          }
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
