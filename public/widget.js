(function() {
  var BACKEND = 'https://sharvii-chatbot-production.up.railway.app/chat';
  var LOGO_URL = 'https://sharviitechnologies.com/wp-content/uploads/2026/01/cropped-ST-logo.png';

  var style = document.createElement('style');
  style.textContent = '#st-btn{position:fixed;bottom:24px;right:24px;width:60px;height:60px;border-radius:50%;background:#1a5f3c;border:none;cursor:pointer;z-index:99999999!important;box-shadow:0 4px 16px rgba(0,0,0,0.25);display:flex!important;align-items:center!important;justify-content:center!important;padding:0!important;overflow:hidden!important;}#st-btn img{width:100%!important;height:100%!important;object-fit:cover!important;pointer-events:none!important;}#st-box{position:fixed;bottom:94px;right:24px;width:340px;height:460px;background:#fff;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.18);display:none;flex-direction:column;z-index:99999999!important;font-family:sans-serif;overflow:hidden;}#st-head{background:#1a5f3c;color:#fff;padding:14px 16px;font-weight:700;font-size:15px;display:flex;align-items:center;gap:8px;}#st-head img{width:24px;height:24px;border-radius:50%;background:#fff;}#st-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;}#st-msgs .u{background:#1a5f3c;color:#fff;align-self:flex-end;padding:10px 13px;border-radius:12px 12px 2px 12px;max-width:80%;font-size:14px;line-height:1.5;}#st-msgs .b{background:#f1f1f1;color:#222;align-self:flex-start;padding:10px 13px;border-radius:12px 12px 12px 2px;max-width:80%;font-size:14px;line-height:1.5;}#st-row{display:flex;padding:10px;border-top:1px solid #eee;gap:8px;}#st-inp{flex:1;border:1px solid #ddd;border-radius:8px;padding:9px 12px;font-size:14px;outline:none;}#st-send{background:#1a5f3c;color:#fff;border:none;border-radius:8px;padding:9px 16px;cursor:pointer;font-size:14px;}';
  document.head.appendChild(style);

  document.body.insertAdjacentHTML('beforeend',
    '<button id="st-btn"><img src="' + LOGO_URL + '" alt="Logo"></button>' +
    '<div id="st-box">' +
    '<div id="st-head"><img src="' + LOGO_URL + '"> Sharvii Assistant</div>' +
    '<div id="st-msgs"><div class="b">Hi! Ask me anything about Sharvii Technologies 😊</div></div>' +
    '<div id="st-row"><input id="st-inp" placeholder="Type your question..."/><button id="st-send">Send</button></div>' +
    '</div>'
  );

  var btn = document.getElementById('st-btn');
  var box = document.getElementById('st-box');
  var inp = document.getElementById('st-inp');
  var send = document.getElementById('st-send');
  var msgs = document.getElementById('st-msgs');

  btn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    box.style.display = (box.style.display === 'flex') ? 'none' : 'flex';
  });

  function addMsg(text, type) {
    var div = document.createElement('div');
    div.className = type;
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

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

  send.addEventListener('click', function(e) { e.preventDefault(); sendMsg(); });
  inp.addEventListener('keydown', function(e) { if(e.key === 'Enter') { e.preventDefault(); sendMsg(); } });
})();
