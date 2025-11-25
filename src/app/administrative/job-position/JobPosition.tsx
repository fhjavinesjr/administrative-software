"use client";

import React, { useEffect, useState, useCallback } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/JobPosition.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";
import type { SalaryScheduleItem } from "@/lib/types/SalaryScheduleItem";
import Swal from "sweetalert2";

const API_BASE_URL_ADMINISTRATIVE = process.env.NEXT_PUBLIC_API_BASE_URL_ADMINISTRATIVE;

export default function JobPosition() {
  type JobPositionItem = {
    jobPositionId: number;
    jobPositionName: string;
    salaryGrade: string;
    salaryStep: string;
  };

  const [isEditing, setIsEditing] = useState(false);
  const [position, setPosition] = useState<JobPositionItem[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const [jobPositionId, setJobPositionId] = useState(0);
  const [jobPositionName, setJobPositionName] = useState("");
  const [salaryGrade, setSalaryGrade] = useState("");
  const [salaryStep, setSalaryStep] = useState("0");

  // salary grades fetched from latest salary schedule
  const [grades, setGrades] = useState<number[]>([]);
  const [gradeSteps, setGradeSteps] = useState<Record<string, number[]>>({});
  const [loadingGrades, setLoadingGrades] = useState(false);

  // 🟢 FETCH EXISTING JOB POSITIONS FROM BACKEND
  const fetchJobPositions = useCallback(async () => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL_ADMINISTRATIVE}/api/job-position/get-all`
      );

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = (await res.json()) as JobPositionItem[];

      // Sort alphabetically
      const sortedData = data.sort((a, b) =>
        a.jobPositionName.localeCompare(b.jobPositionName)
      );

      setPosition(sortedData);
    } catch (err) {
      console.error("Failed to load job positions:", err);
    }
  }, []);

  useEffect(() => {
    fetchJobPositions();
  }, [fetchJobPositions]);
  
  // fetch latest salary schedule and populate distinct grades
  useEffect(() => {
    const fetchGrades = async () => {
      setLoadingGrades(true);
      try {
        const url = `${API_BASE_URL_ADMINISTRATIVE}/api/salary-schedule/get-all`;
        const res = await fetchWithAuth(url);
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as (SalaryScheduleItem & {
          effectivityDate?: string | null;
        })[];

        // pick the latest effectivityDate
        const withDates = data.filter((d) => !!d.effectivityDate);
        let latestDateStr: string | null = null;
        if (withDates.length > 0) {
          const sorted = withDates
            .slice()
            .sort((a, b) => {
              const ta = new Date(a.effectivityDate as string).getTime();
              const tb = new Date(b.effectivityDate as string).getTime();
              return tb - ta;
            });
          latestDateStr = sorted[0].effectivityDate ?? null;
        }

        const itemsToUse = latestDateStr
          ? data.filter((d) => d.effectivityDate === latestDateStr)
          : data;

        // build grade -> steps map
        const stepsMap: Record<string, number[]> = {};
        itemsToUse.forEach((it) => {
          const g = Number(it.salaryGrade ?? NaN);
          const s = Number(it.salaryStep ?? NaN);
          if (!Number.isNaN(g) && !Number.isNaN(s)) {
            const key = String(g);
            if (!stepsMap[key]) stepsMap[key] = [];
            if (!stepsMap[key].includes(s)) stepsMap[key].push(s);
          }
        });
        Object.keys(stepsMap).forEach((k) => stepsMap[k].sort((a, b) => a - b));

        setGradeSteps(stepsMap);

        const gradeArr = Object.keys(stepsMap)
          .map(Number)
          .sort((a, b) => a - b);
        setGrades(gradeArr);

        // default grade/step
        if (gradeArr.length > 0 && !salaryGrade) {
          const firstGrade = String(gradeArr[0]);
          setSalaryGrade(firstGrade);
          const firstStep = String(stepsMap[firstGrade]?.[0] ?? "1");
          setSalaryStep(firstStep);
        }
      } catch (err) {
        console.error("Failed to load salary grades", err);
      } finally {
        setLoadingGrades(false);
      }
    };

    fetchGrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGradeChange = (g: string) => {
    setSalaryGrade(g);

    if (g === "0") {
      setSalaryStep("0");
      return;
    }

    // For real grades, pick the first real step
    const steps = gradeSteps[g];
    if (steps && steps.length > 0) {
      setSalaryStep(String(steps[0]));
    } else {
      setSalaryStep("");
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!jobPositionName.trim()) {
      await Swal.fire("Missing Title", "Please enter a job position title.", "warning");
      return;
    }
    if (!salaryStep) {
      await Swal.fire("Missing Step", "Please select a salary step.", "warning");
      return;
    }

    const newJob: JobPositionItem = { jobPositionId, jobPositionName, salaryGrade, salaryStep };

    try {
      // Swal.fire({
      //   title: isEditing ? "Updating..." : "Saving...",
      //   text: "Please wait while we process your request.",
      //   allowOutsideClick: false,
      //   didOpen: () => {
      //     Swal.showLoading();
      //   },
      // });

      let url = `${API_BASE_URL_ADMINISTRATIVE}/api/job-position/create`;
      let submitMethod = "POST";
      if(isEditing) {
        url = `${API_BASE_URL_ADMINISTRATIVE}/api/job-position/update/${jobPositionId}`;
        submitMethod = "PUT";
      }

      const res = await fetchWithAuth(url, {
          method: submitMethod,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newJob),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to save job position.");
      }

      type ApiResponse = {
        metadataId?: string | number;
        message: string;
      };

      const result: ApiResponse = await res.json();
      console.log("Saved successfully:", result);

      setPosition((prev) => {
        const updated = [...prev];
        if (isEditing && editIndex !== null) {
          updated[editIndex] = newJob;
        } else {
          updated.push(newJob);
        }
        return updated;
      });

      // Reset states
      setIsEditing(false);
      setEditIndex(null);
      setJobPositionName("");
      setSalaryGrade("");
      setSalaryStep("0");

      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: isEditing
          ? "Job position has been updated successfully."
          : "Job position has been saved successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      // 🔁 Reload table with real IDs from backend
      await fetchJobPositions();
      handleClear();

    } catch (error) {
      console.error("Error saving job position:", error);

      // Type-safe error message extraction
      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.";

      await Swal.fire({
        icon: "error",
        title: "Error",
        text:
          message.includes("Failed to fetch") || message.includes("NetworkError")
            ? "Unable to reach the server. Please check your network or backend status."
            : message,
      });
    }
  };

  const handleClear = () => {
    setJobPositionId(0);
    setJobPositionName("");
    setSalaryGrade("");
    setSalaryStep("0");
    setIsEditing(false);
  };

  const handleDelete = async (obj: JobPositionItem) => {
    const { jobPositionId, jobPositionName } = obj;

    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete "${jobPositionName}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!confirm.isConfirmed) {
      return;
    }

    try {
      Swal.fire({
        title: "Deleting...",
        text: "Please wait while we remove the record.",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const url = `${API_BASE_URL_ADMINISTRATIVE}/api/job-position/delete/${jobPositionId}`;
      const res = await fetchWithAuth(url, { method: "DELETE" });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to delete job position.");
      }

      Swal.close();

      await Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: `Job position "${jobPositionName}" has been deleted successfully.`,
        timer: 2000,
        showConfirmButton: false,
      });

      // 🔁 Refresh from backend
      await fetchJobPositions();

      if (isEditing) handleClear();
    } catch (error) {
      Swal.close();
      console.error("Error deleting job position:", error);
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred.";
      await Swal.fire({
        icon: "error",
        title: "Error",
        text:
          message.includes("Failed to fetch") || message.includes("NetworkError")
            ? "Unable to reach the server. Please check your network or backend status."
            : message,
      });
    }
  };

  const handleEdit = (obj: JobPositionItem, index: number) => {
    const { jobPositionId: jobPositionId, jobPositionName: t, salaryGrade: g, salaryStep: s } = obj;
    setEditIndex(index);
    setJobPositionId(jobPositionId);
    setJobPositionName(t);
    setSalaryGrade(g);
    setSalaryStep(s);
    setIsEditing(true);
  };

  return (
    <div className={modalStyles.Modal}>
      <div className={modalStyles.modalContent}>
        <div className={modalStyles.modalHeader}>
          <h2 className={modalStyles.mainTitle}>Job Position</h2>
        </div>

        <div className={modalStyles.modalBody}>
          <div>
            <form className={styles.JobPositionForm} onSubmit={onSubmit}>
              <label>Position</label>
              <input
                type="text"
                value={jobPositionName}
                onChange={(e) => setJobPositionName(e.target.value)}
                required
              />

              <label>Salary Grade</label>
              <select
                value={salaryGrade}
                onChange={(e) => handleGradeChange(e.target.value)}
                required
              >
                {loadingGrades ? (
                  <option>Loading...</option>
                ) : grades.length === 0 ? (
                  <option value="">No grades</option>
                ) : (
                  <>
                    <option value="">-- select grade --</option>
                    <option value="0">0</option>
                    {grades.map((g) => (
                      <option key={g} value={String(g)}>
                        SG {g}
                      </option>
                    ))}
                  </>
                )}
              </select>

              <label>Salary Step</label>
              <select
                value={salaryStep}
                onChange={(e) => setSalaryStep(e.target.value)}
                required
              >
                {salaryGrade === "0" ? (
                  <option value="0">0</option>
                ) : (
                  <>
                    <option value="">-- select step --</option>
                    <option value="0">0</option>
                    {gradeSteps[salaryGrade]?.map((s) => (
                      <option key={s} value={String(s)}>
                        Step {s}
                      </option>
                    ))}
                  </>
                )}
              </select>

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

            {position.length > 0 && (
              <div className={styles.JobPositionTable}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Position Title</th>
                      <th>Salary Grade</th>
                      <th>Salary Step</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {position.map((pos, indx) => (
                      <tr key={pos.jobPositionName ?? `row-${indx}`}>
                        <td>{pos.jobPositionName}</td>
                        <td>{pos.salaryGrade}</td>
                        <td>{pos.salaryStep}</td>
                        <td>
                          <button
                            className={`${styles.iconButton} ${styles.editIcon}`}
                            onClick={() => handleEdit(pos, indx)}
                            title="Edit"
                          >
                            <FaRegEdit />
                          </button>
                          <button
                            className={`${styles.iconButton} ${styles.deleteIcon}`}
                            onClick={() => handleDelete(pos)}
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