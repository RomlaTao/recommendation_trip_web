import { z } from 'zod'

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[A-Za-z])(?=.*\d).+$/,
    'Password must include at least 1 letter and 1 number',
  )
