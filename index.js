// SillyTavern Community Board Extension
// Ported from RisuAI Community Board Module

const MODULE_NAME = 'community_board';
const BOARD_START = '<~ Board Start ~>';
const BOARD_END = '<~ Board End ~>';

// ===== Board Data Store =====
const boardDataStore = {};

// ===== Default Settings =====
const defaultSettings = Object.freeze({
    enabled: true,
    postCount: 5,
    boardName: '자유게시판',
    readerDescription: 'The readers are South Korean otaku adult women in their 20s and 30s.',
    communityDescription: 'As this is an informal female-dominated online community, features such as South Korean internet slang, sarcasm, abbreviations, profanity, and omission of punctuation may appear.',
    maxComments: 20,
});

// ===== Settings Management =====
function getSettings() {
    const context = SillyTavern.getContext();
    if (!context.extensionSettings[MODULE_NAME]) {
        context.extensionSettings[MODULE_NAME] = structuredClone(defaultSettings);
    }
    for (const key of Object.keys(defaultSettings)) {
        if (!Object.hasOwn(context.extensionSettings[MODULE_NAME], key)) {
            context.extensionSettings[MODULE_NAME][key] = defaultSettings[key];
        }
    }
    return context.extensionSettings[MODULE_NAME];
}

// ===== Prompt Builder =====
function buildBoardPrompt(settings) {
    const postTemplate = Array.from({ length: settings.postCount }, (_, i) => {
        const n = i + 1;
        return `POST[Post ${n} Title§Post ${n} Content§Number of comments on Post ${n}§Comments on Post ${n} (each comment separated by a § symbol. up to ${settings.maxComments})]`;
    }).join('\n');

    return `# Important Mission: Display Reader Bulletin Board
For this one time only, at the very bottom of the response, include ${settings.postCount} posts with reader reactions to this story and the comments on those posts.

## Reader Reaction Bulletin Board Guidelines
- ${settings.readerDescription}
- ${settings.communityDescription}
- If readers' opinions conflict, they may argue.
- Bulletin Board Template (Please **strictly** adhere to the following template.):

${BOARD_START}
${postTemplate}
${BOARD_END}`;
}

// ===== Board Parser =====
function parseBoard(text) {
    const startIdx = text.indexOf(BOARD_START);
    const endIdx = text.indexOf(BOARD_END);
    if (startIdx === -1 || endIdx === -1) return null;

    const boardText = text.substring(startIdx, endIdx + BOARD_END.length);
    const posts = [];
    let match;

    const regex = /POST\[([^§]+)§([^§]+)§(\d+)§([^\]]*)\]/g;
    while ((match = regex.exec(boardText)) !== null) {
        const [, title, content, commentCount, commentsRaw] = match;
        const comments = commentsRaw
            .split('§')
            .map(c => c.trim())
            .filter(c => c.length > 0);

        posts.push({
            title: title.trim(),
            content: content.trim(),
            commentCount: parseInt(commentCount, 10),
            comments,
        });
    }

    return posts.length > 0 ? { posts, rawBoardText: boardText } : null;
}

// ===== HTML Renderer =====
function renderBoard(posts, settings) {
    const randomViews = () => Math.floor(Math.random() * 300) + 1;
    const randomMinute = () => String(Math.floor(Math.random() * 60)).padStart(2, '0');
    const uniqueId = Date.now();

    let postsHtml = '';
    posts.forEach((post, idx) => {
        const postId = `cb-post-${uniqueId}-${idx}`;

        let commentsHtml = '';
        post.comments.forEach((comment, cIdx) => {
            const isFirst = cIdx === 0;
            commentsHtml += `
                <li class="comment-item">
                    <div class="comment-main">
                        <div class="comment-meta">
                            <strong>여시</strong>
                            <span class="new-icon">N</span>
                            <span>00:${randomMinute()}</span>
                        </div>
                        <p class="comment-text">
                            ${isFirst ? '<span class="first-comment-badge">첫댓글</span> ' : ''}${comment}
                        </p>
                    </div>
                    <span>⋮</span>
                </li>`;
        });

        postsHtml += `
            <div class="post-item">
                <input type="checkbox" id="${postId}" class="toggle-checkbox">
                <label class="post-summary" for="${postId}">
                    <div class="post-summary-content">
                        <p class="post-title">${post.title}</p>
                        <div class="post-meta">
                            <span>여시</span>
                            <span class="dot">·</span>
                            <span>00:${randomMinute()}</span>
                            <span class="new-icon">N</span>
                            <span class="dot">·</span>
                            <span>조회 ${randomViews()}</span>
                        </div>
                    </div>
                    <div class="comment-count">${post.commentCount}</div>
                </label>
                <div class="post-expanded">
                    <div class="post-body">
                        <p>${post.content}</p>
                    </div>
                    <div class="comments-section">
                        <div class="comments-header">
                            <div><span>💬</span>댓글</div>
                            <div class="bingle">↻</div>
                        </div>
                        <ul class="comment-list">
                            ${commentsHtml}
                        </ul>
                    </div>
                </div>
            </div>`;
    });

    return `<div class="board-container">
        <header class="board-header">
            <div class="header-left"><span>‹</span></div>
            <h1>${settings.boardName}</h1>
            <div class="header-icons"><span>🔔</span><span>☰</span></div>
        </header>
        <div class="board-info">
            <p class="post-count">
                <span class="new-text">새글</span>
                <span class="new-posts">${Math.floor(Math.random() * 50) + 10}</span>/${(Math.floor(Math.random() * 5000) + 1000).toLocaleString()}
            </p>
            <span class="notice-link">공지 보기</span>
        </div>
        <main class="post-list">
            ${postsHtml}
        </main>
    </div>`;
}

