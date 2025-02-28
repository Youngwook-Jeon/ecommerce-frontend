// import { fetchWrapper } from "@/services/fetchWrapper";

import { createProductAction } from "@/utils/actions";

// const CreateProduct = () => {
//   return (
//     <div>
//       <form action={createProductAction}>
//         <input id="productName" type="text" name="productName" placeholder="product name" required />
//         <input id="description" type="text" name="description" placeholder="description" required />
//         <input id="price" type="number" name="price" placeholder="price" required />
//         <button type="submit">Create Product</button>
//       </form>
//     </div>
//   );
// };
const CreateProduct = () => {
//   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     const formData = new FormData(event.currentTarget);

//     const requestBody = {
//       productName: formData.get("productName")?.toString(),
//       description: formData.get("description")?.toString(),
//       price: parseFloat(formData.get("price") as string),
//     };

//     try {
//       const response = await fetchWrapper.post("/api/v1/products", requestBody);

//       if (!response.ok) {
//         throw new Error("Failed to create product");
//       }

//       const data = await response.json();
//       console.log(data);
//     } catch (error) {
//       console.error("Error:", error);
//     }
//   };

  return (
    <div>
      <form action={createProductAction}>
        <input
          id="productName"
          type="text"
          name="productName"
          placeholder="product name"
          required
        />
        <input
          id="description"
          type="text"
          name="description"
          placeholder="description"
          required
        />
        <input
          id="price"
          type="number"
          name="price"
          placeholder="price"
          required
        />
        <button type="submit">Create Product</button>
      </form>
    </div>
  );
};

export default CreateProduct;
