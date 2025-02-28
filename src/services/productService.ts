"use server";

import { fetchWrapper } from "./fetchWrapper";

export async function authTest() {
    const response = await fetchWrapper.get("api/v1/products/auth-test");
    if (!response.ok) throw new Error("Error to fetch auth");
    
    return await response.json();
}

export async function adminTest() {
    const response = await fetchWrapper.get("api/v1/products/auth-admin");
    console.log(response);
    if (!response.ok) throw new Error("Error to fetch admin");
    
    return await response.json();
}

export async function getAllProducts() {
  const response = await fetchWrapper.get("api/v1/products");
  if (!response.ok) throw new Error("Error to fetch products");

  return await response.json();
}
