import mongoose, { Schema, type Document } from "mongoose"

const ItemSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    category: {
      type: String,
      required: true,
      enum: ["clothing", "shoes", "accessories", "bags", "jewelry", "other"],
    },
    type: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    condition: {
      type: String,
      required: true,
      enum: ["new", "like-new", "good", "fair"],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    images: [
      {
        type: String,
        required: true,
      },
    ],
    uploaderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pointValue: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["available", "pending", "swapped", "removed"],
      default: "available",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

ItemSchema.index({ title: "text", description: "text", tags: "text" })
ItemSchema.index({ category: 1, status: 1, isApproved: 1 })

export default mongoose.models.Item || mongoose.model("Item", ItemSchema)
