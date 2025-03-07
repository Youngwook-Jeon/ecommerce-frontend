"use server";

import { fetchWrapper } from "@/common/services/fetchWrapper";

interface ProductRequest {
  productName: string;
  description: string;
  price: number;
}

export const createProductAction = async (
  formData: FormData
): Promise<void> => {
    console.log("createProductAction started!");
  const productName = formData.get("productName")?.toString();
  const description = formData.get("description")?.toString();
  const price = formData.get("price")?.toString();
  console.log("productName:", productName);
  console.log("description:", description);
  console.log("price:", price);

  // 유효성 검사 및 타입 변환
  if (!productName || !description || !price) {
    throw new Error("Invalid form data");
  }

  const parsedPrice = parseFloat(price.toString());
  if (isNaN(parsedPrice)) {
    throw new Error("Price must be a number");
  }

  const requestBody: ProductRequest = {
    productName,
    description,
    price: parsedPrice,
  };

  try {
    const response = await fetchWrapper.post("api/v1/products", requestBody);
    console.log("response:", response);
    if (!response.ok) throw new Error("Error creating product");
    const body = await response.json();
    console.log("Product created successfully!");
    console.log("Product Name:", body.productName);
    console.log("Message:", body.message);
  } catch (error) {
    console.error("Error:", error);
  }
};
