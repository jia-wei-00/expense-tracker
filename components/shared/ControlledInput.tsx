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

const ControlledInput = ({
  label,
  name,
  type = "text",
  placeholder,
  helperText,
  className,
  suffix,
}: IControlledInput) => {
  const { control } = useFormContext();

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
          <Input className={className} size="md">
            <InputField
              type={type}
              placeholder={placeholder}
              value={value}
              onChangeText={onChange}
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
