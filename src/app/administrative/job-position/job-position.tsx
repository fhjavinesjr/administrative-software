"use client";

import React, { useEffect, useState } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/JobPosition.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";
import type { SalaryScheduleItem } from "@/lib/types/SalaryScheduleItem";

const API_BASE_URL_ADMINISTRATIVE = process.env.NEXT_PUBLIC_API_BASE_URL_ADMINISTRATIVE;

export default function JobPosition() {
  type JobPositionItem = {
    title: string;
    grade: string;
    step: string;
  };

  const [isEditing, setIsEditing] = useState(false);
  const [position, setPosition] = useState<JobPositionItem[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [grade, setGrade] = useState("");
  const [step, setStep] = useState("1");

  // salary grades fetched from latest salary schedule
  const [grades, setGrades] = useState<number[]>([]);
  const [gradeSteps, setGradeSteps] = useState<Record<string, number[]>>({});
  const [loadingGrades, setLoadingGrades] = useState(false);

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
        if (gradeArr.length > 0 && !grade) {
          const firstGrade = String(gradeArr[0]);
          setGrade(firstGrade);
          const firstStep = String(stepsMap[firstGrade]?.[0] ?? "1");
          setStep(firstStep);
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

  // when grade changes, update step list and select first available
  useEffect(() => {
    if (grade && gradeSteps[grade]) {
      const steps = gradeSteps[grade];
      setStep(String(steps[0] ?? "1"));
    }
  }, [grade, gradeSteps]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newJob: JobPositionItem = { title, grade, step };

    if (!isEditing) {
      setPosition((prev) => [...prev, newJob]);
    } else if (editIndex !== null) {
      const updatePositions = [...position];
      updatePositions[editIndex] = newJob;
      setPosition(updatePositions);
      setIsEditing(false);
      setEditIndex(null);
    }

    setTitle("");
    setGrade("");
    setStep("1");
  };

  const handleClear = () => {
    setTitle("");
    setGrade("");
    setStep("1");
    setIsEditing(false);
  };

  const handleDelete = (titleToDelete: string) => {
    const arr = position.filter((pos) => pos.title !== titleToDelete);
    setPosition(arr);
    setTitle("");
    setGrade("");
    setStep("1");
    setIsEditing(false);
  };

  const handleEdit = (obj: JobPositionItem, index: number) => {
    const { title: t, grade: g, step: s } = obj;
    setEditIndex(index);
    setTitle(t);
    setGrade(g);
    setStep(s);
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <label>Salary Grade</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
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
                value={step}
                onChange={(e) => setStep(e.target.value)}
                required
                disabled={!grade}
              >
                <option value="0">0</option>
                {grade && gradeSteps[grade] ? (
                  gradeSteps[grade].map((s) => (
                    <option key={s} value={String(s)}>
                      Step {s}
                    </option>
                  ))
                ) : (
                  <option value="">-- select step --</option>
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
                      <tr key={pos.title ?? `row-${indx}`}>
                        <td>{pos.title}</td>
                        <td>{pos.grade}</td>
                        <td>{pos.step}</td>
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
                            onClick={() => handleDelete(pos.title)}
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