// ===== Popup =====
function showBoardPopup(posts, settings) {
    // Remove existing popup
    document.querySelector('.cb-popup-overlay')?.remove();

    const boardHtml = renderBoard(posts, settings);

    const overlay = document.createElement('div');
    overlay.classList.add('cb-popup-overlay');
    overlay.innerHTML = `
        <div class="cb-popup">
            <button class="cb-popup-close">✕</button>
            <div class="cb-popup-content">
                ${boardHtml}
            </div>
        </div>`;

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });

    // Close button
    overlay.querySelector('.cb-popup-close').addEventListener('click', () => {
        overlay.remove();
    });

    document.body.appendChild(overlay);

    // Close on ESC
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            overlay.remove();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

// ===== Get latest board data =====
function getLatestBoard() {
    const keys = Object.keys(boardDataStore).map(Number).sort((a, b) => b - a);
    if (keys.length === 0) return null;
    return boardDataStore[keys[0]];
}

// ===== Process a single message element =====
function processMessageElement(messageElement) {
    if (messageElement.dataset.cbProcessed) return;

    const messageText = messageElement.querySelector('.mes_text');
    if (!messageText) return;

    const rawHtml = messageText.innerHTML;
    if (!rawHtml.includes('Board Start') && !rawHtml.includes('Board End')) return;

    const textContent = messageText.textContent || messageText.innerText || '';
    const parsed = parseBoard(textContent);
    if (!parsed || parsed.posts.length === 0) return;

    // Store the parsed data
    const mesId = messageElement.getAttribute('mesid');
    boardDataStore[mesId] = parsed.posts;
    console.log(`[Community Board] Board data saved from message #${mesId} (${parsed.posts.length} posts)`);

    // Remove the raw board text from displayed message
    const startIdx = rawHtml.indexOf(BOARD_START);
    const endIdx = rawHtml.indexOf(BOARD_END);
    if (startIdx !== -1 && endIdx !== -1) {
        const before = rawHtml.substring(0, startIdx);
        const after = rawHtml.substring(endIdx + BOARD_END.length);
        messageText.innerHTML = before + after;
    } else {
        // Try removing via encoded HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = rawHtml;
        const cleanedText = tempDiv.textContent;
        const sIdx = cleanedText.indexOf(BOARD_START);
        const eIdx = cleanedText.indexOf(BOARD_END);
        if (sIdx !== -1 && eIdx !== -1) {
            // Remove everything between markers using a regex on innerHTML
            messageText.innerHTML = rawHtml.replace(
                /&lt;~ Board Start ~&gt;[\s\S]*?&lt;~ Board End ~&gt;/g,
                ''
            );
        }
    }

    // Mark as processed
    messageElement.dataset.cbProcessed = 'true';

    // Update badge
    updateButtonBadge();
}

// ===== Process all messages =====
function processAllMessages() {
    document.querySelectorAll('.mes:not([is_user="true"])').forEach(el => {
        processMessageElement(el);
    });
}

// ===== Update badge on button =====
function updateButtonBadge() {
    const btn = document.getElementById('community-board-btn');
    if (!btn) return;

    let badge = btn.querySelector('.cb-badge');
    const count = Object.keys(boardDataStore).length;

    if (count > 0) {
        if (!badge) {
            badge = document.createElement('span');
            badge.classList.add('cb-badge');
            btn.appendChild(badge);
        }
        badge.textContent = count;
    } else if (badge) {
        badge.remove();
    }
}

// ===== Prompt Injection =====
function injectPrompt() {
    const settings = getSettings();
    const context = SillyTavern.getContext();

    if (settings.enabled) {
        const prompt = buildBoardPrompt(settings);
        context.setExtensionPrompt(MODULE_NAME, prompt, 1, 0);
        console.log('[Community Board] Prompt injected');
    } else {
        context.setExtensionPrompt(MODULE_NAME, '', 1, 0);
    }
}

