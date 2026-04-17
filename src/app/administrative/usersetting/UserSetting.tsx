"use client"

import React, { useState, useEffect } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import styles from "@/styles/Usersetting.module.scss";
import Swal from "sweetalert2";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";
import { localStorageUtil } from "@/lib/utils/localStorageUtil";
import { Employee } from "@/lib/types/Employee";

const API_BASE_URL_HRM = process.env.NEXT_PUBLIC_API_BASE_URL_HRM;

export default function UserSetting() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        setEmployees(localStorageUtil.getEmployees());
    }, []);

    const handleClear = () => {
        setInputValue("");
        setSelectedEmployee(null);
        setShowPasswordFields(false);
        setNewPassword("");
        setConfirmPassword("");
        setShowNewPassword(false);
        setShowConfirmPassword(false);
    };

    const handleSetPassword = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedEmployee) {
            Swal.fire({ icon: "warning", text: "Please select an employee first.", confirmButtonText: "OK" });
            return;
        }

        if (!showPasswordFields) {
            setShowPasswordFields(true);
            return;
        }

        // Save flow
        if (newPassword.length < 8) {
            Swal.fire({ icon: "warning", text: "Password must be at least 8 characters.", confirmButtonText: "OK" });
            return;
        }

        if (newPassword !== confirmPassword) {
            Swal.fire({ icon: "warning", text: "Passwords do not match.", confirmButtonText: "OK" });
            return;
        }

        Swal.fire({
            text: `Change password for ${selectedEmployee.fullName}?`,
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Save",
            allowOutsideClick: true,
        }).then(async (result) => {
            if (!result.isConfirmed) return;

            try {
                const res = await fetchWithAuth(
                    `${API_BASE_URL_HRM}/api/employee/admin/reset-password/${selectedEmployee.employeeId}`,
                    {
                        method: "PUT",
                        body: JSON.stringify({ newPassword }),
                    }
                );

                if (!res.ok) throw new Error(await res.text());

                handleClear();

                const Toast = Swal.mixin({
                    toast: true,
                    position: "bottom-end",
                    showConfirmButton: false,
                    timer: 2500,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.onmouseenter = Swal.stopTimer;
                        toast.onmouseleave = Swal.resumeTimer;
                    },
                });
                Toast.fire({ icon: "success", title: "Password changed successfully!" });
            } catch {
                Swal.fire({ icon: "error", title: "Failed", text: "Could not change password. Please try again." });
            }
        });
    };

    const isReadyToSave = showPasswordFields && newPassword.length > 0 && confirmPassword.length > 0;

    return (
        <div className={modalStyles.Modal}>
            <div className={modalStyles.modalContent}>
                <div className={modalStyles.modalHeader}>
                    <h2 className={modalStyles.mainTitle}>User Setting</h2>
                </div>
                <div className={modalStyles.modalBody}>
                    <form className={styles.UserForm} onSubmit={handleSetPassword}>
                        <div className={styles.formGroup}>
                            <label htmlFor="employee">Employee Name</label>
                            <input
                                id="employee"
                                type="text"
                                list="employee-list"
                                placeholder="Employee No / Name"
                                required
                                value={inputValue}
                                onChange={(e) => {
                                    setInputValue(e.target.value);
                                    const match = employees.find(
                                        (emp) =>
                                            `[${emp.employeeNo}] ${emp.fullName}`.toLowerCase() ===
                                            e.target.value.toLowerCase()
                                    );
                                    setSelectedEmployee(match ?? null);
                                    if (!match) {
                                        setShowPasswordFields(false);
                                        setNewPassword("");
                                        setConfirmPassword("");
                                    }
                                }}
                            />
                            <datalist id="employee-list">
                                {employees.map((emp) => (
                                    <option
                                        key={emp.employeeNo}
                                        value={`[${emp.employeeNo}] ${emp.fullName}`}
                                    />
                                ))}
                            </datalist>

                            {showPasswordFields && (
                                <>
                                    <label>New Password</label>
                                    <div className={styles.passwordContainer}>
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter new password (min. 8 characters)"
                                        />
                                        {newPassword.length > 0 && (
                                            <div
                                                className={styles.showIcon}
                                                onClick={() => setShowNewPassword((prev) => !prev)}
                                            >
                                                {showNewPassword ? (
                                                    <AiFillEyeInvisible size={23} />
                                                ) : (
                                                    <AiFillEye size={23} />
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <label>Confirm Password</label>
                                    <div className={styles.passwordContainer}>
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Re-enter new password"
                                        />
                                        {confirmPassword.length > 0 && (
                                            <div
                                                className={styles.showIcon}
                                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                            >
                                                {showConfirmPassword ? (
                                                    <AiFillEyeInvisible size={23} />
                                                ) : (
                                                    <AiFillEye size={23} />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className={styles.buttonGroup}>
                            <button
                                type="submit"
                                className={isReadyToSave ? styles.saveButton : styles.searchButton}
                            >
                                {isReadyToSave ? "Save" : "Set Password"}
                            </button>
                            <button
                                type="button"
                                className={styles.clearButton}
                                onClick={handleClear}
                            >
                                Clear
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
