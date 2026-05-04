"use client"

import React, { useState, useEffect } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/ApprovalWorkflow.module.scss";
import { FaTrashAlt, FaUsers, FaPlus, FaSearch } from "react-icons/fa";
import Swal from "sweetalert2";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";
import { localStorageUtil } from "@/lib/utils/localStorageUtil";
import { Employee } from "@/lib/types/Employee";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_ADMINISTRATIVE;

type Area = {
    areasId: number;
    areasName: string;
    areasDescription: string;
};

type BusinessUnit = {
    businessUnitsId: number;
    businessUnitsName: string;
    businessUnitsCode: string;
    areasId: number;
};

type EmployeeRequest = {
    employeeRequestId: number;
    code: string;
    name: string;
    max: number;
};

type ManagePersonnelEntry = {
    id: number;
    employeeId: number;
    businessUnitId: number;
    areaId: number;
    head: boolean;
    coApprover: boolean;
    otherStatus: string;
    base: string;
    // enriched
    employeeNo?: string;
    employeeName?: string;
};

type WorkflowEntry = {
    approvalWorkflowId?: number;
    employeeId: number;
    businessUnitId: number;
    areaId: number;
    employeeRequestId: number;
    approvalLevel: number;
    // enriched
    employeeName?: string;
    status?: string;
};

