import httpClient from "./httpClient";

export const getMyProfile = async () => {
  const { data } = await httpClient.get("/api/Patients/me");
  return data;
};

export const updateMyProfile = async (payload) => {
  const { data } = await httpClient.put(
    "/api/Patients/update-profile/me",
    payload,
  );
  return data;
};

export const getAllPatients = async (
  pageNumber = 1,
  pageSize = 10,
  searchValue = "",
  sortColumn = "",
  sortDirection = "",
) => {
  const { data } = await httpClient.get("/api/admin/patients", {
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

export const getAdminPatientStats = async () => {
  const { data } = await httpClient.get("/api/admin/patients/stats");
  return data;
};

export const deleteAdminPatient = async (id) => {
  const { data } = await httpClient.delete(`/api/admin/patients/${id}`);
  return data;
};
