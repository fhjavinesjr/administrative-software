"use client"

import React, { useState } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/Hazard.module.scss";
// import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
// import Swal from "sweetalert2";

export default function Hazard() {
    const totalDays = 31;

    const [grades, setGrades] = useState(
    Array.from({ length: totalDays }, (_, i) => String(i + 1))
    );

    const handleGradeChange = (index: number, value: string) => {
        setGrades(prev => {
            const updated = [...prev];
            updated[index] = value;
            return updated;
        });
    };

    const [percentages, setPercentages] = useState(
        Array(totalDays).fill(25)
    );

    const addGrade = () => {
        setGrades(prevGrades => {
            const nextGrade = prevGrades.length + 1;
            return [...prevGrades, String(nextGrade)];
        });

        setPercentages(prev => [...prev, 25]); // default percentage
    };

    const handleChange = (index: number, value: string) => {
        const newValues = [...percentages];
        newValues[index] = value;
        setPercentages(newValues);
    };

    return (
        <div className={modalStyles.Modal}>
            <div className={modalStyles.modalContent}>
                <div className={modalStyles.modalHeader}>
                    <h2 className={modalStyles.mainTitle}>Hazard Pay Table</h2>
                </div>
                <div className={modalStyles.modalBody}>
                    <form className={styles.HazardForm}>
                        <div className={styles.formGroup}>
                            <label>Effectivity Date</label>
                            <input
                                type="date"
                                required={true}/>
                        </div>
                    </form>
                    <div className={styles.Hazard}>
                        <div className={styles.HazardTable}>
                            <div className={styles.toolbar}>
                                <button className={styles.newButton}>
                                    💾 Save
                                </button>
                                <button className={styles.clearButton}>
                                    ✖ Clear
                                </button>
                            </div>
                            <div className={styles.tableContainer}>
                                <table className={styles.hazTable}>
                                    <thead>
                                        <tr>
                                            <th>Salary Grade</th>
                                            <th>% Percentage of Basic Salary</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {grades.map((grade, indx) => (
                                            <tr key={indx}>
                                                <td>
                                                    <input
                                                        type="text"
                                                        className={styles.hazInput}
                                                        value={grade}
                                                        onChange={(e) => handleGradeChange(indx, e.target.value)}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        className={styles.hazInput}
                                                        value={percentages[indx]}
                                                        onChange={(e) => handleChange(indx, e.target.value)}
                                                    />
                                                     <span className={styles.percent}>%</span>
                                                </td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td colSpan={1} className={styles.addTableRow}>
                                                <button className={styles.myButton} onClick={addGrade}>
                                                    + Add
                                                </button>
                                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                <button className={styles.myButton} onClick={addGrade}>
                                                    + Remove
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}