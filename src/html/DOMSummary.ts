import { HtmlJsonNode } from "./DomToJson";
import { removeUselessProperties } from "./removeUselessProperties";
import { pruneUselessNodes } from "./pruneUselessNodes";
import { pruneInvisibleNodes } from "./pruneInvisibleNodes";
import { removeEmptyProperties } from "./removeEmptyProperties";
import { transformFormat } from "./transformFormat";


export function summarize(jsonHtml: HtmlJsonNode): HtmlJsonNode {
    const prunedJsonHtml = pruneInvisibleNodes(jsonHtml);
    const usefulProperties = removeUselessProperties(prunedJsonHtml);
    const usefulNodes = pruneUselessNodes(usefulProperties);
    const noEmptyProperties = removeEmptyProperties(usefulNodes);
    return transformFormat(noEmptyProperties);
}
