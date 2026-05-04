"use client";

import React, { useEffect, useState } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/Areas.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_ADMINISTRATIVE;

type AreasEntry = {
  areasId?: number;
  areasName: string;
  areasDescription: string;
};

export default function Areas() {

  const [areasName, setAreasName] = useState("");
  const [areasDescription, setAreasDescription] = useState("");

  const [areas, setAreas] = useState<AreasEntry[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const handleClear = () => {
    setAreasName("");
    setAreasDescription("");
    setIsEditing(false);
    setEditId(null);
  };

  /*
  -------------------------
  GET ALL AREAS
  -------------------------
  */

  const loadAreas = async () => {
    try {

      const res = await fetchWithAuth(`${API_BASE_URL}/api/areas/get-all`, {
        method: "GET"
      });

      if (!res.ok) throw new Error("Failed loading areas");

      const data = await res.json();
      setAreas(data);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAreas();
  }, []);

  /*
  -------------------------
  CREATE / UPDATE
  -------------------------
  */

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      areasName,
      areasDescription
    };

    try {

      if (!isEditing) {

        const res = await fetchWithAuth(`${API_BASE_URL}/api/areas/create`, {
          method: "POST",
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Create failed");

        await loadAreas();

        Swal.fire({
          toast: true,
          position: "bottom-end",
          icon: "success",
          title: "Area created",
          timer: 2000,
          showConfirmButton: false
        });

      } else {

        const res = await fetchWithAuth(`${API_BASE_URL}/api/areas/update/${editId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Update failed");

        await loadAreas();

        Swal.fire({
          toast: true,
          position: "bottom-end",
          icon: "success",
          title: "Area updated",
          timer: 2000,
          showConfirmButton: false
        });
      }

      handleClear();

    } catch (err) {
      console.error(err);
    }
  };

  /*
  -------------------------
  DELETE
  -------------------------
  */

  const handleDelete = async (id: number) => {

    const result = await Swal.fire({
      text: "Are you sure you want to delete this record?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete"
    });

    if (!result.isConfirmed) return;

    try {

      const res = await fetchWithAuth(`${API_BASE_URL}/api/areas/delete/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Delete failed");

      await loadAreas();

      Swal.fire({
        toast: true,
        position: "bottom-end",
        icon: "success",
        title: "Deleted successfully",
        timer: 2000,
        showConfirmButton: false
      });

    } catch (err) {
      console.error(err);
    }
  };

  /*
  -------------------------
  EDIT
  -------------------------
  */

  const handleEdit = (area: AreasEntry) => {
    setIsEditing(true);
    setEditId(area.areasId!);
    setAreasName(area.areasName);
    setAreasDescription(area.areasDescription);
  };

  return (
    <div className={modalStyles.Modal}>
      <div className={modalStyles.modalContent}>

        <div className={modalStyles.modalHeader}>
          <h2 className={modalStyles.mainTitle}>Areas</h2>
        </div>

        <div className={modalStyles.modalBody}>

          <form className={styles.AreasForm} onSubmit={onSubmit}>

            <label>Area Name</label>
            <input
              type="text"
              value={areasName}
              onChange={(e) => setAreasName(e.target.value)}
              required
            />

            <label>Description</label>
            <input
              type="text"
              value={areasDescription}
              onChange={(e) => setAreasDescription(e.target.value)}
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

          {areas.length > 0 && (

            <div className={styles.AreasTable}>

              <table className={styles.table}>

                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {areas.map((area) => (

                    <tr key={area.areasId}>

                      <td>{area.areasName}</td>
                      <td>{area.areasDescription}</td>

                      <td>

                        <button
                          className={`${styles.iconButton} ${styles.editIcon}`}
                          onClick={() => handleEdit(area)}
                        >
                          <FaRegEdit />
                        </button>

                        <button
                          className={`${styles.iconButton} ${styles.deleteIcon}`}
                          onClick={() => handleDelete(area.areasId!)}
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