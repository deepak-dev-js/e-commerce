const API_URL = import.meta.env.VITE_API_URL;

export const uploadProductImage = async (image, category) => {
const formData = new FormData();

formData.append("image", image);
formData.append("category", category);

const response = await fetch(
`${API_URL}/api/admin/upload-product-image`,
{
method: "POST",
credentials: "include",
body: formData, 
}
);

const data = await response.json();

if (!response.ok) {
throw new Error(data.message || "Image upload failed");
}

return data;
};

export const createProduct = async (productData) => {
const response = await fetch(`${API_URL}/api/products`, {
method: "POST",
headers: {
"Content-Type": "application/json",
},
credentials: "include",
body: JSON.stringify(productData),
});

const data = await response.json();

if (!response.ok) {
throw new Error(data.message || "Failed to create product");
}

return data;
};
