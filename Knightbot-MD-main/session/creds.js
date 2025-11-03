const creds = async (sock, chatId) => {
  const text = `
👑 *Knight Bot™* 👑
──────────────────
💻 *Dev:* Mohand  
📸 *Instagram:* [mohandz4](https://www.instagram.com/mohandz4)
⚔️ *Power Level:* 100%
🧠 *Vibe:* Gen Z energy only
──────────────────
✨ "Coded with caffeine, sarcasm & way too much attitude." ✨
`;

  await sock.sendMessage(chatId, { text });
};

module.exports = { creds };