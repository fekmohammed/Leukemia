// src/api/patients.js
import API from "./axios";

export const getPatients = async () => {
    try {
        const token = localStorage.getItem("token");
        if (token) {
            API.defaults.headers.common["Authorization"] = `Token ${token}`;
        }
        const response = await API.get("/api/patients/");
        return response.data;
    } catch (error) {
        console.error("Error fetching patients:", error);
        return [];
    }
};

// ✅ Add this function:
export const getPatient = async (id) => {
    try {
        const token = localStorage.getItem("token");
        if (token) {
            API.defaults.headers.common["Authorization"] = `Token ${token}`;
        }
        const response = await API.get(`/api/patients/${id}/`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching patient ${id}:`, error);
        throw error;
    }
};
