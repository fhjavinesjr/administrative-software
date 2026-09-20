"use client";

import { runtimeConfig } from "@/lib/utils/runtimeConfig";
import React, { useState, useEffect } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/ManagePersonnel.module.scss";
import { FaTrashAlt, FaUsers, FaPlus, FaSearch, FaEdit } from "react-icons/fa";
import Swal from "sweetalert2";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";
import { localStorageUtil } from "@/lib/utils/localStorageUtil";
import { Employee } from "@/lib/types/Employee";

const API_BASE_URL = runtimeConfig.getApiUrl("administrative");

type ManagePersonnelEntry = {
  id?: number;
  employeeId?: number;
  employeeNo?: string;
  employeeName: string;
  businessUnitId?: number;
  areaId?: number;
  head: boolean | number;
  coApprover: boolean | number;
  otherStatus: string;
  status?: string;
  base?: string;
  oicEffectiveFrom?: string | null;
  oicEffectiveTo?: string | null;
};

type RowSelection = {
  selected: boolean;
  head: boolean;
  coApprover: boolean;
};

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

const pageSizeOptions = [25, 50, 100, 300, 500, 750, 1000];

export default function ManagePersonnel() {
  const canAdd = localStorageUtil.canAdd("admin.managePersonnel");
  const canEdit = localStorageUtil.canEdit("admin.managePersonnel");
  const canDelete = localStorageUtil.canDelete("admin.managePersonnel");
  const canChooseAnyEmployee = canAdd && canEdit;
  const [areas, setAreas] = useState<Area[]>([]);
  const [units, setUnits] = useState<BusinessUnit[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  // Removed tempUnits state, no longer needed
  const [rowState, setRowState] = useState<Record<string, RowSelection>>({});
  const [entry, setEntry] = useState<ManagePersonnelEntry[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [otherStatus, setOtherStatus] = useState<{ [key: string]: string }>({});
  const [base, setBase] = useState<{ [key: string]: string }>({});
  const [oicEffectiveFrom, setOicEffectiveFrom] = useState<Record<string, string>>({});
  const [oicEffectiveTo, setOicEffectiveTo] = useState<Record<string, string>>({});
  const [fieldOne, setFieldOne] = useState(false);
  const [fieldTwo, setFieldTwo] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [empSearch, setEmpSearch] = useState("");

  // Fetch Areas
  useEffect(() => {
    fetchWithAuth(`${API_BASE_URL}/api/areas/get-all`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.statusText)))
      .then((data) => setAreas(data))
      .catch(() => setAreas([]));
  }, []);

  // Fetch Business Units
  useEffect(() => {
    fetchWithAuth(`${API_BASE_URL}/api/businessUnits/get-all`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.statusText)))
      .then((data) => setUnits(data))
      .catch(() => setUnits([]));
  }, []);

  // Load all employees from localStorage (master list, not filtered by business unit)
  useEffect(() => {
    const storedEmployees = localStorageUtil.getEmployees();
    if (canChooseAnyEmployee) {
      setEmployees(storedEmployees);
      return;
    }

    const employeeNo = localStorageUtil.getEmployeeNo();
    const currentEmployee = storedEmployees.find(
      (employee) => employee.employeeNo === employeeNo,
    );
    setEmployees(currentEmployee ? [currentEmployee] : []);
    setSearch(currentEmployee?.fullName ?? "");
    setRowState(
      currentEmployee
        ? {
            [currentEmployee.employeeNo]: {
              selected: true,
              head: false,
              coApprover: false,
            },
          }
        : {},
    );
  }, [canChooseAnyEmployee]);

  // Fetch Manage Personnel entries and enrich with employee info from localStorage
  useEffect(() => {
    const allEmployees = localStorageUtil.getEmployees();
    fetchWithAuth(`${API_BASE_URL}/api/manage-personnel/get-all`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.statusText)))
      .then((data: ManagePersonnelEntry[]) => {
        const enriched = data.map((entry) => {
          const emp = allEmployees.find(
            (e) => e.employeeId === entry.employeeId,
          );
          return {
            ...entry,
            employeeNo: emp?.employeeNo ?? "",
            employeeName: emp?.fullName ?? "",
          };
        });
        setEntry(enriched);
      })
      .catch(() => setEntry([]));
  }, [selectedUnit]);

  const filteredUnits = units.filter((unit) => {
    const area = areas.find((a) => a.areasId === unit.areasId);
    return area && area.areasName === selectedArea;
  });

  const selectedUnitObj = filteredUnits.find(
    (u) => u.businessUnitsName === selectedUnit,
  );
  const entryForSelectedUnit = entry.filter(
    (e) => e.businessUnitId === selectedUnitObj?.businessUnitsId,
  );

  const handleAdd = async () => {
    /* RBAC:handleAdd */

    if (!canAdd) {
      void Swal.fire({
        icon: "warning",
        title: "Permission denied",
        text: "You do not have permission to add this record.",
      });

      return;
    }
    if (hasSelectedEmployee) {
      const selected = employees.filter(
        (emp) => rowState[emp.employeeNo]?.selected,
      );

      // Validate: Main Base of Approval Level must be selected for all selected employees
      const missingBase = selected.filter((emp) => !base[emp.employeeNo]);
      if (missingBase.length > 0) {
        Swal.fire({
          icon: "warning",
          title: "Missing Main Base Approval Level",
          html: `Please select <b>Yes</b> or <b>No</b> for Main Base of Approval Level for:<br/><b>${missingBase.map((e) => e.fullName).join(", ")}</b>`,
        });
        return;
      }

      const invalidOic = selected.find((emp) => {
        const isOic = otherStatus[emp.employeeNo] === "OIC";
        const from = oicEffectiveFrom[emp.employeeNo];
        const to = oicEffectiveTo[emp.employeeNo];
        return isOic && (!rowState[emp.employeeNo]?.head || !from || (to && to < from));
      });
      if (invalidOic) {
        Swal.fire({
          icon: "warning",
          title: "Invalid OIC designation",
          text: "OIC must be marked as Head, requires an Effective From date, and its Effective To date cannot be earlier.",
        });
        return;
      }

      // Validate: An employee can only have Base=Yes in one Business Unit globally
      const alreadyBaseYes = selected.filter(
        (emp) =>
          base[emp.employeeNo] === "Yes" &&
          entry.some(
            (e) => e.employeeId === emp.employeeId && e.base === "Yes",
          ),
      );
      if (alreadyBaseYes.length > 0) {
        const conflicts = alreadyBaseYes.map((emp) => {
          const existing = entry.find(
            (e) => e.employeeId === emp.employeeId && e.base === "Yes",
          );
          const buName =
            units.find((u) => u.businessUnitsId === existing?.businessUnitId)
              ?.businessUnitsName ?? "another unit";
          return `<b>${emp.fullName}</b> already has Base=Yes in <b>${buName}</b>`;
        });
        Swal.fire({
          icon: "error",
          title: "Duplicate Base Assignment",
          html: `An employee can only have <b>Base=Yes</b> in one Business Unit:<br/><br/>${conflicts.join("<br/>")}`,
        });
        return;
      }
      const duplicates = selected.filter((emp) =>
        entryForSelectedUnit.some((e) => e.employeeId === emp.employeeId),
      );

      if (duplicates.length === selected.length) {
        Swal.fire({
          icon: "warning",
          title: "Already Designated",
          text: `${duplicates.map((e) => e.fullName).join(", ")} ${duplicates.length > 1 ? "are" : "is"} already in the designated list.`,
        });
        return;
      }

      if (duplicates.length > 0) {
        const confirm = await Swal.fire({
          icon: "warning",
          title: "Some Already Designated",
          html: `The following ${duplicates.length > 1 ? "employees are" : "employee is"} already designated and will be skipped:<br/><b>${duplicates.map((e) => e.fullName).join(", ")}</b>`,
          showCancelButton: true,
          confirmButtonText: "Continue with the rest",
          cancelButtonText: "Cancel",
        });
        if (!confirm.isConfirmed) return;
      }

      const newEmployees = selected
        .filter(
          (emp) =>
            !entryForSelectedUnit.some((e) => e.employeeId === emp.employeeId),
        )
        .map((emp) => ({
          employeeId: emp.employeeId,
          employeeNo: emp.employeeNo,
          employeeName: emp.fullName,
          businessUnitId: selectedUnitObj?.businessUnitsId,
          areaId: selectedUnitObj?.areasId,
          head: rowState[emp.employeeNo]?.head ? 1 : 0,
          coApprover: rowState[emp.employeeNo]?.coApprover ? 1 : 0,
          otherStatus: otherStatus[emp.employeeNo] || "",
          base: base[emp.employeeNo] || "",
          oicEffectiveFrom: otherStatus[emp.employeeNo] === "OIC"
            ? oicEffectiveFrom[emp.employeeNo]
            : null,
          oicEffectiveTo: otherStatus[emp.employeeNo] === "OIC"
            ? (oicEffectiveTo[emp.employeeNo] || null)
            : null,
        }));

      try {
        const res = await fetchWithAuth(
          `${API_BASE_URL}/api/manage-personnel/save`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newEmployees),
          },
        );

        if (!res.ok) throw new Error(await res.text());

        const saved: ManagePersonnelEntry[] = await res.json();
        const enriched = newEmployees.map((emp, i) => ({
          ...emp,
          id: saved[i]?.id,
        }));

        setEntry((prev) => [...prev, ...enriched]);
        setRowState({});
        setOtherStatus({});
        setBase({});
        setOicEffectiveFrom({});
        setOicEffectiveTo({});

        const Toast = Swal.mixin({
          toast: true,
          position: "bottom-end",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });

        Toast.fire({
          icon: "success",
          title: "Successfully Added!",
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Failed to save",
          text: error instanceof Error ? error.message : "An error occurred while saving. Please try again.",
        });
      }
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Select atleast one employee!",
      });
    }
  };

  const handleDelete = (id: number) => {
    /* RBAC:handleDelete */

    if (!canDelete) {
      void Swal.fire({
        icon: "warning",
        title: "Permission denied",
        text: "You do not have permission to delete this record.",
      });

      return;
    }
    Swal.fire({
      text: `Are you sure you want to delete this record?`,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Delete",
      allowOutsideClick: true,
      backdrop: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetchWithAuth(
            `${API_BASE_URL}/api/manage-personnel/delete/${id}`,
            { method: "DELETE" },
          );

          if (!res.ok) throw new Error(await res.text());

          setEntry((prev) => prev.filter((s) => s.id !== id));

          const Toast = Swal.mixin({
            toast: true,
            position: "bottom-end",
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.onmouseenter = Swal.stopTimer;
              toast.onmouseleave = Swal.resumeTimer;
            },
          });

          Toast.fire({
            icon: "success",
            title: "Successfully Deleted!",
          });
        } catch {
          Swal.fire({
            icon: "error",
            title: "Failed to delete",
            text: "An error occurred while deleting. Please try again.",
          });
        }
      }
    });
  };

  const handleEditDesignation = async (designation: ManagePersonnelEntry) => {
    if (!canEdit || !designation.id) return;
    const result = await Swal.fire({
      title: "Edit Personnel Designation",
      html: `
        <label style="display:flex;gap:8px;align-items:center;margin:8px 0"><input id="mp-head" type="checkbox"> Head</label>
        <label style="display:flex;gap:8px;align-items:center;margin:8px 0"><input id="mp-co" type="checkbox"> Co-Approver</label>
        <label style="display:block;text-align:left;margin-top:10px">Other Status</label>
        <select id="mp-status" class="swal2-select" style="width:100%;margin:4px 0"><option value="">None</option><option value="OIC">OIC</option></select>
        <label style="display:block;text-align:left;margin-top:10px">OIC Effective From</label><input id="mp-from" type="date" class="swal2-input" style="width:100%;margin:4px 0">
        <label style="display:block;text-align:left;margin-top:10px">OIC Effective To (optional)</label><input id="mp-to" type="date" class="swal2-input" style="width:100%;margin:4px 0">
        <label style="display:block;text-align:left;margin-top:10px">Main Base Approval Level</label>
        <select id="mp-base" class="swal2-select" style="width:100%;margin:4px 0"><option value="No">No</option><option value="Yes">Yes</option></select>`,
      didOpen: () => {
        (document.getElementById("mp-head") as HTMLInputElement).checked = Boolean(designation.head);
        (document.getElementById("mp-co") as HTMLInputElement).checked = Boolean(designation.coApprover);
        (document.getElementById("mp-status") as HTMLSelectElement).value = designation.otherStatus === "OIC" ? "OIC" : "";
        (document.getElementById("mp-from") as HTMLInputElement).value = designation.oicEffectiveFrom ?? "";
        (document.getElementById("mp-to") as HTMLInputElement).value = designation.oicEffectiveTo ?? "";
        (document.getElementById("mp-base") as HTMLSelectElement).value = designation.base === "Yes" ? "Yes" : "No";
      },
      showCancelButton: true,
      confirmButtonText: "Save Changes",
      preConfirm: () => {
        const status = (document.getElementById("mp-status") as HTMLSelectElement).value;
        const head = (document.getElementById("mp-head") as HTMLInputElement).checked;
        const from = (document.getElementById("mp-from") as HTMLInputElement).value;
        const to = (document.getElementById("mp-to") as HTMLInputElement).value;
        if (status === "OIC" && (!head || !from || (to && to < from))) {
          Swal.showValidationMessage("OIC must be marked Head and have a valid Effective From/To period.");
          return false;
        }
        return {
          head,
          coApprover: (document.getElementById("mp-co") as HTMLInputElement).checked,
          otherStatus: status,
          oicEffectiveFrom: status === "OIC" ? from : null,
          oicEffectiveTo: status === "OIC" ? (to || null) : null,
          base: (document.getElementById("mp-base") as HTMLSelectElement).value,
        };
      },
    });
    if (!result.isConfirmed || !result.value) return;
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/manage-personnel/update/${designation.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...designation, ...result.value }),
      });
      if (!response.ok) throw new Error(await response.text());
      const saved: ManagePersonnelEntry = await response.json();
      setEntry((current) => current.map((item) => item.id === designation.id
        ? { ...item, ...saved, employeeName: item.employeeName, employeeNo: item.employeeNo }
        : item));
      void Swal.fire({ icon: "success", title: "Designation updated", timer: 1600, showConfirmButton: false });
    } catch (error) {
      void Swal.fire({ icon: "error", title: "Update failed", text: error instanceof Error ? error.message : "Unable to update the designation." });
    }
  };

  // Always use the master employee list for Designate Personnel
  const filteredEmployees = employees.filter((emp) => {
    const q = search.toLowerCase();
    return (
      emp.fullName.toLowerCase().includes(q) ||
      emp.employeeNo.toLowerCase().includes(q)
    );
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, itemsPerPage]);

  const hasSelectedEmployee = filteredEmployees.some(
    (emp) => rowState[emp.employeeNo]?.selected,
  );

  const empResults =
    empSearch.trim().length > 0
      ? entry.filter((e) => {
          const q = empSearch.toLowerCase();
          return (
            e.employeeName.toLowerCase().includes(q) ||
            (e.employeeNo ?? "").toLowerCase().includes(q)
          );
        })
      : [];

  return (
    <div className={modalStyles.Modal}>
      <div className={modalStyles.modalContent}>
        <div className={modalStyles.modalHeader}>
          <h2 className={modalStyles.mainTitle}>Manage Personnel</h2>
        </div>
        <div className={modalStyles.modalBody}>
          <form className={styles.BusinessUnitsForm}>
            {/* Employee Business Unit Lookup */}
            <div className={styles.empLookupSection}>
              <label>Employee Business Unit Lookup</label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  placeholder="Search employee by name or ID..."
                  value={empSearch}
                  onChange={(e) => setEmpSearch(e.target.value)}
                />
                <span className={styles.iconSearch}>
                  <FaSearch />
                </span>
              </div>
              {empSearch.trim() !== "" &&
                (empResults.length > 0 ? (
                  <div className={styles.empLookupResults}>
                    <p className={styles.empLookupCount}>
                      <strong>{empResults[0].employeeName}</strong> is
                      designated in <strong>{empResults.length}</strong>{" "}
                      business unit{empResults.length !== 1 ? "s" : ""}.
                    </p>
                    <div className={styles.BusinessUnitsTable}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Employee No.</th>
                            <th>Employee Name</th>
                            <th>Business Unit</th>
                            <th>Area</th>
                            <th>Head</th>
                            <th>Co-Approver</th>
                            <th>Other Status</th>
                            <th>OIC Effective Period</th>
                            <th>Main Base of Approval Level</th>
                          </tr>
                        </thead>
                        <tbody>
                          {empResults.map((r, i) => {
                            const buName =
                              units.find(
                                (u) => u.businessUnitsId === r.businessUnitId,
                              )?.businessUnitsName ?? "—";
                            const areaName =
                              areas.find((a) => a.areasId === r.areaId)
                                ?.areasName ?? "—";
                            return (
                              <tr key={r.id ?? i}>
                                <td>{r.employeeNo}</td>
                                <td>{r.employeeName}</td>
                                <td>{buName}</td>
                                <td>{areaName}</td>
                                <td>{!!r.head ? "Yes" : "No"}</td>
                                <td>{!!r.coApprover ? "Yes" : "No"}</td>
                                <td>{r.otherStatus === "OIC" ? "OIC" : ""}</td>
                                <td>{r.otherStatus === "OIC" ? `${r.oicEffectiveFrom ?? ""}${r.oicEffectiveTo ? ` to ${r.oicEffectiveTo}` : " onward"}` : ""}</td>
                                <td>{r.base}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className={styles.noPersonnel}>
                    No designations found for &ldquo;{empSearch}&rdquo;.
                  </p>
                ))}
            </div>

            <label>Areas</label>
            <select
              className={styles.main_select}
              id="businessUnit"
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              required
            >
              <option value="" disabled>
                Select Areas
              </option>

              {areas.map((a) => (
                <option key={a.areasId} value={a.areasName}>
                  {a.areasName}
                </option>
              ))}
            </select>
            {selectedArea.trim() != "" && (
              <div>
                <label>Business Unit</label>
                <select
                  className={styles.main_select}
                  id="unit"
                  required
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                >
                  <option value="" disabled>
                    Select Unit
                  </option>
                  {filteredUnits.map((unit) => (
                    <option
                      key={unit.businessUnitsId}
                      value={unit.businessUnitsName}
                    >
                      {unit.businessUnitsName}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {selectedUnit.trim() != "" && (
              <div>
                <h2>{selectedUnit}</h2>
                <div
                  className={styles.designatedbtn}
                  onClick={() => {
                    setFieldOne((prev) => !prev);
                  }}
                >
                  <span className={styles.icon}>
                    <FaUsers size={15} />
                  </span>
                  <span className="text">
                    View{" "}
                    {entryForSelectedUnit.length > 0 &&
                      ` (${entryForSelectedUnit.length})`}{" "}
                    Designated Personnel
                  </span>
                </div>
                <div
                  className={`${styles.containerUnit} ${
                    fieldOne ? styles.open : styles.closed
                  }`}
                >
                  {entryForSelectedUnit.length > 0 ? (
                    <div className={styles.designatedTable}>
                      <div
                        className={`${styles.BusinessUnitsTable} ${
                          fieldOne ? styles.open : styles.closed
                        }`}
                      >
                        <table className={styles.table}>
                          <thead>
                            <tr>
                              <th>Employee No.</th>
                              <th>Employee Name</th>
                              <th>Head</th>
                              <th>Co-Approver</th>
                              <th>Other Status</th>
                              <th>OIC Effective Period</th>
                              <th>Main Base of Approval Level</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {entryForSelectedUnit.map((ent, indx) => (
                              <tr key={ent.employeeNo ?? `row-${indx}`}>
                                <td>{ent.employeeNo}</td>
                                <td>{ent.employeeName}</td>
                                <td>{!!ent.head ? "Yes" : "No"}</td>
                                <td>{!!ent.coApprover ? "Yes" : "No"}</td>
                                <td>{ent.otherStatus === "OIC" ? "OIC" : ""}</td>
                                <td>{ent.otherStatus === "OIC" ? `${ent.oicEffectiveFrom ?? ""}${ent.oicEffectiveTo ? ` to ${ent.oicEffectiveTo}` : " onward"}` : ""}</td>
                                <td>{ent.base}</td>
                                <td>
                                  <button
                                    className={styles.iconButton}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      void handleEditDesignation(ent);
                                    }}
                                    title="Edit designation"
                                    disabled={!canEdit}
                                  >
                                    <FaEdit size={17} />
                                  </button>
                                  <button
                                    className={`${styles.iconButton} ${styles.deleteIcon}`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleDelete(ent.id!);
                                    }}
                                    title="Delete"
                                    disabled={!canDelete}
                                  >
                                    <FaTrashAlt size={17} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <p className={styles.noPersonnel}>
                      No designated personnel yet.
                    </p>
                  )}
                </div>
              </div>
            )}

            {selectedUnit.trim() != "" && (
              <div>
                <div
                  className={`${styles.designatedbtn} ${styles.designatebtn}`}
                  onClick={() => {
                    setFieldTwo((prev) => !prev);
                  }}
                >
                  <span className={styles.icon}>
                    <FaUsers size={15} />
                  </span>
                  <span className="text">Designate Personnel</span>
                </div>
                {/* {fieldTwo && ( */}
                <div
                  className={`${styles.containerUnit} ${
                    fieldTwo ? styles.open : styles.closed
                  }`}
                >
                  <div className={styles.search}>
                    <div className={styles.inputWrapper}>
                      <input
                        placeholder="Search Employee"
                        type="text"
                        value={search}
                        readOnly={!canChooseAnyEmployee}
                        onChange={(e) => {
                          if (!canChooseAnyEmployee) return;
                          setSearch(e.target.value);
                        }}
                      />
                      <span className={styles.iconSearch}>
                        <FaSearch />
                      </span>
                    </div>
                    <div className={styles.paginationControls}>
                      <label>Rows per page: </label>
                      <select
                        className={styles.row_select}
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                      >
                        {pageSizeOptions.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                      <span className={styles.recordInfo}>
                        Showing{" "}
                        {filteredEmployees.length === 0 ? 0 : startIndex + 1} to{" "}
                        {Math.min(endIndex, filteredEmployees.length)} of{" "}
                        {filteredEmployees.length}
                      </span>
                      <button
                        className={styles.pageBtn}
                        disabled={currentPage === 1}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(1);
                        }}
                      >
                        First
                      </button>
                      <button
                        className={styles.pageBtn}
                        disabled={currentPage === 1}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage((p) => Math.max(p - 1, 1));
                        }}
                      >
                        Previous
                      </button>
                      <span className={styles.pageIndicator}>
                        Page {currentPage} of {totalPages || 1}
                      </span>
                      <button
                        className={styles.pageBtn}
                        disabled={
                          currentPage === totalPages || totalPages === 0
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage((p) => Math.min(p + 1, totalPages));
                        }}
                      >
                        Next
                      </button>
                      <button
                        className={styles.pageBtn}
                        disabled={
                          currentPage === totalPages || totalPages === 0
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(totalPages);
                        }}
                      >
                        Last
                      </button>
                    </div>
                  </div>
                  <div className={styles.BusinessUnitsTable}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Select</th>
                          <th>Employee No.</th>
                          <th>Employee Name</th>
                          <th>Head</th>
                          <th>Co-Approver</th>
                          <th>Other Status</th>
                          <th>OIC Effective From</th>
                          <th>OIC Effective To</th>
                          <th>Main Base Approval level</th>
                        </tr>
                      </thead>
                      {paginatedEmployees.length > 0 && (
                        <tbody>
                          {paginatedEmployees.map((emp, indx) => (
                            <tr key={emp.employeeNo ?? `row-${indx}`}>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={
                                    rowState[emp.employeeNo]?.selected || false
                                  }
                                  disabled={!canChooseAnyEmployee}
                                  onChange={(e) =>
                                    setRowState((prev) => ({
                                      ...prev,
                                      [emp.employeeNo]: {
                                        ...prev[emp.employeeNo],
                                        selected: e.target.checked,
                                      },
                                    }))
                                  }
                                />
                              </td>
                              <td>{emp.employeeNo}</td>
                              <td>{emp.fullName}</td>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={
                                    rowState[emp.employeeNo]?.head || false
                                  }
                                  onChange={(e) =>
                                    setRowState((prev) => ({
                                      ...prev,
                                      [emp.employeeNo]: {
                                        ...prev[emp.employeeNo],
                                        head: e.target.checked,
                                      },
                                    }))
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={
                                    rowState[emp.employeeNo]?.coApprover ||
                                    false
                                  }
                                  onChange={(e) =>
                                    setRowState((prev) => ({
                                      ...prev,
                                      [emp.employeeNo]: {
                                        ...prev[emp.employeeNo],
                                        coApprover: e.target.checked,
                                      },
                                    }))
                                  }
                                />
                              </td>
                              <td>
                                <select
                                  className={styles.stastus_base_base}
                                  id="otherStatus"
                                  value={otherStatus[emp.employeeNo] || ""}
                                  onChange={(e) => {
                                    setOtherStatus((prev) => ({
                                      ...prev,
                                      [emp.employeeNo]: e.target.value,
                                    }));
                                    if (e.target.value === "OIC") {
                                      setRowState((prev) => ({
                                        ...prev,
                                        [emp.employeeNo]: { ...prev[emp.employeeNo], head: true },
                                      }));
                                    } else {
                                      setOicEffectiveFrom((prev) => ({ ...prev, [emp.employeeNo]: "" }));
                                      setOicEffectiveTo((prev) => ({ ...prev, [emp.employeeNo]: "" }));
                                    }
                                  }}
                                >
                                  <option value=""></option>
                                  <option value="OIC">OIC</option>
                                </select>
                              </td>
                              <td>
                                <input
                                  type="date"
                                  className={styles.stastus_base_base}
                                  value={oicEffectiveFrom[emp.employeeNo] || ""}
                                  disabled={otherStatus[emp.employeeNo] !== "OIC"}
                                  onChange={(e) => setOicEffectiveFrom((prev) => ({ ...prev, [emp.employeeNo]: e.target.value }))}
                                />
                              </td>
                              <td>
                                <input
                                  type="date"
                                  className={styles.stastus_base_base}
                                  value={oicEffectiveTo[emp.employeeNo] || ""}
                                  min={oicEffectiveFrom[emp.employeeNo] || undefined}
                                  disabled={otherStatus[emp.employeeNo] !== "OIC"}
                                  onChange={(e) => setOicEffectiveTo((prev) => ({ ...prev, [emp.employeeNo]: e.target.value }))}
                                />
                              </td>
                              <td>
                                <select
                                  className={styles.stastus_base_base}
                                  id="otherStatus"
                                  value={base[emp.employeeNo] || ""}
                                  onChange={(e) =>
                                    setBase((prev) => ({
                                      ...prev,
                                      [emp.employeeNo]: e.target.value,
                                    }))
                                  }
                                >
                                  <option value=""></option>
                                  <option value="Yes">Yes</option>
                                  <option value="No">No</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      )}
                    </table>
                  </div>
                </div>
                {/* )} */}
                {fieldTwo && (
                  <div className={styles.buttonGroup}>
                    <button
                      type="button"
                      className={styles.saveButton}
                      disabled={!canAdd}
                      onClick={handleAdd}
                    >
                      <FaPlus size={15} />
                      <span className={styles.addBtn}>Add</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
