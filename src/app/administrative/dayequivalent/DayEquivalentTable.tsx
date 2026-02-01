"use client"

import React, { useEffect, useState, useCallback, useRef } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import DayEquivalentTableStyle from "@/styles/DayEquivalentTable.module.scss";
import Swal from "sweetalert2";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";
import { toCustomFormat, toDateInputValue } from "@/lib/utils/dateFormatUtils";

const API_BASE_URL_ADMINISTRATIVE = process.env.NEXT_PUBLIC_API_BASE_URL_ADMINISTRATIVE;

type HourItem = {
    dayEquivalentHoursId?: number;
    effectivityDate?: string;
    hours: string;
    hoursEquivalent: string;
};

type MinuteItem = {
    dayEquivalentMinutesId?: number;
    effectivityDate?: string;
    minutes: string;
    minutesEquivalent: string;
};

type DayEquivalentHistory = {
    effectivityDate: string;
    totalRows: number;
};

export default function DayEquivalentTable() {
    const [activeTab, setActiveTab] = useState<"hour" | "minute">("hour");
    
    // Hours state
    const [rows, setRows] = useState<HourItem[]>([]);
    const [history, setHistory] = useState<DayEquivalentHistory[]>([]);
    const [deletedRows, setDeletedRows] = useState<HourItem[]>([]);
    
    // Minutes state
    const [minuteRows, setMinuteRows] = useState<MinuteItem[]>([]);
    const [minuteHistory, setMinuteHistory] = useState<DayEquivalentHistory[]>([]);
    const [deletedMinuteRows, setDeletedMinuteRows] = useState<MinuteItem[]>([]);
    
    // Shared state
    const [loading, setLoading] = useState(false);
    const [effectivityDate, setEffectivityDate] = useState<string>("");
    const skipFetchRef = useRef(false);
    const skipMinuteFetchRef = useRef(false);

    useEffect(() => {
        const today = new Date().toISOString().split("T")[0];
        setEffectivityDate(today);
    }, []);

    const fetchHistory = useCallback(async () => {
        try {
            const res = await fetchWithAuth(`${API_BASE_URL_ADMINISTRATIVE}/api/dayEquivalentHours/get-all`);
            if (!res.ok) throw new Error("Failed to fetch day equivalent history");
            const data: HourItem[] = await res.json();

            const grouped = new Map<string, number>();
            data.forEach(item => {
                if (!item.effectivityDate) return;
                const dateKey = toDateInputValue(item.effectivityDate);
                grouped.set(dateKey, (grouped.get(dateKey) ?? 0) + 1);
            });

            const historyRows: DayEquivalentHistory[] = Array.from(grouped.entries())
                .map(([effectivityDate, totalRows]) => ({ effectivityDate, totalRows }))
                .sort((a, b) => b.effectivityDate.localeCompare(a.effectivityDate));

            setHistory(historyRows);
        } catch (err) {
            console.error(err);
        }
    }, []);

    const fetchDayEquivalent = useCallback(async (dateToFetch?: string) => {
        const dateValue = dateToFetch || effectivityDate;
        if (!dateValue) return;

        try {
            setLoading(true);
            const res = await fetchWithAuth(`${API_BASE_URL_ADMINISTRATIVE}/api/dayEquivalentHours/get-all`);
            if (!res.ok) throw new Error("Failed to fetch day equivalent");
            const data: HourItem[] = await res.json();

            const filtered = data.filter(item => item.effectivityDate?.startsWith(dateValue));
            if (filtered.length > 0) {
                setRows(
                    filtered.map(item => ({
                        dayEquivalentHoursId: item.dayEquivalentHoursId,
                        effectivityDate: item.effectivityDate,
                        hours: item.hours ?? "",
                        hoursEquivalent: item.hoursEquivalent ?? "",
                    }))
                );
            } else {
                setRows([{ hours: "", hoursEquivalent: "" }]);
            }
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to load Day Equivalent table", "error");
        } finally {
            setLoading(false);
        }
    }, [effectivityDate]);

    useEffect(() => {
        if (skipFetchRef.current) {
            skipFetchRef.current = false;
            return;
        }
        fetchDayEquivalent();
        fetchHistory();
    }, [fetchDayEquivalent, fetchHistory]);

    // Minutes handlers
    const fetchMinutesHistory = useCallback(async () => {
        try {
            const res = await fetchWithAuth(`${API_BASE_URL_ADMINISTRATIVE}/api/dayEquivalentMinutes/get-all`);
            if (!res.ok) throw new Error("Failed to fetch day equivalent minutes history");
            const data: MinuteItem[] = await res.json();

            const grouped = new Map<string, number>();
            data.forEach(item => {
                if (!item.effectivityDate) return;
                const dateKey = toDateInputValue(item.effectivityDate);
                grouped.set(dateKey, (grouped.get(dateKey) ?? 0) + 1);
            });

            const historyRows: DayEquivalentHistory[] = Array.from(grouped.entries())
                .map(([effectivityDate, totalRows]) => ({ effectivityDate, totalRows }))
                .sort((a, b) => b.effectivityDate.localeCompare(a.effectivityDate));

            setMinuteHistory(historyRows);
        } catch (err) {
            console.error(err);
        }
    }, []);

    const fetchDayEquivalentMinutes = useCallback(async (dateToFetch?: string) => {
        const dateValue = dateToFetch || effectivityDate;
        if (!dateValue) return;

        try {
            setLoading(true);
            const res = await fetchWithAuth(`${API_BASE_URL_ADMINISTRATIVE}/api/dayEquivalentMinutes/get-all`);
            if (!res.ok) throw new Error("Failed to fetch day equivalent minutes");
            const data: MinuteItem[] = await res.json();

            const filtered = data.filter(item => item.effectivityDate?.startsWith(dateValue));
            if (filtered.length > 0) {
                setMinuteRows(
                    filtered.map(item => ({
                        dayEquivalentMinutesId: item.dayEquivalentMinutesId,
                        effectivityDate: item.effectivityDate,
                        minutes: item.minutes ?? "",
                        minutesEquivalent: item.minutesEquivalent ?? "",
                    }))
                );
            } else {
                setMinuteRows([{ minutes: "", minutesEquivalent: "" }]);
            }
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to load Day Equivalent Minutes table", "error");
        } finally {
            setLoading(false);
        }
    }, [effectivityDate]);

    useEffect(() => {
        if (skipMinuteFetchRef.current) {
            skipMinuteFetchRef.current = false;
            return;
        }
        fetchDayEquivalentMinutes();
        fetchMinutesHistory();
    }, [fetchDayEquivalentMinutes, fetchMinutesHistory]);

    const addRow = () => setRows(prev => [...prev, { hours: "", hoursEquivalent: "" }]);
    const removeRow = () => {
        setRows(prev => {
            if (prev.length <= 1) return prev;
            const removed = prev[prev.length - 1];
            if (removed && removed.dayEquivalentHoursId) {
                setDeletedRows(d => [...d, removed]);
            }
            return prev.slice(0, -1);
        });
    };

    const updateRow = (index: number, field: keyof HourItem, value: string) => {
        setRows(prev => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
    };

    // Minutes row handlers
    const addMinuteRow = () => setMinuteRows(prev => [...prev, { minutes: "", minutesEquivalent: "" }]);
    const removeMinuteRow = () => {
        setMinuteRows(prev => {
            if (prev.length <= 1) return prev;
            const removed = prev[prev.length - 1];
            if (removed && removed.dayEquivalentMinutesId) {
                setDeletedMinuteRows(d => [...d, removed]);
            }
            return prev.slice(0, -1);
        });
    };

    const updateMinuteRow = (index: number, field: keyof MinuteItem, value: string) => {
        setMinuteRows(prev => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
    };

    const checkExistingByEffectivityDate = async (date: string) => {
        const res = await fetchWithAuth(`${API_BASE_URL_ADMINISTRATIVE}/api/dayEquivalentHours/getBy/${toCustomFormat(date, false)}`);
        if (!res.ok) throw new Error("Failed to validate effectivity date");
        const data: HourItem[] = await res.json();
        return data;
    };

    const checkExistingMinutesByEffectivityDate = async (date: string) => {
        const res = await fetchWithAuth(`${API_BASE_URL_ADMINISTRATIVE}/api/dayEquivalentMinutes/getBy/${toCustomFormat(date, false)}`);
        if (!res.ok) throw new Error("Failed to validate minutes effectivity date");
        const data: MinuteItem[] = await res.json();
        return data;
    };

    const handleSave = async () => {
        try {
            if (!effectivityDate) {
                Swal.fire("Validation", "Effectivity Date is required", "warning");
                return;
            }

            if (rows.some(r => !r.hours.trim() || !r.hoursEquivalent.trim())) {
                Swal.fire("Validation", "Hours and Equivalent cannot be empty", "warning");
                return;
            }

            setLoading(true);
            const existingData = await checkExistingByEffectivityDate(effectivityDate);
            const isEditing = rows.some(r => r.dayEquivalentHoursId);

            if (!isEditing && existingData.length > 0) {
                Swal.fire({ icon: "warning", title: "Duplicate Effectivity Date", text: "Records already exist for this Effectivity Date. Please edit the existing data instead." });
                return;
            }

            const payload = rows.map(row => ({ ...row, effectivityDate: toCustomFormat(effectivityDate, false) }));
            const url = isEditing ? `${API_BASE_URL_ADMINISTRATIVE}/api/dayEquivalentHours/update` : `${API_BASE_URL_ADMINISTRATIVE}/api/dayEquivalentHours/create`;

            await fetchWithAuth(url, { method: isEditing ? "PUT" : "POST", body: JSON.stringify(payload) });

            // If there are removed rows that have persisted IDs, call deleteById endpoint
            if (deletedRows.length > 0) {
                try {
                    const delPayload = deletedRows.map(r => ({ dayEquivalentHoursId: r.dayEquivalentHoursId }));
                    await fetchWithAuth(`${API_BASE_URL_ADMINISTRATIVE}/api/dayEquivalentHours/deleteById`, {
                        method: "DELETE",
                        body: JSON.stringify(delPayload),
                    });
                    // clear deleted rows after successful deletion
                    setDeletedRows([]);
                } catch (err) {
                    console.error("Failed to delete removed rows:", err);
                }
            }

            Swal.fire("Success", "Day Equivalent saved successfully", "success");

            await fetchDayEquivalent(effectivityDate);
            fetchHistory();
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to save Day Equivalent", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleClear = async () => {
        if (!effectivityDate) return;
        const confirm = await Swal.fire({ text: `Clear records for ${effectivityDate}?`, icon: "warning", showCancelButton: true, confirmButtonText: "Clear" });
        if (!confirm.isConfirmed) return;
        try {
            setRows([{ hours: "", hoursEquivalent: "" }]);
            fetchHistory();
            Swal.fire("Cleared", "Records cleared successfully", "success");
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to clear records", "error");
        }
    };

    const handleClearMinutes = async () => {
        if (!effectivityDate) return;
        const confirm = await Swal.fire({ text: `Clear records for ${effectivityDate}?`, icon: "warning", showCancelButton: true, confirmButtonText: "Clear" });
        if (!confirm.isConfirmed) return;
        try {
            setMinuteRows([{ minutes: "", minutesEquivalent: "" }]);
            fetchMinutesHistory();
            Swal.fire("Cleared", "Records cleared successfully", "success");
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to clear records", "error");
        }
    };

    const handleEditHistory = async (selectedDate: string) => {
        try {
            setLoading(true);
            const res = await fetchWithAuth(`${API_BASE_URL_ADMINISTRATIVE}/api/dayEquivalentHours/getBy/${toCustomFormat(selectedDate, false)}`);
            if (!res.ok) throw new Error("Failed to fetch day equivalent for the selected date");
            const data: HourItem[] = await res.json();
            if (data.length > 0) {
                setRows(data.map(item => ({ dayEquivalentHoursId: item.dayEquivalentHoursId, effectivityDate: item.effectivityDate, hours: item.hours ?? "", hoursEquivalent: item.hoursEquivalent ?? "" })));
                skipFetchRef.current = true;
                setEffectivityDate(selectedDate);
            } else {
                setRows([{ hours: "", hoursEquivalent: "" }]);
                skipFetchRef.current = true;
                setEffectivityDate(selectedDate);
            }
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to load selected Day Equivalent", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleEditMinutesHistory = async (selectedDate: string) => {
        try {
            setLoading(true);
            const res = await fetchWithAuth(`${API_BASE_URL_ADMINISTRATIVE}/api/dayEquivalentMinutes/getBy/${toCustomFormat(selectedDate, false)}`);
            if (!res.ok) throw new Error("Failed to fetch day equivalent minutes for the selected date");
            const data: MinuteItem[] = await res.json();
            if (data.length > 0) {
                setMinuteRows(data.map(item => ({ dayEquivalentMinutesId: item.dayEquivalentMinutesId, effectivityDate: item.effectivityDate, minutes: item.minutes ?? "", minutesEquivalent: item.minutesEquivalent ?? "" })));
                skipMinuteFetchRef.current = true;
                setEffectivityDate(selectedDate);
            } else {
                setMinuteRows([{ minutes: "", minutesEquivalent: "" }]);
                skipMinuteFetchRef.current = true;
                setEffectivityDate(selectedDate);
            }
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to load selected Day Equivalent Minutes", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteHistory = async (date: string) => {
        const confirm = await Swal.fire({ text: `Delete day equivalent effective ${date}?`, icon: "warning", showCancelButton: true, confirmButtonText: "Delete" });
        if (!confirm.isConfirmed) return;
        try {
            await fetchWithAuth(`${API_BASE_URL_ADMINISTRATIVE}/api/dayEquivalentHours/delete/${toCustomFormat(date, false)}`, { method: "DELETE" });
            Swal.fire("Deleted", "History deleted successfully", "success");
            fetchHistory();
            if (date === effectivityDate) setRows([{ hours: "", hoursEquivalent: "" }]);
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to delete history", "error");
        }
    };

    const handleDeleteMinutesHistory = async (date: string) => {
        const confirm = await Swal.fire({ text: `Delete day equivalent minutes effective ${date}?`, icon: "warning", showCancelButton: true, confirmButtonText: "Delete" });
        if (!confirm.isConfirmed) return;
        try {
            await fetchWithAuth(`${API_BASE_URL_ADMINISTRATIVE}/api/dayEquivalentMinutes/delete/${toCustomFormat(date, false)}`, { method: "DELETE" });
            Swal.fire("Deleted", "History deleted successfully", "success");
            fetchMinutesHistory();
            if (date === effectivityDate) setMinuteRows([{ minutes: "", minutesEquivalent: "" }]);
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to delete history", "error");
        }
    };

    const handleSaveMinutes = async () => {
        try {
            if (!effectivityDate) {
                Swal.fire("Validation", "Effectivity Date is required", "warning");
                return;
            }

            if (minuteRows.some(r => !r.minutes.trim() || !r.minutesEquivalent.trim())) {
                Swal.fire("Validation", "Minutes and Equivalent cannot be empty", "warning");
                return;
            }

            setLoading(true);
            const existingData = await checkExistingMinutesByEffectivityDate(effectivityDate);
            const isEditing = minuteRows.some(r => r.dayEquivalentMinutesId);

            if (!isEditing && existingData.length > 0) {
                Swal.fire({ icon: "warning", title: "Duplicate Effectivity Date", text: "Records already exist for this Effectivity Date. Please edit the existing data instead." });
                return;
            }

            const payload = minuteRows.map(row => ({ ...row, effectivityDate: toCustomFormat(effectivityDate, false) }));
            const url = isEditing ? `${API_BASE_URL_ADMINISTRATIVE}/api/dayEquivalentMinutes/update` : `${API_BASE_URL_ADMINISTRATIVE}/api/dayEquivalentMinutes/create`;

            await fetchWithAuth(url, { method: isEditing ? "PUT" : "POST", body: JSON.stringify(payload) });

            // If there are removed rows that have persisted IDs, call deleteById endpoint
            if (deletedMinuteRows.length > 0) {
                try {
                    const delPayload = deletedMinuteRows.map(r => ({ dayEquivalentMinutesId: r.dayEquivalentMinutesId }));
                    await fetchWithAuth(`${API_BASE_URL_ADMINISTRATIVE}/api/dayEquivalentMinutes/deleteById`, {
                        method: "DELETE",
                        body: JSON.stringify(delPayload),
                    });
                    // clear deleted rows after successful deletion
                    setDeletedMinuteRows([]);
                } catch (err) {
                    console.error("Failed to delete removed rows:", err);
                }
            }

            Swal.fire("Success", "Day Equivalent Minutes saved successfully", "success");

            await fetchDayEquivalentMinutes(effectivityDate);
            fetchMinutesHistory();
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to save Day Equivalent Minutes", "error");
        } finally {
            setLoading(false);
        }
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
                            <button className={`${DayEquivalentTableStyle.tabButton} ${activeTab === "minute" ? DayEquivalentTableStyle.active : ""}`} onClick={() => setActiveTab("minute")}>
                                Minutes
                            </button>
                        </div>

                        <div className={DayEquivalentTableStyle.DayEquivalentTable}>
                            <div className={DayEquivalentTableStyle.toolbar}>
                                <button className={DayEquivalentTableStyle.newButton} onClick={activeTab === "hour" ? handleSave : handleSaveMinutes} disabled={loading}>
                                    💾 Save
                                </button>
                                <button className={DayEquivalentTableStyle.clearButton} onClick={activeTab === "hour" ? handleClear : handleClearMinutes}>
                                    ✖ Clear
                                </button>
                            </div>

                            <div className={DayEquivalentTableStyle.effectivityDate}>
                                <label>Effectivity Date</label>
                                <input type="date" value={effectivityDate} onChange={e => setEffectivityDate(e.target.value)} />
                            </div>

                            {activeTab === "hour" && (
                                <div className={DayEquivalentTableStyle.tableContainer}>
                                    <table className={DayEquivalentTableStyle.dayTable}>
                                        <thead>
                                            <tr>
                                                <th>Hour(s)</th>
                                                <th>Equivalent Day</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rows.map((row, idx) => (
                                                <tr key={idx}>
                                                    <td>
                                                        <input type="text" className={DayEquivalentTableStyle.earnedLeaveInput} value={row.hours} onChange={e => updateRow(idx, "hours", e.target.value)} />
                                                    </td>
                                                    <td>
                                                        <input type="text" className={DayEquivalentTableStyle.earnedLeaveInput} value={row.hoursEquivalent} onChange={e => updateRow(idx, "hoursEquivalent", e.target.value)} />
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr>
                                                <td colSpan={2} className={DayEquivalentTableStyle.addTableRow}>
                                                    <button className={DayEquivalentTableStyle.myButton} onClick={addRow}>+ Add</button>
                                                    &nbsp;&nbsp;&nbsp;
                                                    <button className={DayEquivalentTableStyle.myButton} onClick={removeRow}>− Remove</button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === "minute" && (
                                <div className={DayEquivalentTableStyle.tableContainer}>
                                    <table className={DayEquivalentTableStyle.dayTable}>
                                        <thead>
                                            <tr>
                                                <th>Minute(s)</th>
                                                <th>Equivalent Day</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {minuteRows.map((row, idx) => (
                                                <tr key={idx}>
                                                    <td>
                                                        <input type="text" className={DayEquivalentTableStyle.earnedLeaveInput} value={row.minutes} onChange={e => updateMinuteRow(idx, "minutes", e.target.value)} />
                                                    </td>
                                                    <td>
                                                        <input type="text" className={DayEquivalentTableStyle.earnedLeaveInput} value={row.minutesEquivalent} onChange={e => updateMinuteRow(idx, "minutesEquivalent", e.target.value)} />
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr>
                                                <td colSpan={2} className={DayEquivalentTableStyle.addTableRow}>
                                                    <button className={DayEquivalentTableStyle.myButton} onClick={addMinuteRow}>+ Add</button>
                                                    &nbsp;&nbsp;&nbsp;
                                                    <button className={DayEquivalentTableStyle.myButton} onClick={removeMinuteRow}>− Remove</button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* History */}
                            <div>&nbsp;</div>
                            <div className={DayEquivalentTableStyle.DayEquivalentTableHistory}>
                                <h3 className={DayEquivalentTableStyle.historyTitle}>{activeTab === "hour" ? "Day Equivalent History" : "Day Equivalent Minutes History"}</h3>
                                <table className={DayEquivalentTableStyle.table}>
                                    <thead>
                                        <tr>
                                            <th>Effectivity Date</th>
                                            <th>Total Rows</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeTab === "hour" && history.length === 0 && (
                                            <tr>
                                                <td colSpan={3} style={{ textAlign: "center" }}>No history available</td>
                                            </tr>
                                        )}
                                        {activeTab === "minute" && minuteHistory.length === 0 && (
                                            <tr>
                                                <td colSpan={3} style={{ textAlign: "center" }}>No history available</td>
                                            </tr>
                                        )}

                                        {activeTab === "hour" && history.map(item => (
                                            <tr key={item.effectivityDate}>
                                                <td>{item.effectivityDate}</td>
                                                <td>{item.totalRows}</td>
                                                <td>
                                                    <button className={`${DayEquivalentTableStyle.iconButton} ${DayEquivalentTableStyle.editIcon}`} onClick={() => handleEditHistory(item.effectivityDate)} title="Edit"><FaRegEdit /></button>
                                                    <button className={`${DayEquivalentTableStyle.iconButton} ${DayEquivalentTableStyle.deleteIcon}`} onClick={() => handleDeleteHistory(item.effectivityDate)} title="Delete"><FaTrashAlt /></button>
                                                </td>
                                            </tr>
                                        ))}

                                        {activeTab === "minute" && minuteHistory.map(item => (
                                            <tr key={item.effectivityDate}>
                                                <td>{item.effectivityDate}</td>
                                                <td>{item.totalRows}</td>
                                                <td>
                                                    <button className={`${DayEquivalentTableStyle.iconButton} ${DayEquivalentTableStyle.editIcon}`} onClick={() => handleEditMinutesHistory(item.effectivityDate)} title="Edit"><FaRegEdit /></button>
                                                    <button className={`${DayEquivalentTableStyle.iconButton} ${DayEquivalentTableStyle.deleteIcon}`} onClick={() => handleDeleteMinutesHistory(item.effectivityDate)} title="Delete"><FaTrashAlt /></button>
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
    );
}