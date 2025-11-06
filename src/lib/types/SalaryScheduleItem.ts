
export type SalaryScheduleItem = {
  salaryGrade?: number;
  salaryStep?: number;
  monthlySalary?: number | null;
  // metadata (optional so it can be undefined when coming from different places)
  salaryScheduleId?: number | null;
  effectivityDate?: string | null;
  nbcNo?: string | null;
  nbcDate?: string | null;
  eoNo?: string | null;
  eoDate?: string | null;
};