import mongoose, { Schema, type Document } from "mongoose"


const SwapSchema = new Schema(
  {
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    itemId: {
      type: Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    offeredItemId: {
      type: Schema.Types.ObjectId,
      ref: "Item",
    },
    pointsOffered: {
      type: Number,
      min: 1,
    },
    type: {
      type: String,
      enum: ["direct", "points"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },
    message: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  },
)

// Ensure either offeredItemId or pointsOffered is provided based on type
SwapSchema.pre("save", function (next) {
  if (this.type === "direct" && !this.offeredItemId) {
    return next(new Error("Direct swap requires an offered item"))
  }
  if (this.type === "points" && !this.pointsOffered) {
    return next(new Error("Points swap requires points offered"))
  }
  next()
})

export default mongoose.models.Swap || mongoose.model("Swap", SwapSchema)
