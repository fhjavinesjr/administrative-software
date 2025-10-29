"use client";

import React from "react";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import styles from "@/styles/SalaryScheduleTrailTable.module.scss";

export default function SalaryScheduleTrailTable() {
  const data = [
    {
      createdOrModifiedBy: "HR Admin",
      effectiveDate: "01/01/2025",
    },
    {
      createdOrModifiedBy: "HR Officer",
      effectiveDate: "01/01/2024",
    },
  ];

  const handleEdit = () => {
    return;
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete this record?`)) {
      return;
    }
  };

  return (
    <div className={styles.SalaryScheduleTrailTable}>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Created / Modified By</th>
              <th>Effective Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.createdOrModifiedBy}</td>
                <td>{item.effectiveDate}</td>
                <td>
                  <button
                    className={`${styles.iconButton} ${styles.editIcon}`}
                    onClick={() => handleEdit()}
                    title="Edit"
                  >
                    <FaRegEdit />
                  </button>
                  <button
                    className={`${styles.iconButton} ${styles.deleteIcon}`}
                    onClick={() => handleDelete()}
                    title="Delete"
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
  );
}
