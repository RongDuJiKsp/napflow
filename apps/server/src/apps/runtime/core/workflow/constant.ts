import { ComponentNodesEnum } from "@shared/common/workflow/component-node";
import { CommNode } from "./node";

const NodeKlassMap: Record<ComponentNodesEnum, CommNode> = {
    [ComponentNodesEnum.Trigger]: undefined,
    [ComponentNodesEnum.Reply]: undefined
}