export class ValidationError extends Error {
  public field: string
  public code: string

  constructor(field: string, message: string, code = "VALIDATION_ERROR") {
    super(message)
    this.field = field
    this.code = code
    this.name = "ValidationError"
  }
}

export class Validator {
  static email(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  static password(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long")
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push("Password must contain at least one lowercase letter")
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push("Password must contain at least one uppercase letter")
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push("Password must contain at least one number")
    }

    return { isValid: errors.length === 0, errors }
  }

  static required(value: any, fieldName: string): void {
    if (!value || (typeof value === "string" && value.trim() === "")) {
      throw new ValidationError(fieldName, `${fieldName} is required`)
    }
  }

  static minLength(value: string, min: number, fieldName: string): void {
    if (value.length < min) {
      throw new ValidationError(fieldName, `${fieldName} must be at least ${min} characters`)
    }
  }

  static maxLength(value: string, max: number, fieldName: string): void {
    if (value.length > max) {
      throw new ValidationError(fieldName, `${fieldName} must not exceed ${max} characters`)
    }
  }

  static isIn(value: string, allowedValues: string[], fieldName: string): void {
    if (!allowedValues.includes(value)) {
      throw new ValidationError(fieldName, `${fieldName} must be one of: ${allowedValues.join(", ")}`)
    }
  }

  static isNumber(value: any, fieldName: string): void {
    if (isNaN(Number(value))) {
      throw new ValidationError(fieldName, `${fieldName} must be a valid number`)
    }
  }

  static isPositive(value: number, fieldName: string): void {
    if (value <= 0) {
      throw new ValidationError(fieldName, `${fieldName} must be a positive number`)
    }
  }

  static isArray(value: any, fieldName: string): void {
    if (!Array.isArray(value)) {
      throw new ValidationError(fieldName, `${fieldName} must be an array`)
    }
  }

  static validateItemData(data: any): void {
    this.required(data.title, "title")
    this.minLength(data.title, 3, "title")
    this.maxLength(data.title, 100, "title")

    this.required(data.description, "description")
    this.minLength(data.description, 10, "description")
    this.maxLength(data.description, 1000, "description")

    this.required(data.category, "category")
    this.isIn(data.category, ["clothing", "shoes", "accessories", "bags", "jewelry", "other"], "category")

    this.required(data.condition, "condition")
    this.isIn(data.condition, ["new", "like-new", "good", "fair"], "condition")

    this.required(data.size, "size")
    this.required(data.type, "type")

    if (data.images) {
      this.isArray(data.images, "images")
      if (data.images.length === 0) {
        throw new ValidationError("images", "At least one image is required")
      }
      if (data.images.length > 5) {
        throw new ValidationError("images", "Maximum 5 images allowed")
      }
    }

    if (data.tags) {
      this.isArray(data.tags, "tags")
    }
  }

  static validateSwapData(data: any): void {
    this.required(data.itemId, "itemId")
    this.required(data.type, "type")
    this.isIn(data.type, ["direct", "points"], "type")

    if (data.type === "direct") {
      this.required(data.offeredItemId, "offeredItemId")
    } else if (data.type === "points") {
      this.required(data.pointsOffered, "pointsOffered")
      this.isNumber(data.pointsOffered, "pointsOffered")
      this.isPositive(data.pointsOffered, "pointsOffered")
    }

    if (data.message && data.message.length > 500) {
      throw new ValidationError("message", "Message must not exceed 500 characters")
    }
  }
}
