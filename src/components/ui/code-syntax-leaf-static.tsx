import { SlateLeaf, type SlateLeafProps } from "@udecode/plate";
import * as React from "react";

export function CodeSyntaxLeafStatic(props: SlateLeafProps) {
	const tokenClassName = props.leaf.className as string;

	return <SlateLeaf className={tokenClassName} {...props} />;
}
