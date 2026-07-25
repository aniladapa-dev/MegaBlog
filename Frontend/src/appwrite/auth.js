export class AuthService {
    baseUrl = import.meta.env.VITE_BACKEND_URL 
        ? `${import.meta.env.VITE_BACKEND_URL}/api/auth` 
        : "http://localhost:8080/api/auth";

    async createAccount({ email, password, name }) {
        try {
            const response = await fetch(`${this.baseUrl}/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Signup failed");
            }

            const data = await response.json();
            if (data.token) {
                sessionStorage.setItem("token", data.token);
                return data.user;
            }
            return null;
        } catch (error) {
            console.error("AuthService createAccount error:", error);
            throw error;
        }
    }

    async login({ email, password }) {
        try {
            const response = await fetch(`${this.baseUrl}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Invalid credentials");
            }

            const data = await response.json();
            if (data.token) {
                sessionStorage.setItem("token", data.token);
                return data.user;
            }
            return null;
        } catch (error) {
            console.error("AuthService login error:", error);
            throw error;
        }
    }

    async getCurrentUser() {
        try {
            const token = sessionStorage.getItem("token");
            if (!token) return null;

            const response = await fetch(`${this.baseUrl}/me`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (response.status === 401) {
                sessionStorage.removeItem("token");
                return null;
            }

            if (!response.ok) {
                throw new Error("Failed to fetch user");
            }

            return await response.json();
        } catch (error) {
            console.log("AuthService getCurrentUser error : ", error);
            return null;
        }
    }

    async logout() {
        try {
            sessionStorage.removeItem("token");
            return true;
        } catch (error) {
            console.log("AuthService logout error : ", error);
            return false;
        }
    }

    async updateProfile({ name, password }) {
        try {
            const token = sessionStorage.getItem("token");
            if (!token) return null;

            const response = await fetch(`${this.baseUrl}/update-profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ name, password }),
            });

            if (!response.ok) {
                throw new Error("Failed to update profile");
            }

            return await response.json();
        } catch (error) {
            console.error("AuthService updateProfile error:", error);
            throw error;
        }
    }

    async getUserProfile(userId) {
        try {
            const response = await fetch(`${this.baseUrl}/users/${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch user profile");
            }

            return await response.json();
        } catch (error) {
            console.error("AuthService getUserProfile error:", error);
            return null;
        }
    }

    async deleteAccount() {
        try {
            const token = sessionStorage.getItem("token");
            const response = await fetch(`${this.baseUrl}/delete-account`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete account");
            }

            return await response.json();
        } catch (error) {
            console.error("AuthService deleteAccount error:", error);
            throw error;
        }
    }
}

const authService = new AuthService();
export default authService;