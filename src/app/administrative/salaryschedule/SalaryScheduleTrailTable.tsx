"use client";

import React, { useEffect, useState } from "react";
import styles from "@/styles/SalaryScheduleTrailTable.module.scss";
const API_BASE_URL_ADMINISTRATIVE = process.env.NEXT_PUBLIC_API_BASE_URL_ADMINISTRATIVE;
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";
import Swal from "sweetalert2";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import type { SalaryScheduleItem } from "@/lib/types/SalaryScheduleItem";

type AuditRow = {
  id?: string;
  effectivityDate?: string | null;
  nbcNo?: string | null;
  nbcDate?: string | null;
  eoNo?: string | null;
  eoDate?: string | null;
  items?: SalaryScheduleItem[]; // array of SalaryScheduleItem
  createdAt?: string | null;
};

type Props = {
  onSelect: (payload: {
    effectivityDate: string;
    nbcNo: string;
    nbcDate: string;
    eoNo: string;
    eoDate: string;
    items?: AuditRow["items"];
  }) => void;
};

type FetchedSalarySchedule = SalaryScheduleItem & { createdAt?: string | null };

export default function SalaryScheduleTrailTable({ onSelect }: Props) {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAudit = async () => {
    setLoading(true);
    try {
      // fetch full list from backend
      const url = `${API_BASE_URL_ADMINISTRATIVE}/api/salary-schedule/get-all`;
      const res = await fetchWithAuth(url);
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = (await res.json()) as FetchedSalarySchedule[];

      // Group by metadata so UI shows distinct audit rows
      // key: combination of effectivityDate|nbcNo|eoNo (adjust if you need different grouping)
      const groups = new Map<
        string,
        {
          effectivityDate?: string | null;
          nbcNo?: string | null;
          nbcDate?: string | null;
          eoNo?: string | null;
          eoDate?: string | null;
          createdAt?: string | null;
          items: SalaryScheduleItem[];
        }
      >();

      data.forEach((it) => {
        const key = `${it.effectivityDate ?? ""}|${it.nbcNo ?? ""}|${it.eoNo ?? ""}`;
        const entry = groups.get(key);
        const createdAt = it.createdAt ?? null;
        if (!entry) {
          groups.set(key, {
            effectivityDate: it.effectivityDate ?? null,
            nbcNo: it.nbcNo ?? null,
            nbcDate: it.nbcDate ?? null,
            eoNo: it.eoNo ?? null,
            eoDate: it.eoDate ?? null,
            createdAt: createdAt,
            items: [{ ...it }],
          });
        } else {
          entry.items.push({ ...it });
          // keep latest createdAt if present
          if (createdAt && (!entry.createdAt || createdAt > entry.createdAt)) {
            entry.createdAt = createdAt;
          }
        }
      });

      // convert groups map into rows array
      const result: AuditRow[] = Array.from(groups.values()).map((g, idx) => ({
        id: `${g.effectivityDate ?? "no-date"}_${idx}`,
        effectivityDate: g.effectivityDate ?? null,
        nbcNo: g.nbcNo ?? null,
        nbcDate: g.nbcDate ?? null,
        eoNo: g.eoNo ?? null,
        eoDate: g.eoDate ?? null,
        createdAt: g.createdAt ?? null,
        items: g.items,
      }));

      // sort rows by effectivityDate (newest first) if effectivityDate exists
      result.sort((a, b) => {
        if (!a.effectivityDate && !b.effectivityDate) return 0;
        if (!a.effectivityDate) return 1;
        if (!b.effectivityDate) return -1;
        return new Date(b.effectivityDate).getTime() - new Date(a.effectivityDate).getTime();
      });

      setRows(result);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to load audit",
        text: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, []);

  const handleEdit = async (row: AuditRow) => {
    try {
      // if group already has items, forward them
      if (row.items && row.items.length > 0) {
        onSelect({
          effectivityDate: row.effectivityDate || "",
          nbcNo: row.nbcNo || "",
          nbcDate: row.nbcDate || "",
          eoNo: row.eoNo || "",
          eoDate: row.eoDate || "",
          items: row.items,
        });
        return;
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to load record",
        text: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const handleDelete = async (row: AuditRow) => {
    // backend expects effectivityDate (LocalDateTime) as the path variable
    const effectivityDate = row.effectivityDate;
    if (!effectivityDate) {
      Swal.fire({
        icon: "error",
        title: "Cannot delete",
        text: "Effectivity date not available for this record.",
      });
      return;
    }

    const confirmed = await Swal.fire({
      title: "Delete salary schedule?",
      text: `Are you sure you want to delete the salary schedule (effectivity date: ${effectivityDate})?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });
    if (!confirmed.isConfirmed) {
      return;
    }

    try {
      // URL-encode the date string so slashes/spaces are safe in the path
      const encoded = encodeURIComponent(effectivityDate);
      const url = `${API_BASE_URL_ADMINISTRATIVE}/api/salary-schedule/delete/${encoded}`;
      const res = await fetchWithAuth(url, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      Swal.fire({ icon: "success", title: "Deleted" });
      await fetchAudit();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: err instanceof Error ? err.message : String(err),
      });
    }
  };

  return (
    <div className={styles.SalaryScheduleTrailTable}>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Effective Date</th>
                <th>NBC No</th>
                <th>EO No</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center" }}>
                    No records found
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => (
                  <tr key={r.id ?? idx}>
                    <td>{r.effectivityDate ?? "-"}</td>
                    <td>{r.nbcNo ?? "-"}</td>
                    <td>{r.eoNo ?? "-"}</td>
                    <td>
                      <button
                        className={`${styles.iconButton} ${styles.editIcon}`}
                        onClick={() => handleEdit(r)}
                        title="Edit"
                      >
                        <FaRegEdit />
                      </button>
                      <button
                        className={`${styles.iconButton} ${styles.deleteIcon}`}
                        onClick={() => handleDelete(r)}
                        title="Delete"
                      >
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}