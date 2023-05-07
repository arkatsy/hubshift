import { type Theme } from "@supabase/auth-ui-shared"

export const HubShiftTheme: Theme = {
  default: {
    space: {
      buttonPadding: "8px 16px",
      inputPadding: "8px 16px",
      labelBottomMargin: "4px",
    },
    borderWidths: {
      buttonBorderWidth: "1px",
      inputBorderWidth: "1px",
    },
    radii: {
      borderRadiusButton: "0.375rem",
      inputBorderRadius: "0.375rem",
      buttonBorderRadius: "0.375rem",
    },
    fontSizes: {
      baseBodySize: "0.875rem",
      baseButtonSize: "1.1rem",
    },
    fonts: {
      bodyFontFamily: "var(--font-nunito-sans), var(--font-open-sans)",
      buttonFontFamily: "var(--font-nunito-sans), var(--font-open-sans)",
      inputFontFamily: "var(--font-nunito-sans), var(--font-open-sans)",
      labelFontFamily: "var(--font-nunito-sans), var(--font-open-sans)",
    },
  },

  dark: {
    colors: {
      defaultButtonBackground: "#27272a",
      defaultButtonBorder: "#52525b",
      defaultButtonBackgroundHover: "#3f3f46",
      inputBackground: "#27272a",
      inputBorder: "#52525b",
      inputBorderHover: "#52525b",
      inputBorderFocus: "#fafafa",
      inputPlaceholder: "#52525b",
      inputText: "#fafafa",
      brandAccent: "#3f3f46",
      brand: "#27272a",
      messageTextDanger: "#b91c1c",
      messageText: "#d4d4d8",
      anchorTextColor: "#fafafa",
      anchorTextHoverColor: "#4f46e5",
    },
  },

  light: {
    colors: {
      defaultButtonBackground: "#fafafa",
      defaultButtonBorder: "#d4d4d8",
      defaultButtonBackgroundHover: "#f4f4f5",
      inputBorder: "#d1d5db",
      inputBackground: "white",
      inputBorderHover: "#d1d5db",
      inputBorderFocus: "#27272a",
      inputPlaceholder: "#9ca3af",
      inputText: "#09090b",
      brandAccent: "#d4d4d8",
      brand: "#ffffff",
      messageTextDanger: "#b91c1c",
      messageText: "#09090b",
      anchorTextColor: "#09090b",
      anchorTextHoverColor: "#4f46e5",
    },
  },
}
