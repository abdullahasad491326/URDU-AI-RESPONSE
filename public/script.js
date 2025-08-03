async function sendMessage() {
  const input = document.getElementById("inputBox");
  const msg = input.value.trim();
  if (!msg) return;

  const chat = document.getElementById("chat");

  // یوزر کا پیغام دکھائیں
  const userDiv = document.createElement("div");
  userDiv.className = "msg user";
  userDiv.innerText = msg;
  chat.appendChild(userDiv);

  input.value = "";

  // بوٹ کا ریسپانس حاصل کریں
  const responseDiv = document.createElement("div");
  responseDiv.className = "msg bot";
  responseDiv.innerText = "⏳ انتظار کریں...";
  chat.appendChild(responseDiv);

  try {
    const res = await fetch("https://wewordle.org/gptapi/v1/web/turbo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
          { role: "user", content: msg }
        ]
      })
    });

    const data = await res.json();

    if (data?.result?.content) {
      responseDiv.innerText = data.result.content;
    } else {
      responseDiv.innerText = "⚠️ معذرت! کوئی ریسپانس نہیں آیا۔";
    }
  } catch (error) {
    responseDiv.innerText = "🚫 خرابی: سرور سے رابطہ ممکن نہیں۔";
  }
}
