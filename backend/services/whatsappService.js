const sendWhatsAppMessage = async (phone, message) => {
  try {
    const response = await fetch(
      `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: phone,
          type: "text",
          text: {
            body: message,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("WhatsApp message failed:", data);
      return false;
    }

    console.log("WhatsApp message sent:", data);
    return true;
  } catch (error) {
    console.error("WhatsApp message failed:", error);
    return false;
  }
};

export default sendWhatsAppMessage;