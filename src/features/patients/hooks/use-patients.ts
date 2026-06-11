"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { listPatients } from "@/features/patients/api/patients.api";
import { patientQueries } from "@/features/patients/queries/patient-queries";
import type {
  PatientListParams,
  PatientSortField,
  SortDirection,
} from "@/features/patients/types/patient.types";
import { processPatientList } from "@/features/patients/utils/patient.utils";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

const DEFAULT_PAGE_SIZE = 10;

export function usePatientsList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<PatientSortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const debouncedSearch = useDebouncedValue(search, 300);

  const query = useQuery({
    ...patientQueries.list(),
    queryFn: listPatients,
  });

  const listParams: PatientListParams = useMemo(
    () => ({
      search: debouncedSearch,
      page,
      pageSize: DEFAULT_PAGE_SIZE,
      sortField,
      sortDirection,
    }),
    [debouncedSearch, page, sortField, sortDirection],
  );

  const processed = useMemo(() => {
    if (!query.data) {
      return {
        items: [],
        total: 0,
        totalPages: 1,
        filteredTotal: 0,
      };
    }
    return processPatientList(query.data, listParams);
  }, [query.data, listParams]);

  const toggleSort = (field: PatientSortField) => {
    setPage(1);
    if (sortField === field) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortField(field);
    setSortDirection("asc");
  };

  return {
    ...query,
    patients: processed.items,
    total: processed.total,
    filteredTotal: processed.filteredTotal,
    totalPages: processed.totalPages,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    search,
    sortField,
    sortDirection,
    setSearch: (value: string) => {
      setPage(1);
      setSearch(value);
    },
    setPage,
    toggleSort,
  };
}
