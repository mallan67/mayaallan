gitsave () 
{ 
    local R=mallan67/mayaallan BR=work/site-visibility P="$1" SUBJ="$2" CONTENT MSG BLOB HEAD TREE NT NC i;
    CONTENT=$(cat);
    MSG=$(printf '%s\n\nCo-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>' "$SUBJ");
    BLOB=$(printf '%s' "$CONTENT" | node -e 'let s="";process.stdin.setEncoding("utf8").on("data",d=>s+=d).on("end",()=>process.stdout.write(JSON.stringify({content:s,encoding:"utf-8"})))' | gh api repos/$R/git/blobs --input - --jq .sha) || { 
        echo "blob failed";
        return 1
    };
    for i in 1 2 3 4 5 6 7 8;
    do
        HEAD=$(gh api repos/$R/git/ref/heads/$BR --jq .object.sha);
        TREE=$(gh api repos/$R/git/commits/$HEAD --jq .tree.sha);
        NT=$(gh api repos/$R/git/trees -f base_tree="$TREE" -f "tree[][path]=$P" -f "tree[][mode]=100644" -f "tree[][type]=blob" -f "tree[][sha]=$BLOB" --jq .sha) || return 1;
        NC=$(gh api repos/$R/git/commits -f message="$MSG" -f tree="$NT" -f "parents[]=$HEAD" --jq .sha) || return 1;
        if gh api -X PATCH repos/$R/git/refs/heads/$BR -f sha="$NC" -F force=false --jq .object.sha > /dev/null 2>&1; then
            echo "SAVED $P commit=$NC parent=$HEAD";
            gh api repos/$R/compare/$HEAD...$NC --jq '.files[] | "\(.status) \(.filename)"';
            return 0;
        fi;
    done;
    echo "FAILED to save $P";
    return 1
}