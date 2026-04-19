const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const BASE_URL = `${API_BASE}/auth`;

export const registerUser = async (data) => {
  return fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data),
  }).then(res => res.json());
};

export const loginUser = async (data) => {
  return fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data),
  }).then(res => res.json());
};

export const verifyOtp = async (email, otp) => {
  return fetch(`${BASE_URL}/verify-otp`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email, otp }),
  }).then(res => res.json());
};

export const forgotPassword = async (email, origin) => {
  return fetch(`${BASE_URL}/forgot-password`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email, origin }),
  }).then(res => res.json());
};

// 🔐 Passkey APIs

export const startPasskeyRegister = async (email) => {
  return fetch(`${BASE_URL}/passkey/register/start?email=${email}`, {
    method: "POST"
  }).then(res => res.json());
};

export const verifyPasskeyRegister = async (email, response) => {
  return fetch(`${BASE_URL}/passkey/register/verify?email=${email}`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(response),
  }).then(res => res.json());
};

export const startPasskeyLogin = async (email) => {
  return fetch(`${BASE_URL}/passkey/login/start?email=${email}`, {
    method: "POST"
  }).then(res => res.json());
};

export const verifyPasskeyLogin = async (email, response) => {
  return fetch(`${BASE_URL}/passkey/login/verify?email=${email}`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(response),
  }).then(res => res.json());
};