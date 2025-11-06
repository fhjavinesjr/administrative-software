"use client";

import React, { useState, useEffect } from "react";
import styles from "@/styles/SalaryScheduleTable.module.scss";
const API_BASE_URL_ADMINISTRATIVE = process.env.NEXT_PUBLIC_API_BASE_URL_ADMINISTRATIVE;
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";
import Swal from "sweetalert2";
import type { SalaryScheduleItem } from "@/lib/types/SalaryScheduleItem";

type SalaryCell = { monthly: string };

type Props = {
  effectivityDate: string;
  nbcNo: string;
  nbcDate: string;
  eoNo: string;
  eoDate: string;
  selectedItems?: SalaryScheduleItem[] | null;
  onClear?: () => void;
};

export default function SalaryScheduleTable({
  effectivityDate,
  nbcNo,
  nbcDate,
  eoNo,
  eoDate,
  selectedItems = null,
  onClear
}: Props) {
  const steps = Array.from({ length: 8 }, (_, i) => i + 1);
  const grades = Array.from({ length: 33 }, (_, i) => i + 1);

  const [isEditing, setIsEditing] = useState<boolean | null>(false);
  const initialSalaryData: SalaryCell[][] = grades.map(() => steps.map(() => ({ monthly: "" })));
  const [salaryData, setSalaryData] = useState<SalaryCell[][]>(initialSalaryData);

  // populate grid when selectedItems is provided (audit -> view)
  useEffect(() => {
    if (!selectedItems) {
      return;
    }

    // create fresh empty grid
    const newGrid: SalaryCell[][] = grades.map(() => steps.map(() => ({ monthly: "" })));

    selectedItems.forEach((it) => {
      // expect salaryGrade and salaryStep in item
      const g = Number(it.salaryGrade);
      const s = Number(it.salaryStep);
      const monthly = it.monthlySalary != null ? String(it.monthlySalary) : "";
      if (!isNaN(g) && !isNaN(s) && g >= 1 && g <= grades.length && s >= 1 && s <= steps.length) {
        newGrid[g - 1][s - 1].monthly = monthly;
      }
    });

    setSalaryData(newGrid);
    // when loading from Audit -> open in edit mode so user can Save changes
    setIsEditing(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItems]);

  const handleInputChange = (gradeIndex: number, stepIndex: number, value: string) => {
    const updated = [...salaryData];
    updated[gradeIndex][stepIndex].monthly = value;
    setSalaryData(updated);
  };

  const handleSave = async () => {
    try {
      let adminSvcUrl = `${API_BASE_URL_ADMINISTRATIVE}/api/salary-schedule/create`;
      let submitMethod = "POST";
      if (isEditing) {
        adminSvcUrl = `${API_BASE_URL_ADMINISTRATIVE}/api/salary-schedule/update`;
        submitMethod = "PUT";
      }

      // Build items array where each item matches your Java DTO
      const items: SalaryScheduleItem[] = [];
      salaryData.forEach((row, gradeIndex) => {
        row.forEach((cell, stepIndex) => {
          const monthlyStr = cell.monthly?.trim();
          if (monthlyStr) {
            // try to find an existing item (from selectedItems/audit) for this grade/step
            const existing = selectedItems?.find(
              (it) =>
                Number(it.salaryGrade) === gradeIndex + 1 &&
                Number(it.salaryStep) === stepIndex + 1
            );
            items.push({
              salaryScheduleId: existing?.salaryScheduleId ?? null,
              effectivityDate: effectivityDate || null,
              nbcNo: nbcNo || null,
              nbcDate: nbcDate || null,
              eoNo: eoNo || null,
              eoDate: eoDate || null,
              salaryGrade: gradeIndex + 1,
              salaryStep: stepIndex + 1,
              monthlySalary: monthlyStr ? Number(monthlyStr) : null,
            });
          }
        });
      });

      if(items.length < 264) { //264 is the total no of salary schedule
        throw new Error("Please complete all salary grade and step entries before saving.");
      }

      const salaryScheduleResponse = await fetchWithAuth(adminSvcUrl, {
        method: submitMethod,
        body: JSON.stringify(items),
        headers: { "Content-Type": "application/json" },
      });

      if (!salaryScheduleResponse.ok) {
        const text = await salaryScheduleResponse.text();
        throw new Error(`Failed to save Salary Schedule ${text}`);
      }

      await salaryScheduleResponse.json();

      Swal.fire({
        icon: "success",
        title: !isEditing ? "Salary Schedule Created" : "Salary Schedule Updated",
        text: "",
      });

      setIsEditing(false);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  const handleClear = () => {
    setSalaryData(
      grades.map(() =>
        steps.map(() => ({
          monthly: "",
        }))
      )
    );

    if(onClear) {
      onClear();
    } 

    // exit edit mode when clearing
    setIsEditing(false);
  };

  const handleNew = () => {
    setIsEditing(null);
  };

  return (
    <div className={styles.SalaryScheduleTable}>
      <div className={styles.toolbar}>
        {isEditing != null && isEditing === false ? (
          <button onClick={handleNew} className={styles.newButton}>
            + New
          </button>
        ) : (
          <>
            <button onClick={handleSave} className={styles.saveButton}>
              💾 Save
            </button>
          </>
        )}
        <button onClick={handleClear} className={styles.clearButton}>
          ✖ Clear
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.salaryTable}>
          <thead>
            <tr>
              <th className={styles.gradeHeader}>Salary Grade / Step</th>
              {steps.map((step) => (
                <th key={step} className={styles.stepHeader}>
                  Step {step}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {grades.map((grade, gradeIndex) => (
              <tr key={grade}>
                <td className={styles.gradeCell}>SG {grade}</td>
                {steps.map((step, stepIndex) => (
                  <td key={step} className={styles.salaryCell}>
                    {isEditing == null || isEditing ? (
                      <input
                        type="number"
                        value={salaryData[gradeIndex][stepIndex].monthly}
                        onChange={(e) =>
                          handleInputChange(gradeIndex, stepIndex, e.target.value)
                        }
                        className={styles.salaryInput}
                        placeholder="₱"
                      />
                    ) : (
                      <div className={styles.salaryContent}>
                        <div className={styles.monthly}>
                          <span className={styles.label}>Monthly:</span>{" "}
                          ₱
                          {salaryData[gradeIndex][stepIndex].monthly
                            ? Number(salaryData[gradeIndex][stepIndex].monthly).toLocaleString()
                            : "-"}
                        </div>
                        <div className={styles.annual}>
                          <span className={styles.label}>Annual:</span>{" "}
                          ₱
                          {salaryData[gradeIndex][stepIndex].monthly
                            ? (
                                Number(salaryData[gradeIndex][stepIndex].monthly) * 12
                              ).toLocaleString()
                            : "-"}
                        </div>
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}