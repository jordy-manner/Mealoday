---
name: gh-handle
description: Traite une unique issue GitHub de façon interactive dans le terminal courant (pas de tmux). Sélection par bouton radio. Lancer avec « /gh-handle », « handle issue », « traite cette issue ».
---

# gh-handle — implémentation interactive d'une issue

Une issue sélectionnée → traitée dans la session courante. L'utilisateur reste dans la boucle et peut répondre aux questions.

---

## Étapes

### 1. Lister les issues ouvertes

```bash
gh issue list \
  --repo jordy-manner/mealoday \
  --state open \
  --json number,title,body,labels \
  --limit 20
```

---

### 2. Filtrer et sélectionner l'issue à traiter

#### 2a. Règles de filtrage (identiques à nightshift)

| Condition | Action |
|-----------|--------|
| Pas de label `hasPR` | ✅ Éligible normalement |
| Label `hasPR` + PR avec `Status:Needs Work` | ✅ Éligible en **mode fix** — lire les directives avant d'implémenter |
| Label `hasPR` + PR sans `Status:Needs Work` | ❌ Exclure silencieusement |

Pour détecter la PR associée :

```bash
gh pr list --repo jordy-manner/mealoday --state open --json number,labels,body \
  | jq --arg n "{numéro}" '.[] | select(.body | contains("Closes #\($n)") or contains("closes #\($n)"))'
```

#### 2b. Afficher la sélection (bouton radio — une seule issue)

Poser via `AskUserQuestion` avec `multiSelect: false` :

- **Label** : `[{type}] #{N} — {titre}`
  - `type` depuis les labels : `Type:Fix` → `fix`, `Type:Chore` → `chore`, sinon `feat`
  - Mode fix : ajouter ` ⚠️ Needs Work`
- **Description** : premiers 120 caractères du body (tronquer au dernier mot)
  - Mode fix : remplacer par la directive principale du premier change request

Si annulé (Échap) → `gh-handle annulé.`

Pour l'issue sélectionnée :
- `type` : depuis les labels
- `slug` : kebab-case 2–4 mots depuis le titre
- `mode` : `normal` ou `fix`

---

### 3. Résoudre la branche de base

```bash
BASE_BRANCH=$(git -C /home/jmanner/www/html/__lab/mealoday/main branch --show-current)
```

---

### 4. Préparer la branche

```bash
BRANCH="{type}/{numéro}-{slug}"
git show-ref --verify --quiet refs/remotes/origin/$BRANCH || {
  git checkout -b $BRANCH
  git push -u origin $BRANCH
  git checkout $BASE_BRANCH
}
```

---

### 5. Préparer le worktree

Détecter un worktree existant pour cette branche :

```bash
EXISTING=$(git worktree list | grep " \[$BRANCH\]" | awk '{print $1}')

if [ -n "$EXISTING" ]; then
  WORKTREE="$EXISTING"
else
  git worktree add "/home/jmanner/www/html/__lab/mealoday/{slug}" "$BRANCH"
  WORKTREE="/home/jmanner/www/html/__lab/mealoday/{slug}"
fi
```

Port :

```bash
USED_PORTS=$(find /home/jmanner/www/html/__lab/mealoday \
  -maxdepth 2 -name ".port" -exec cat {} \; 2>/dev/null | sort -u)

if [ -f "$WORKTREE/.port" ]; then
  PORT=$(cat "$WORKTREE/.port")
else
  for port in 3001 3002 3003 3004 3005 3006 3007 3008 3009 3010 3011 3012 3013 3014 3015 3016 3017 3018 3019; do
    echo "$USED_PORTS" | grep -q "^$port$" && continue
    ss -tlnp 2>/dev/null | grep -q ":${port}[^0-9]" && continue
    echo $port > "$WORKTREE/.port"
    PORT=$port
    break
  done
fi
```

---

### 6. Rapport de préparation + lancer l'implémentation

Afficher :

```
✓ Issue     : #{numéro} — {titre}
✓ Branche   : {type}/{numéro}-{slug}
✓ Worktree  : {worktree}/
✓ Port      : {port}
✓ Mode      : {normal|fix}

Implémentation en cours…
```

**À partir d'ici, Claude travaille directement dans la session courante** dans le worktree `{worktree}/`. Utiliser des chemins absolus pour toutes les lectures/écritures de fichiers.

---

### 7. Lire le contexte (dans le worktree)

Lire dans cet ordre, tous via chemins absolus :

1. `{worktree}/CLAUDE.md` + `{worktree}/AGENTS.md`
2. `{worktree}/DESIGN.md` (si travail UI)
3. Fichiers concernés par l'issue (grep / Read)
4. Si mode fix : comments de la PR

```bash
# Mode fix : lire les directives de la PR
gh pr view {pr_number} --repo jordy-manner/mealoday --comments
```

---

### 8. Implémenter l'issue

Travail normal dans `{worktree}/` :

- Commits atomiques avec `refs #{numéro}`
- Après changement UI : `npm run check:design` depuis `{worktree}/`
- Poser des questions à l'utilisateur si bloqué (session interactive — pas de comment GitHub de blocage)
- Ne PAS ajouter `Co-Authored-By` dans les commits

---

### 9. Pousser et ouvrir la PR

```bash
git -C "{worktree}" push origin {branch}
```

Ouvrir la PR sous le compte de l'utilisateur (pas le bot) :

```bash
gh pr create --repo jordy-manner/mealoday \
  --head {branch} \
  --base {base_branch} \
  --title "{commit title}" \
  --body "$(cat <<'EOF'
## Issue
Closes #{numéro} — {issue title}

> {one-line problem summary}

## Changes
{bullet list of files changed and what was done}

## Acceptance criteria
{copy acceptance criteria checkboxes from issue}

## Preview
Vercel auto-deploy is disabled on PR branches. Comment \`/deploy\` to trigger a preview deployment.
EOF
)"
```

---

### 10. Labels de fin

Mode normal :

```bash
PR_NUMBER=$(gh pr list --repo jordy-manner/mealoday --head {branch} --json number --jq '.[0].number')
gh api repos/jordy-manner/mealoday/issues/$PR_NUMBER/labels \
  --method POST --field 'labels[]=Status:Needs Review'
gh api repos/jordy-manner/mealoday/issues/{numéro}/labels \
  --method POST --field 'labels[]=hasPR'
```

Mode fix :

```bash
gh api repos/jordy-manner/mealoday/issues/{pr_number}/labels \
  --method DELETE --field 'labels[]=Status:Needs Work'
gh api repos/jordy-manner/mealoday/issues/{pr_number}/labels \
  --method POST --field 'labels[]=Status:Reviewed'
```

---

### 11. Rapport final

```
✅ Issue #{numéro} traitée

PR     : {pr_url}
Branch : {branch}
Worktree supprimable avec : git worktree remove {worktree}
```

---

## Notes

- Pas de tmux, pas de sub-process Claude : tout se passe dans la session courante.
- L'utilisateur peut interrompre et répondre à tout moment — c'est l'avantage vs nightshift.
- Migrations Prisma : si un autre worktree a des migrations en cours, signaler avant de continuer.
- Pour supprimer le worktree après merge : `git worktree remove {slug}`.
