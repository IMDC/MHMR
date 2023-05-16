import Toast from "react-native-toast-message";

export const SERVER_URL = `https://swoosh-backend.up.railway.app`;

export const showToast = (
  toastType: "success" | "error" | "info",
  title: string,
  message: string
) => {
  return Toast.show({
    type: toastType,
    text1: title,
    text2: message,
    position: "bottom",
    props: {},
  });
};
