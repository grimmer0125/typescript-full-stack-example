import { SHA256 } from "crypto-js";

// TODO: add optional environment setting for production
const restURL = "http://localhost:3001";

export async function signup(singUpArg: {
  username: string;
  email: string;
  password: string;
}): Promise<void> {
  console.log("signup");

  const hashPassword = SHA256(singUpArg.password).toString();

  const response = await fetch(`${restURL}/auth/signup`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...singUpArg, password: hashPassword }),
  });

  if (!response.ok) {
    throw new Error("sign up failure");
  }
  const json = await response.json();
  return json;
}

export interface LoginReturnObj {
  access_token?: string;
}

async function logout() {
  console.log("remove access_token");
  localStorage.removeItem("access_token");
}

async function login(loginArg: {
  username: string;
  password: string;
}): Promise<LoginReturnObj> {
  console.log("login");

  const hashPassword = SHA256(loginArg.password).toString();

  const response = await fetch(`${restURL}/auth/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      password: hashPassword,
      username: loginArg.username,
    }),
  });

  if (response.ok) {
    const data = await response.json();

    // save accessToken in localStorage
    const { access_token } = data;
    console.log("login response ok:", data);
    localStorage.setItem("access_token", access_token);

    return data;
  }

  throw new Error("login failure");
}

export default {
  signup,
  login,
  logout,
};
