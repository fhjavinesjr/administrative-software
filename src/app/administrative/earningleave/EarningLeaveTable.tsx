"use client"

import React, { useState } from "react";
import styles from "@/styles/EarningLeaveTable.module.scss";
import modalStyles from "@/styles/Modal.module.scss";
// import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";

export default function EarningLeaveTable() {
    const totalDays = 30; 
    const days = Array.from(
        { length: totalDays * 2 + 1 },
        (_, i) => (i * 0.5).toFixed(1)
    );

    function getEarnedLeave(index: number) {
        return (1.25 - index * 0.021).toFixed(3);
    }

    const initialEarnedLeaves = days.map((_, index) => getEarnedLeave(index));
    const [earnedLeaves, setEarnedLeaves] = useState<string[]>(initialEarnedLeaves);

    const handleChange = (index: number, value: string) => {
        const updatedLeaves = [...earnedLeaves]; // copy array
        updatedLeaves[index] = value; // update value at index
        setEarnedLeaves(updatedLeaves); // set new state
    };

    const handleClear = () => {

        Swal.fire({
            text: `Are you sure you want to clear all the record?`,
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Clear",
            allowOutsideClick: true,
            backdrop: true,
        }).then(result => {
            if(result.isConfirmed) {
                setEarnedLeaves(initialEarnedLeaves.map(() => ""));
            }
        })
    };

    return (
        <div className={modalStyles.Modal}>
            <div className={modalStyles.modalContent}>
                <div className={modalStyles.modalHeader}>
                    <h2 className={modalStyles.mainTitle}>Earning Leave Table</h2>
                </div>

                <div className={modalStyles.modalBody}>
                    <div className={styles.EarningLeave}>

                        <div className={styles.EarningLeaveTable}>
                            <div className={styles.toolbar}>
                                <button className={styles.newButton}>
                                    💾 Save
                                </button>
                                <button className={styles.clearButton} onClick={handleClear}>
                                    ✖ Clear
                                </button>
                            </div>
                            <div className={styles.tableContainer}>
                                <table className={styles.earningTable}>
                                    <thead>
                                        <tr>
                                            <th>Day(s)</th>
                                            <th>Earned Leave</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {days.map((day, indx) => (
                                            <tr key={indx}>
                                                <td>{day}</td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        className={styles.earnedLeaveInput}
                                                        value={earnedLeaves[indx]}
                                                        onChange={(e) => handleChange(indx, e.target.value)}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
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