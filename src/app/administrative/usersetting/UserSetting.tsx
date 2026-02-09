"use client"

import React, { useState, useEffect } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import { AiFillEye , AiFillEyeInvisible  } from "react-icons/ai";
import styles from "@/styles/UserSetting.module.scss";
import Swal from "sweetalert2";

export default function UserSetting() {
    type Users = {
        id: number;
        employeeNo: string;
        fullName: string;
        password: string;
    };

    const [userRole] = useState("1");
    const [inputValue, setInputValue] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [hidePassword, setHidePassword] = useState(false);
    const [isSearch, setIsSearch] = useState(true);
    const [displayIcon, setDisplayIcon] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Users | null>(null);

    const employees = [
        { id: 1, employeeNo: "2500001", fullName: 'Marco Polo', password: '' },
        { id: 2, employeeNo: "2500002", fullName: 'John Doe', password: '' },
        { id: 3, employeeNo: "2500003", fullName: 'Jane Doe', password: '' },
        { id: 4, employeeNo: "2500004", fullName: 'Marga Lister', password: '' },
        { id: 5, employeeNo: "2500005", fullName: 'Saint Charlos', password: '' },
        { id: 6, employeeNo: "2500006", fullName: 'Marcus Mars', password: '' },
        { id: 7, employeeNo: "2500007", fullName: 'Linda dane', password: '' },
    ];

    const handleClear = () => {
        setInputValue("");
        setPassword("");
        setShowPassword(false);
        setIsSearch(true);
        setDisplayIcon(false);
    }

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if(selectedEmployee) {
            if(isSearch) {
                // const { password } = selectedEmployee;
                // setPassword(password);
                setShowPassword(true);
            }

            if(!isSearch) {
                // const updated_emps = employees.map(e => e.id == selectedEmployee.id ? { ...e, password } : e);
                if(password.length >= 8) {
                    Swal.fire({
                        text: "Are you sure you want to save this password?",
                        icon: "info",
                        showCancelButton: true,
                        confirmButtonText: "Save",
                        allowOutsideClick: true,
                        backdrop: true,
                    }).then((result) => {
                        if(result.isConfirmed) {
                            setInputValue("");
                            setPassword("");
                            setShowPassword(false);
                            setIsSearch(true);
                            setDisplayIcon(false);

                            const Toast = Swal.mixin({
                                toast: true,
                                position: "bottom-end",
                                showConfirmButton: false,
                                timer: 2500,
                                timerProgressBar: true,
                                didOpen: (toast) => {
                                    toast.onmouseenter = Swal.stopTimer;
                                    toast.onmouseleave = Swal.resumeTimer;
                                }
                            });

                            Toast.fire({
                                icon: "success",
                                title: "Successfully saved!"
                            });
                        }
                    });
                } else {
                    Swal.fire({
                        text: "Password must atleast 8 character or above!",
                        icon: "warning",
                        confirmButtonText: "OK"
                    });
                }
                
            }
        }
    };

    useEffect(() => {
        setDisplayIcon(password.length > 0);
        setIsSearch(password.length == 0);
        // if(password) {
        //     if(password != '') {
        //         setIsSearch(false);
        //         setDispalyIcon(true);
        //     } else {
        //         setIsSearch(true);
        //     }
        // } 
    }, [password, selectedEmployee]);

    useEffect(() => {
        if(inputValue) {
            if(selectedEmployee == null) {
                setIsSearch(true);
                setDisplayIcon(false);
            }
        }
    }, [inputValue, selectedEmployee])

    return (
        <div className={modalStyles.Modal}>
            <div className={modalStyles.modalContent}>
                <div className={modalStyles.modalHeader}>
                    <h2 className={modalStyles.mainTitle}>User Setting</h2>
                </div>
                <div className={modalStyles.modalBody}>
                    <form className={styles.UserForm} onSubmit={onSubmit}>
                        <div className={styles.formGroup}>
                            <label htmlFor="employee">Employee Name</label>
                            <input
                                id="employee"
                                type="text"
                                list={userRole === "1" ? "employee-list" : undefined}
                                placeholder="Employee No / Lastname"
                                required={true}
                                value={
                                    userRole === "1"
                                    ? inputValue // ✅ Admin can type freely
                                    : selectedEmployee
                                    ? `[${selectedEmployee.employeeNo}] ${selectedEmployee.fullName}`
                                    : ""
                                }
                                readOnly={userRole !== "1"} // ✅ Non-admin can't edit
                                onChange={(e) => {
                                    if (userRole === "1") {
                                    setInputValue(e.target.value); // ✅ Track admin typing
                
                                    const selected = employees.find(
                                        (emp) =>
                                        `[${emp.employeeNo}] ${emp.fullName}`.toLowerCase() ===
                                        e.target.value.toLowerCase()
                                    );
                                    setSelectedEmployee(selected || null);
                                    }
                            }}/>
                            {userRole === "1" && (
                            <datalist id="employee-list">
                                {employees.map((emp) => (
                                <option
                                    key={emp.employeeNo}
                                    value={`[${emp.employeeNo}] ${emp.fullName}`}
                                />
                                ))}
                            </datalist>
                            )}
                            {showPassword && (
                                <>
                                    <label>Password</label>
                                    <div className={styles.passwordContainer}>
                                        <input
                                            type={hidePassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter password"
                                        />
                                        { displayIcon && (
                                            <div
                                                className={styles.showIcon}
                                                onClick={() => setHidePassword(!hidePassword)}
                                            >
                                                {hidePassword ? (
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
                            <button type="submit" className={isSearch ? styles.searchButton : styles.saveButton} >
                                {isSearch ? "Set Password" : "Save"}
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
    )
};