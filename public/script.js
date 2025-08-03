async function sendMessage() {
  const input = document.getElementById("userInput").value;
  const responseBox = document.getElementById("responseBox");

  responseBox.innerHTML = "⏳ براہ کرم انتظار کریں...";

  const body = {
    messages: [
      { role: "user", content: input }
    ]
  };

  try {
    const res = await fetch("https://wewordle.org/gptapi/v1/web/turbo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    const reply = data?.data?.message?.content || "❌ کوئی جواب موصول نہیں ہوا۔";
    responseBox.innerHTML = reply;
  } catch (error) {
    responseBox.innerHTML = "⚠️ خرابی: سرور سے رابطہ ممکن نہیں۔";
  }
}
