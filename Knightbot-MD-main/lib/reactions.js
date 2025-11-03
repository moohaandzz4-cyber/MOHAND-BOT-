const fs = require('fs');
const path = require('path');

// الإيموجيات المطلوبة بالترتيب (تحديث بابي 😎)
const commandEmojis = [
  '🚀', '🐲'
];

// مسار تخزين حالة الريأكت التلقائي
const USER_GROUP_DATA = path.join(__dirname, '../data/userGroupData.json');

// تحميل الحالة
function loadAutoReactionState() {
  try {
    if (fs.existsSync(USER_GROUP_DATA)) {
      const data = JSON.parse(fs.readFileSync(USER_GROUP_DATA, 'utf8'));
      return data.autoReaction || false;
    }
  } catch (error) {
    console.error('Error loading auto-reaction state:', error);
  }
  return false;
}

// حفظ الحالة
function saveAutoReactionState(state) {
  try {
    const data = fs.existsSync(USER_GROUP_DATA)
      ? JSON.parse(fs.readFileSync(USER_GROUP_DATA, 'utf8'))
      : { groups: [], chatbot: {} };

    data.autoReaction = state;
    fs.writeFileSync(USER_GROUP_DATA, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving auto-reaction state:', error);
  }
}

let isAutoReactionEnabled = loadAutoReactionState();

// دالة إضافة الريأكتات المتتالية
async function addCommandReaction(sock, message) {
  try {
    if (!isAutoReactionEnabled || !message?.key?.id) return;

    // يضيف كل الإيموجيات بالترتيب بينهم 700ms
    commandEmojis.forEach((emoji, index) => {
      setTimeout(async () => {
        try {
          await sock.sendMessage(message.key.remoteJid, {
            react: {
              text: emoji,
              key: message.key,
            },
          });
        } catch (err) {
          console.error('Error adding reaction:', err);
        }
      }, index * 1000);
    });
  } catch (error) {
    console.error('Error adding command reaction:', error);
  }
}

// أمر .areact للتحكم
async function handleAreactCommand(sock, chatId, message, isOwner) {
  try {
    if (!isOwner) {
      await sock.sendMessage(chatId, {
        text: '❌ This command is only available for the owner!',
        quoted: message,
      });
      return;
    }

    const args = (message.message?.conversation || '').split(' ');
    const action = args[1]?.toLowerCase();

    if (action === 'on') {
      isAutoReactionEnabled = true;
      saveAutoReactionState(true);
      await sock.sendMessage(chatId, {
        text: '✅ Auto-reactions have been enabled globally (will react to ALL messages)',
        quoted: message,
      });
    } else if (action === 'off') {
      isAutoReactionEnabled = false;
      saveAutoReactionState(false);
      await sock.sendMessage(chatId, {
        text: '✅ Auto-reactions have been disabled globally',
        quoted: message,
      });
    } else {
      const currentState = isAutoReactionEnabled ? 'enabled' : 'disabled';
      await sock.sendMessage(chatId, {
        text: `Auto-reactions are currently ${currentState} globally.\n\nUse:\n.areact on - Enable auto-reactions\n.areact off - Disable auto-reactions`,
        quoted: message,
      });
    }
  } catch (error) {
    console.error('Error handling areact command:', error);
    await sock.sendMessage(chatId, {
      text: '❌ Error controlling auto-reactions',
      quoted: message,
    });
  }
}

module.exports = {
  addCommandReaction,
  handleAreactCommand,
  commandEmojis,
  saveAutoReactionState,
  loadAutoReactionState
};