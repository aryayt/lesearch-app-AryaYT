import {
	Pages,
	Page,
	CanvasLayer,
	TextLayer,
	usePdf,
	AnnotationLayer,
	HighlightLayer,
	useSelectionDimensions,
} from "@anaralabs/lector";

import { CustomSelect } from "./custom-select";
export const HighlightLayerContent = () => {
	const selectionDimensions = useSelectionDimensions();
	const setHighlights = usePdf((state) => state.setHighlight);

	const handleHighlight = () => {
		const dimension = selectionDimensions.getDimension();
		if (dimension && !dimension.isCollapsed) {
			setHighlights(dimension.highlights);
		}
	};

	console.log(!!selectionDimensions);

	return (
		<Pages className="mx-auto py-6 bg-white dark:invert-[94%] dark:hue-rotate-180 dark:brightness-[80%] dark:contrast-[228%]">
			<Page className="mx-auto shadow-md rounded-md overflow-hidden ">
				{selectionDimensions && <CustomSelect onHighlight={handleHighlight} />}
				<CanvasLayer />
				<TextLayer />
				<AnnotationLayer />
				<HighlightLayer className="bg-yellow-200/70" />
			</Page>
		</Pages>
	);
};
