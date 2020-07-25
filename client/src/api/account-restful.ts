import { SHA256 } from "crypto-js";

export interface SingupArg {
  email: string;
  password: string;
}

// TODO: add optional environment setting for production
const restURL = "http://localhost:3001";

export async function signup(singUpArg: SingupArg): Promise<void> {
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

export interface LoginArg {
  password: string;
  email: string;
}

export interface LoginReturnObj {
  tokens: {
    refreshToken: string;
  };
}

async function login(loginArg: LoginArg): Promise<LoginReturnObj> {
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
      username: loginArg.email,
    }),
  });

  if (response.ok) {
    const data = await response.json();
    console.log("login response ok:", data);

    //{"access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluMTIzQGxuLmNvbSIsImlkIjoxNSwiaWF0IjoxNTk1NzAwNzgzLCJleHAiOjE2MDA4ODQ3ODN9.4aRrQE9X64lWsT1ZV2ieMhf3tlMXtMB-5P_gnwCwMw4"}
    // const { tokens } = data;

    // save accessToken in localStorage
    const { accessToken } = data;
    localStorage.setItem("accounts:accessToken", accessToken);

    return data;
  }

  throw new Error("login failure");
}

export default {
  signup,
  login,
};
