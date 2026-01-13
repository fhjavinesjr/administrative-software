"use client"

import React, { useState } from "react";
import modalStyles from "@/styles/Modal.module.scss";
// import styles from "@/styles/Gender.module.scss";
// import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
// import Swal from "sweetalert2";
import DayEquivalentTableStyle from "@/styles/DayEquivalentTable.module.scss";

export default function DayEquivalentTable() {
    type HourItem  = {
        text: number;
        value: string;
    }
    const [activeTab, setActiveTab] = useState<"hour" | "minute">("hour");

    const [hours, setHours] = useState<HourItem[]>([
        {text: 1, value: "0.125"},
        {text: 2, value: "0.25"},
        {text: 3, value: "0.375"},
        {text: 4, value: "0.5"},
        {text: 5, value: "0.625"},
        {text: 6, value: "0.75"},
        {text: 7, value: "0.875"},
        {text: 8, value: "1.0"},
    ]); 

    const handleChange = (index: number, value: string) => {
        const updated = [...hours];
        updated[index].value = value;
        setHours(updated);
    };
    
    const addHour = () => {
         const lst = hours[hours.length - 1];
         const obj = {
            text: lst.text + 1,
            value: ''
         }
         setHours([...hours, obj]);
    }

    const addMinute = () => {
         const lst = minutes[minutes.length - 1];
         const obj = {
            text: lst.text + 1,
            value: ''
         }
         setMinutes([...minutes, obj]);
    }

    const handleClear = () => {
        if(activeTab == 'hour') {
            const cleared = hours.map(item => ({
                ...item,
                value: "" 
            }));
            setHours(cleared);
        }
    };

    const generateMinutes = () => {
        const start = 0.002;
        const end = 0.125;
        const count = 60;
        const step = (end - start) / (count - 1);

        return Array.from({ length: count }, (_, i) => ({
            text: i + 1,                       // 1 → 60
            value: (start + step * i).toFixed(3)
        }));
    };

    const [minutes, setMinutes] = useState<HourItem[]>(generateMinutes());

    const handleChangeMinute = (index: number, value: string) => {
        const updated = [...minutes];
        updated[index].value = value;
        setMinutes(updated);
    };

    return (
        <div className={modalStyles.Modal}>
            <div className={modalStyles.modalContent}>
                <div className={modalStyles.modalHeader}>
                    <h2 className={modalStyles.mainTitle}>Day Equivalent Table</h2>
                </div>

                <div className={modalStyles.modalBody}>
                    <div className={DayEquivalentTableStyle.DayEquivalent}>
                        <div className={DayEquivalentTableStyle.tabsHeader}>
                            <button className={`${DayEquivalentTableStyle.tabButton} ${activeTab === "hour" ? DayEquivalentTableStyle.active : ""}`} onClick={() => setActiveTab("hour")}>
                                Hours
                            </button>
                            <button className={`${DayEquivalentTableStyle.tabButton} ${ activeTab === "minute" ? DayEquivalentTableStyle.active : ""}`} onClick={() => setActiveTab("minute")}>
                                Minutes
                            </button>
                        </div>

                        <div className={DayEquivalentTableStyle.toolbar}>
                            <button className={DayEquivalentTableStyle.newButton}>
                                💾 Save
                            </button>
                            <button className={DayEquivalentTableStyle.clearButton} onClick={handleClear}>
                                ✖ Clear
                            </button>
                        </div>

                        {activeTab == 'hour' && (
                            <div className={DayEquivalentTableStyle.DayEquivalentTable}>
                                <div className={DayEquivalentTableStyle.tableContainer}>
                                    <table className={DayEquivalentTableStyle.dayTable}>
                                        <thead>
                                            <tr>
                                                <th>Hour(s)</th>
                                                <th>Equivalent Day</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {hours.map((hour, indx) => (
                                                <tr key={indx}>
                                                    <td>{hour.text}</td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className={DayEquivalentTableStyle.earnedLeaveInput}
                                                            value={hour.value}
                                                            onChange={(e) => handleChange(indx, e.target.value)}
                                                        />
                                                    </td>
                                                </tr>
                                                
                                            ))}
                                            <tr>
                                                <td colSpan={1} style={{ textAlign: "center", border: "none", }}>
                                                    <button className={DayEquivalentTableStyle.myButton} onClick={addHour}>
                                                        + Add
                                                    </button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab == "minute" && (
                            <div className={DayEquivalentTableStyle.DayEquivalentTable}>
                                <div className={DayEquivalentTableStyle.tableContainer}>
                                    <table className={DayEquivalentTableStyle.dayTable}>
                                        <thead>
                                            <tr>
                                                <th>Minutes(s)</th>
                                                <th>Equivalent Day</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {minutes.map((min, indx) => (
                                                <tr key={indx}>
                                                    <td>{min.text}</td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className={DayEquivalentTableStyle.earnedLeaveInput}
                                                            value={min.value}
                                                            onChange={(e) => handleChangeMinute(indx, e.target.value)}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr>addTableRow
                                                <td colSpan={1} className={DayEquivalentTableStyle.addTableRow}>
                                                    <button className={DayEquivalentTableStyle.myButton} onClick={addMinute}>
                                                        + Add
                                                    </button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    )
}