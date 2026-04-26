import api from "/shared/api-handler.js";
import { USERS_STORAGE_KEY, usersMockData } from "../storage/users.js";

api.setBaseURL("http://localhost:3000");

function cloneUsers(users) {
    return JSON.parse(JSON.stringify(users));
}

function writeUsers(users) {
    const clonedUsers = cloneUsers(users);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(clonedUsers));
    return clonedUsers;
}

function readUsers() {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);

    if (!storedUsers) {
        return writeUsers(usersMockData);
    }

    try {
        return JSON.parse(storedUsers);
    } catch {
        return writeUsers(usersMockData);
    }
}

function getNextUserId(users) {
    const maxId = users.reduce((max, user) => {
        const match = /^USR-(\d+)$/.exec(user.id || "");
        return match ? Math.max(max, Number(match[1])) : max;
    }, 1000);

    return `USR-${String(maxId + 1).padStart(4, "0")}`;
}

function getUsers() {
    return readUsers();
}

function getAllUsers() {
    return getUsers();
}

function updateUsers(newUsers) {
    return writeUsers(newUsers);
}

function getUserById(userId) {
    return getAllUsers().find((user) => user.id === userId) || null;
}

function getUsersByStatus(status) {
    return getAllUsers().filter((user) => user.status === status);
}

function createUser(userData) {
    const users = readUsers();
    const newUser = {
        status: "active",
        role: "customer",
        ...userData,
        id: userData.id || getNextUserId(users),
        createdAt: userData.createdAt || new Date().toISOString(),
        lastLoginAt: userData.lastLoginAt ?? null,
    };

    writeUsers([newUser, ...users]);
    return newUser;
}

function updateUser(userId, updates) {
    const users = readUsers();
    const userIndex = users.findIndex((user) => user.id === userId);

    if (userIndex === -1) {
        return null;
    }

    const updatedUser = { ...users[userIndex], ...updates, id: users[userIndex].id };
    users[userIndex] = updatedUser;
    writeUsers(users);
    return updatedUser;
}

function deleteUser(userId) {
    const users = readUsers();
    const nextUsers = users.filter((user) => user.id !== userId);

    if (nextUsers.length === users.length) {
        return false;
    }

    writeUsers(nextUsers);
    return true;
}

const UsersApi = {
    getUsers,
    getAllUsers,
    updateUsers,
    getUserById,
    getUsersByStatus,
    createUser,
    updateUser,
    deleteUser,
};

export default UsersApi;
