"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import styles from "@/styles/TimeShift.module.scss";
import modalStyles from "@/styles/Modal.module.scss";
import { authToken } from "@/lib/utils/localStorageUtil";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";
import to12HourFormat from "@/lib/utils/convert24To12HrFormat";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";

const API_BASE_URL_ADMINISTRATIVE =
  process.env.NEXT_PUBLIC_API_BASE_URL_ADMINISTRATIVE;

type TimeShift = {
  timeShiftId: number;
  tsCode: string;
  timeIn: string;
  breakOut: string;
  breakIn: string;
  timeOut: string;
};

type FormValues = {
  code: string;
  timeInHour: string;
  timeInMinute: string;
  breakOutHour: string;
  breakOutMinute: string;
  breakInHour: string;
  breakInMinute: string;
  timeOutHour: string;
  timeOutMinute: string;
};

export default function TimeShift() {
  const [shifts, setShifts] = useState<TimeShift[]>([]);

  // react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      code: "",
      timeInHour: "08",
      timeInMinute: "00",
      breakOutHour: "12",
      breakOutMinute: "00",
      breakInHour: "13",
      breakInMinute: "00",
      timeOutHour: "17",
      timeOutMinute: "00",
    },
  });

  const hours = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0")
  );
  const minutesSeconds = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0")
  );

  const onSubmit = async (data: FormValues) => {
    const payload = {
      tsCode: data.code,
      timeIn: `${data.timeInHour}:${data.timeInMinute}:00`,
      breakOut: data.breakOutHour
        ? `${data.breakOutHour}:${data.breakOutMinute}:00`
        : "",
      breakIn: data.breakInHour
        ? `${data.breakInHour}:${data.breakInMinute}:00`
        : "",
      timeOut: `${data.timeOutHour}:${data.timeOutMinute}:00`,
    };

    try {
      const token = authToken.get();
      if (!token) {
        console.error("No token found, please login first");
        return;
      }

      const res = await fetchWithAuth(
        `${API_BASE_URL_ADMINISTRATIVE}/api/time-shift/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error(`Failed to save timeshift: ${res.status}`);

      const saved = await res.json();
      setShifts((prev) => [...prev, saved]);
      reset(); // clear form
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const fetchShifts = async () => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL_ADMINISTRATIVE}/api/getAll/time-shift`
      );

      if (!res.ok) throw new Error(`Failed to fetch timeshifts: ${res.status}`);

      const data = await res.json();
      setShifts(data);
    } catch (err) {
      console.error("Failed to fetch timeshifts:", err);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

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
    const splitTime = (timeStr: string) => {
      const [hour, minute] = timeStr.split(":");
      return { hour, minute };
    };

    reset({
      code: shift.tsCode,
      timeInHour: splitTime(shift.timeIn).hour,
      timeInMinute: splitTime(shift.timeIn).minute,
      breakOutHour: shift.breakOut ? splitTime(shift.breakOut).hour : "",
      breakOutMinute: shift.breakOut ? splitTime(shift.breakOut).minute : "",
      breakInHour: shift.breakIn ? splitTime(shift.breakIn).hour : "",
      breakInMinute: shift.breakIn ? splitTime(shift.breakIn).minute : "",
      timeOutHour: splitTime(shift.timeOut).hour,
      timeOutMinute: splitTime(shift.timeOut).minute,
    });
  };

  return (
    <div id="timeShiftModal" className={modalStyles.Modal}>
      <div className={modalStyles.modalContent}>
        <div className={modalStyles.modalHeader}>
          <h2 className={modalStyles.mainTitle}>Time Shift</h2>
        </div>
        <div className={modalStyles.modalBody}>
          <div className={styles.TimeShiftWrapper}>
            {/* Form enhanced with react-hook-form */}
            <form
              className={styles.TimeShiftForm}
              onSubmit={handleSubmit(onSubmit)}
            >
              <label>Code</label>
              <input
                type="text"
                {...register("code", { required: "Code is required" })}
                required={true}
              />
              {errors.code && (
                <span className={styles.error}>{errors.code.message}</span>
              )}

              <label>Time In</label>
              <div className={styles.timeGroup}>
                <select {...register("timeInHour")} className={styles.timeSelect}>
                  {hours.map((h) => (
                    <option key={`timeInHour-${h}`} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
                <span className={styles.timeColon}>:</span>
                <select
                  {...register("timeInMinute")}
                  className={styles.timeSelect}
                >
                  {minutesSeconds.map((m) => (
                    <option key={`timeInMinute-${m}`} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <label>Break Out</label>
              <div className={styles.timeGroup}>
                <select {...register("breakOutHour")} className={styles.timeSelect}>
                  <option value="">--</option>
                  {hours.map((h) => (
                    <option key={`breakOutHour-${h}`} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
                <span className={styles.timeColon}>:</span>
                <select
                  {...register("breakOutMinute")}
                  className={styles.timeSelect}
                >
                  <option value="">--</option>
                  {minutesSeconds.map((m) => (
                    <option key={`breakOutMinute-${m}`} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <label>Break In</label>
              <div className={styles.timeGroup}>
                <select {...register("breakInHour")} className={styles.timeSelect}>
                  <option value="">--</option>
                  {hours.map((h) => (
                    <option key={`breakInHour-${h}`} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
                <span className={styles.timeColon}>:</span>
                <select
                  {...register("breakInMinute")}
                  className={styles.timeSelect}
                >
                  <option value="">--</option>
                  {minutesSeconds.map((m) => (
                    <option key={`breakInMinute-${m}`} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <label>Time Out</label>
              <div className={styles.timeGroup}>
                <select {...register("timeOutHour")} className={styles.timeSelect}>
                  {hours.map((h) => (
                    <option key={`timeOutHour-${h}`} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
                <span className={styles.timeColon}>:</span>
                <select
                  {...register("timeOutMinute")}
                  className={styles.timeSelect}
                >
                  {minutesSeconds.map((m) => (
                    <option key={`timeOutMinute-${m}`} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.buttonGroup}>
                <button type="submit" className={styles.saveButton}>
                  Save
                </button>
                <button
                  type="button"
                  className={styles.clearButton}
                  onClick={() => reset()}
                >
                  Clear
                </button>
              </div>
            </form>

            {/* Table remains unchanged */}
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
                    {shifts.map((shift) => (
                      <tr key={shift.timeShiftId}>
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