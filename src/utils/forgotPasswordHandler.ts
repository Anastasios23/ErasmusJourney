export const handleForgotPassword = async (email: string) => {
  try {
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, message: data.message, token: data.token };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    return {
      success: false,
      message: "Network error. Please try again.",
    };
  }
};
