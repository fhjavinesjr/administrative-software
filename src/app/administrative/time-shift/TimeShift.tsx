"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "@/styles/TimeShift.module.scss";
import modalStyles from "@/styles/Modal.module.scss";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";
const API_BASE_URL_ADMINISTRATIVE =
  process.env.NEXT_PUBLIC_API_BASE_URL_ADMINISTRATIVE;
import to12HourFormat from "@/lib/utils/convert24To12HrFormat";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";

export default function TimeShift() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  type TimeShift = {
    timeShiftId: number;
    tsCode: string;
    tsName: string;
    tsFlexible: boolean;
    timeIn: string;
    breakOut: string;
    breakIn: string;
    timeOut: string;
    monInTimeLimit: string;
    tueInTimeLimit: string;
    wedInTimeLimit: string;
    thuInTimeLimit: string;
    friInTimeLimit: string;
    satInTimeLimit: string;
    sunInTimeLimit: string;
  };

  const [form, setForm] = useState({
    timeShiftId: 0,
    code: "",
    name: "",
    tsFlexible: false,
    flexibleDays: {
      mon: false,
      tue: false,
      wed: false,
      thu: false,
      fri: false,
      sat: false,
      sun: false,
    },
    inTimeLimits: {
      mon: { hour: "", minute: "", second: "00" },
      tue: { hour: "", minute: "", second: "00" },
      wed: { hour: "", minute: "", second: "00" },
      thu: { hour: "", minute: "", second: "00" },
      fri: { hour: "", minute: "", second: "00" },
      sat: { hour: "", minute: "", second: "00" },
      sun: { hour: "", minute: "", second: "00" },
    },
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
      setMessage("Unable to load time shifts. Refresh the page or try again later.");
    }
  };

  const handleClear = () => {
    setForm({
      timeShiftId: 0,
      code: "",
      name: "",
      tsFlexible: false,
      flexibleDays: {
        mon: false,
        tue: false,
        wed: false,
        thu: false,
        fri: false,
        sat: false,
        sun: false,
      },
      inTimeLimits: {
        mon: { hour: "", minute: "", second: "00" },
        tue: { hour: "", minute: "", second: "00" },
        wed: { hour: "", minute: "", second: "00" },
        thu: { hour: "", minute: "", second: "00" },
        fri: { hour: "", minute: "", second: "00" },
        sat: { hour: "", minute: "", second: "00" },
        sun: { hour: "", minute: "", second: "00" },
      },
      timeIn: { hour: "08", minute: "00", second: "00" },
      breakOut: { hour: "12", minute: "00", second: "00" },
      breakIn: { hour: "13", minute: "00", second: "00" },
      timeOut: { hour: "17", minute: "00", second: "00" },
    });

    setMessage(null);
    setIsEditing(false);
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

      if (!res.ok) {
        throw new Error(`Delete failed: ${res.status}`);
      }
        
      setShifts((prev) => prev.filter((s) => s.timeShiftId !== id));
      handleClear();
      setMessage("Time shift deleted successfully.");
    } catch (err) {
      console.error("Failed to delete shift:", err);
      setMessage("Failed to delete shift. Please try again.");
    }
  };

  const handleEdit = (shift: TimeShift) => {
    const splitTime = (timeStr: string) => {
      if (!timeStr) return { hour: "", minute: "" };
      const [hour, minute] = timeStr.split(":");
      return { hour, minute };
    };

    setForm({
      timeShiftId: shift.timeShiftId,
      code: shift.tsCode,
      name: shift.tsName,
      tsFlexible: shift.tsFlexible ?? false,
      flexibleDays: {
        mon: !!shift.monInTimeLimit,
        tue: !!shift.tueInTimeLimit,
        wed: !!shift.wedInTimeLimit,
        thu: !!shift.thuInTimeLimit,
        fri: !!shift.friInTimeLimit,
        sat: !!shift.satInTimeLimit,
        sun: !!shift.sunInTimeLimit,
      },
      inTimeLimits: {
        mon: { ...splitTime(shift.monInTimeLimit), second: "00" },
        tue: { ...splitTime(shift.tueInTimeLimit), second: "00" },
        wed: { ...splitTime(shift.wedInTimeLimit), second: "00" },
        thu: { ...splitTime(shift.thuInTimeLimit), second: "00" },
        fri: { ...splitTime(shift.friInTimeLimit), second: "00" },
        sat: { ...splitTime(shift.satInTimeLimit), second: "00" },
        sun: { ...splitTime(shift.sunInTimeLimit), second: "00" },
      },
      timeIn: { ...splitTime(shift.timeIn), second: "00" },
      breakOut: shift.breakOut
        ? { ...splitTime(shift.breakOut), second: "00" }
        : { hour: "", minute: "", second: "00" },
      breakIn: shift.breakIn
        ? { ...splitTime(shift.breakIn), second: "00" }
        : { hour: "", minute: "", second: "00" },
      timeOut: { ...splitTime(shift.timeOut), second: "00" },
    });

    // scroll into view like you already do
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (formRef.current) {
          formRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
          const firstFocusable = formRef.current.querySelector(
            "input, select, textarea, button"
          ) as HTMLElement | null;
          if (firstFocusable) firstFocusable.focus();
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    });

    setIsEditing(true);
  };

  const validateForm = () => {
    if (!form.code.trim()) {
      setMessage("Code is required.");
      return false;
    }

    if (!form.name.trim()) {
      setMessage("Name is required.");
      return false;
    }

    const requiredSections: Array<"timeIn" | "timeOut"> = ["timeIn", "timeOut"];
    for (const sec of requiredSections) {
      if (!form[sec].hour || !form[sec].minute) {
        setMessage("Time In and Time Out must be complete.");
        return false;
      }
    }

    if (form.tsFlexible) {
      const dayKeys: Array<keyof typeof form.flexibleDays> = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
      for (const day of dayKeys) {
        if (form.flexibleDays[day]) {
          const limit = form.inTimeLimits[day];
          if (!limit.hour || !limit.minute) {
            setMessage(`Please specify In-Time limit for ${day.toUpperCase()}.`);
            return false;
          }
        }
      }
    }

    return true;
  };

  type DayKey = keyof typeof form.flexibleDays;
  const dayNames: Record<DayKey, string> = {
    mon: "Monday",
    tue: "Tuesday",
    wed: "Wednesday",
    thu: "Thursday",
    fri: "Friday",
    sat: "Saturday",
    sun: "Sunday",
  };

  const toggleDay = (day: DayKey) => {
    setForm((prev) => ({
      ...prev,
      flexibleDays: { ...prev.flexibleDays, [day]: !prev.flexibleDays[day] },
    }));
  };

  const renderFlexibleLimit = (day: DayKey) => (
    <div className={styles.timeGroup} style={{ marginTop: "8px" }}>
      <label style={{ width: "100%", marginBottom: "4px" }}>
        {dayNames[day]} In-Time Limit
      </label>
      <div style={{ display: "flex", gap: "6px" }}>
        <select
          className={styles.timeSelect}
          value={form.inTimeLimits[day].hour}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              inTimeLimits: {
                ...prev.inTimeLimits,
                [day]: { ...prev.inTimeLimits[day], hour: e.target.value },
              },
            }))
          }
        >
          <option value="">--</option>
          {hours.map((h) => (
            <option key={`${day}-in-hour-${h}`} value={h}>
              {h}
            </option>
          ))}
        </select>
        <span className={styles.timeColon}>:</span>
        <select
          className={styles.timeSelect}
          value={form.inTimeLimits[day].minute}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              inTimeLimits: {
                ...prev.inTimeLimits,
                [day]: { ...prev.inTimeLimits[day], minute: e.target.value },
              },
            }))
          }
        >
          <option value="">--</option>
          {minutesSeconds.map((m) => (
            <option key={`${day}-in-minute-${m}`} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // ✅ Build the TimeShift model
    const payload: TimeShift = {
      timeShiftId: form.timeShiftId, // comes from your form state
      tsCode: form.code,
      tsName: form.name,
      tsFlexible: form.tsFlexible,
      timeIn: `${form.timeIn.hour}:${form.timeIn.minute}:${form.timeIn.second}`,
      breakOut: form.breakOut.hour
        ? `${form.breakOut.hour}:${form.breakOut.minute}:${form.breakOut.second}`
        : "",
      breakIn: form.breakIn.hour
        ? `${form.breakIn.hour}:${form.breakIn.minute}:${form.breakIn.second}`
        : "",
      timeOut: `${form.timeOut.hour}:${form.timeOut.minute}:${form.timeOut.second}`,
      monInTimeLimit: form.flexibleDays.mon
        ? `${form.inTimeLimits.mon.hour}:${form.inTimeLimits.mon.minute}:${form.inTimeLimits.mon.second}`
        : "",
      tueInTimeLimit: form.flexibleDays.tue
        ? `${form.inTimeLimits.tue.hour}:${form.inTimeLimits.tue.minute}:${form.inTimeLimits.tue.second}`
        : "",
      wedInTimeLimit: form.flexibleDays.wed
        ? `${form.inTimeLimits.wed.hour}:${form.inTimeLimits.wed.minute}:${form.inTimeLimits.wed.second}`
        : "",
      thuInTimeLimit: form.flexibleDays.thu
        ? `${form.inTimeLimits.thu.hour}:${form.inTimeLimits.thu.minute}:${form.inTimeLimits.thu.second}`
        : "",
      friInTimeLimit: form.flexibleDays.fri
        ? `${form.inTimeLimits.fri.hour}:${form.inTimeLimits.fri.minute}:${form.inTimeLimits.fri.second}`
        : "",
      satInTimeLimit: form.flexibleDays.sat
        ? `${form.inTimeLimits.sat.hour}:${form.inTimeLimits.sat.minute}:${form.inTimeLimits.sat.second}`
        : "",
      sunInTimeLimit: form.flexibleDays.sun
        ? `${form.inTimeLimits.sun.hour}:${form.inTimeLimits.sun.minute}:${form.inTimeLimits.sun.second}`
        : "",
    };

    try {
      const url = isEditing
        ? `${API_BASE_URL_ADMINISTRATIVE}/api/time-shift/update/${payload.timeShiftId}`
        : `${API_BASE_URL_ADMINISTRATIVE}/api/time-shift/create`;

      const method = isEditing ? "PUT" : "POST";

      const res = await fetchWithAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Failed to save timeshift: ${res.status}`);
      }
    
      await res.json();
      setMessage("Time shift saved successfully.");
      await fetchShifts();
      handleClear();
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  return (
    <div id="timeShiftModal" className={modalStyles.Modal}>
      <div className={modalStyles.modalContent}>
        <div className={modalStyles.modalHeader}>
          <h2 className={modalStyles.mainTitle}>Time Shift</h2>
        </div>
        <div className={modalStyles.modalBody}>
          <div className={styles.TimeShiftWrapper}>
            <form ref={formRef} className={styles.TimeShiftForm} onSubmit={onSubmit}>
              {message && (
                <div
                  style={{
                    marginBottom: "0.75rem",
                    color: message.includes("failed") || message.includes("Unable") ? "#b91c1c" : "#15803d",
                  }}
                >
                  {message}
                </div>
              )}
              <label>Code</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, code: e.target.value }))
                }
                required={true}
              />

              <label>Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required={true}
              />

              <div className={styles.checkboxField}>
                <label>Is Flexible?</label>
                <input
                  type="checkbox"
                  checked={form.tsFlexible}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, tsFlexible: e.target.checked }))
                  }
                />
              </div>

              {form.tsFlexible && (
                <div className={styles.flexibleSection}>
                  <label>Dynamic Flexible Schedule</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                    {(Object.keys(form.flexibleDays) as Array<keyof typeof form.flexibleDays>).map((day) => (
                      <label key={day} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <input
                          type="checkbox"
                          checked={form.flexibleDays[day]}
                          onChange={() => toggleDay(day)}
                        />
                        {dayNames[day]}
                      </label>
                    ))}
                  </div>

                  {(Object.keys(form.flexibleDays) as Array<keyof typeof form.flexibleDays>)
                    .filter((day) => form.flexibleDays[day])
                    .map((day) => (
                      <div key={`${day}-limit`} style={{ marginTop: "0.5rem" }}>
                        {renderFlexibleLimit(day)}
                      </div>
                    ))}
                </div>
              )}

              <label>Time In</label>
              {renderTimeSelect("timeIn")}

              <label>Break Out</label>
              {renderTimeSelect("breakOut")}

              <label>Break In</label>
              {renderTimeSelect("breakIn")}

              <label>Time Out</label>
              {renderTimeSelect("timeOut")}

              <div className={styles.buttonGroup}>
                <button type="submit" className={styles.saveButton}>
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

            {shifts.length > 0 && (
              <div className={styles.TimeShiftTable}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Name</th>
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
                        <td>{shift.tsName}</td>
                        <td>{shift.timeIn + " [" + to12HourFormat(shift.timeIn) + "]"}</td>
                        <td>
                          {shift.breakOut
                            ? shift.breakOut + " [" + to12HourFormat(shift.breakOut) + "]"
                            : "-"}
                        </td>
                        <td>
                          {shift.breakIn ? shift.breakIn + " [" + to12HourFormat(shift.breakIn) + "]" : "-"}
                        </td>
                        <td>{shift.timeOut + " [" + to12HourFormat(shift.timeOut) + "]"}</td>
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