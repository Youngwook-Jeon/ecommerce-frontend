"use client";

import { useEffect, useState } from "react";
import { authenticate } from "../actions/authActions";
import Link from "next/link";
import { Button, Dropdown } from "flowbite-react";
import { AiOutlineLogout } from "react-icons/ai";
import { useRouter } from "next/navigation";

export default function AuthenticationInfo() {
    const router = useRouter();
  type User = {
    isAuthenticated: boolean;
    username: string;
    firstName: string;
    lastName: string;
    roles: string[];
  };

  const [user, setUser] = useState<User>({
    isAuthenticated: false,
    username: "",
    firstName: "",
    lastName: "",
    roles: [],
  });

  async function getAuthInfo() {
    const res = await authenticate();
    return await res.json();
  }

  async function handleSubmit() {
    await fetch("/logout", {method: "POST"})
    // router.push("/");
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
        <Dropdown label={`welcome ${user.username}`} inline>
          <Dropdown.Item>
            <Link href="/my-orders">My Orders</Link>
          </Dropdown.Item>
          <Dropdown.Item>
            <Link href="/profile">My Profile</Link>
          </Dropdown.Item>
          <Dropdown.Item>
            <Link href="/session">Session (dev only!)</Link>
          </Dropdown.Item>
          <Dropdown.Divider />
          {/* <Dropdown.Item icon={AiOutlineLogout} onClick={handleSubmit}>
            Logout
          </Dropdown.Item> */}
          {/* <Dropdown.Item icon={AiOutlineLogout}>
            <Link href="/logout">Logout</Link>
          </Dropdown.Item> */}
          {/* <Link href="/logout">Logout</Link> */}
          {/* <Button onClick={handleSubmit}></Button> */}
          <form action="/logout" method="post">
            <button>
              <span>logout</span>
            </button>
          </form>
        </Dropdown>
      ) : (
        <div>
          <Button>
            <Link
              href="/oauth2/authorization/keycloak"
              className="d-blockh-full"
            >
              Login
            </Link>
          </Button>
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
