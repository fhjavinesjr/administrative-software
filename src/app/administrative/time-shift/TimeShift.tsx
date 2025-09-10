"use client";

import React, { useState, useEffect } from "react";
import React, { useState, useEffect } from "react";
import styles from "@/styles/TimeShift.module.scss";
import modalStyles from "@/styles/Modal.module.scss";
import { authToken } from "@/pages/api/authToken";
import { fetchWithAuth } from "@/pages/api/fetchWithAuth";
import { authToken } from "@/pages/api/authToken";
import { fetchWithAuth } from "@/pages/api/fetchWithAuth";

export default function TimeShift() {

type TimeShift = {
  timeShiftId: number;
  timeIn: string;
  breakOut: string;
  breakIn: string;
  timeOut: string;
}

  const [form, setForm] = useState({
    code: "",
    timeIn: { hour: "01", minute: "00", second: "00" },
    breakOut: { hour: "01", minute: "00", second: "00" },
    breakIn: { hour: "01", minute: "00", second: "00" },
    timeOut: { hour: "01", minute: "00", second: "00" },
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
      breakOut: `${form.breakOut.hour}:${form.breakOut.minute}:${form.breakOut.second}`,
      breakIn: `${form.breakIn.hour}:${form.breakIn.minute}:${form.breakIn.second}`,
      timeOut: `${form.timeOut.hour}:${form.timeOut.minute}:${form.timeOut.second}`,
    };

    try {
      const token = authToken.get(); // get token from login

      if (!token) {
        console.error("No token found, please login first");
        return;
      }

     const method = "POST";
     const res = await fetchWithAuth('http://localhost:8083/api/time-shift/create', {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tsCode: payload.tsCode,
          timeIn: payload.timeIn,
          breakOut: payload.breakOut,
          breakIn: payload.breakIn,
          timeOut: payload.timeOut,
        }),
      });

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
    const fetchShifts = async () => {
      try {
        const token = authToken.get();
        if (!token) {
          console.error("No token found, please login first");
          return;
        }

        const res = await fetch("http://localhost:8083/api/timeshifts", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch timeshifts: ${res.status}`);
        }

        const data = await res.json();
        setShifts(data);
      } catch (err) {
        console.error("Failed to fetch timeshifts:", err);
      }
    };

    fetchShifts();
  }, []);

  const handleClear = () => {
    setForm({
      code: "",
      timeIn: { hour: "01", minute: "00", second: "00" },
      breakOut: { hour: "01", minute: "00", second: "00" },
      breakIn: { hour: "01", minute: "00", second: "00" },
      timeOut: { hour: "01", minute: "00", second: "00" },
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
        {hours.map((h) => (
          <option key={h} value={h}>
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
        {minutesSeconds.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <span className={styles.timeColon}>:</span>
      <select
        className={styles.timeSelect}
        value={form[field].second}
        onChange={(e) => handleChange(field, "second", e.target.value)}
      >
        {minutesSeconds.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div id="timeShiftModal" className={modalStyles.Modal}>
      <div className={modalStyles.modalContent}>
        <div className={modalStyles.modalHeader}>
          <h2 className={modalStyles.mainTitle}>Time Shift</h2>
        </div>
        <div className={modalStyles.modalBody}>
          <div className={styles.TimeShiftWrapper}>
            <div className={styles.TimeShiftForm}>
              <label>Code:</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, code: e.target.value }))
                }
              />

              <label>Time In:</label>
              {renderTimeSelect("timeIn")}

              <label>Break Out:</label>
              {renderTimeSelect("breakOut")}

              <label>Break In:</label>
              {renderTimeSelect("breakIn")}

              <label>Time Out:</label>
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

            <div className={styles.dtrTableContainer}>
              <table className={styles.dtrTable}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Time In</th>
                    <th>Break Out</th>
                    <th>Break In</th>
                    <th>Time Out</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.map((s) => (
                    <tr key={s.timeShiftId}>
                      <td>{s.timeShiftId}</td>
                      <td>{s.timeIn}</td>
                      <td>{s.breakOut}</td>
                      <td>{s.breakIn}</td>
                      <td>{s.timeOut}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
