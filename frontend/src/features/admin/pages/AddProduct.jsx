import { useEffect, useRef, useState } from "react";
import { createProduct, uploadProductImage } from "../services/adminService";
import allowedCategories from "../../../../constants/allowedCategories.js";


const initialFormData = {
  name: "",
  description: "High-quality product with premium features.",
  price: "",
  category: "Sneakers",
};

const AddProduct = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const previewUrlRef = useRef("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const clearImagePreview = () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = "";
    setPreviewUrl("");
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : ["price",].includes(name)
            ? value === ""
              ? ""
              : Number(value)
            : value,
    }));

    setMessage("");
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = file ? URL.createObjectURL(file) : "";
    setPreviewUrl(previewUrlRef.current);
    setImage(file);
    setMessage("");


  };

  const handleSubmit = async (event) => {
    event.preventDefault();


    if (!image) {
      setMessage("Please select a product image.");
      setMessageType("error");
      return;
    }

    if (image.size > 5 * 1024 * 1024) {
      setMessage("Image size must not exceed 5 MB.");
      setMessageType("error");
      return;
    }

    if (!image.type.startsWith("image/")) {
      setMessage("Please select a valid image file.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Step 1: Upload image to Cloudinary.
      const uploadData = await uploadProductImage(
        image,
        formData.category
      );

      // Step 2: Save product details and image URL in MongoDB.
      const productData = {
        ...formData,
        price: Number(formData.price),
        image: uploadData.imageUrl,
      };

      await createProduct(productData);

      setMessage("Product added successfully!");
      setMessageType("success");

      setFormData(initialFormData);
      setImage(null);
      clearImagePreview();

      event.target.reset();
    } catch (error) {
      console.error("Add product error:", error);

      setMessage(error.message || "Failed to add product.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }


  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (<div className="mx-auto max-w-4xl"> <div className="mb-6"> <h1 className="text-2xl font-bold text-gray-800">
    Add New Product </h1>


    <p className="mt-1 text-sm text-gray-500">
      Enter product details to add an item to your store.
    </p>
  </div>

    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm md:p-8"
    >
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Basic Information
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 space-y-4 mb-5">
          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Category *
            </label>

            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={inputClass}
              required
            >
              {allowedCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Product Name *
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Nike Air Max"
              className={inputClass}
              required
              maxLength={150}
            />
          </div>


        </div>
      </div>

      <div className="border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="price"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Price (₹) *
            </label>

            <input
              id="price"
              name="price"
              type="number"
              min="0.01"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              placeholder="4999"
              className={inputClass}
              required
            />
          </div>
        </div>
      </div>


      <div className="border-t border-gray-100">

        <label
          htmlFor="image"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Upload Image *
        </label>

        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full rounded-lg border border-gray-300 p-3 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-medium file:text-blue-700 hover:file:bg-blue-100"
          required
        />

        <p className="mt-2 text-xs text-gray-500">
          Supported image formats depend on Cloudinary configuration.
          Maximum file size: 1 MB.
        </p>

        {previewUrl && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-gray-700">
              Image Preview
            </p>

            <img
              src={previewUrl}
              alt="Product preview"
              className="h-48 w-48 rounded-lg border border-gray-200 object-cover"
            />
          </div>
        )}
      </div>

      {message && (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-lg p-3 text-sm ${messageType === "success"
            ? "bg-green-50 text-green-700"
            : "bg-red-50 text-red-700"
            }`}
        >
          {message}
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            setFormData(initialFormData);
            setImage(null);
            clearImagePreview();
            setMessage("");
            setMessageType("");
            document.getElementById("image").value = "";
          }}
          className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
        >
          Reset
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Saving Product..." : "Add Product"}
        </button>
      </div>
    </form>
  </div>


  );
};

export default AddProduct;
