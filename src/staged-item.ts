import { InspectableFile } from './inspectable-file';

export interface StagedItem
{
	fileId: string;
	fileName: string;
	detectedType: string;
	createdTime?: string;
	availableActions: Array<{ type: string; label: string }>;
	inspectableFile?: InspectableFile;
}
