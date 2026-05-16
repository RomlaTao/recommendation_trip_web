import type { FieldErrors, FieldValues, Path, UseFormRegister } from 'react-hook-form'
import { Input } from '@/components/ui/Input'

type DynamicFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'tel'
  | 'select'
  | 'checkbox'
  | 'textarea'

interface DynamicFieldOption {
  value: string
  label: string
}

export interface DynamicFormFieldConfig {
  name: string
  label: string
  type: DynamicFieldType
  placeholder?: string
  options?: DynamicFieldOption[]
  wrapperClassName?: string
  inputClassName?: string
  disabled?: boolean
}

interface DynamicFormFieldsProps<TValues extends FieldValues> {
  fields: DynamicFormFieldConfig[]
  register: UseFormRegister<TValues>
  errors: FieldErrors<TValues>
}

function resolveErrorMessage<TValues extends FieldValues>(
  errors: FieldErrors<TValues>,
  fieldName: string,
): string | undefined {
  const value = errors[fieldName as keyof FieldErrors<TValues>]
  if (!value || typeof value !== 'object') return undefined
  return 'message' in value ? String(value.message ?? '') : undefined
}

export function DynamicFormFields<TValues extends FieldValues>({
  fields,
  register,
  errors,
}: DynamicFormFieldsProps<TValues>) {
  return (
    <>
      {fields.map((field) => {
        const error = resolveErrorMessage(errors, field.name)
        const key = `${field.name}-${field.type}`
        const registered = register(field.name as Path<TValues>)

        if (field.type === 'checkbox') {
          return (
            <label key={key} className={field.wrapperClassName ?? 'flex items-center gap-3 cursor-pointer'}>
              <input
                type="checkbox"
                className="h-4 w-4"
                {...registered}
                disabled={field.disabled}
              />
              <span className="font-label-caps text-[11px] tracking-wider text-on-surface-variant">
                {field.label}
              </span>
            </label>
          )
        }

        if (field.type === 'select') {
          return (
            <div key={key} className={field.wrapperClassName ?? 'space-y-unit'}>
              <label className="font-label-caps text-label-caps text-on-surface-variant block">
                {field.label}
              </label>
              <select
                className={`w-full px-4 py-3 bg-surface-container-lowest border ${
                  error ? 'border-error' : 'border-outline-variant'
                } rounded-none focus:outline-none focus:border-primary font-body-md ${field.inputClassName ?? ''}`}
                {...registered}
                disabled={field.disabled}
              >
                {(field.options ?? []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {error && (
                <p className="font-label-caps text-[11px] text-error mt-1">{error}</p>
              )}
            </div>
          )
        }

        if (field.type === 'textarea') {
          return (
            <div key={key} className={field.wrapperClassName ?? 'space-y-unit'}>
              <label className="font-label-caps text-label-caps text-on-surface-variant block">
                {field.label}
              </label>
              <textarea
                className={`w-full px-4 py-3 bg-surface-container-lowest border ${
                  error ? 'border-error' : 'border-outline-variant'
                } rounded-none focus:outline-none focus:border-primary transition-colors duration-300 font-body-md min-h-[110px] ${field.inputClassName ?? ''}`}
                placeholder={field.placeholder}
                {...registered}
                disabled={field.disabled}
              />
              {error && (
                <p className="font-label-caps text-[11px] text-error mt-1">{error}</p>
              )}
            </div>
          )
        }

        return (
          <div key={key} className={field.wrapperClassName}>
            <Input
              label={field.label}
              type={field.type}
              placeholder={field.placeholder}
              error={error}
              className={field.inputClassName}
              {...registered}
              disabled={field.disabled}
            />
          </div>
        )
      })}
    </>
  )
}
