#!/usr/bin/env python3
"""設計Docsの機械検査（読み取り専用）。リポジトリのルートで実行する。

検査: 相対リンク・アンカー、表の列数、fence、入口からの到達性、追加行の個人情報・秘密情報、
文書以外の差分。規約の本文は持たない（判断は docs/guidelines/ を正本とする）。
エラーまたは個人情報・秘密情報の疑いがあれば終了コード1。
"""
import collections
import os
import re
import subprocess
import sys


def sh(*a):
    return subprocess.check_output(a, text=True)


files = sorted({os.path.normpath(f) for f in sh("git", "ls-files", "-co", "--exclude-standard", "*.md").split("\n") if f})
texts = {f: open(f, encoding="utf-8").read() for f in files if os.path.exists(f)}


def strip_code(t):
    return re.sub(r"```.*?```", "", t, flags=re.S)


def slug(h):
    h = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", h.strip().lower())
    h = re.sub(r"[`*]", "", h)
    return "".join("-" if ch == " " else ch for ch in h if ch.isalnum() or ch in "-_ ")


anchors = {}
for f, t in texts.items():
    seen, s = {}, set()
    for line in strip_code(t).split("\n"):
        m = re.match(r"^#{1,6}\s+(.*?)\s*#*\s*$", line)
        if m:
            b = slug(m.group(1))
            n = seen.get(b, 0)
            seen[b] = n + 1
            s.add(b if n == 0 else f"{b}-{n}")
    anchors[f] = s

link_re = re.compile(r"\[[^\]]*\]\(([^)\s]+)\)")
links = alinks = 0
missing, bad, graph = [], [], collections.defaultdict(set)
for f, t in texts.items():
    for m in link_re.finditer(strip_code(t)):
        u = m.group(1)
        if re.match(r"^(https?:|mailto:)", u):
            continue
        p, _, frag = u.partition("#")
        tg = os.path.normpath(os.path.join(os.path.dirname(f), p)) if p else f
        links += 1
        if p and not os.path.exists(tg):
            missing.append((f, u))
            continue
        if tg in anchors:
            graph[f].add(tg)
        if frag:
            alinks += 1
            if tg in anchors and frag not in anchors[tg] and frag.lower() not in anchors[tg]:
                bad.append((f, u))


def cells(line):
    line = line.strip()
    s = re.sub(r"`[^`]*`", lambda m: m.group(0).replace("|", "\x00"), line).replace("\\|", "\x00")
    parts = s.split("|")
    if line.startswith("|"):
        parts = parts[1:]
    if line.endswith("|"):
        parts = parts[:-1]
    return len(parts)


tables, table_bad, fence_bad = 0, [], []
for f, t in texts.items():
    lines = t.split("\n")
    if sum(1 for l in lines if l.strip().startswith("```")) % 2:
        fence_bad.append(f)
    i, in_code = 0, False
    while i < len(lines):
        l = lines[i]
        if l.strip().startswith("```"):
            in_code = not in_code
            i += 1
            continue
        if not in_code and l.strip().startswith("|"):
            j = i
            while j < len(lines) and lines[j].strip().startswith("|"):
                j += 1
            blk = lines[i:j]
            if len(blk) >= 2 and re.match(r"^\|?\s*:?-{3,}", blk[1].strip().replace(" ", "")):
                tables += 1
                n = cells(blk[0])
                table_bad += [(f, i + k + 1) for k, x in enumerate(blk) if cells(x) != n]
            i = j
            continue
        i += 1

roots = [r for r in ("docs/00_index.md", "AGENTS.md", "README.md", "CLAUDE.md") if r in texts]
reach, queue = set(roots), list(roots)
while queue:
    for y in graph.get(queue.pop(), ()):
        if y not in reach:
            reach.add(y)
            queue.append(y)
unreachable = [f for f in files if f.startswith("docs/") and f not in reach]

print(f"[links] md={len(files)} tables={tables} links={links} anchor-links={alinks}")
print(f"[links] missing={len(missing)} bad-anchor={len(bad)} table-mismatch={len(table_bad)} unclosed-fence={len(fence_bad)} unreachable={len(unreachable)}")
for tag, items in (("MISSING", missing), ("BAD-ANCHOR", bad), ("TABLE", table_bad), ("FENCE", fence_bad), ("UNREACHABLE", unreachable)):
    for x in items[:10]:
        print("   ", tag, x)

# 追加行（作業ツリーとHEADの差分＋未追跡の新規md）の個人情報・秘密情報の疑い
added, cur = [], None
for l in sh("git", "diff", "-U0", "HEAD").split("\n"):
    if l.startswith("+++ b/"):
        cur = l[6:]
    elif l.startswith("+") and not l.startswith("+++"):
        added.append((cur, l[1:]))
for nf in sh("git", "ls-files", "--others", "--exclude-standard").split("\n"):
    if nf.endswith(".md") and os.path.exists(nf):
        added += [(nf, l) for l in open(nf, encoding="utf-8").read().split("\n")]
patterns = {
    "email": r"[\w.+-]+@[\w-]+\.[\w.]+",
    "abs-path": r"/Users/|C:\\\\",
    "ipv4": r"\b\d{1,3}(?:\.\d{1,3}){3}\b",
    "drive-id-like": r"(?<![\w./#-])(?=[A-Za-z0-9_-]{25,}(?![\w./#-]))(?=[A-Za-z0-9_-]*\d)(?=[A-Za-z0-9_-]*[a-z])(?=[A-Za-z0-9_-]*[A-Z])[A-Za-z0-9_-]{25,}",
    "registration-mark": r"\bJU[0-9A-Z]{6,}\b",
    "file-name-ext": r"\.(?:png|jpe?g|heic|gif|xlsx?|docx?|pdf)\b",
    "secret-words": r"client_secret\s*[:=]|access_token|refresh_token|BEGIN [A-Z ]*KEY",
}
hits = 0
for name, p in patterns.items():
    found = [(f, l) for f, l in added if re.search(p, l)]
    hits += len(found)
    if found:
        print(f"[privacy] {name}: {len(found)}")
        for f, l in found[:4]:
            print("    ", f, "|", l[:140])
print(f"[privacy] added lines scanned={len(added)} hits={hits}（実名・登録記号・Drive ID・固定IP・パスの疑い。目視で確認する）")

# 文書以外の差分（文書と .claude/ 以外が変わっていれば表示）
changed = set(sh("git", "diff", "--name-only", "HEAD").split("\n")) | set(sh("git", "ls-files", "--others", "--exclude-standard").split("\n"))
non_doc = sorted(f for f in changed if f and not f.endswith(".md") and not f.startswith(".claude/"))
print(f"[git] branch={sh('git', 'branch', '--show-current').strip()} changed-files={len([f for f in changed if f])} non-doc-changes={len(non_doc)}")
for f in non_doc[:20]:
    print("    NON-DOC", f)

errors = len(missing) + len(bad) + len(table_bad) + len(fence_bad) + len(unreachable)
sys.exit(1 if errors or hits else 0)
