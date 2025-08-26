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
        error: null,
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
        getError(state): string | null {
            return state.error;
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
        handleError(error: any, defaultMessage: string = 'Failed to show error notification', silent: boolean = false): string {
            const errorMessage =
                error?.response?.data?.message ||
                error?.response?._data?.message ||
                error?.data?.message ||
                error?.message ||
                defaultMessage;

            this.error = errorMessage;

            if (!silent && process.client) {
                try {
                    const toast = useToast();
                    toast.add({
                        title: 'Error',
                        description: errorMessage,
                        color: 'red',
                        icon: 'i-heroicons-x-circle',
                        timeout: 5000,
                    });
                } catch (e) {
                    console.error('Failed to show error notification:', e);
                }
            }
            return errorMessage;
        },

        handleSuccess(message: string): void {
            this.error = null;
            if (process.client) {
                try {
                    const toast = useToast();
                    toast.add({
                        title: 'Success',
                        description: message,
                        color: 'green',
                        icon: 'i-heroicons-check-circle',
                        timeout: 5000,
                    });
                } catch (e) {
                    console.error('Failed to show success notification:', e);
                }
            }
        },

        clearError() {
            this.error = null;
        },

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
            this.clearError();

            try {
                const data = await $fetch<SignupResponse>("/api/auth/signup", {
                    method: "POST",
                    body: formData,
                });

                if (data?.status === "success") {
                    this.authUser = null;
                    if (import.meta.client) {
                        localStorage.removeItem("authUser");
                        localStorage.removeItem("authToken");
                    }
                    this.handleSuccess("Account created successfully!");
                } else {
                    const errorMessage = data?.message || "Signup failed";
                    this.handleError({ message: errorMessage });
                    throw new Error(errorMessage);
                }
            } catch (error: any) {
                let errorMessage = "Signup failed. Please try again.";

                if (error?.data?.message) {
                    errorMessage = error.data.message;
                } else if (error?.message && !error?.message.includes("fetch")) {
                    errorMessage = error.message;
                }

                this.handleError({ message: errorMessage });
                throw new Error(errorMessage);
            } finally {
                this.loading = false;
            }
        },

        async signIn({ email, password }: { email: string; password: string }) {
            this.loading = true;
            this.clearError();

            try {
                // Simple direct approach without complex error handling
                const response = await $fetch<any>("/api/auth/signin", {
                    method: "POST",
                    body: { email, password },
                    // Don't throw on 4xx/5xx errors, let us handle them
                    ignoreResponseError: true,
                });

                console.log('Response received:', response);

                if (response?.status === "success") {
                    this.authUser = response.user || {};
                    if (import.meta.client) {
                        localStorage.setItem("authUser", JSON.stringify(response.user));
                        localStorage.setItem("authToken", response.token);
                    }
                    this.handleSuccess("Welcome back! Login successful.");
                } else {
                    // Handle error response
                    const errorMessage = response?.message || "Login failed. Please try again.";
                    this.handleError({ message: errorMessage });
                    throw new Error(errorMessage);
                }
            } catch (error: any) {
                console.log('Caught error:', error);

                // Simple error handling
                let errorMessage = "Something went wrong. Please try again.";

                if (error?.data?.message) {
                    errorMessage = error.data.message;
                } else if (error?.message) {
                    errorMessage = error.message;
                }

                this.handleError({ message: errorMessage });
                throw new Error(errorMessage);
            } finally {
                this.loading = false;
            }
        },
        async googleSignIn(formData: Record<string, any>) {
            this.loading = true;
            this.clearError();

            try {
                const data = await $fetch<SigninResponse>("/api/auth/google-signin", {
                    method: "POST",
                    body: formData,
                });

                if (data?.status === "success") {
                    this.authUser = data.user || {};
                    if (import.meta.client) {
                        localStorage.setItem("authUser", JSON.stringify(data.user));
                        localStorage.setItem("authToken", data.token);
                    }

                    this.handleSuccess(data.message || "Sign-in successful!");
                    return {
                        status: "success",
                        message: data.message || "Sign-in successful!",
                        redirect: data.redirect || "/profile",
                    };
                } else {
                    const errorMessage = data?.message || "Sign-in failed";
                    this.handleError({ message: errorMessage });
                    throw new Error(errorMessage);
                }
            } catch (error: any) {
                let errorMessage = "An unknown error occurred during sign-in.";

                if (error?.data?.message) {
                    errorMessage = error.data.message;
                } else if (error?.message && !error?.message.includes("fetch")) {
                    errorMessage = error.message;
                }

                this.handleError({ message: errorMessage });
                throw new Error(errorMessage);
            } finally {
                this.loading = false;
            }
        },

        async resetPassword(formData: Record<string, any> | null) {
            this.loading = true;
            this.clearError();

            try {
                const data = await $fetch<ResetPasswordResponse>("/api/auth/reset-password", {
                    method: "POST",
                    body: formData,
                });

                if (data?.status === "success") {
                    this.handleSuccess("Password reset email sent successfully!");
                    return data;
                } else {
                    const errorMessage = data?.message || "Failed to send reset email";
                    this.handleError({ message: errorMessage });
                    throw new Error(errorMessage);
                }
            } catch (error: any) {
                let errorMessage = "Failed to send reset email";

                if (error?.data?.message) {
                    errorMessage = error.data.message;
                } else if (error?.message && !error?.message.includes("fetch")) {
                    errorMessage = error.message;
                }

                this.handleError({ message: errorMessage });
                throw new Error(errorMessage);
            } finally {
                this.loading = false;
            }
        },

        async updatePassword(formData: Record<string, any> | null) {
            this.loading = true;
            this.clearError();

            try {
                const data = await $fetch<UpdatePasswordResponse>("/api/auth/update-password", {
                    method: "POST",
                    body: formData,
                });

                if (data?.status === "success") {
                    this.handleSuccess("Password updated successfully!");
                    return data;
                } else {
                    const errorMessage = data?.message || "Failed to update password";
                    this.handleError({ message: errorMessage });
                    throw new Error(errorMessage);
                }
            } catch (error: any) {
                let errorMessage = "Failed to update password";

                if (error?.data?.message) {
                    errorMessage = error.data.message;
                } else if (error?.message && !error?.message.includes("fetch")) {
                    errorMessage = error.message;
                }

                this.handleError({ message: errorMessage });
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
