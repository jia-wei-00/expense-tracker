import React, { useCallback, useMemo } from "react";
import type { IControlledDropdown } from "@/types/components/shared/controlled-dropdown";
import { useFormContext, Controller, useWatch } from "react-hook-form";
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
import { AlertCircleIcon, ChevronDownIcon } from "@/components/ui/icon";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "@/components/ui/select";
import { Box } from "@/components/ui/box";
import { Calendar } from "react-native-calendars";
import dayjs from "dayjs";

/**
 * Please wrap this component with FormProvider. It uses useFormContext to get form methods
 */
const ControlledDropdown = ({
  label,
  name,
  placeholder,
  variant,
  helperText,
  items,
  isCalendar = false,
  valueType = "string",
  displayValue,
}: IControlledDropdown) => {
  const { control } = useFormContext();
  const watchedValue = useWatch({ control, name });

  const handleChange = useCallback(
    (value: string) => {
      if (valueType === "number") return Number(value);
      if (valueType === "boolean") return Boolean(value);
      return value;
    },
    [valueType],
  );

  const formattedDate = useMemo(() => {
    return isCalendar
      ? dayjs(watchedValue).format("YYYY-MM-DD")
      : dayjs().format("YYYY-MM-DD");
  }, [watchedValue, isCalendar]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        return (
          <FormControl isInvalid={!!error?.message}>
            {label && (
              <FormControlLabel>
                <FormControlLabelText>{label}</FormControlLabelText>
              </FormControlLabel>
            )}
            <Select
              onValueChange={(value) => {
                onChange(handleChange(value));
              }}
              defaultValue={value}
              selectedValue={value ? value : ""}
            >
              <SelectTrigger variant={variant} size="md">
                <SelectInput
                  placeholder={placeholder}
                  value={displayValue ?? (isCalendar ? formattedDate : (value ?? ""))}
                  className="flex-1"
                />
                <SelectIcon className="mr-3" as={ChevronDownIcon} />
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent>
                  <SelectDragIndicatorWrapper>
                    <SelectDragIndicator />
                  </SelectDragIndicatorWrapper>
                  {isCalendar ? (
                    <Box className="w-full min-h-40 p-2">
                      <Calendar
                        onDayPress={({ timestamp }) => {
                          onChange(dayjs(timestamp).toISOString());
                        }}
                        markedDates={{
                          [formattedDate]: {
                            selected: true,
                            disableTouchEvent: true,
                          },
                        }}
                        style={{ borderRadius: 10 }}
                      />
                    </Box>
                  ) : (
                    items?.map(({ label, value }) => (
                      <SelectItem label={label} value={value} key={value} />
                    ))
                  )}
                </SelectContent>
              </SelectPortal>
            </Select>
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
        );
      }}
    />
  );
};

export default ControlledDropdown;
