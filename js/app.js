// アプリケーションのメインロジック
(function () {
  let selectedPlatform = "instagram";

  // プラットフォーム選択
  const platformButtons = document.getElementById("platformButtons");
  platformButtons.addEventListener("click", function (e) {
    const btn = e.target.closest(".platform-btn");
    if (!btn) return;

    platformButtons.querySelectorAll(".platform-btn").forEach(function (b) {
      b.classList.remove("active");
    });
    btn.classList.add("active");
    selectedPlatform = btn.dataset.platform;
  });

  // 生成ボタン
  var generateBtn = document.getElementById("generateBtn");
  generateBtn.addEventListener("click", function () {
    var category = document.getElementById("categorySelect").value;
    if (!category) {
      alert("カテゴリを選択してください");
      return;
    }

    var productName = document.getElementById("productName").value.trim() || "こだわりの蒲鉾";
    var keywords = document.getElementById("keywords").value.trim() || "";

    var template = TEMPLATES[category];
    if (!template) return;

    var resultSection = document.getElementById("resultSection");
    var resultCards = document.getElementById("resultCards");
    resultCards.innerHTML = "";

    template.posts.forEach(function (post, index) {
      var text = post.text
        .replace(/{product}/g, productName)
        .replace(/{keywords}/g, keywords);

      // ハッシュタグを追加
      var hashtags = buildHashtags(selectedPlatform, category);
      if (hashtags) {
        text += "\n\n" + hashtags;
      }

      var charLimit = CHAR_LIMITS[selectedPlatform];
      var charCount = text.length;
      var isOver = charCount > charLimit;

      var card = document.createElement("div");
      card.className = "result-card";
      card.innerHTML =
        '<div class="result-card__header">' +
          '<span class="result-card__label">案 ' + (index + 1) + '</span>' +
          '<span class="result-card__charcount ' + (isOver ? "over" : "") + '">' +
            charCount + " / " + charLimit + "文字" +
          "</span>" +
        "</div>" +
        '<div class="result-card__body">' + escapeHtml(text) + "</div>" +
        '<div class="result-card__actions">' +
          '<button class="copy-btn" data-text="' + escapeAttr(text) + '">コピーする</button>' +
        "</div>";

      resultCards.appendChild(card);
    });

    resultSection.style.display = "block";
    resultSection.scrollIntoView({ behavior: "smooth" });
  });

  // コピーボタンの処理（イベント委譲）
  document.addEventListener("click", function (e) {
    if (!e.target.classList.contains("copy-btn")) return;
    var btn = e.target;
    var text = btn.getAttribute("data-text");

    navigator.clipboard.writeText(text).then(function () {
      btn.textContent = "コピーしました！";
      btn.classList.add("copied");
      setTimeout(function () {
        btn.textContent = "コピーする";
        btn.classList.remove("copied");
      }, 2000);
    }).catch(function () {
      // Fallback for older browsers
      var textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      btn.textContent = "コピーしました！";
      btn.classList.add("copied");
      setTimeout(function () {
        btn.textContent = "コピーする";
        btn.classList.remove("copied");
      }, 2000);
    });
  });

  // ハッシュタグ生成
  function buildHashtags(platform, category) {
    var tags = (HASHTAGS[platform] || []).slice();
    var categoryTags = CATEGORY_HASHTAGS[category] || [];

    // LINEはハッシュタグなし
    if (platform === "line") return "";

    // Xは文字数制限があるのでタグを絞る
    if (platform === "x") {
      tags = tags.slice(0, 3);
      categoryTags = categoryTags.slice(0, 1);
    }

    return tags.concat(categoryTags).join(" ");
  }

  // HTMLエスケープ
  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // 属性用エスケープ
  function escapeAttr(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
})();
