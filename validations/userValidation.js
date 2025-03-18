// validations/userValidation.js
import { z } from 'zod';

// Schema for user registration - required fields are explicitly defined
const registerSchema = z.object({
  firstName: z
    .string({ required_error: 'First name is required' }) // Must be provided
    .trim()
    .min(3, { message: 'First name must be at least 3 characters' })
    .max(20, { message: 'First name must not exceed 20 characters' }),
  lastName: z
    .string({ required_error: 'Last name is required' }) // Must be provided
    .trim()
    .min(3, { message: 'Last name must be at least 3 characters' })
    .max(20, { message: 'Last name must not exceed 20 characters' }),
  email: z
    .string({ required_error: 'Email is required' }) // Must be provided
    .trim()
    .email({ message: 'Invalid email format' })
    .min(5, { message: 'Email must be at least 5 characters' })
    .max(200, { message: 'Email must not exceed 200 characters' }),
  password: z
    .string({ required_error: 'Password is required' }) // Must be provided
    .trim()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(20, { message: 'Password must not exceed 20 characters' }),
  phoneNumber: z
    .string()
    .optional() // Optional field
    .refine((val) => !val || /^\+\d{1,15}$/.test(val), {
      message: 'Phone number must include country code (e.g., +1234567890) and be valid',
    }),
  dob: z
    .string()
    .optional() // Optional field
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Date of birth must be a valid date',
    }),
  gender: z
    .enum(['Male', 'Female', 'Other'])
    .optional(), // Optional field
  location: z
    .object({
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(), // Optional nested object
});

// Schema for updating user info - all fields are optional for partial updates
const updateUserInfoSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(3, { message: 'First name must be at least 3 characters' })
    .max(20, { message: 'First name must not exceed 20 characters' })
    .optional(), // Optional for updates
  lastName: z
    .string()
    .trim()
    .min(3, { message: 'Last name must be at least 3 characters' })
    .max(20, { message: 'Last name must not exceed 20 characters' })
    .optional(), // Optional for updates
  phoneNumber: z
    .string()
    .optional() // Optional for updates
    .refine((val) => !val || /^\+\d{1,15}$/.test(val), {
      message: 'Phone number must include country code (e.g., +1234567890) and be valid',
    }),
  dob: z
    .string()
    .optional() // Optional for updates
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Date of birth must be a valid date',
    }),
  gender: z
    .enum(['Male', 'Female', 'Other'])
    .optional(), // Optional for updates
  location: z
    .object({
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(), // Optional nested object for updates
});

export { registerSchema, updateUserInfoSchema };