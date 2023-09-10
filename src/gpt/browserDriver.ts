import { compact, summarize } from "./DOMSummary";

export async function execute() {
    console.log('Executing...');
    const childCount = document.body.childElementCount;
    console.log(`childCount: ${childCount}`);

    const node = document.getElementById("climsMyLogin:j_id503:j_id504:j_id505:j_id506:loginForm:username");
    node?.setAttribute("value", "teste");

    const summary = summarize(document);
    // const compactSummary = compact(summary);
    console.log(JSON.stringify(summary, null, 2));
}

