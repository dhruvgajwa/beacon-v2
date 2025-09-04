export class LookupContactsDto {
  phoneNumbers: string[] = []

  // Basic validation method for null safety
  validate(): void {
    if (!Array.isArray(this.phoneNumbers)) {
      throw new Error("phoneNumbers must be an array")
    }

    if (this.phoneNumbers.length === 0) {
      throw new Error("At least one phone number is required")
    }

    // Filter out null/undefined/empty values for safety
    this.phoneNumbers = this.phoneNumbers
      .filter((phone) => phone && typeof phone === "string" && phone.trim().length > 0)
      .map((phone) => phone.trim())
  }
}
