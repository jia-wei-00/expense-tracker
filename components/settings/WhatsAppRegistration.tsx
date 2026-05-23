import React, { useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Icon, ChevronDownIcon, ChevronUpIcon } from "@/components/ui/icon";
import { Divider } from "@/components/ui/divider";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText, ButtonSpinner } from "@/components/ui/button";
import { MessageCircle } from "lucide-react-native";
import ActionSheet from "@/components/shared/ActionSheet";
import {
  useWhatsAppUser,
  useSaveWhatsAppUser,
  useDeleteWhatsAppUser,
} from "@/hooks/useWhatsApp";

// WhatsApp format: country code + number, no + prefix (e.g. 60123456789)
const phoneSchema = z.object({
  phone_number: z
    .string()
    .regex(/^[1-9]\d{6,14}$/, "whatsapp.error.format"),
});

type PhoneForm = z.infer<typeof phoneSchema>;

const WhatsAppRegistration = () => {
  const { t } = useTranslation("settings");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUnlinkOpen, setIsUnlinkOpen] = useState(false);

  const { data: whatsappUser, isLoading: isQuerying } = useWhatsAppUser();
  const { mutateAsync: save, isPending: isSaving } = useSaveWhatsAppUser();
  const { mutateAsync: remove, isPending: isRemoving } = useDeleteWhatsAppUser();

  const hasExisting = !!whatsappUser?.phone_number;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone_number: whatsappUser?.phone_number ?? "" },
  });

  // Sync form when data loads
  useEffect(() => {
    reset({ phone_number: whatsappUser?.phone_number ?? "" });
  }, [whatsappUser?.phone_number, reset]);

  const onSave = handleSubmit(async ({ phone_number }) => {
    await save({ phone_number, hasExisting });
    setIsExpanded(false);
  });

  const onUnlink = async () => {
    await remove();
    setIsUnlinkOpen(false);
    setIsExpanded(false);
  };

  return (
    <>
      <Box className="rounded-2xl bg-background-0 overflow-hidden">
        <Pressable onPress={() => setIsExpanded((prev) => !prev)}>
          <HStack className="p-5 items-center justify-between">
            <HStack className="items-center" space="sm">
              <Icon as={MessageCircle} className="text-typography-700" size="sm" />
              <Text bold size="md">
                {t("whatsapp.label")}
              </Text>
            </HStack>
            <HStack className="items-center" space="sm">
              <Text size="sm" className="text-typography-500">
                {isQuerying
                  ? "..."
                  : hasExisting
                    ? whatsappUser.phone_number
                    : t("whatsapp.not_linked")}
              </Text>
              <Icon
                as={isExpanded ? ChevronUpIcon : ChevronDownIcon}
                className="text-typography-500"
                size="sm"
              />
            </HStack>
          </HStack>
        </Pressable>

        {isExpanded && (
          <VStack className="px-5 pb-5" space="md">
            <Divider />

            <VStack space="xs">
              <Text size="sm" className="text-typography-500">
                {t("whatsapp.hint")}
              </Text>
              <Controller
                control={control}
                name="phone_number"
                render={({ field: { onChange, value } }) => (
                  <Input variant="outline" size="md">
                    <InputField
                      placeholder="60123456789"
                      value={value}
                      onChangeText={onChange}
                      keyboardType="phone-pad"
                      autoCorrect={false}
                    />
                  </Input>
                )}
              />
              {errors.phone_number && (
                <Text size="xs" className="text-error-500">
                  {t(errors.phone_number.message ?? "whatsapp.error.format")}
                </Text>
              )}
            </VStack>

            <VStack space="sm">
              <Button size="md" onPress={onSave} isDisabled={isSaving}>
                {isSaving ? (
                  <>
                    <ButtonSpinner />
                    <ButtonText className="ml-2">{t("whatsapp.saving")}</ButtonText>
                  </>
                ) : (
                  <ButtonText>
                    {hasExisting ? t("whatsapp.update") : t("whatsapp.link")}
                  </ButtonText>
                )}
              </Button>

              {hasExisting && (
                <Button
                  variant="outline"
                  size="md"
                  action="negative"
                  onPress={() => setIsUnlinkOpen(true)}
                  isDisabled={isRemoving}
                >
                  <ButtonText>{t("whatsapp.unlink")}</ButtonText>
                </Button>
              )}
            </VStack>
          </VStack>
        )}
      </Box>

      <ActionSheet
        title={t("whatsapp.unlink.title")}
        description={t("whatsapp.unlink.description")}
        isOpen={isUnlinkOpen}
        onClose={() => setIsUnlinkOpen(false)}
        isLoading={isRemoving}
        primaryButtonLabel={t(isRemoving ? "whatsapp.unlinking" : "whatsapp.unlink")}
        primaryButtonAction={onUnlink}
        secondaryButtonLabel={t("whatsapp.cancel")}
        secondaryButtonAction={() => setIsUnlinkOpen(false)}
      />
    </>
  );
};

export default WhatsAppRegistration;
