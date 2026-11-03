// prompt.txt (Claude Code のターミナルログ) を、会話として読みやすい HTML にする

// ログに混ざる IDE やブラウザ拡張の自動挿入タグ
const AUTO_TAG_RE = /<(browser_instruction|ide_opened_file|ide_selection|system-reminder)>[\s\S]*?(<\/\1>|$)/g;
// "Update(index.html)" "Bash(...)" などのツール呼び出し行
const TOOL_RE = /^[\w-]+( - [\w -]+)?( \(MCP\))?\(/;
// "Read 1 file (ctrl+o to expand)" などのツール要約行
const SUMMARY_RE = /\(ctrl\+o to expand\)\s*$/;
const LIST_RE = /^\s*([-*•]|\d+[.)])\s/;
const BOX_RE = /^\s*[─-╿]/;
const CJK_RE = /[　-ヿ㐀-鿿＀-￯]/;

// ❯ (ユーザー) と ⏺ (Claude) を区切りにブロックへ分ける
function parsePrompt(text) {
    const blocks = [];
    let cur = null;
    for (const line of text.split('\n')) {
        if (line.startsWith('❯') || line.startsWith('⏺')) {
            const body = line.slice(2);
            const role = line[0] === '❯' ? 'user' : TOOL_RE.test(body) ? 'tool' : 'claude';
            cur = { role, lines: [body] };
            blocks.push(cur);
        } else if (cur) {
            const body = line.replace(/^  /, '');
            if (SUMMARY_RE.test(body) && !/^\s/.test(body)) {
                cur = { role: 'tool', lines: [body.replace(SUMMARY_RE, '')] };
                blocks.push(cur);
            } else {
                cur.lines.push(body);
            }
        }
    }
    return blocks;
}

// 全角を2として数えた表示幅
function displayWidth(s) {
    let w = 0;
    for (const c of s) w += CJK_RE.test(c) ? 2 : 1;
    return w;
}

// ターミナル幅で折り返された行をつなぎ直す。リストや罫線の行はそのまま
// keepShort: ユーザーの改行を残すため、端まで届いていない行の次はつながない
function unwrap(lines, keepShort = false) {
    const out = [];
    let joinable = false;
    for (const raw of lines) {
        const line = raw.replace(/\s+$/, '');
        if (!line.trim() || line.trim().startsWith('⎿') || SUMMARY_RE.test(line)) {
            if (!line.trim()) out.push('');
            joinable = false;
            continue;
        }
        if (BOX_RE.test(line)) {
            out.push(line);
            joinable = false;
            continue;
        }
        if (joinable && !LIST_RE.test(line)) {
            const prev = out[out.length - 1];
            const next = line.trim();
            const sep = CJK_RE.test(prev.slice(-1)) || CJK_RE.test(next[0]) ? '' : ' ';
            out[out.length - 1] = prev + sep + next;
        } else {
            out.push(line);
        }
        joinable = !keepShort || displayWidth(line) >= 66;
    }
    return out;
}

// 段落・リスト・罫線 (pre) に分けて el に追加する
function renderLines(lines, el, keepShort) {
    let pre = null;
    for (const line of unwrap(lines, keepShort)) {
        if (BOX_RE.test(line)) {
            if (!pre) {
                pre = document.createElement('pre');
                el.appendChild(pre);
            }
            pre.textContent += line + '\n';
            continue;
        }
        pre = null;
        if (!line) continue;
        const div = document.createElement('div');
        const indent = line.match(/^\s*/)[0].length;
        div.className = LIST_RE.test(line) ? 'li' : 'p';
        div.style.marginLeft = `${indent * 0.5}em`;
        div.textContent = line.trim();
        el.appendChild(div);
    }
}

function renderPrompt(text, el) {
    el.innerHTML = '';
    const inner = document.createElement('div');
    inner.className = 'prompt-inner';
    el.appendChild(inner);

    for (const block of parsePrompt(text)) {
        const div = document.createElement('div');
        div.className = `msg ${block.role}`;
        if (block.role === 'tool') {
            // ツールは1行目だけを短く見せる
            const head = block.lines[0].trim();
            div.textContent = head.length > 100 ? head.slice(0, 100) + '…' : head;
        } else if (block.role === 'user') {
            const body = block.lines.join('\n').replace(AUTO_TAG_RE, '');
            if (!body.trim()) continue;
            renderLines(body.split('\n'), div, true);
        } else {
            renderLines(block.lines, div);
        }
        inner.appendChild(div);
    }
}