export default function ApprovalWorkFlow() {
    const [areas, setAreas] = useState<Area[]>([]);
    const [units, setUnits] = useState<BusinessUnit[]>([]);
    const [employeeRequests, setEmployeeRequests] = useState<EmployeeRequest[]>([]);
    const [designatedPersonnel, setDesignatedPersonnel] = useState<ManagePersonnelEntry[]>([]);
    const [workflowEntries, setWorkflowEntries] = useState<WorkflowEntry[]>([]);

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedAreaId, setSelectedAreaId] = useState<number | "">("");
    const [selectedUnitId, setSelectedUnitId] = useState<number | "">("");
    const [selectedRequestId, setSelectedRequestId] = useState<number | "">("");
    const [search, setSearch] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [fieldOne, setFieldOne] = useState(false);

    // Load master employee list from localStorage
    useEffect(() => {
        setEmployees(localStorageUtil.getEmployees());
    }, []);

    // Fetch Areas
    useEffect(() => {
        fetchWithAuth(`${API_BASE_URL}/api/areas/get-all`)
            .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
            .then(data => setAreas(data))
            .catch(() => setAreas([]));
    }, []);

    // Fetch Business Units
    useEffect(() => {
        fetchWithAuth(`${API_BASE_URL}/api/businessUnits/get-all`)
            .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
            .then(data => setUnits(data))
            .catch(() => setUnits([]));
    }, []);

    // Fetch Employee Requests
    useEffect(() => {
        fetchWithAuth(`${API_BASE_URL}/api/employeeRequest/get-all`)
            .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
            .then(data => setEmployeeRequests(data))
            .catch(() => setEmployeeRequests([]));
    }, []);

    // Fetch ManagePersonnel whenever selected unit changes
    useEffect(() => {
        if (selectedUnitId === "") {
            setDesignatedPersonnel([]);
            return;
        }
        const allEmployees = localStorageUtil.getEmployees();
        fetchWithAuth(`${API_BASE_URL}/api/manage-personnel/get-all`)
            .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
            .then((data: ManagePersonnelEntry[]) => {
                const filtered = data
                    .filter(p => p.businessUnitId === selectedUnitId)
                    .map(p => {
                        const emp = allEmployees.find(e => e.employeeId === p.employeeId);
                        return {
                            ...p,
                            employeeNo: emp?.employeeNo ?? "",
                            employeeName: emp?.fullName ?? "",
                        };
                    });
                setDesignatedPersonnel(filtered);
            })
            .catch(() => setDesignatedPersonnel([]));
    }, [selectedUnitId]);

    // Fetch ApprovalWorkflow entries whenever unit + request changes
    useEffect(() => {
        if (selectedUnitId === "" || selectedRequestId === "") {
            setWorkflowEntries([]);
            return;
        }
        const allEmployees = localStorageUtil.getEmployees();
        fetchWithAuth(
            `${API_BASE_URL}/api/approval-workflow/get-by-unit-and-request?businessUnitId=${selectedUnitId}&employeeRequestId=${selectedRequestId}`
        )
            .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
            .then((data: WorkflowEntry[]) => {
                const enriched = data.map(entry => {
                    const emp = allEmployees.find(e => e.employeeId === entry.employeeId);
                    return { ...entry, employeeName: emp?.fullName ?? "" };
                });
                // sort by approvalLevel
                enriched.sort((a, b) => (a.approvalLevel ?? 0) - (b.approvalLevel ?? 0));
                setWorkflowEntries(enriched);
            })
            .catch(() => setWorkflowEntries([]));
    }, [selectedUnitId, selectedRequestId]);

    const filteredUnits = units.filter(u => u.areasId === selectedAreaId);

    const selectedUnit = units.find(u => u.businessUnitsId === selectedUnitId);
    const selectedRequest = employeeRequests.find(r => r.employeeRequestId === selectedRequestId);

    const resolveStatus = (p: ManagePersonnelEntry): string => {
        if (p.head) return "Head";
        if (p.coApprover) return "Co-Approver";
        if (p.otherStatus) return p.otherStatus;
        return "Rank and File";
    };

    const handleAdd = async () => {
        if (!selectedEmployee) {
            Swal.fire({ icon: "error", title: "Oops...", text: "Select an employee from the list!" });
            return;
        }
        if (selectedUnitId === "" || selectedRequestId === "") return;

        const alreadyAdded = workflowEntries.some(e => e.employeeId === selectedEmployee.employeeId);
        if (alreadyAdded) {
            Swal.fire({ icon: "warning", title: "Already Added", text: `${selectedEmployee.fullName} is already in the workflow.` });
            return;
        }

        const payload: WorkflowEntry = {
            employeeId: selectedEmployee.employeeId,
            businessUnitId: selectedUnitId as number,
            areaId: selectedAreaId as number,
            employeeRequestId: selectedRequestId as number,
            approvalLevel: workflowEntries.length + 1,
        };

        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/api/approval-workflow/save`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(await res.text());
            const saved: WorkflowEntry = await res.json();
            const personnelEntry = designatedPersonnel.find(p => p.employeeId === selectedEmployee.employeeId);
            setWorkflowEntries(prev => [
                ...prev,
                {
                    ...saved,
                    employeeName: selectedEmployee.fullName,
                    status: personnelEntry ? resolveStatus(personnelEntry) : "Rank and File",
                },
            ]);
            setSearch("");
            setSelectedEmployee(null);

            const Toast = Swal.mixin({
                toast: true, position: "bottom-end",
                showConfirmButton: false, timer: 2000, timerProgressBar: true,
                didOpen: (toast) => {
                    toast.onmouseenter = Swal.stopTimer;
                    toast.onmouseleave = Swal.resumeTimer;
                }
            });
            Toast.fire({ icon: "success", title: "Successfully Added!" });
        } catch {
            Swal.fire({ icon: "error", title: "Failed to save", text: "An error occurred. Please try again." });
        }
    };

    const handleDelete = (entry: WorkflowEntry, index: number) => {
        Swal.fire({
            text: `Are you sure you want to delete "${entry.employeeName}" from the workflow?`,
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Delete",
            allowOutsideClick: true,
            backdrop: true,
        }).then(async result => {
            if (!result.isConfirmed) return;
            try {
                const res = await fetchWithAuth(
                    `${API_BASE_URL}/api/approval-workflow/delete/${entry.approvalWorkflowId}`,
                    { method: "DELETE" }
                );
                if (!res.ok) throw new Error(await res.text());
                // remove and re-number
                setWorkflowEntries(prev => {
                    const updated = prev.filter((_, i) => i !== index);
                    return updated.map((e, i) => ({ ...e, approvalLevel: i + 1 }));
                });
                const Toast = Swal.mixin({
                    toast: true, position: "bottom-end",
                    showConfirmButton: false, timer: 2000, timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.onmouseenter = Swal.stopTimer;
                        toast.onmouseleave = Swal.resumeTimer;
                    }
                });
                Toast.fire({ icon: "success", title: "Successfully Deleted!" });
            } catch {
                Swal.fire({ icon: "error", title: "Failed to delete", text: "An error occurred. Please try again." });
            }
        });
    };

    return (
        <div className={modalStyles.Modal}>
            <div className={modalStyles.modalContent}>
                <div className={modalStyles.modalHeader}>
                    <h2 className={modalStyles.mainTitle}>Approval Workflow</h2>
                </div>
                <div className={modalStyles.modalBody}>
                    <form className={styles.ApprovalWorkflowForm}>
                        <label>Areas</label>
                        <select
                            value={selectedAreaId}
                            onChange={(e) => {
                                setSelectedAreaId(e.target.value ? Number(e.target.value) : "");
                                setSelectedUnitId("");
                                setSelectedRequestId("");
                                setWorkflowEntries([]);
                                setDesignatedPersonnel([]);
                                setSearch("");
                                setFieldOne(false);
                            }}
                            required>
                            <option value="" disabled>Select Areas</option>
                            {areas.map(a => (
                                <option key={a.areasId} value={a.areasId}>{a.areasName}</option>
                            ))}
                        </select>

                        {selectedAreaId !== "" && (
                            <div>
                                <label>Business Unit</label>
                                <select
                                    value={selectedUnitId}
                                    onChange={(e) => {
                                        setSelectedUnitId(e.target.value ? Number(e.target.value) : "");
                                        setSelectedRequestId("");
                                        setWorkflowEntries([]);
                                        setSearch("");
                                        setFieldOne(false);
                                    }}
                                    required>
                                    <option value="" disabled>Select Unit</option>
                                    {filteredUnits.map(u => (
                                        <option key={u.businessUnitsId} value={u.businessUnitsId}>
                                            {u.businessUnitsName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {selectedUnitId !== "" && (
                            <div>
                                <label>Employee Request</label>
                                <select
                                    value={selectedRequestId}
                                    onChange={(e) => {
                                        setSelectedRequestId(e.target.value ? Number(e.target.value) : "");
                                        setSearch("");
                                    }}
                                    required>
                                    <option value="" disabled>Select</option>
                                    {employeeRequests.map(r => (
                                        <option key={r.employeeRequestId} value={r.employeeRequestId}>
                                            {r.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {selectedRequestId !== "" && (
                            <div>
                                <h2>{selectedUnit?.businessUnitsName}</h2>

                                {/* Designated Personnel collapsible */}
                                <div className={styles.designatedbtn} onClick={() => setFieldOne(prev => !prev)}>
                                    <span className={styles.icon}><FaUsers size={15} /></span>
                                    <span>View{designatedPersonnel.length > 0 ? ` (${designatedPersonnel.length})` : ""} Designated Personnel</span>
                                </div>
                                <div className={`${styles.containerUnit} ${fieldOne ? styles.open : styles.closed}`}>
                                    <div className={styles.designatedTable}>
                                        <div className={styles.ApprovalWorkflowTable}>
                                            <table className={styles.table}>
                                                <thead>
                                                    <tr>
                                                        <th>Employee No.</th>
                                                        <th>Employee Name</th>
                                                        <th>Status</th>
                                                        <th>Other Status</th>
                                                        <th>Main Base of Approval Level</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {designatedPersonnel.map((p, i) => (
                                                        <tr key={p.id ?? i}>
                                                            <td>{p.employeeNo}</td>
                                                            <td>{p.employeeName}</td>
                                                            <td>{p.head ? "Head" : p.coApprover ? "Co-Approver" : "Rank and File"}</td>
                                                            <td>{p.otherStatus}</td>
                                                            <td>{p.base}</td>
                                                        </tr>
                                                    ))}
                                                    {designatedPersonnel.length === 0 && (
                                                        <tr><td colSpan={5} className={styles.noPersonnel}>No designated personnel for this unit.</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* Search + Add */}
                                <div className={styles.containerRequestEmployeeField}>
                                    <div className={styles.search}>
                                        <div className={styles.inputWrapper}>
                                            <input
                                                type="text"
                                                list="master-employees"
                                                placeholder="Search by Employee No / Name"
                                                value={search}
                                                onChange={(e) => {
                                                    setSearch(e.target.value);
                                                    const match = employees.find(
                                                        emp =>
                                                            `[${emp.employeeNo}] ${emp.fullName}`.toLowerCase() ===
                                                            e.target.value.toLowerCase()
                                                    );
                                                    setSelectedEmployee(match ?? null);
                                                }}
                                            />
                                            <datalist id="master-employees">
                                                {employees.map(emp => (
                                                    <option
                                                        key={emp.employeeNo}
                                                        value={`[${emp.employeeNo}] ${emp.fullName}`}
                                                    />
                                                ))}
                                            </datalist>
                                            <span className={styles.iconSearch}><FaSearch /></span>
                                        </div>
                                        <div className={styles.btnGroup}>
                                            <button type="button" onClick={handleAdd} className={styles.saveButton}>
                                                <FaPlus size={15} />
                                                <span className={styles.addBtn}>Add</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Workflow Entries Table */}
                                    <div className={styles.ApprovalWorkflowTable}>
                                        <table className={styles.table}>
                                            <thead>
                                                <tr>
                                                    <th>Approval Level</th>
                                                    <th>Employee Name</th>
                                                    <th>Status</th>
                                                    <th>Under</th>
                                                    <th>Employee Request</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            {workflowEntries.length > 0 && (
                                                <tbody>
                                                    {workflowEntries.map((ent, i) => {
                                                        const personnel = designatedPersonnel.find(p => p.employeeId === ent.employeeId);
                                                        const status = ent.status ?? (personnel ? resolveStatus(personnel) : "Rank and File");
                                                        return (
                                                            <tr key={ent.approvalWorkflowId ?? i}>
                                                                <td>{i + 1}</td>
                                                                <td>{ent.employeeName}</td>
                                                                <td>{status}</td>
                                                                <td>{selectedUnit?.businessUnitsName}</td>
                                                                <td>{selectedRequest?.name}</td>
                                                                <td>
                                                                    <button
                                                                        className={`${styles.iconButton} ${styles.deleteIcon}`}
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            handleDelete(ent, i);
                                                                        }}
                                                                        title="Delete">
                                                                        <FaTrashAlt size={15} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            )}
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}