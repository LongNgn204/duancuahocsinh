// backend/workers/validation.js
// Chú thích: Lightweight input validation (tương tự Zod nhưng đơn giản hơn cho Workers)
// Không dùng Zod vì có thể không tương thích với Workers environment

/**
 * Validation result
 */
class ValidationResult {
  constructor(success, data = null, errors = []) {
    this.success = success;
    this.data = data;
    this.errors = errors;
  }

  static success(data) {
    return new ValidationResult(true, data);
  }

  static failure(errors) {
    return new ValidationResult(false, null, Array.isArray(errors) ? errors : [errors]);
  }
}

/**
 * Base validator class
 */
class Validator {
  constructor(name) {
    this.name = name;
  }

  parse(value) {
    throw new Error('parse() must be implemented');
  }
}

/**
 * String validator
 */
class StringValidator extends Validator {
  constructor(name = 'string') {
    super(name);
    this.minLength = null;
    this.maxLength = null;
    this.pattern = null;
    this.required = true;
  }

  min(len) {
    this.minLength = len;
    return this;
  }

  max(len) {
    this.maxLength = len;
    return this;
  }

  regex(pattern) {
    this.pattern = pattern;
    return this;
  }

  optional() {
    this.required = false;
    return this;
  }

  parse(value) {
    if (value === null || value === undefined) {
      if (this.required) {
        return ValidationResult.failure(`${this.name} is required`);
      }
      return ValidationResult.success(null);
    }

    if (typeof value !== 'string') {
      return ValidationResult.failure(`${this.name} must be a string`);
    }

    if (this.minLength !== null && value.length < this.minLength) {
      return ValidationResult.failure(`${this.name} must be at least ${this.minLength} characters`);
    }

    if (this.maxLength !== null && value.length > this.maxLength) {
      return ValidationResult.failure(`${this.name} must be at most ${this.maxLength} characters`);
    }

    if (this.pattern && !this.pattern.test(value)) {
      return ValidationResult.failure(`${this.name} does not match required pattern`);
    }

    return ValidationResult.success(value);
  }
}

/**
 * Number validator
 */
class NumberValidator extends Validator {
  constructor(name = 'number') {
    super(name);
    this.min = null;
    this.max = null;
    this.int = false;
    this.required = true;
  }

  minValue(val) {
    this.min = val;
    return this;
  }

  maxValue(val) {
    this.max = val;
    return this;
  }

  integer() {
    this.int = true;
    return this;
  }

  optional() {
    this.required = false;
    return this;
  }

  parse(value) {
    if (value === null || value === undefined) {
      if (this.required) {
        return ValidationResult.failure(`${this.name} is required`);
      }
      return ValidationResult.success(null);
    }

    const num = Number(value);
    if (isNaN(num)) {
      return ValidationResult.failure(`${this.name} must be a number`);
    }

    if (this.int && !Number.isInteger(num)) {
      return ValidationResult.failure(`${this.name} must be an integer`);
    }

    if (this.min !== null && num < this.min) {
      return ValidationResult.failure(`${this.name} must be at least ${this.min}`);
    }

    if (this.max !== null && num > this.max) {
      return ValidationResult.failure(`${this.name} must be at most ${this.max}`);
    }

    return ValidationResult.success(this.int ? Math.floor(num) : num);
  }
}

/**
 * Array validator
 */
class ArrayValidator extends Validator {
  constructor(name = 'array', itemValidator = null) {
    super(name);
    this.itemValidator = itemValidator;
    this.minLength = null;
    this.maxLength = null;
    this.required = true;
  }

  min(len) {
    this.minLength = len;
    return this;
  }

  max(len) {
    this.maxLength = len;
    return this;
  }

  optional() {
    this.required = false;
    return this;
  }

  parse(value) {
    if (value === null || value === undefined) {
      if (this.required) {
        return ValidationResult.failure(`${this.name} is required`);
      }
      return ValidationResult.success(null);
    }

    if (!Array.isArray(value)) {
      return ValidationResult.failure(`${this.name} must be an array`);
    }

    if (this.minLength !== null && value.length < this.minLength) {
      return ValidationResult.failure(`${this.name} must have at least ${this.minLength} items`);
    }

    if (this.maxLength !== null && value.length > this.maxLength) {
      return ValidationResult.failure(`${this.name} must have at most ${this.maxLength} items`);
    }

    if (this.itemValidator) {
      const validated = [];
      const errors = [];
      for (let i = 0; i < value.length; i++) {
        const result = this.itemValidator.parse(value[i]);
        if (result.success) {
          validated.push(result.data);
        } else {
          errors.push(`[${i}]: ${result.errors.join(', ')}`);
        }
      }
      if (errors.length > 0) {
        return ValidationResult.failure(errors);
      }
      return ValidationResult.success(validated);
    }

    return ValidationResult.success(value);
  }
}

/**
 * Object schema validator
 */
class ObjectSchema {
  constructor(schema) {
    this.schema = schema;
  }

  parse(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return ValidationResult.failure('Expected an object');
    }

    const result = {};
    const errors = [];

    for (const [key, validator] of Object.entries(this.schema)) {
      const value = data[key];
      const validationResult = validator.parse(value);
      
      if (validationResult.success) {
        result[key] = validationResult.data;
      } else {
        errors.push(`${key}: ${validationResult.errors.join(', ')}`);
      }
    }

    if (errors.length > 0) {
      return ValidationResult.failure(errors);
    }

    return ValidationResult.success(result);
  }
}

/**
 * Factory functions
 */
export function z() {
  return {
    string: (name) => new StringValidator(name),
    number: (name) => new NumberValidator(name),
    array: (name, itemValidator) => new ArrayValidator(name, itemValidator),
    object: (schema) => new ObjectSchema(schema),
  };
}

/**
 * Validate request body với schema
 * @param {Request} request 
 * @param {ObjectSchema} schema 
 * @returns {Promise<{success: boolean, data?: any, error?: Response}>}
 */
export async function validateRequest(request, schema) {
  try {
    const body = await request.json();
    const result = schema.parse(body);
    
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return {
        success: false,
        error: new Response(JSON.stringify({
          error: 'validation_error',
          message: 'Dữ liệu không hợp lệ',
          details: result.errors,
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }),
      };
    }
  } catch (error) {
    return {
      success: false,
      error: new Response(JSON.stringify({
        error: 'invalid_json',
        message: 'Body phải là JSON hợp lệ',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }),
    };
  }
}

