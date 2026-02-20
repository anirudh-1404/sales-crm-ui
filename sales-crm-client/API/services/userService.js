import API from "../Interceptor";

// Get all users (admin: all, manager: team, rep: self)
export const getTeamUsers = async () => {
    return API.get("/auth/team");
};

// Create a new user (admin only)
export const createUser = async (userData) => {
    return API.post("/auth/register", userData);
};

// Update user details (admin can also change role/managerId)
export const updateUser = async (id, userData) => {
    return API.put(`/auth/${id}`, userData);
};

// Deactivate a user
export const deactivateUser = async (id) => {
    return API.patch(`/auth/${id}/deactivate`);
};

// Activate (reactivate) a user
export const activateUser = async (id) => {
    return API.patch(`/auth/${id}/activate`);
};

// Change password
export const changePassword = async (id, passwords) => {
    return API.patch(`/auth/${id}/change-password`, passwords);
};

// Bulk reassign records from one user to another
export const bulkReassignRecords = async (id, newOwnerId) => {
    return API.patch(`/auth/${id}/reassign`, { newOwnerId });
};
