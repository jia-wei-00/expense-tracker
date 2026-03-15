import React from "react";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { IControlledInput } from "@/types/components/shared/controlled-input";
import { useFormContext, Controller } from "react-hook-form";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { AlertCircleIcon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

/**
 * Please wrap this component with FormProvider. It uses useFormContext to get form methods
 */
const ControlledInput = ({
  label,
  name,
  type = "text",
  placeholder,
  helperText,
  className,
  suffix,
  isDisabled = false,
  variant = "outline",
  prefix,
  valueType = "string",
  ...props
}: IControlledInput) => {
  const { control } = useFormContext();

  const handleChange = (value: string) => {
    if (valueType === "number") {
      return Number(value);
    }
    return value;
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <FormControl isInvalid={!!error?.message}>
          {label && (
            <FormControlLabel>
              <FormControlLabelText>{label}</FormControlLabelText>
            </FormControlLabel>
          )}
          <Input
            className={className}
            size="md"
            variant={variant}
            isDisabled={isDisabled}
          >
            {!!prefix && (
              <InputSlot className="px-2">
                <Text>{prefix}</Text>
              </InputSlot>
            )}
            <InputField
              type={type}
              placeholder={placeholder}
              value={value?.toString()}
              onChangeText={(value) => onChange(handleChange(value))}
              {...props}
            />
            {!!suffix && (
              <InputSlot onPress={suffix.onPress} className="pr-3">
                <InputIcon as={suffix.icon} />
              </InputSlot>
            )}
          </Input>
          {helperText && (
            <FormControlHelper>
              <FormControlHelperText>{helperText}</FormControlHelperText>
            </FormControlHelper>
          )}
          {error?.message && (
            <FormControlError>
              <FormControlErrorIcon
                as={AlertCircleIcon}
                className="text-red-500"
              />
              <FormControlErrorText className="text-red-500">
                {error.message as string}
              </FormControlErrorText>
            </FormControlError>
          )}
        </FormControl>
      )}
    />
  );
};

export default ControlledInput;
