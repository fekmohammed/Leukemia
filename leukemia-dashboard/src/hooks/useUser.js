// src/hooks/useUser.js
import { useEffect, useState } from "react";
import API from "@/api/axios";

const useUser = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await API.get("auth/users/me/");
                setUser(res.data);
            } catch (err) {
                console.error("Failed to fetch user:", err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    return { user, loading };
};

export default useUser;
