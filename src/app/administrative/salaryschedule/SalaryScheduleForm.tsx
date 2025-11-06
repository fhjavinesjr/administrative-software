"use client";

import styles from "@/styles/SalaryScheduleForm.module.scss";
import { toCustomFormat, toDateInputValue } from "@/lib/utils/dateFormatUtils";

type Props = {
  effectivityDate: string;
  setEffectivityDate: (v: string) => void;
  nbcNo: string;
  setNbcNo: (v: string) => void;
  nbcDate: string;
  setNbcDate: (v: string) => void;
  eoNo: string;
  setEoNo: (v: string) => void;
  eoDate: string;
  setEoDate: (v: string) => void;
};

export default function SalaryScheduleForm({
  effectivityDate,
  setEffectivityDate,
  nbcNo,
  setNbcNo,
  nbcDate,
  setNbcDate,
  eoNo,
  setEoNo,
  eoDate,
  setEoDate,
}: Props) {

  return (
    <div className={styles.SalaryScheduleForm}>
      {/* Effectivity Date */}
      <div className={styles.formRow}>
        <label className={styles.label}>Select Effectivity Date</label>
        <input
          type="date"
          value={effectivityDate ? toDateInputValue(effectivityDate) : ""}
          onChange={(e) => setEffectivityDate(toCustomFormat(e.target.value, false))}
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
            value={nbcDate ? toDateInputValue(nbcDate) : ""}
            onChange={(e) => setNbcDate(toCustomFormat(e.target.value, false))}
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
            value={eoDate ? toDateInputValue(eoDate) : ""}
            onChange={(e) => setEoDate(toCustomFormat(e.target.value, false))}
            className={styles.dateInput}
          />
        </div>
      </div>
    </div>
  );
}