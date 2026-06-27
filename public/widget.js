(function() {
  var BACKEND = 'https://sharvii-chatbot-production.up.railway.app/chat';
  var LOGO_URL = 'https://sharviitechnologies.com/wp-content/uploads/2026/01/cropped-ST-logo.png';

  // Expose toggle function globally so WordPress can find it anywhere
  window.toggleSharviiChat = function(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    var box = document.getElementById('st-box');
    if (box) {
      box.style.display = (box.style.display === 'flex') ? 'none' : 'flex';
    }
  };

  var style = document.createElement('style');
  style.textContent = `
    #st-btn {
      position: fixed !important;
      bottom: 30px !important;
      left: 30px !important;
      right: auto !important;
      width: 65px !important;
      height: 65px !important;
      border-radius: 50% !important;
      background: #ffffff !important;
      border: 2px solid #1a5f3c !important;
      cursor: pointer !important;
      z-index: 2147483647 !important;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 0 !important;
      overflow: hidden !important;
    }
    #st-btn img {
      width: 85% !important;
      height: 85% !important;
      object-fit: contain !important;
      pointer-events: none !important;
    }
    #st-box {
      position: fixed !important;
      bottom: 105px !important;
      left: 30px !important;
      right: auto !important;
      width: 350px !important;
      height: 480px !important;
      background: #fff !important;
      border-radius: 16px !important;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2) !important;
      display: none;
      flex-direction: column !important;
      z-index: 2147483647 !important;
      font-family: sans-serif !important;
      overflow: hidden !important;
    }
    #st-head {
      background: #1a5f3c !important;
      color: #fff !important;
      padding: 14px 16px !important;
      font-weight: 700 !important;
      font-size: 15px !important;
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
    }
    #st-head img {
      width: 24px !important;
      height: 24px !important;
      border-radius: 50% !important;
      background: #fff !important;
    }
    #st-msgs {
      flex: 1 !important;
      overflow-y: auto !important;
      padding: 14px !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 10px !important;
    }
    #st-msgs .u {
      background: #1a5f3c !important;
      color: #fff !important;
      align-self: flex-end !important;
      padding: 10px 13px !important;
      border-radius: 12px 12px 2px 12px !important;
      max-width: 80% !important;
      font-size: 14px !important;
      line-height: 1.5 !important;
    }
    #st-msgs .b {
      background: #f1f1f1 !important;
      color: #222 !important;
      align-self: flex-start !important;
      padding: 10px 13px !important;
      border-radius: 12px 12px 12px 2px !important;
      max-width: 80% !important;
      font-size: 14px !important;
      line-height: 1.5 !important;
    }
    #st-row {
      display: flex !important;
      padding: 10px !important;
      border-top: 1px solid #eee !important;
      gap: 8px !important;
    }
    #st-inp {
      flex: 1 !important;
      border: 1px solid #ddd !important;
      border-radius: 8px !important;
      padding: 9px 12px !important;
      font-size: 14px !important;
      outline: none !important;
    }
    #st-send {
      background: #1a5f3c !important;
      color: #fff !important;
      border: none !important;
      border-radius: 8px !important;
      padding: 9px 16px !important;
      cursor: pointer !important;
      font-size: 14px !important;
    }
  `;
  document.head.appendChild(style);

  // Added explicit onclick attribute natively directly onto the button HTML layout
  document.body.insertAdjacentHTML('beforeend',
    '<button id="st-btn" onclick="window.toggleSharviiChat(event)"><img src="' + LOGO_URL + '" alt="Logo"></button>' +
    '<div id="st-box">' +
    '<div id="st-head"><img src="' + LOGO_URL + '"> Sharvii Assistant</div>' +
    '<div id="st-msgs"><div class="b">Hi! Ask me anything about Sharvii Technologies 😊</div></div>' +
    '<div id="st-row"><input id="st-inp" placeholder="Type your question..."/><button id="st-send">Send</button></div>' +
    '</div>'
  );

  var inp = document.getElementById('st-inp');
  var send = document.getElementById('st-send');
  var msgs = document.getElementById('st-msgs');

  async function sendMsg() {
    var msg = inp.value.trim();
    if (!msg) return;
    inp.value = '';
    addMsg(msg, 'u');
    addMsg('Typing...', 'b');
    try {
      var res = await fetch(BACKEND, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ message: msg })
      });
      var data = await res.json();
      msgs.lastChild.textContent = data.reply;
    } catch(e) {
      msgs.lastChild.textContent = 'Sorry, could not connect. Please try again.';
    }
    msgs.scrollTop = msgs.scrollHeight;
  }

  function addMsg(text, type) {
    var div = document.createElement('div');
    div.className = type;
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  send.addEventListener('click', function(e) { e.preventDefault(); sendMsg(); });
  inp.addEventListener('keydown', function(e) { if(e.key === 'Enter') { e.preventDefault(); sendMsg(); } });
})();
