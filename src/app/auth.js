import api from "../api/axios";

const TOKEN_KEYS = ["access", "refresh"];

export function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * POST auth/login/ {login_identifier, password} — unchanged contract.
 * Stores access + refresh, then best-effort GET auth/profile/ cached to
 * localStorage.user. Login must never fail because the profile fetch failed.
 */
export async function login(identifier, password) {
  const response = await api.post("auth/login/", {
    login_identifier: identifier,
    password,
  });

  localStorage.setItem("access", response.data.access);
  localStorage.setItem("refresh", response.data.refresh);

  try {
    const profile = await api.get("auth/profile/");
    const { first_name = "", last_name = "", username = "" } = profile.data ?? {};
    const user = {
      full_name: [first_name, last_name].filter(Boolean).join(" ") || username,
      email: profile.data?.email ?? "",
      username,
    };
    localStorage.setItem("user", JSON.stringify(user));
  } catch (profileError) {
    console.error("Profile fetch failed (non-fatal):", profileError);
    localStorage.setItem("user", JSON.stringify({ full_name: "Admin", email: "" }));
  }
}

export function logout() {
  TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
  localStorage.removeItem("user");
}
