import httpClient from "./httpClient";

export const getMyProfile = async () => {
  const { data } = await httpClient.get("/api/Patients/me");
  return data;
};

export const updateMyProfile = async (payload) => {
  const { data } = await httpClient.put("/api/Patients/me", payload);
  return data;
};

export const getPatientById = async (id) => {
  const { data } = await httpClient.get(`/api/Patients/${id}`);
  return data;
};

export const getAllPatients = async (
  pageNumber = 1,
  pageSize = 10,
  searchValue = "",
  sortColumn = "",
  sortDirection = "",
) => {
  const { data } = await httpClient.get("/api/Patients/all", {
    params: {
      PageNumber: pageNumber,
      PageSize: pageSize,
      SearchValue: searchValue,
      SortColumn: sortColumn,
      SortDirection: sortDirection,
    },
  });
  return data;
};
