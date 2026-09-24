import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface UseAuthLoginResult {
    email: string;
    setEmail: (email: string) => void;
    password: string;
    setPassword: (password: string) => void;
    loading: boolean;
    error: string;
    success: string;
    showPassword: boolean;
    isDisabled: boolean;
    togglePasswordVisibility: () => void;
    login: (e: React.FormEvent) => Promise<void>;
}

export const useAuthLogin = (): UseAuthLoginResult => {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const isDisabled = loading || !!success;


    const togglePasswordVisibility = useCallback(() => {
        setShowPassword((prev) => !prev);
    }, []);

    const login = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!email || !password) {
            setError("Please enter both email and password.");
            toast.error("Enter email and password.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("userToken", data.token);

                toast.success("Login successful!");
                setSuccess(`Login successful! Welcome ${data.email}.`);

                setTimeout(() => {
                    router.push("/");
                }, 1000);
            } else {
                setError(data.message || "Login failed.");
                toast.error(data.message || "Invalid login credentials.");
            }
        } catch (err) {
            console.error("Network error:", err);
            setError("A network error occurred. Please try again.");
            toast.error("Network error. Try again.");
        } finally {
            setLoading(false);
        }
    }, [email, password, router]);

    return {
        email,
        setEmail,
        password,
        setPassword,
        loading,
        error,
        success,
        showPassword,
        isDisabled,
        togglePasswordVisibility,
        login,
    };
};