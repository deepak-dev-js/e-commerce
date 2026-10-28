import mongoose from "mongoose";

const productVariantSchema = new mongoose.Schema(
  {
    sku: {                  // Unique identifier for a particular variant, such as SHIRT-BLACK-M.
      type: String,
      required: true,
      trim: true,
    },

    attributes: {           // Stores the selected combination of size, color, RAM, storage, or other attributes.
      type: Map,
      of: String,
      default: {},
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    images: {
      type: [String],
      default: [],
    },
  },
  { _id: true },
);

export default productVariantSchema;