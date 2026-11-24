export interface FileAction
{
	type: string;
	label: string;
}

export interface SniffResult
{
	detectedType: string;
	availableActions: FileAction[];
}

export abstract class AbstractFileSniffer
{
	abstract sniff(fileId: string, fileName: string): SniffResult | null;
}
