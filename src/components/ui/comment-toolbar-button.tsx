"use client";

import { useEditorPlugin } from "@udecode/plate/react";

import { getDraftCommentKey } from "@udecode/plate-comments";
import { MessageSquareTextIcon } from "lucide-react";
import * as React from "react";

import { commentsPlugin } from "@/components/platejs/comments-plugin";

import { ToolbarButton } from "./toolbar";

export function CommentToolbarButton() {
	const { editor, setOption, tf } = useEditorPlugin(commentsPlugin);

	const onCommentToolbarButton = React.useCallback(() => {
		if (!editor.selection) return;

		tf.comment.setDraft();
		editor.tf.collapse();
		setOption("activeId", getDraftCommentKey());
		setOption("commentingBlock", editor.selection.focus.path.slice(0, 1));
	}, [editor.selection, editor.tf, setOption, tf.comment]);

	return (
		<ToolbarButton
			onClick={onCommentToolbarButton}
			data-plate-prevent-overlay
			tooltip="Comment"
		>
			<MessageSquareTextIcon />
		</ToolbarButton>
	);
}
