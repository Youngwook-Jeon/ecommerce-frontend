export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export async function authenticate(): Promise<any> {
  return await fetch("http://localhost:9000/user", { method: "GET" });
}

