"use client";

import React from "react";
import styles from "@/styles/SalaryScheduleForm.module.scss";

export default function SalaryScheduleForm() {
  const [effectivityDate, setEffectivityDate] = React.useState("");
  const [nbcNo, setNbcNo] = React.useState("");
  const [nbcDate, setNbcDate] = React.useState("");
  const [eoNo, setEoNo] = React.useState("");
  const [eoDate, setEoDate] = React.useState("");

  return (
    <div className={styles.SalaryScheduleForm}>
      {/* Effectivity Date */}
      <div className={styles.formRow}>
        <label className={styles.label}>Select Effectivity Date</label>
        <input
          type="date"
          value={effectivityDate}
          onChange={(e) => setEffectivityDate(e.target.value)}
          className={styles.dateInput}
        />
      </div>

      {/* NBC Row */}
      <div className={styles.formRow}>
        <label className={styles.label}>National Budget Circular (NBC)</label>
        <div className={styles.inlineGroup}>
          <span>No.</span>
          <input
            type="text"
            value={nbcNo}
            onChange={(e) => setNbcNo(e.target.value)}
            className={styles.shortInput}
          />
          <span className={styles.dated}>Dated</span>
          <input
            type="date"
            value={nbcDate}
            onChange={(e) => setNbcDate(e.target.value)}
            className={styles.dateInput}
          />
        </div>
      </div>

      {/* EO Row */}
      <div className={styles.formRow}>
        <label className={styles.label}>Executive Order (E.O.)</label>
        <div className={styles.inlineGroup}>
          <span>No.</span>
          <input
            type="text"
            value={eoNo}
            onChange={(e) => setEoNo(e.target.value)}
            className={styles.shortInput}
          />
          <span className={styles.dated}>Dated</span>
          <input
            type="date"
            value={eoDate}
            onChange={(e) => setEoDate(e.target.value)}
            className={styles.dateInput}
          />
        </div>
      </div>
    </div>
  );
}