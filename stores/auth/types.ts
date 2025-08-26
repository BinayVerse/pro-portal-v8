export interface State {
    authUser: Record<string, any> | null;
    loading: boolean;
    error: string | null;
    resetPasswordResponse: ResetPasswordResponse | null;
    updatePasswordResponse: UpdatePasswordResponse | null;
    currentView: string;
}

// export interface AuthUser {
//     id: string;
//     email: string;
//     name?: string;
//     // Add other fields as needed
//   }
export interface SignupResponse {
    status: string;
    message?: string;
    data?: Record<string, any> | null;
}

export interface SigninResponse {
    status: string;
    token: string;
    user: Record<string, any> | null;
    message?: string;
    redirect: string;
}

export interface AuthUser {
    user_id?: string | null;
    email?: string | null;
    password?: string | null;
    name?: string | null;
    contact_number?: string | null;
    org_id?: string | null;
    primary_contact?: boolean | null;
    role_id?: number | null;
    reset_token?: string | null;
    reset_token_expiry?: string | null;
    profile_complete?: boolean | null;
    added_by?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export interface ResetPasswordResponse {
    status: string;
    token: string;
    data?: Record<string, any> | null;
    message?: string;
}

export interface UpdatePasswordResponse {
    status: string;
    message?: string;
    data?: Record<string, any> | null;
}
