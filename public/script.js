function sendMessage() {
  const input = document.getElementById('userInput');
  const messages = document.getElementById('messages');
  const loader = document.getElementById('loader');

  const userText = input.value;
  if (!userText) return;

  messages.innerHTML += `👤: ${userText}\n`;
  loader.style.display = 'block';
  input.value = '';

  fetch('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: userText })
  })
    .then(res => res.json())
    .then(data => {
      loader.style.display = 'none';
      messages.innerHTML += `🤖: ${data.reply}\n\n`;
    })
    .catch(() => {
      loader.style.display = 'none';
      messages.innerHTML += `❌: کوئی جواب نہ ملا، دوبارہ کوشش کریں۔\n`;
    });
}
