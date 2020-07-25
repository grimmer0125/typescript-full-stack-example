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
}

export default {
  signup,
};
