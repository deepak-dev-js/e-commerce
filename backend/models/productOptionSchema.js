import mongoose from "mongoose";

const productOptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    values: {
      type: [String],
      required: true,
      validate: {
        validator: (values) => values.length > 0,
        message: "At least one option value is required",
      },
    },
  },
  { _id: false },
);

export default productOptionSchema;