// ===== Remove Board from AI Context =====
globalThis.communityBoardInterceptor = function (chat, contextSize, abort, type) {
    for (const message of chat) {
        if (message.mes && message.mes.includes(BOARD_START)) {
            const startIdx = message.mes.indexOf(BOARD_START);
            const endIdx = message.mes.indexOf(BOARD_END);
            if (startIdx !== -1 && endIdx !== -1) {
                message.mes =
                    message.mes.substring(0, startIdx).trimEnd() +
                    message.mes.substring(endIdx + BOARD_END.length).trimStart();
            }
        }
    }
};

// ===== Settings UI =====
function loadSettingsUI() {
    const settings = getSettings();

    const settingsHtml = `
    <div id="community-board-settings">
        <div class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b>📋 Community Board</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content">
                <div class="cb-setting-row">
                    <label for="cb_enabled">게시판 활성화</label>
                    <input id="cb_enabled" type="checkbox" ${settings.enabled ? 'checked' : ''} />
                </div>
                <div class="cb-setting-row">
                    <label for="cb_board_name">게시판 이름</label>
                    <input id="cb_board_name" type="text" class="text_pole" value="${settings.boardName}" />
                </div>
                <div class="cb-setting-row">
                    <label for="cb_post_count">게시글 수</label>
                    <input id="cb_post_count" type="number" class="text_pole" min="1" max="10" value="${settings.postCount}" />
                </div>
                <div class="cb-setting-row">
                    <label for="cb_max_comments">최대 댓글 수</label>
                    <input id="cb_max_comments" type="number" class="text_pole" min="1" max="50" value="${settings.maxComments}" />
                </div>
                <div class="cb-setting-row">
                    <label for="cb_reader_desc">독자 설정</label>
                    <textarea id="cb_reader_desc" class="text_pole" rows="2">${settings.readerDescription}</textarea>
                </div>
                <div class="cb-setting-row">
                    <label for="cb_community_desc">커뮤니티 분위기</label>
                    <textarea id="cb_community_desc" class="text_pole" rows="2">${settings.communityDescription}</textarea>
                </div>
            </div>
        </div>
    </div>`;

    $('#extensions_settings2').append(settingsHtml);

    const saveDebounced = SillyTavern.getContext().saveSettingsDebounced;

    $('#cb_enabled').on('change', function () {
        settings.enabled = !!$(this).prop('checked');
        saveDebounced();
    });

    $('#cb_board_name').on('input', function () {
        settings.boardName = String($(this).val());
        saveDebounced();
    });

    $('#cb_post_count').on('input', function () {
        settings.postCount = parseInt($(this).val(), 10) || 5;
        saveDebounced();
    });

    $('#cb_max_comments').on('input', function () {
        settings.maxComments = parseInt($(this).val(), 10) || 20;
        saveDebounced();
    });

    $('#cb_reader_desc').on('input', function () {
        settings.readerDescription = String($(this).val());
        saveDebounced();
    });

    $('#cb_community_desc').on('input', function () {
        settings.communityDescription = String($(this).val());
        saveDebounced();
    });
}

// ===== Main Button (Open Board Only) =====
function addMainButton() {
    const button = document.createElement('div');
    button.id = 'community-board-btn';
    button.title = '게시판 열기';
    button.textContent = '📋';

    button.addEventListener('click', () => {
        const latest = getLatestBoard();
        if (latest) {
            showBoardPopup(latest, getSettings());
        } else {
            toastr.warning('아직 생성된 게시판이 없어요! 게시판을 활성화하고 메시지를 보내보세요.');
        }
    });

    const sendForm = document.getElementById('send_form');
    if (sendForm) {
        sendForm.insertBefore(button, sendForm.firstChild);
    }
}

// ===== Main Init =====
(async function () {
    const context = SillyTavern.getContext();

    loadSettingsUI();
    addMainButton();

    // When AI message is rendered -> extract board data and hide it
    context.eventSource.on(context.eventTypes.CHARACTER_MESSAGE_RENDERED, (messageIndex) => {
        const messageElement = document.querySelector(`.mes[mesid="${messageIndex}"]`);
        if (messageElement) {
            processMessageElement(messageElement);
        }
    });

    // When chat changes -> re-process all messages
    context.eventSource.on(context.eventTypes.CHAT_CHANGED, () => {
        // Clear stored boards for new chat
        Object.keys(boardDataStore).forEach(k => delete boardDataStore[k]);
        updateButtonBadge();
        setTimeout(processAllMessages, 500);
    });

    // Before generation -> inject prompt
    context.eventSource.on(context.eventTypes.GENERATION_STARTED, () => {
        injectPrompt();
    });

    // After generation -> clear prompt
    context.eventSource.on(context.eventTypes.GENERATION_ENDED, () => {
        const ctx = SillyTavern.getContext();
        ctx.setExtensionPrompt(MODULE_NAME, '', 1, 0);
    });

    // Process existing messages on load
    setTimeout(processAllMessages, 1000);

    console.log('[Community Board] Extension loaded!');
})();
