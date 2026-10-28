import Product from "../../models/Product.js";
import allowedCategories from "../../constants/allowedCategories.js";

export const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      brand = "",
      options = [],
      variants = [],
    } = req.body;

    // 1. Validate basic product information.
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof description !== "string" ||
      !description.trim() ||
      typeof category !== "string" ||
      !category.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, description, and category are required.",
      });
    }

    console.log("category 2",category)

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product category.",
      });
    }

    if (typeof brand !== "string") {
      return res.status(400).json({
        success: false,
        message: "Brand must be a string.",
      });
    }

    // 2. Validate options and variants.
    if (!Array.isArray(options) || !Array.isArray(variants)) {
      return res.status(400).json({
        success: false,
        message: "Options and variants must be arrays.",
      });
    }

    if (variants.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product variant is required.",
      });
    }

    // 3. Validate option names and values.
    const optionNames = new Set();

    for (const option of options) {
      if (
        typeof option.name !== "string" ||
        !option.name.trim() ||
        !Array.isArray(option.values) ||
        option.values.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Every option must have a name and at least one value.",
        });
      }

      const optionName = option.name.trim().toLowerCase();

      if (optionNames.has(optionName)) {
        return res.status(400).json({
          success: false,
          message: `Duplicate option name: ${option.name}`,
        });
      }

      optionNames.add(optionName);

      const normalizedValues = new Set();

      for (const value of option.values) {
        if (typeof value !== "string" || !value.trim()) {
          return res.status(400).json({
            success: false,
            message: `Option "${option.name}" contains an invalid value.`,
          });
        }

        const normalizedValue = value.trim().toLowerCase();

        if (normalizedValues.has(normalizedValue)) {
          return res.status(400).json({
            success: false,
            message: `Option "${option.name}" contains duplicate values.`,
          });
        }

        normalizedValues.add(normalizedValue);
      }
    }

    // 4. Validate each purchasable variant.
    const skuSet = new Set();
    const variantCombinationSet = new Set();

    for (const variant of variants) {
      if (
        typeof variant.sku !== "string" ||
        !variant.sku.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Every variant must have a SKU.",
        });
      }

      const normalizedSku = variant.sku.trim().toUpperCase();

      if (skuSet.has(normalizedSku)) {
        return res.status(400).json({
          success: false,
          message: `Duplicate SKU: ${variant.sku}`,
        });
      }

      skuSet.add(normalizedSku);

      if (
        variant.price === "" ||
        variant.price === null ||
        variant.price === undefined ||
        !Number.isFinite(Number(variant.price)) ||
        Number(variant.price) < 0
      ) {
        return res.status(400).json({
          success: false,
          message: `Variant ${variant.sku} has an invalid price.`,
        });
      }

      if (
        variant.stock === "" ||
        variant.stock === null ||
        variant.stock === undefined ||
        !Number.isInteger(Number(variant.stock)) ||
        Number(variant.stock) < 0
      ) {
        return res.status(400).json({
          success: false,
          message: `Variant ${variant.sku} has an invalid stock quantity.`,
        });
      }

      if (
        !variant.attributes ||
        typeof variant.attributes !== "object" ||
        Array.isArray(variant.attributes)
      ) {
        return res.status(400).json({
          success: false,
          message: `Variant ${variant.sku} must have attributes.`,
        });
      }

      // Require every declared option in every variant.
      const attributeNames = Object.keys(variant.attributes);

      if (
        attributeNames.length !== options.length ||
        options.some((option) => {
          const matchingKey = attributeNames.find(
            (key) =>
              key.trim().toLowerCase() === option.name.trim().toLowerCase(),
          );

          if (!matchingKey) {
            return true;
          }

          const value = variant.attributes[matchingKey];

          return (
            typeof value !== "string" ||
            !option.values.some(
              (allowedValue) =>
                allowedValue.trim().toLowerCase() === value.trim().toLowerCase(),
            )
          );
        })
      ) {
        return res.status(400).json({
          success: false,
          message: `Variant ${variant.sku} has invalid attributes.`,
        });
      }

      // Prevent duplicate combinations, such as two Black / M variants.
      const normalizedAttributes = options
        .map((option) => {
          const key = attributeNames.find(
            (attributeName) =>
              attributeName.trim().toLowerCase() ===
              option.name.trim().toLowerCase(),
          );

          return variant.attributes[key].trim().toLowerCase();
        });

      const combinationKey = JSON.stringify(normalizedAttributes);

      if (variantCombinationSet.has(combinationKey)) {
        return res.status(400).json({
          success: false,
          message: "Duplicate variant attribute combination.",
        });
      }

      variantCombinationSet.add(combinationKey);

      if (
        !Array.isArray(variant.images) ||
        variant.images.length === 0 ||
        variant.images.some(
          (image) =>
            typeof image !== "string" ||
            !image.trim() ||
            !/^https:\/\//i.test(image.trim()),
        )
      ) {
        return res.status(400).json({
          success: false,
          message: `Variant ${variant.sku} must have at least one valid HTTPS image URL.`,
        });
      }
    }

    // 5. Save the new product structure.
    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      category,
      brand: brand.trim(),

      options: options.map((option) => ({
        name: option.name.trim(),
        values: option.values.map((value) => value.trim()),
      })),

      variants: variants.map((variant) => ({
        sku: variant.sku.trim(),
        attributes: variant.attributes,
        price: Number(variant.price),
        stock: Number(variant.stock),
        images: variant.images.map((image) => image.trim()),
      })),
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product,
    });
  } catch (error) {
    console.error("Error creating product:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create product.",
    });
  }
};