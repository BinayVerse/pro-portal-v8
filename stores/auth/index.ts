import { useNuxtApp } from "nuxt/app";
import type {
    State,
    SignupResponse,
    SigninResponse,
    ResetPasswordResponse,
    UpdatePasswordResponse,
} from "./types";

function initialState(): State {
    return {
        authUser: null,
        loading: false,
        resetPasswordResponse: null,
        updatePasswordResponse: null,
        currentView: "signin",
    };
}

export const useAuthStore = defineStore("authStore", {
    state: (): State => initialState(),

    getters: {
        isLoggedIn(state): boolean {
            return !!state.authUser;
        },
        getAuthUser(state) {
            return state.authUser || null;
        },
        getResetPassword(state): ResetPasswordResponse | null {
            return state.resetPasswordResponse || null;
        },
        getUpdatePassword(state): UpdatePasswordResponse | null {
            return state.updatePasswordResponse || null;
        },
        getCurrentView(state): string {
            return state.currentView;
        },
    },

    actions: {
        initializeStore() {
            if (import.meta.client) {
                const storedUser = localStorage.getItem("authUser");
                if (storedUser) {
                    this.authUser = JSON.parse(storedUser);
                }
            }
        },

        async signup(formData: Record<string, any>) {
            this.loading = true;

            try {
                const response = await fetch("/api/auth/signup", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                });

                let data: SignupResponse;

                try {
                    const responseText = await response.text();

                    if (!responseText) {
                        data = {
                            status: "error",
                            message: "Empty response from server"
                        } as SignupResponse;
                    } else {
                        try {
                            data = JSON.parse(responseText);
                        } catch (parseError) {
                            data = {
                                status: "error",
                                message: responseText
                            } as SignupResponse;
                        }
                    }
                } catch (textError) {
                    data = {
                        status: "error",
                        message: "Failed to read response from server"
                    } as SignupResponse;
                }

                if (response.ok && data?.status === "success") {
                    this.authUser = null;
                    if (import.meta.client) {
                        localStorage.removeItem("authUser");
                        localStorage.removeItem("authToken");
                    }
                } else {
                    throw new Error(data?.message || "Signup failed");
                }
            } catch (error: any) {
                this.loading = false;

                let errorMessage = "Signup failed. Please try again.";

                if (error?.message) {
                    errorMessage = error.message;
                }

                console.error('Signup error:', errorMessage);
                throw new Error(errorMessage);
            } finally {
                this.loading = false;
            }
        },

        async signIn({ email, password }: { email: string; password: string }) {
            this.loading = true;

            try {
                // Use fetch with manual error handling
                const response = await fetch("/api/auth/signin", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, password }),
                });

                let data: SigninResponse;

                try {
                    // Always try to get response as text first
                    const responseText = await response.text();

                    if (!responseText) {
                        data = {
                            status: "error",
                            message: `Server returned ${response.status}: ${response.statusText}`,
                            token: "",
                            user: null,
                            redirect: ""
                        } as SigninResponse;
                    } else {
                        try {
                            // Try to parse the text as JSON
                            data = JSON.parse(responseText);
                        } catch (parseError) {
                            // If JSON parsing fails, create error response with the text
                            data = {
                                status: "error",
                                message: responseText || `HTTP ${response.status}: ${response.statusText}`,
                                token: "",
                                user: null,
                                redirect: ""
                            } as SigninResponse;
                        }
                    }
                } catch (textError) {
                    // If we can't read text, create error response with status info
                    data = {
                        status: "error",
                        message: `HTTP ${response.status}: ${response.statusText || 'Unknown error'}`,
                        token: "",
                        user: null,
                        redirect: ""
                    } as SigninResponse;
                }

                // Handle success response
                if (data?.status === "success" && response.ok) {
                    this.authUser = data.user || {};
                    if (import.meta.client) {
                        localStorage.setItem("authUser", JSON.stringify(data.user));
                        localStorage.setItem("authToken", data.token);
                    }
                } else {
                    // For error responses, throw with the message from the server
                    const errorMessage = data?.message || `HTTP ${response.status}: ${response.statusText}`;
                    throw new Error(errorMessage);
                }
            } catch (error: any) {
                this.loading = false;

                let errorMessage = "Sign-in failed. Please check your credentials.";

                if (error?.message) {
                    errorMessage = error.message;
                }

                console.error('Sign-in error:', errorMessage);
                throw new Error(errorMessage);
            } finally {
                this.loading = false;
            }
        },
        async googleSignIn(formData: Record<string, any>) {
            this.loading = true;

            try {
                const response = await fetch("/api/auth/google-signin", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                });

                let data: SigninResponse;

                try {
                    const responseText = await response.text();

                    if (!responseText) {
                        data = {
                            status: "error",
                            message: "Empty response from server"
                        } as SigninResponse;
                    } else {
                        try {
                            data = JSON.parse(responseText);
                        } catch (parseError) {
                            data = {
                                status: "error",
                                message: responseText
                            } as SigninResponse;
                        }
                    }
                } catch (textError) {
                    data = {
                        status: "error",
                        message: "Failed to read response from server"
                    } as SigninResponse;
                }

                if (response.ok && data?.status === "success") {
                    this.authUser = data.user || {};
                    if (import.meta.client) {
                        localStorage.setItem("authUser", JSON.stringify(data.user));
                        localStorage.setItem("authToken", data.token);
                    }

                    return {
                        status: "success",
                        message: data.message || "Sign-in successful!",
                        redirect: data.redirect || "/profile",
                    };
                } else {
                    throw new Error(data?.message || "Sign-in failed");
                }
            } catch (error: any) {
                this.loading = false;

                let errorMessage = "An unknown error occurred during sign-in.";

                if (error?.message) {
                    errorMessage = error.message;
                }

                console.error('Google sign-in error:', errorMessage);
                throw new Error(errorMessage);
            } finally {
                this.loading = false;
            }
        },

        async resetPassword(formData: Record<string, any> | null) {
            this.loading = true;

            try {
                const response = await fetch("/api/auth/reset-password", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                });

                let data: ResetPasswordResponse;

                try {
                    const responseText = await response.text();

                    if (!responseText) {
                        data = {
                            status: "error",
                            message: "Empty response from server"
                        } as ResetPasswordResponse;
                    } else {
                        try {
                            data = JSON.parse(responseText);
                        } catch (parseError) {
                            data = {
                                status: "error",
                                message: responseText
                            } as ResetPasswordResponse;
                        }
                    }
                } catch (textError) {
                    data = {
                        status: "error",
                        message: "Failed to read response from server"
                    } as ResetPasswordResponse;
                }

                if (response.ok && data?.status === "success") {
                    return data;
                } else {
                    throw new Error(
                        data?.message || "Failed to send reset email"
                    );
                }
            } catch (error: any) {
                this.loading = false;

                let errorMessage = "Failed to send reset email";

                if (error?.message) {
                    errorMessage = error.message;
                }

                console.error('Reset password error:', errorMessage);
                throw new Error(errorMessage);
            } finally {
                this.loading = false;
            }
        },

        async updatePassword(formData: Record<string, any> | null) {
            this.loading = true;

            try {
                const response = await fetch("/api/auth/update-password", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                });

                let data: UpdatePasswordResponse;

                try {
                    const responseText = await response.text();

                    if (!responseText) {
                        data = {
                            status: "error",
                            message: "Empty response from server"
                        } as UpdatePasswordResponse;
                    } else {
                        try {
                            data = JSON.parse(responseText);
                        } catch (parseError) {
                            data = {
                                status: "error",
                                message: responseText
                            } as UpdatePasswordResponse;
                        }
                    }
                } catch (textError) {
                    data = {
                        status: "error",
                        message: "Failed to read response from server"
                    } as UpdatePasswordResponse;
                }

                if (response.ok && data?.status === "success") {
                    return data;
                } else {
                    throw new Error(data?.message || "Failed to update password");
                }
            } catch (error: any) {
                this.loading = false;

                let errorMessage = "Failed to update password";

                if (error?.message) {
                    errorMessage = error.message;
                }

                console.error('Update password error:', errorMessage);
                throw new Error(errorMessage);
            } finally {
                this.loading = false;
            }
        },

        async signOut() {
            try {
                this.authUser = null;
                localStorage.removeItem("authUser");
                localStorage.removeItem("authToken");
                navigateTo("/");
            } catch (error) {
                console.error("Error during logout:", error.message);
            }
        },
    },
});
