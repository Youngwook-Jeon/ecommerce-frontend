"use client";

import { authenticate } from "../actions/authActions";
import { useEffect, useState } from "react";
import Link from "next/link";

type User = {
    isAuthenticated: boolean,
    username: string,
    firstName: string,
    lastName: string,
    roles: string[],
}

export default function Session() {
  const [user, setUser] = useState<User>({
    isAuthenticated: false,
    username: "",
    firstName: "",
    lastName: "",
    roles: []
  });

  async function getAuthInfo() {
    const res = await authenticate();
    return await res.json();
  }

  useEffect(() => {
    getAuthInfo().then((data) => {
      setUser(data);
    });
  }, []);

  console.log(user);

  return (
    <>
      {user.isAuthenticated ? (
        JSON.stringify(user)
      ) : (
        <div>
          <Link href="/oauth2/authorization/keycloak" className="d-blockh-full">
            Login
          </Link>
        </div>
      )}
    </>

    // <div>
    //   <div className="bg-blue-200 border-2 border-blue-500">
    //     <h3 className="text-lg">Session data</h3>
    //     <pre>{JSON.stringify(session, null, 2)}</pre>
    //   </div>
    //   <div className="mt-4">
    //     <AuthTest />
    //   </div>
    //   <div className="bg-green-200 border-2 border-blue-500 mt-4">
    //     <h3 className="text-lg">Token data</h3>
    //     <pre className="overflow-auto">{JSON.stringify(token, null, 2)}</pre>
    //   </div>
    // </div>
  );
}
