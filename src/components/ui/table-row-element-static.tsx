import type { SlateElementProps } from "@udecode/plate";
import { SlateElement } from "@udecode/plate";
import * as React from "react";

export function TableRowElementStatic(props: SlateElementProps) {
	return (
		<SlateElement {...props} as="tr" className="h-full">
			{props.children}
		</SlateElement>
	);
}
