"use client";

import { useState } from "react";
import SalaryScheduleForm from "./SalaryScheduleForm";
import SalaryScheduleTable from "./SalaryScheduleTable";
import AuditTrailTable from "./SalaryScheduleTrailTable";
import salaryScheduleStyle from "@/styles/SalarySchedule.module.scss";
import modalStyles from "@/styles/Modal.module.scss";

export default function SalarySchedulePage() {
  const [activeTab, setActiveTab] = useState<"salary" | "audit">("audit");

  type SalaryScheduleItem = {
    salaryGrade?: number;
    salaryStep?: number;
    monthlySalary?: number | null;
    // optional metadata if audit returns items with metadata
    effectivityDate?: string | null;
    nbcNo?: string | null;
    nbcDate?: string | null;
    eoNo?: string | null;
    eoDate?: string | null;
};

  // LIFTED form state so Table can include them in payload
  const [effectivityDate, setEffectivityDate] = useState<string>("");
  const [nbcNo, setNbcNo] = useState<string>("");
  const [nbcDate, setNbcDate] = useState<string>("");
  const [eoNo, setEoNo] = useState<string>("");
  const [eoDate, setEoDate] = useState<string>("");

  // selected schedule items from audit (when user clicks Edit in Audit Trail)
  const [selectedItems, setSelectedItems] = useState<SalaryScheduleItem[] | null>(null);

  const handleClearAll = () => {
    setEffectivityDate("");
    setNbcNo("");
    setNbcDate("");
    setEoNo("");
    setEoDate("");
    setSelectedItems(null);
  };

  const handleSelectAudit = (payload: {
    effectivityDate: string;
    nbcNo: string;
    nbcDate: string;
    eoNo: string;
    eoDate: string;
    items?: SalaryScheduleItem[] | null;
  }) => {
    // set lifted metadata
    setEffectivityDate(payload.effectivityDate || "");
    setNbcNo(payload.nbcNo || "");
    setNbcDate(payload.nbcDate || "");
    setEoNo(payload.eoNo || "");
    setEoDate(payload.eoDate || "");
    // pass items to table to populate grid (allow undefined/null)
    setSelectedItems(payload.items ?? null);
    // switch to salary tab (view)
    setActiveTab("salary");
  };

  return (
    <div className={modalStyles.Modal}>
      <div className={modalStyles.modalContent}>
        <div className={modalStyles.modalHeader}>
          <h2 className={modalStyles.mainTitle}>Salary Schedule</h2>
        </div>

        <div className={modalStyles.modalBody}>
          <div className={salaryScheduleStyle.SalarySchedule}>
            {/* --- Tabs Header --- */}
            <div className={salaryScheduleStyle.tabsHeader}>
              <button
                className={`${salaryScheduleStyle.tabButton} ${
                  activeTab === "audit" ? salaryScheduleStyle.active : ""
                }`}
                onClick={() => setActiveTab("audit")}
              >
                Audit Trail
              </button>
              <button className={`${salaryScheduleStyle.tabButton} ${ activeTab === "salary" ? salaryScheduleStyle.active : ""}`}
                onClick={() => setActiveTab("salary")}>
                Salary Schedule
              </button>
            </div>

            {/* --- Salary Schedule Tab --- */}
            {activeTab === "salary" && (
              <div className={salaryScheduleStyle.tabContent}>
                <SalaryScheduleForm
                  effectivityDate={effectivityDate}
                  setEffectivityDate={setEffectivityDate}
                  nbcNo={nbcNo}
                  setNbcNo={setNbcNo}
                  nbcDate={nbcDate}
                  setNbcDate={setNbcDate}
                  eoNo={eoNo}
                  setEoNo={setEoNo}
                  eoDate={eoDate}
                  setEoDate={setEoDate}
                />
                <SalaryScheduleTable
                  effectivityDate={effectivityDate}
                  nbcNo={nbcNo}
                  nbcDate={nbcDate}
                  eoNo={eoNo}
                  eoDate={eoDate}
                  selectedItems={selectedItems}
                  onClear={handleClearAll}
                />
              </div>
            )}

            {/* --- Audit Trail Tab --- */}
            {activeTab === "audit" && (
              <div className={salaryScheduleStyle.tabContent}>
                <AuditTrailTable onSelect={handleSelectAudit} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}