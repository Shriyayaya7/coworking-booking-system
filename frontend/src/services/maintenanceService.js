import api from "./api";

export const createMaintenance = async (maintenanceData) => {
  const response = await api.post(
    "/maintenance",
    maintenanceData
  );

  return response.data;
};

export const getMaintenance = async () => {
  const response = await api.get("/maintenance");

  return response.data;
};

export const deleteMaintenance = async (maintenanceId) => {
  const response = await api.delete(
    `/maintenance/${maintenanceId}`
  );

  return response.data;
};