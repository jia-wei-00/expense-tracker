import React from "react";
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
import { AlertCircleIcon, CircleIcon } from "@/components/ui/icon";
import { HStack } from "@/components/ui/hstack";
import {
  Radio,
  RadioGroup,
  RadioIcon,
  RadioIndicator,
  RadioLabel,
} from "@/components/ui/radio";
import { IControlledRadio } from "@/types/components/shared/controlled-radio";

/**
 * Please wrap this component with FormProvider. It uses useFormContext to get form methods
 */
const ControlledDropdown = ({
  label,
  name,
  helperText,
  items,
  valueType = "string",
}: IControlledRadio) => {
  const { control } = useFormContext();

  const handleChange = (value: string) => {
    if (valueType === "number") {
      return Number(value);
    }
    if (valueType === "boolean") {
      return value === "true";
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
          <HStack>
            <RadioGroup
              value={String(value)}
              onChange={(value) => onChange(handleChange(value))}
            >
              <HStack space="md">
                {items?.map(({ label, value }) => (
                  <Radio
                    key={String(value)}
                    value={String(value)}
                    size="sm"
                    isInvalid={!!error?.message}
                    isDisabled={false}
                  >
                    <RadioIndicator>
                      <RadioIcon as={CircleIcon} />
                    </RadioIndicator>
                    <RadioLabel>{label}</RadioLabel>
                  </Radio>
                ))}
              </HStack>
            </RadioGroup>
          </HStack>
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
                {error.message}
              </FormControlErrorText>
            </FormControlError>
          )}
        </FormControl>
      )}
    />
  );
};

export default ControlledDropdown;
