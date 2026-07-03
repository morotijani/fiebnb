const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    phone_number: z.string().regex(/^(?:\+233|0)\d{9}$/, 'Must be a valid Ghanaian phone number'),
    role: z.string().optional()
  })
});

const hotelManagerUpgradeSchema = z.object({
  body: z.object({
    business_name: z.string().min(1, 'Business name is required'),
    registration_number: z.string().min(1, 'Registration number is required'),
    document_urls: z.array(z.string().url('Must be a valid URL')).min(1, 'At least one document is required')
  })
});

const loginSchema = z.object({
  body: z.object({
    identifier: z.string().min(1, 'Email or phone number is required'),
    password: z.string().min(1, 'Password is required')
  })
});

const otpSchema = z.object({
  body: z.object({
    phone_number: z.string().regex(/^(?:\+233|0)\d{9}$/, 'Must be a valid Ghanaian phone number'),
    otp_code: z.string().length(6, 'OTP must be exactly 6 digits')
  })
});

const homeownerUpgradeSchema = z.object({
  body: z.object({
    property_details: z.object({
      title: z.string().min(1, 'Property title is required'),
      description: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      is_multi_room: z.boolean().optional()
    }),
    id_document: z.string().min(1, 'ID document is required')
  })
});

module.exports = {
  registerSchema,
  loginSchema,
  hotelManagerUpgradeSchema,
  homeownerUpgradeSchema,
  otpSchema
};
