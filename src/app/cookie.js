import Cookies from "js-cookie";

export const getUserCookie = () => {
  const userCookie = Cookies.get("user");
  try {
    if (userCookie) return JSON.parse(userCookie);
  } catch (error) {
    console.error("Error parsing user cookie:", error);
  }
  return null;
};

export const setUserCookie = (user) => {
  Cookies.set("user", JSON.stringify(user), { expires: 7 });
};

export const removeUserCookie = () => {
  Cookies.remove("user");
};
