"use client";

import React, { useState, useEffect } from "react";
import styles from "@/styles/TimeShift.module.scss";
import modalStyles from "@/styles/Modal.module.scss";
import { authToken } from "@/lib/utils/localStorageUtil";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";
const API_BASE_URL_ADMINISTRATIVE =
  process.env.NEXT_PUBLIC_API_BASE_URL_ADMINISTRATIVE;
import to12HourFormat from "@/lib/utils/convert24To12HrFormat";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";

export default function TimeShift() {
  type TimeShift = {
    timeShiftId: number;
    tsCode: string;
    timeIn: string;
    breakOut: string;
    breakIn: string;
    timeOut: string;
  };

  const [form, setForm] = useState({
    code: "",
    timeIn: { hour: "08", minute: "00", second: "00" },
    breakOut: { hour: "12", minute: "00", second: "00" },
    breakIn: { hour: "13", minute: "00", second: "00" },
    timeOut: { hour: "17", minute: "00", second: "00" },
  });

  const [shifts, setShifts] = useState<TimeShift[]>([]); // store backend data

  const hours = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0")
  );
  const minutesSeconds = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0")
  );

  const handleChange = (
    field: "timeIn" | "breakOut" | "breakIn" | "timeOut",
    part: "hour" | "minute" | "second",
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: { ...prev[field], [part]: value },
    }));
  };

  const handleSave = async () => {
    const payload = {
      tsCode: form.code,
      timeIn: `${form.timeIn.hour}:${form.timeIn.minute}:${form.timeIn.second}`,
      breakOut: `${
        form.breakOut.hour != ""
          ? form.breakOut.hour +
            ":" +
            form.breakOut.minute +
            ":" +
            form.breakOut.second
          : ""
      }`,
      breakIn: `${
        form.breakIn.hour != ""
          ? form.breakIn.hour +
            ":" +
            form.breakIn.minute +
            ":" +
            form.breakIn.second
          : ""
      }`,
      timeOut: `${form.timeOut.hour}:${form.timeOut.minute}:${form.timeOut.second}`,
    };

    try {
      const token = authToken.get(); // get token from login

      if (!token) {
        console.error("No token found, please login first");
        return;
      }

      const method = "POST";
      const res = await fetchWithAuth(
        `${API_BASE_URL_ADMINISTRATIVE}/api/time-shift/create`,
        {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tsCode: payload.tsCode,
            timeIn: payload.timeIn,
            breakOut: payload.breakOut,
            breakIn: payload.breakIn,
            timeOut: payload.timeOut,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to save timeshift: ${res.status}`);
      }

      const saved = await res.json();
      setShifts((prev) => [...prev, saved]);
      handleClear();
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL_ADMINISTRATIVE}/api/getAll/time-shift`
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch timeshifts: ${res.status}`);
      }

      const data = await res.json();
      setShifts(data);
    } catch (err) {
      console.error("Failed to fetch timeshifts:", err);
    }
  };

  const handleClear = () => {
    setForm({
      code: "",
      timeIn: { hour: "08", minute: "00", second: "00" },
      breakOut: { hour: "12", minute: "00", second: "00" },
      breakIn: { hour: "13", minute: "00", second: "00" },
      timeOut: { hour: "17", minute: "00", second: "00" },
    });
  };

  const renderTimeSelect = (
    field: "timeIn" | "breakOut" | "breakIn" | "timeOut"
  ) => (
    <div className={styles.timeGroup}>
      <select
        className={styles.timeSelect}
        value={form[field].hour}
        onChange={(e) => handleChange(field, "hour", e.target.value)}
      >
        <option value="">--</option>
        {hours.map((h, idx) => (
          <option key={`${field}-hour-${idx}`} value={h}>
            {h}
          </option>
        ))}
      </select>
      <span className={styles.timeColon}>:</span>
      <select
        className={styles.timeSelect}
        value={form[field].minute}
        onChange={(e) => handleChange(field, "minute", e.target.value)}
      >
        <option value="">--</option>
        {minutesSeconds.map((m, idx) => (
          <option key={`${field}-minute-${idx}`} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );

  const handleDelete = async (id: number) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL_ADMINISTRATIVE}/api/time-shift/delete/${id}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      setShifts((prev) => prev.filter((s) => s.timeShiftId !== id));
    } catch (err) {
      console.error("Failed to delete shift:", err);
    }
  };

  const handleEdit = (shift: TimeShift) => {
    // ✅ pre-fill form for editing
    setForm({
      code: shift.tsCode,
      timeIn: splitTime(shift.timeIn),
      breakOut: shift.breakOut
        ? splitTime(shift.breakOut)
        : { hour: "", minute: "", second: "" },
      breakIn: shift.breakIn
        ? splitTime(shift.breakIn)
        : { hour: "", minute: "", second: "" },
      timeOut: splitTime(shift.timeOut),
    });
  };

  // helper: split "HH:mm:ss" to {hour, minute, second}
  const splitTime = (timeStr: string) => {
    const [hour, minute, second] = timeStr.split(":");
    return { hour, minute, second };
  };

  return (
    <div id="timeShiftModal" className={modalStyles.Modal}>
      <div className={modalStyles.modalContent}>
        <div className={modalStyles.modalHeader}>
          <h2 className={modalStyles.mainTitle}>Time Shift</h2>
        </div>
        <div className={modalStyles.modalBody}>
          <div className={styles.TimeShiftWrapper}>
            <div className={styles.TimeShiftForm}>
              <label>Code</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, code: e.target.value }))
                }
              />

              <label>Time In</label>
              {renderTimeSelect("timeIn")}

              <label>Break Out</label>
              {renderTimeSelect("breakOut")}

              <label>Break In</label>
              {renderTimeSelect("breakIn")}

              <label>Time Out</label>
              {renderTimeSelect("timeOut")}

              <div className={styles.buttonGroup}>
                <button
                  type="button"
                  className={styles.saveButton}
                  onClick={handleSave}
                >
                  Save
                </button>
                <button
                  type="button"
                  className={styles.clearButton}
                  onClick={handleClear}
                >
                  Clear
                </button>
              </div>
            </div>

            {shifts.length > 0 && (
              <div className={styles.DTRTable}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Time In</th>
                      <th>Break Out</th>
                      <th>Break In</th>
                      <th>Time Out</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shifts.map((shift, idx) => (
                      <tr key={shift.timeShiftId ?? `row-${idx}`}>
                        <td>{shift.tsCode}</td>
                        <td>{to12HourFormat(shift.timeIn)}</td>
                        <td>
                          {shift.breakOut
                            ? to12HourFormat(shift.breakOut)
                            : "-"}
                        </td>
                        <td>
                          {shift.breakIn ? to12HourFormat(shift.breakIn) : "-"}
                        </td>
                        <td>{to12HourFormat(shift.timeOut)}</td>
                        <td className={styles.actionsCell}>
                          <button
                            className={`${styles.iconButton} ${styles.editIcon}`}
                            onClick={() => handleEdit(shift)}
                            title="Edit"
                          >
                            <FaRegEdit />
                          </button>
                          <button
                            className={`${styles.iconButton} ${styles.deleteIcon}`}
                            onClick={() => handleDelete(shift.timeShiftId)}
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
    </div>
  );
}
