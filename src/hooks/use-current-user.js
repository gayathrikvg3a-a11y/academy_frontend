import { useEffect, useState } from "react";
import { getStoredUser } from "../app/auth";
import api from "../api/axios";

/**
 * Cached read of localStorage.user with a one-shot best-effort profile
 * refresh for pre-existing sessions. Falls back to "Admin" silently.
 */
export function useCurrentUser() {
  const [user, setUser] = useState(getStoredUser);

  useEffect(() => {
    if (!localStorage.getItem("access")) return;

    let cancelled = false;

    api
      .get("auth/profile/")
      .then((response) => {
        if (cancelled || !response.data) return;
        const { first_name = "", last_name = "", username = "" } = response.data;
        const next = {
          full_name: [first_name, last_name].filter(Boolean).join(" ") || username,
          email: response.data.email ?? "",
          username,
        };
        localStorage.setItem("user", JSON.stringify(next));
        setUser(next);
      })
      .catch(() => {
        // Non-fatal — keep whatever is cached.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return user;
}
