"use client";

import React, { useState } from "react";
import styles from "@/styles/PremiumPayMultiplier.module.scss";
import modalStyles from "@/styles/Modal.module.scss";

export default function PremiumPayForm() {
  const [sector, setSector] = useState("private");
  const [multipliers, setMultipliers] = useState({
    regularDay: 1.0,
    regularOvertime: 1.25,
    restDay: 1.3,
    restDayOvertime: 1.69,
    holiday: 2.0,
    holidayOvertime: 2.6,
    nightShift: 1.1,
    restDayNightShift: 1.43,
    holidayNightShift: 2.2,
    restDayNightShiftOvertime: 1.86,
    holidayNightShiftOvertime: 2.86,
  });

  const handleSectorChange = (value: string) => {
    const nsd = value === "private" ? 1.1 : 1.2;
    setSector(value);
    setMultipliers((prev) => ({
      ...prev,
      nightShift: nsd,
      restDayNightShift: 1.3 * nsd,
      holidayNightShift: 2.0 * nsd,
      restDayNightShiftOvertime: 1.69 * nsd,
      holidayNightShiftOvertime: 2.6 * nsd,
    }));
  };

  const handleMultiplierChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    setMultipliers({
      ...multipliers,
      [field]: parseFloat(e.target.value) || 0,
    });
  };

  const [inputs, setInputs] = useState({
    baseHourlyRate: 0,
    workHours: 8, // NEW: Default 8 hours per day
    overtimeHours: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs({
      ...inputs,
      [e.target.name]: parseFloat(e.target.value) || 0,
    });
  };

  const calculatePay = (multiplier: number, type: string) => {
    const { baseHourlyRate, workHours, overtimeHours } = inputs;

    // Regular pay (without overtime)
    if (type.toLowerCase().includes("overtime")) {
      return baseHourlyRate * overtimeHours * multiplier;
    }

    return baseHourlyRate * workHours * multiplier;
  };

  const formatLabel = (key: string) => {
    return key
      .replace(/([A-Z])/g, " $1") // split camelCase → words
      .replace(/^./, (str) => str.toUpperCase()); // capitalize first word
  };

  return (
    <div id="premiumpaymultiplierModal" className={modalStyles.Modal}>
      <div className={modalStyles.modalContent}>
        <div className={modalStyles.modalHeader}>
          <h2 className={modalStyles.mainTitle}>Premium Pay / Multiplier</h2>
        </div>
        <div className={modalStyles.modalBody}>
          <div className={styles.PremiumPayMultiplier}>
            {/* DOLE Computation Notes */}
            <div className={styles.doleNotes}>
              <h3>📌 How DOLE computes pay</h3>
              <ul>
                <li>
                  <strong>Daily Rate (8 hours of work)</strong>: If you’re paid
                  on a daily basis, your daily wage already covers 8 hours of
                  work. <br />
                  Example: ₱500/day means ₱500 for 8 hours of duty.
                </li>
                <li>
                  <strong>Hourly Rate (for computations)</strong>: DOLE usually
                  requires converting the daily rate into an hourly rate to
                  apply multipliers (for overtime, night shift, etc.). <br />
                  Formula: <code>Hourly Rate = Daily Rate ÷ 8</code> <br />
                  Example: ₱500/day ÷ 8 = ₱62.50/hour.
                </li>
                <li>
                  <strong>Monthly-paid employees</strong>: DOLE standard
                  conversion: <br />
                  <code>Daily Rate = Monthly Rate × 12 ÷ 261</code> <br />
                  <code>Hourly Rate = Daily Rate ÷ 8</code> <br />
                  The divisor <strong>261</strong> is the average working days
                  per year (excluding rest days, but including holidays).
                </li>
              </ul>
            </div>

            {/* Input fields */}
            <div className={styles.formGrid}>
              <div className={styles.inputDiv}>
                <label>Base Hourly Rate (₱)</label>
                <input
                  type="number"
                  name="baseHourlyRate"
                  value={inputs.baseHourlyRate}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.inputDiv}>
                <label>Work Hours (per day)</label>
                <input
                  type="number"
                  name="workHours"
                  value={inputs.workHours}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Overtime Hours</label>
                <input
                  type="number"
                  name="overtimeHours"
                  value={inputs.overtimeHours}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Sector Selection */}
            <div className={styles.sectorSelection}>
              <label>
                <input
                  type="radio"
                  name="sector"
                  value="private"
                  checked={sector === "private"}
                  onChange={() => handleSectorChange("private")}
                />
                Private Sector (10% NSD)
              </label>
              <label>
                <input
                  type="radio"
                  name="sector"
                  value="government"
                  checked={sector === "government"}
                  onChange={() => handleSectorChange("government")}
                />
                Government Sector (20% NSD)
              </label>
            </div>

            {/* Editable Multipliers Table */}
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Multiplier</th>
                  <th>Formula</th>
                  <th>Computed Pay (₱)</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(multipliers).map(([key, value]) => (
                  <tr key={key}>
                    <td>{formatLabel(key)}</td>
                    <td>
                      <input
                        type="number"
                        value={value}
                        step="0.01"
                        onChange={(e) => handleMultiplierChange(e, key)}
                      />
                    </td>
                    <td>
                      {inputs.baseHourlyRate} ×{" "}
                      {key.toLowerCase().includes("overtime")
                        ? inputs.overtimeHours
                        : inputs.workHours}{" "}
                      × {value}
                    </td>
                    <td>{calculatePay(value, key).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}