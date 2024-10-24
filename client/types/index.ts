import * as z from 'zod';

export const NewPasswordSchema = z.object({
  password: z.string().min(6, {
    message: 'Minimum 6 characters required',
  }),
  confirmPassword: z.string().min(6, {
    message: 'Minimum 6 characters required',
  }),
});

export const ResetSchema = z.object({
  email: z.string().email({
    message: 'Email is required',
  }),
});

export const LoginSchema = z.object({
  email: z.string().email({
    message: 'Email is required',
  }),
  password: z.string().min(1, {
    message: 'Password is required',
  }),
  code: z.optional(z.string()),
});

export const RegisterSchema = z.object({
  name: z.string().min(1, {
    message: 'Name is required',
  }),
  email: z.string().email({
    message: 'Email is required',
  }),
  password: z.string().min(6, {
    message: 'Minimum 6 characters required',
  }),
  confirmPassword: z.string().min(6, {
    message: 'Minimum 6 characters required',
  }),
});


// ====== URL QUERY PARAMS
export type UrlQueryParams = {
    params: string
    key: string
    value: string | null
  }
  
  export type RemoveUrlQueryParams = {
    params: string
    keysToRemove: string[]
  }
  
  export type SearchParamProps = {
    params: { id: string }
    searchParams: { [key: string]: string | string[] | undefined }
  }