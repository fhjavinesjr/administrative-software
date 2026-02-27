"use client";

import React, { useEffect, useState } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/BusinessUnits.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_ADMINISTRATIVE;

type Area = {
  areasId: number;
  areasName: string;
  areasDescription: string;
};

// Aligned with BusinessUnitsDTO.java
type BusinessUnit = {
  businessUnitsId?: number;
  businessUnitsCode: string; // Updated from description
  businessUnitsName: string;
  areasId: number;
};

export default function BusinessUnit() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);

  // State variables aligned with your Java Entity field names
  const [buName, setBuName] = useState("");
  const [buCode, setBuCode] = useState("");
  const [selectedArea, setSelectedArea] = useState<number | "">("");

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const handleClear = () => {
    setBuName("");
    setBuCode("");
    setSelectedArea("");
    setIsEditing(false);
    setEditId(null);
  };

  const loadAreas = async () => {
    const res = await fetchWithAuth(`${API_BASE_URL}/api/areas/get-all`, { method: "GET" });
    const data = await res.json();
    setAreas(data);
  };

  const loadBusinessUnits = async () => {
    const res = await fetchWithAuth(`${API_BASE_URL}/api/businessUnits/get-all`, { method: "GET" });
    const data = await res.json();
    setBusinessUnits(data);
  };

  useEffect(() => {
    loadAreas();
    loadBusinessUnits();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // This payload matches the structure of BusinessUnitsDTO.java
    const payload = {
      businessUnitsName: buName,
      businessUnitsCode: buCode,
      areasId: selectedArea,
    };

    try {
      const url = isEditing 
        ? `${API_BASE_URL}/api/businessUnits/update/${editId}` 
        : `${API_BASE_URL}/api/businessUnits/create`;
      
      const method = isEditing ? "PUT" : "POST";

      const res = await fetchWithAuth(url, {
        method: method,
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      Swal.fire({
        toast: true,
        position: "bottom-end",
        icon: "success",
        title: isEditing ? "Updated Successfully" : "Created Successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      loadBusinessUnits();
      handleClear();
    } catch {
      Swal.fire("Error", "Operation failed", "error");
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      text: "Are you sure you want to delete this record?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    await fetchWithAuth(`${API_BASE_URL}/api/businessUnits/delete/${id}`, { method: "DELETE" });
    loadBusinessUnits();
  };

  const handleEdit = (bu: BusinessUnit) => {
    setIsEditing(true);
    setEditId(bu.businessUnitsId!);
    setBuName(bu.businessUnitsName);
    setBuCode(bu.businessUnitsCode);
    setSelectedArea(bu.areasId);
  };

  const getAreaName = (areaId: number) => {
    const area = areas.find(a => a.areasId === areaId);
    return area ? area.areasName : "N/A";
  };

  return (
    <div className={modalStyles.Modal}>
      <div className={modalStyles.modalContent}>
        <div className={modalStyles.modalHeader}>
          <h2 className={modalStyles.mainTitle}>Business Units Management</h2>
        </div>

        <div className={modalStyles.modalBody}>
          <form className={styles.BusinessUnitsForm} onSubmit={onSubmit}>
            <label>Select Area</label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(Number(e.target.value))}
              required
            >
              <option value="">Choose an Area</option>
              {areas.map((area) => (
                <option key={area.areasId} value={area.areasId}>
                  {area.areasName}
                </option>
              ))}
            </select>

            <label>Business Unit Code</label>
            <input
              type="text"
              value={buCode}
              onChange={(e) => setBuCode(e.target.value)}
              required
              placeholder="e.g. BU-2024"
            />

            <label>Business Unit Name</label>
            <input
              type="text"
              value={buName}
              onChange={(e) => setBuName(e.target.value)}
              required
              placeholder="Enter Name"
            />

            <div className={styles.buttonGroup}>
              <button type="submit" className={isEditing ? styles.updateButton : styles.saveButton}>
                {isEditing ? "Update" : "Save"}
              </button>
              <button type="button" className={styles.clearButton} onClick={handleClear}>
                Clear
              </button>
            </div>
          </form>

          {businessUnits.length > 0 && (
            <div className={styles.BusinessUnitsTable}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Area</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {businessUnits.map((bu) => (
                    <tr key={bu.businessUnitsId}>
                      <td>{bu.businessUnitsCode}</td>
                      <td>{bu.businessUnitsName}</td>
                      <td>{getAreaName(bu.areasId)}</td>
                      <td>
                        <button className={`${styles.iconButton} ${styles.editIcon}`} onClick={() => handleEdit(bu)}>
                          <FaRegEdit />
                        </button>
                        <button className={`${styles.iconButton} ${styles.deleteIcon}`} onClick={() => handleDelete(bu.businessUnitsId!)}>
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