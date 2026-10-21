const API_URL = import.meta.env.VITE_API_URL;

export const getAdminDashboard = async () => {
  const response = await fetch(`${API_URL}/api/admin/dashboard`, {
    method: "GET",
    credentials: "include", // Isse browser request ke saath applicable authentication cookies bhej sakta hai.Because Tumhara backend JWT authentication ke liye cookie use karta hai.
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch admin dashboard");
  }

  return data;
};