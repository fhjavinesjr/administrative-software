"use client";

import { localStorageUtil } from "@/lib/utils/localStorageUtil";

import React, { useState, useEffect, useCallback } from "react";
import styles from "@/styles/SystemConfig.module.scss";
import Swal from "sweetalert2";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";
import { runtimeConfig } from "@/lib/utils/runtimeConfig";

type SystemConfigEntry = {
  configKey: string;
  configValue: string;
  description: string;
  category: string;
  editable: boolean;
};

export default function SystemConfig() {
  const canEdit = localStorageUtil.canEdit("admin.technicalSettings");
  const [configs, setConfigs] = useState<SystemConfigEntry[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = runtimeConfig.getApiUrl("administrative");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/api/system-config/get-all`,
      );
      if (!res.ok) throw new Error("Failed to load system config");
      const data: SystemConfigEntry[] = await res.json();
      setConfigs(data);
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error",
        text: "Failed to load system configuration.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    load();
  }, [load]);

  const startEdit = (entry: SystemConfigEntry) => {
    /* RBAC:startEdit */

    if (!canEdit) {
      void Swal.fire({
        icon: "warning",
        title: "Permission denied",
        text: "You do not have permission to edit this record.",
      });

      return;
    }
    setEditingKey(entry.configKey);
    setEditValue(entry.configValue);
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditValue("");
  };

  const saveEdit = async (configKey: string) => {
    /* RBAC:saveEdit */

    if (!canEdit) {
      void Swal.fire({
        icon: "warning",
        title: "Permission denied",
        text: "You do not have permission to edit this record.",
      });

      return;
    }
    if (!editValue.trim()) {
      Swal.fire({
        title: "Validation",
        text: "Value cannot be empty.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Save Configuration",
      text: `Update "${configKey}" to "${editValue.trim()}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Save",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/api/system-config/update/${encodeURIComponent(configKey)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ configValue: editValue.trim() }),
        },
      );

      if (!res.ok) throw new Error("Update failed");

      Swal.fire({
        title: "Saved",
        text: "Configuration updated. Changes will take effect on next login or page refresh.",
        icon: "success",
        confirmButtonText: "OK",
      });
      setEditingKey(null);
      setEditValue("");
      await load();
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error",
        text: "Failed to update configuration.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  // Group configs by category
  const grouped = configs.reduce<Record<string, SystemConfigEntry[]>>(
    (acc, cfg) => {
      const cat = cfg.category || "General";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(cfg);
      return acc;
    },
    {},
  );

  const categoryOrder = ["API Endpoints", "Security", "UI Navigation"];
  const sortedCategories = [
    ...categoryOrder.filter((c) => grouped[c]),
    ...Object.keys(grouped).filter((c) => !categoryOrder.includes(c)),
  ];

  if (loading) {
    return (
      <div className={styles.loadingText}>Loading system configuration...</div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <h2 className={styles.pageTitle}>Technical / System Settings</h2>
        <p className={styles.pageSubtitle}>
          Manage backend API endpoints, security settings, and UI navigation
          URLs. Changes take effect on the next login or page refresh.
        </p>
      </div>

      {sortedCategories.map((category) => (
        <div key={category} className={styles.categorySection}>
          <h3 className={styles.categoryTitle}>{category}</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.configTable}>
              <thead>
                <tr>
                  <th className={styles.colKey}>Configuration Key</th>
                  <th className={styles.colDesc}>Description</th>
                  <th className={styles.colValue}>Current Value</th>
                  <th className={styles.colAction}>Action</th>
                </tr>
              </thead>
              <tbody>
                {grouped[category].map((cfg) => (
                  <tr
                    key={cfg.configKey}
                    className={
                      editingKey === cfg.configKey ? styles.rowEditing : ""
                    }
                  >
                    <td className={styles.keyCell}>
                      <code className={styles.keyCode}>{cfg.configKey}</code>
                    </td>
                    <td className={styles.descCell}>{cfg.description}</td>
                    <td className={styles.valueCell}>
                      {editingKey === cfg.configKey ? (
                        <input
                          className={styles.editInput}
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit(cfg.configKey);
                            if (e.key === "Escape") cancelEdit();
                          }}
                          autoFocus
                        />
                      ) : (
                        <span className={styles.valueText}>
                          {cfg.configValue}
                        </span>
                      )}
                    </td>
                    <td className={styles.actionCell}>
                      {cfg.editable ? (
                        editingKey === cfg.configKey ? (
                          <div className={styles.editActions}>
                            <button
                              className={styles.saveBtn}
                              onClick={() => saveEdit(cfg.configKey)}
                              disabled={!canEdit}
                            >
                              Save
                            </button>
                            <button
                              className={styles.cancelBtn}
                              onClick={cancelEdit}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            className={styles.editBtn}
                            onClick={() => startEdit(cfg)}
                            disabled={!canEdit}
                          >
                            Edit
                          </button>
                        )
                      ) : (
                        <span className={styles.readonlyBadge}>Read-only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
