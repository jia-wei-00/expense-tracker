import React, { useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import {
  Icon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@/components/ui/icon";
import { Divider } from "@/components/ui/divider";
import { Button, ButtonText, ButtonSpinner } from "@/components/ui/button";
import { MessageCircle, CheckCircle2, AlertCircle } from "lucide-react-native";
import ActionSheet from "@/components/shared/ActionSheet";
import ControlledInput from "@/components/shared/ControlledInput";
import {
  useWhatsAppUser,
  useSaveWhatsAppUser,
  useDeleteWhatsAppUser,
  useResendWhatsAppVerification,
} from "@/hooks/useWhatsApp";
import { useWhatsAppSubscription } from "@/hooks/useWhatsAppSubscription";
import {
  type TPhoneForm,
  createPhoneSchema,
} from "@/types/components/whatsapp-bot/phone-schema";

const WhatsAppRegistration = () => {
  const { t } = useTranslation("settings");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUnlinkOpen, setIsUnlinkOpen] = useState(false);

  useWhatsAppSubscription();

  const { data: whatsappUser, isLoading: isQuerying } = useWhatsAppUser();
  const { mutateAsync: save, isPending: isSaving } = useSaveWhatsAppUser();
  const { mutateAsync: remove, isPending: isRemoving } =
    useDeleteWhatsAppUser();
  const { mutateAsync: resend, isPending: isResending } =
    useResendWhatsAppVerification();

  const hasExisting = !!whatsappUser?.phone_number;
  const isVerified = whatsappUser?.is_verified ?? false;

  const methods = useForm<TPhoneForm>({
    resolver: zodResolver(createPhoneSchema(t)),
    defaultValues: { phone_number: whatsappUser?.phone_number ?? "" },
  });

  const { reset } = methods;
  useEffect(() => {
    reset({ phone_number: whatsappUser?.phone_number ?? "" });
  }, [whatsappUser?.phone_number, reset]);

  const onSave = methods.handleSubmit(async ({ phone_number }) => {
    await save({ phone_number });
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
              <Icon
                as={MessageCircle}
                className="text-typography-700"
                size="sm"
              />
              <Text bold size="md">
                {t("whatsapp.label")}
              </Text>
            </HStack>
            <HStack className="items-center" space="sm">
              {isQuerying ? (
                <Text size="sm" className="text-typography-500">
                  ...
                </Text>
              ) : hasExisting ? (
                <HStack className="items-center" space="xs">
                  <Text size="sm" className="text-typography-500">
                    {whatsappUser.phone_number}
                  </Text>
                  <Icon
                    as={isVerified ? CheckCircle2 : AlertCircle}
                    size="xs"
                    className={
                      isVerified ? "text-success-500" : "text-warning-500"
                    }
                  />
                </HStack>
              ) : (
                <Text size="sm" className="text-typography-500">
                  {t("whatsapp.not_linked")}
                </Text>
              )}
              <Icon
                as={isExpanded ? ChevronUpIcon : ChevronDownIcon}
                className="text-typography-500"
                size="sm"
              />
            </HStack>
          </HStack>
        </Pressable>

        {isExpanded && (
          <FormProvider {...methods}>
            <VStack className="px-5 pb-5" space="md">
              <Divider />

              <VStack space="xs">
                <Text size="sm" className="text-typography-500">
                  {t("whatsapp.hint")}
                </Text>
                <ControlledInput
                  name="phone_number"
                  placeholder="60123456789"
                  keyboardType="phone-pad"
                  autoCorrect={false}
                />
              </VStack>

              {hasExisting && (
                <HStack className="items-center justify-between">
                  <HStack className="items-center" space="xs">
                    <Icon
                      as={isVerified ? CheckCircle2 : AlertCircle}
                      size="sm"
                      className={
                        isVerified ? "text-success-500" : "text-warning-500"
                      }
                    />
                    <Text
                      size="sm"
                      className={
                        isVerified ? "text-success-500" : "text-warning-500"
                      }
                    >
                      {t(
                        isVerified
                          ? "whatsapp.verified"
                          : "whatsapp.not_verified",
                      )}
                    </Text>
                  </HStack>

                  {!isVerified && (
                    <Button
                      variant="link"
                      size="sm"
                      onPress={() => resend()}
                      isDisabled={isResending}
                    >
                      {isResending ? (
                        <>
                          <ButtonSpinner />
                          <ButtonText className="ml-1">
                            {t("whatsapp.resending")}
                          </ButtonText>
                        </>
                      ) : (
                        <ButtonText>{t("whatsapp.resend_verification")}</ButtonText>
                      )}
                    </Button>
                  )}
                </HStack>
              )}

              {hasExisting ? (
                <HStack space="sm">
                  <Button
                    className="flex-1 rounded-full"
                    size="md"
                    onPress={onSave}
                    isDisabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <ButtonSpinner />
                        <ButtonText className="ml-2">
                          {t("whatsapp.saving")}
                        </ButtonText>
                      </>
                    ) : (
                      <ButtonText>{t("whatsapp.update")}</ButtonText>
                    )}
                  </Button>

                  <Button
                    className="flex-1 rounded-full"
                    variant="outline"
                    size="md"
                    action="negative"
                    onPress={() => setIsUnlinkOpen(true)}
                    isDisabled={isRemoving}
                  >
                    <ButtonText>{t("whatsapp.unlink")}</ButtonText>
                  </Button>
                </HStack>
              ) : (
                <Button
                  className="rounded-full"
                  size="md"
                  onPress={onSave}
                  isDisabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <ButtonSpinner />
                      <ButtonText className="ml-2">
                        {t("whatsapp.saving")}
                      </ButtonText>
                    </>
                  ) : (
                    <ButtonText>{t("whatsapp.link")}</ButtonText>
                  )}
                </Button>
              )}
            </VStack>
          </FormProvider>
        )}
      </Box>

      <ActionSheet
        title={t("whatsapp.unlink.title")}
        description={t("whatsapp.unlink.description")}
        isOpen={isUnlinkOpen}
        onClose={() => setIsUnlinkOpen(false)}
        isLoading={isRemoving}
        primaryButtonLabel={t(
          isRemoving ? "whatsapp.unlinking" : "whatsapp.unlink",
        )}
        primaryButtonAction={onUnlink}
        secondaryButtonLabel={t("whatsapp.cancel")}
        secondaryButtonAction={() => setIsUnlinkOpen(false)}
      />
    </>
  );
};

export default WhatsAppRegistration;
