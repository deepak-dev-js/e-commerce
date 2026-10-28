import { useEffect, useRef, useState } from "react";
import {
  createProduct,
  uploadProductImage,
} from "../services/adminService";
import allowedCategories from "../../../../constants/allowedCategories.js";

const initialFormData = {
  name: "",
  description: "High-quality product with premium features.",
  category: "",
  brand: "",
};

const createOption = () => ({
  id: crypto.randomUUID(),
  name: "",
  valuesText: "",
});

const createEmptyVariant = (attributes, index) => ({
  id: crypto.randomUUID(),
  sku: "",
  attributes,
  price: "",
  stock: "10",
  images: [],
  index,
});

const generateVariants = (options) => {
  if (options.length === 0) {
    return [];
  }

  let combinations = [{}];

  for (const option of options) {
    const values = option.valuesText
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    if (!option.name.trim() || values.length === 0) {
      return [];
    }

    combinations = combinations.flatMap((combination) =>
      values.map((value) => ({
        ...combination,
        [option.name.trim()]: value,
      })),
    );
  }

  return combinations.map((attributes, index) =>
    createEmptyVariant(attributes, index),
  );
};

const AddProduct = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [options, setOptions] = useState([]);
  const [variants, setVariants] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const fileInputRefs = useRef({});
  const previewUrlsRef = useRef([]);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const clearMessage = () => {
    setMessage("");
    setMessageType("");
  };

  const handleBasicChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    clearMessage();
  };

  const addOption = () => {
    setOptions((previous) => [...previous, createOption()]);
    clearMessage();
  };

  const updateOption = (optionId, field, value) => {
    setOptions((previous) =>
      previous.map((option) =>
        option.id === optionId
          ? { ...option, [field]: value }
          : option,
      ),
    );

    setVariants([]);
    clearMessage();
  };

  const removeOption = (optionId) => {
    setOptions((previous) =>
      previous.filter((option) => option.id !== optionId),
    );

    setVariants([]);
    clearMessage();
  };

  const handleGenerateVariants = () => {
    const preparedOptions = options.map((option) => ({
      ...option,
      name: option.name.trim(),
      values: option.valuesText
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    }));

    if (preparedOptions.length === 0) {
      setMessage("Add at least one option before generating variants.");
      setMessageType("error");
      return;
    }

    const optionNames = preparedOptions.map((option) =>
      option.name.toLowerCase(),
    );

    if (preparedOptions.some((option) => !option.name)) {
      setMessage("Every option must have a name.");
      setMessageType("error");
      return;
    }

    if (new Set(optionNames).size !== optionNames.length) {
      setMessage("Option names must be unique.");
      setMessageType("error");
      return;
    }

    if (preparedOptions.some((option) => option.values.length === 0)) {
      setMessage("Enter comma-separated values for every option.");
      setMessageType("error");
      return;
    }

    for (const option of preparedOptions) {
      const normalizedValues = option.values.map((value) =>
        value.toLowerCase(),
      );

      if (new Set(normalizedValues).size !== normalizedValues.length) {
        setMessage(`Duplicate values found in "${option.name}".`);
        setMessageType("error");
        return;
      }
    }

    // Limit combinations to prevent accidentally generating too many variants.
    const combinationCount = preparedOptions.reduce(
      (total, option) => total * option.values.length,
      1,
    );

    if (combinationCount > 100) {
      setMessage(
        "This creates more than 100 variants. Reduce the option values and try again.",
      );
      setMessageType("error");
      return;
    }

    const generatedVariants = generateVariants(options);

    if (generatedVariants.length === 0) {
      setMessage("Unable to generate variants. Check your options.");
      setMessageType("error");
      return;
    }

    setVariants(generatedVariants);
    clearMessage();
  };

  const updateVariant = (variantId, field, value) => {
    setVariants((previous) =>
      previous.map((variant) =>
        variant.id === variantId
          ? { ...variant, [field]: value }
          : variant,
      ),
    );

    clearMessage();
  };

  const handleImagesChange = (variantId, event) => {
    const selectedFiles = Array.from(event.target.files || []);
    const existingVariant = variants.find(
      (variant) => variant.id === variantId,
    );

    if (!existingVariant) {
      return;
    }

    if (existingVariant.images.length + selectedFiles.length > 10) {
      setMessage("You can select a maximum of 10 images per variant.");
      setMessageType("error");
      event.target.value = "";
      return;
    }

    const invalidFile = selectedFiles.find(
      (file) =>
        !file.type.startsWith("image/") ||
        file.size > 5 * 1024 * 1024,
    );

    if (invalidFile) {
      setMessage(
        "Every image must be a valid image file no larger than 5 MB.",
      );
      setMessageType("error");
      event.target.value = "";
      return;
    }

    const newImages = selectedFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    previewUrlsRef.current.push(
      ...newImages.map((image) => image.previewUrl),
    );

    setVariants((previous) =>
      previous.map((variant) =>
        variant.id === variantId
          ? {
            ...variant,
            images: [...variant.images, ...newImages],
          }
          : variant,
      ),
    );

    clearMessage();
    event.target.value = "";
  };

  const removeVariantImage = (variantId, imageId) => {
    setVariants((previous) =>
      previous.map((variant) =>
        variant.id === variantId
          ? {
            ...variant,
            images: variant.images.filter(
              (image) => image.id !== imageId,
            ),
          }
          : variant,
      ),
    );

    clearMessage();
  };

  const handleReset = () => {
    previewUrlsRef.current.forEach((url) => {
      URL.revokeObjectURL(url);
    });

    previewUrlsRef.current = [];

    setFormData(initialFormData);
    setOptions([]);
    setVariants([]);
    setMessage("");
    setMessageType("");

    Object.values(fileInputRefs.current).forEach((input) => {
      if (input) {
        input.value = "";
      }
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (variants.length === 0) {
      setMessage("Generate at least one variant before saving.");
      setMessageType("error");
      return;
    }

    for (const variant of variants) {
      if (!variant.sku.trim()) {
        setMessage("Every variant needs a SKU.");
        setMessageType("error");
        return;
      }

      if (
        variant.price === "" ||
        !Number.isFinite(Number(variant.price)) ||
        Number(variant.price) < 0
      ) {
        setMessage(`Enter a valid price for ${variant.sku}.`);
        setMessageType("error");
        return;
      }

      if (
        variant.stock === "" ||
        !Number.isInteger(Number(variant.stock)) ||
        Number(variant.stock) < 0
      ) {
        setMessage(`Enter valid stock for ${variant.sku}.`);
        setMessageType("error");
        return;
      }

      if (variant.images.length === 0) {
        setMessage(`Upload at least one image for ${variant.sku}.`);
        setMessageType("error");
        return;
      }
    }

    const skuValues = variants.map((variant) =>
      variant.sku.trim().toLowerCase(),
    );

    if (new Set(skuValues).size !== skuValues.length) {
      setMessage("Every variant must have a unique SKU.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    clearMessage();

    try {
      const uploadedVariants = [];

      for (const variant of variants) {
        const imageUrls = [];

        for (const image of variant.images) {
          // Upload each image to Cloudinary.
          const uploadData = await uploadProductImage(
            image.file,
            formData.category,
          );

          if (!uploadData.imageUrl) {
            throw new Error(
              `Image upload failed for ${variant.sku}.`,
            );
          }

          imageUrls.push(uploadData.imageUrl);
        }

        uploadedVariants.push({
          sku: variant.sku.trim(),
          attributes: variant.attributes,
          price: Number(variant.price),
          stock: Number(variant.stock),
          images: imageUrls,
        });
      }

      const productOptions = options.map((option) => ({
        name: option.name.trim(),
        values: option.valuesText
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
      }));

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        brand: formData.brand.trim(),
        options: productOptions,
        variants: uploadedVariants,
      };

      await createProduct(productData);

      setMessage("Product added successfully!");
      setMessageType("success");

      handleReset();
      setMessage("Product added successfully!");
      setMessageType("success");
    } catch (error) {
      console.error("Add product error:", error);

      setMessage(error.message || "Failed to add product.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Add New Product
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Create a product with multiple variants, prices, stock levels,
          and images.
        </p>
      </div>

     <form
  onSubmit={handleSubmit}
  className="flex flex-wrap items-start gap-16 rounded-xl border border-gray-100 bg-white p-6 shadow-sm md:p-8"
>
        {/* Basic product information */}
        <section className="w-full space-y-4 md:w-[35%]">
          <h2 className="text-lg font-semibold text-gray-800">
            Basic Information
          </h2>

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
              onChange={handleBasicChange}
              className={inputClass}
              required
            >
              <option value="" disabled>
                Select Category
              </option>

              {allowedCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

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
              value={formData.name}
              onChange={handleBasicChange}
              placeholder="e.g. Men's Casual Shirt"
              className={inputClass}
              maxLength={150}
              required
            />
          </div>

          <div>
            <label
              htmlFor="brand"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Brand
            </label>

            <input
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleBasicChange}
              placeholder="e.g. Example Brand"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Description *
            </label>

            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleBasicChange}
              rows={4}
              className={inputClass}
              required
            />
          </div>
        </section>

        {/* Product options */}
      <section className="min-w-0 flex-1 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Product Options
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Add options such as Color, Size, RAM, Storage, Weight, or
              Flavor. Separate multiple values with commas.
            </p>
          </div>

          {options.map((option) => (
            <div
              key={option.id}
              className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 p-4 md:grid-cols-[1fr_2fr_auto]"
            >
              <div>
                <label
                  htmlFor={`option-name-${option.id}`}
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Option Name
                </label>

                <input
                  id={`option-name-${option.id}`}
                  value={option.name}
                  onChange={(event) =>
                    updateOption(option.id, "name", event.target.value)
                  }
                  placeholder="e.g. Color"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor={`option-values-${option.id}`}
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Values
                </label>

                <input
                  id={`option-values-${option.id}`}
                  value={option.valuesText}
                  onChange={(event) =>
                    updateOption(
                      option.id,
                      "valuesText",
                      event.target.value,
                    )
                  }
                  placeholder="e.g. Black, Blue, White"
                  className={inputClass}
                  required
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeOption(option.id)}
                  disabled={loading}
                  className="rounded-lg border border-red-200 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={addOption}
              disabled={loading}
              className="rounded-lg border border-blue-200 px-4 py-2 font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50"
            >
              + Add Option
            </button>

            <button
              type="button"
              onClick={handleGenerateVariants}
              disabled={loading || options.length === 0}
              className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Generate Variants
            </button>
          </div>

          {/* Generated variants */}
          {variants.length > 0 && (
            <section className="space-y-5 border-t border-gray-100 pt-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Variant Details ({variants.length})
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Set the SKU, price, stock, and images for each combination.
                </p>
              </div>

              {variants.map((variant, index) => (
                <div
                  key={variant.id}
                  className="space-y-5 rounded-xl border border-gray-200 p-4 md:p-5"
                >
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Variant {index + 1}
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {Object.entries(variant.attributes).map(
                        ([name, value]) => (
                          <span
                            key={name}
                            className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                          >
                            {name}: {value}
                          </span>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label
                        htmlFor={`sku-${variant.id}`}
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        SKU *
                      </label>

                      <input
                        id={`sku-${variant.id}`}
                        value={variant.sku}
                        onChange={(event) =>
                          updateVariant(
                            variant.id,
                            "sku",
                            event.target.value,
                          )
                        }
                        placeholder="e.g. SHIRT-BLACK-M"
                        className={inputClass}
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`price-${variant.id}`}
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Price (₹) *
                      </label>

                      <input
                        id={`price-${variant.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.price}
                        onChange={(event) =>
                          updateVariant(
                            variant.id,
                            "price",
                            event.target.value,
                          )
                        }
                        placeholder="799"
                        className={inputClass}
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`stock-${variant.id}`}
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Stock Quantity *
                      </label>

                      <input
                        id={`stock-${variant.id}`}
                        type="number"
                        min="0"
                        step="1"
                        value={variant.stock}
                        onChange={(event) =>
                          updateVariant(
                            variant.id,
                            "stock",
                            event.target.value,
                          )
                        }
                        className={inputClass}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor={`images-${variant.id}`}
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Variant Images *
                    </label>

                    <input
                      id={`images-${variant.id}`}
                      ref={(element) => {
                        fileInputRefs.current[variant.id] = element;
                      }}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(event) =>
                        handleImagesChange(variant.id, event)
                      }
                      className="w-full rounded-lg border border-gray-300 p-3 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                    />

                    <p className="mt-2 text-xs text-gray-500">
                      Select multiple images. Maximum 10 images per variant,
                      5 MB per image.
                    </p>

                    {variant.images.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {variant.images.map((image, imageIndex) => (
                          <div
                            key={image.id}
                            className="relative rounded-lg border border-gray-200 p-2"
                          >
                            <img
                              src={image.previewUrl}
                              alt={`${variant.sku || "Variant"} preview ${imageIndex + 1}`}
                              className="h-32 w-full rounded-md object-cover"
                            />

                            <p className="mt-2 truncate text-xs text-gray-500">
                              {image.file.name}
                            </p>

                            <button
                              type="button"
                              onClick={() =>
                                removeVariantImage(variant.id, image.id)
                              }
                              disabled={loading}
                              aria-label={`Remove image ${image.file.name}`}
                              className="mt-2 w-full rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              Remove Image
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </section>
          )}

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
              onClick={handleReset}
              className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Reset
            </button>

            <button
              type="submit"
              disabled={loading || variants.length === 0}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Uploading Images & Saving..." : "Add Product"}
            </button>
          </div>
        </section>


      </form>
    </div>
  );
};

export default AddProduct;