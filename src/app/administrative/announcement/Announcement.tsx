"use client";

import { runtimeConfig } from "@/lib/utils/runtimeConfig";
import React, { useState, useCallback, useEffect } from "react";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import styles from "@/styles/Announcement.module.scss";
import modalStyles from "@/styles/Modal.module.scss";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";

const API_BASE_URL_ADMINISTRATIVE = runtimeConfig.getApiUrl("administrative");

type Announcement = {
  announcementId?: number;
  effectivityDate: string;
  effectiveUntil: string;
  title: string;
  content: string;
};

const defaultForm: Announcement = {
  effectivityDate: "",
  effectiveUntil: "",
  title: "",
  content: "",
};

export default function Announcement() {
  const [form, setForm] = useState<Announcement>(defaultForm);
  const [arr, setArr] = useState<Announcement[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editItem, setEditItem] = useState<Announcement | null>(null);

  const toast = (icon: "success" | "error", title: string) =>
    Swal.mixin({
      toast: true,
      position: "bottom-end",
      showConfirmButton: false,
      timer: 2200,
      timerProgressBar: true,
    }).fire({ icon, title });

  const loadAnnouncements = useCallback(async () => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL_ADMINISTRATIVE}/api/announcement/get-all`
      );
      if (!response.ok) throw new Error();
      const data: Announcement[] = await response.json();
      setArr(data || []);
    } catch {
      toast("error", "Failed to load announcements");
    }
  }, []);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const handleClear = () => {
    setForm(defaultForm);
    setIsEditing(false);
    setEditItem(null);
  };

  const handleEdit = (item: Announcement) => {
    setEditItem(item);
    setIsEditing(true);
    setForm({ ...item });
  };

  const handleDelete = (item: Announcement) => {
    Swal.fire({
      text: `Are you sure you want to delete "${item.title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    }).then(async (result) => {
      if (result.isConfirmed && item.announcementId) {
        try {
          const response = await fetchWithAuth(
            `${API_BASE_URL_ADMINISTRATIVE}/api/announcement/delete/${item.announcementId}`,
            { method: "DELETE" }
          );
          if (!response.ok) throw new Error();
          toast("success", "Successfully deleted announcement");
          loadAnnouncements();
        } catch {
          toast("error", "Delete failed");
        }
      }
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!isEditing) {
        const response = await fetchWithAuth(
          `${API_BASE_URL_ADMINISTRATIVE}/api/announcement/create`,
          {
            method: "POST",
            body: JSON.stringify(form),
          }
        );
        if (!response.ok) throw new Error();
        toast("success", "Successfully created announcement");
      } else if (editItem?.announcementId) {
        const response = await fetchWithAuth(
          `${API_BASE_URL_ADMINISTRATIVE}/api/announcement/update/${editItem.announcementId}`,
          {
            method: "PUT",
            body: JSON.stringify(form),
          }
        );
        if (!response.ok) throw new Error();
        toast("success", "Successfully updated announcement");
      }
      handleClear();
      loadAnnouncements();
    } catch {
      toast("error", "Operation failed");
    }
  };

  return (
    <div className={modalStyles.Modal}>
      <div className={modalStyles.modalContent}>
        <div className={modalStyles.modalHeader}>
          <h2 className={modalStyles.mainTitle}>Announcement</h2>
        </div>

        <div className={modalStyles.modalBody}>
          <form className={styles.AnnouncementForm} onSubmit={onSubmit}>
            <div className={styles.dateRow}>
              <div className={styles.dateField}>
                <label>Effectivity Date</label>
                <input
                  type="date"
                  value={form.effectivityDate}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, effectivityDate: e.target.value }))
                  }
                  required
                />
              </div>
              <div className={styles.dateField}>
                <label>Effective Until</label>
                <input
                  type="date"
                  value={form.effectiveUntil}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, effectiveUntil: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <label>Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              required
            />

            <label>Content</label>
            <textarea
              value={form.content}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, content: e.target.value }))
              }
              required
            />

            <div className={styles.buttonGroup}>
              <div>
                <button
                  type="submit"
                  className={isEditing ? styles.updateButton : styles.saveButton}
                >
                  {isEditing ? "Update" : "Save"}
                </button>
              </div>
              <div>
                <button
                  type="button"
                  className={styles.clearButton}
                  onClick={handleClear}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>

          {arr.length > 0 && (
            <div className={styles.AnnouncementTable}>
              <div className={styles.tableHeader}>LIST OF ANNOUNCEMENT</div>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Effectivity Date</th>
                    <th>Effective Until</th>
                    <th>Title</th>
                    <th>Content</th>
                    <th>Option</th>
                  </tr>
                </thead>
                <tbody>
                  {arr.map((item) => (
                    <tr key={item.announcementId}>
                      <td>{item.effectivityDate}</td>
                      <td>{item.effectiveUntil}</td>
                      <td>{item.title}</td>
                      <td className={styles.contentCell}>{item.content}</td>
                      <td>
                        <button
                          className={`${styles.iconButton} ${styles.editIcon}`}
                          onClick={() => handleEdit(item)}
                          title="Edit"
                        >
                          <FaRegEdit />
                        </button>
                        <button
                          className={`${styles.iconButton} ${styles.deleteIcon}`}
                          onClick={() => handleDelete(item)}
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
          )}
        </div>
      </div>
    </div>
  );
}
