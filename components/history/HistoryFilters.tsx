import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { Calendar } from "react-native-calendars";
import { Search, X } from "lucide-react-native";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { ChevronDownIcon } from "@/components/ui/icon";
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
import { hasActiveExpenseFilters } from "@/hooks/useExpenses";
import type {
  TExpenseFilters,
  TExpenseTypeFilter,
} from "@/types/hooks/use-expense";
import type { IHistoryFilters } from "@/types/components/history/history-filters";

const TYPE_FILTERS: TExpenseTypeFilter[] = ["all", "expense", "income"];

const isTypeFilter = (value: string): value is TExpenseTypeFilter =>
  value === "all" || value === "expense" || value === "income";

const DateFilterSelect = ({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value?: string;
  onChange: (date?: string) => void;
}) => {
  const formatted = value ? dayjs(value).format("YYYY-MM-DD") : "";

  return (
    <Select className="flex-1">
      <SelectTrigger variant="rounded" size="md">
        <SelectInput
          placeholder={placeholder}
          value={formatted}
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
          <Box className="w-full min-h-40 p-2">
            <Calendar
              onDayPress={({ timestamp }) => {
                onChange(dayjs(timestamp).toISOString());
              }}
              markedDates={
                formatted
                  ? { [formatted]: { selected: true, disableTouchEvent: true } }
                  : {}
              }
              style={{ borderRadius: 10 }}
            />
          </Box>
        </SelectContent>
      </SelectPortal>
    </Select>
  );
};

const HistoryFilters = ({ filters, onChange }: IHistoryFilters) => {
  const { t } = useTranslation("home");
  const [search, setSearch] = useState(filters.search ?? "");

  useEffect(() => {
    const handle = setTimeout(() => {
      const next = search.trim() || undefined;
      if (next !== filters.search) onChange({ ...filters, search: next });
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const setFilter = (patch: Partial<TExpenseFilters>) =>
    onChange({ ...filters, ...patch });

  const handleClear = () => {
    setSearch("");
    onChange({ type: "all" });
  };

  const typeLabels: Record<TExpenseTypeFilter, string> = {
    all: t("filter.type.all"),
    expense: t("filter.type.expense"),
    income: t("filter.type.income"),
  };
  const selectedType = filters.type ?? "all";

  return (
    <VStack space="sm" className="pb-2">
      <Input variant="rounded" size="md">
        <InputSlot className="pl-3">
          <InputIcon as={Search} />
        </InputSlot>
        <InputField
          placeholder={t("filter.search.placeholder")}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
        {search.length > 0 && (
          <InputSlot className="pr-3" onPress={() => setSearch("")}>
            <InputIcon as={X} />
          </InputSlot>
        )}
      </Input>
      <HStack space="sm">
        <Select
          className="flex-1"
          selectedValue={selectedType}
          onValueChange={(value) => {
            if (isTypeFilter(value)) setFilter({ type: value });
          }}
        >
          <SelectTrigger variant="rounded" size="md">
            <SelectInput
              placeholder={t("filter.type.all")}
              value={typeLabels[selectedType]}
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
              {TYPE_FILTERS.map((type) => (
                <SelectItem key={type} label={typeLabels[type]} value={type} />
              ))}
            </SelectContent>
          </SelectPortal>
        </Select>
        <DateFilterSelect
          placeholder={t("filter.from")}
          value={filters.startDate}
          onChange={(startDate) => setFilter({ startDate })}
        />
        <DateFilterSelect
          placeholder={t("filter.to")}
          value={filters.endDate}
          onChange={(endDate) => setFilter({ endDate })}
        />
      </HStack>
      {hasActiveExpenseFilters(filters) && (
        <HStack className="justify-end">
          <Button variant="link" size="sm" onPress={handleClear}>
            <ButtonText>{t("filter.clear")}</ButtonText>
          </Button>
        </HStack>
      )}
    </VStack>
  );
};

export default HistoryFilters;
