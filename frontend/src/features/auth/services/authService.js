const request = async (path, credentials) => {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Authentication request failed (${response.status})`);
  }

  return response.json();
};

export const login = (credentials) => request("/api/auth/login", credentials);

export const register = (userDetails) =>
  request("/api/auth/register", userDetails);
