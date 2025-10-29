"use client";

import React from "react";
import styles from "@/styles/SalaryScheduleTable.module.scss";

export default function SalaryScheduleTable() {
  // X-axis: Salary Step 1–8
  const steps = Array.from({ length: 8 }, (_, i) => i + 1);

  // Y-axis: Salary Grade 1–33
  const grades = Array.from({ length: 33 }, (_, i) => i + 1);

  return (
    <div className={styles.SalaryScheduleTable}>

      {/* Scrollable Table Container */}
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
            {grades.map((grade) => (
              <tr key={grade}>
                <td className={styles.gradeCell}>SG {grade}</td>
                {steps.map((step) => {
                  const monthly = 13000 + (grade - 1) * 800 + (step - 1) * 400;
                  const annual = monthly * 12;

                  return (
                    <td key={step} className={styles.salaryCell}>
                      <div className={styles.salaryContent}>
                        <div className={styles.monthly}>
                          <span className={styles.label}>Monthly:</span>{" "}
                          ₱{monthly.toLocaleString()}
                        </div>
                        <div>&nbsp;</div>
                        <div className={styles.annual}>
                          <span className={styles.label}>Annual:</span>{" "}
                          ₱{annual.toLocaleString()}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}