import React, { useState } from "react";
import type { IControlledDropdown } from "@/types/components/shared/controlled-dropdown";
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
}: IControlledDropdown) => {
  const { control } = useFormContext();
  const [selected, setSelected] = useState(dayjs().format("YYYY-MM-DD"));

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange }, fieldState: { error } }) => (
        <FormControl isInvalid={!!error?.message}>
          {label && (
            <FormControlLabel>
              <FormControlLabelText>{label}</FormControlLabelText>
            </FormControlLabel>
          )}
          <Select onValueChange={onChange}>
            <SelectTrigger variant={variant} size="md">
              <SelectInput
                placeholder={placeholder}
                {...(isCalendar && { value: selected })}
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
                      onDayPress={({ timestamp, dateString }) => {
                        setSelected(dateString);
                        onChange(new Date(timestamp).toISOString());
                      }}
                      markedDates={{
                        [selected]: {
                          selected: true,
                          disableTouchEvent: true,
                        },
                      }}
                      style={{
                        borderRadius: 10,
                      }}
                    />
                  </Box>
                ) : (
                  items?.map(({ label, value }) => {
                    return (
                      <SelectItem label={label} value={value} key={value} />
                    );
                  })
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
                {error.message as string}
              </FormControlErrorText>
            </FormControlError>
          )}
        </FormControl>
      )}
    />
  );
};

export default ControlledDropdown;
