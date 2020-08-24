enum Tag {
	Performance = 'performanceTags',
	Target = 'targetTags',
	Match = 'matchTags',
	Noise = 'noiseTags',
}

class TargetTag {
	constructor(
		private tag: {},
		private min: number = 0,
		private target: number = 0,
		private max: number = 0,
		private isActive: boolean = false
	) {}
}
class MatchTag {
	constructor(
		private tag: {},
		private offSetMin: number = 0,
		private offSetMax: number = 0,
		private isActive: boolean = false
	) {}
}

class NoiseTag {
	constructor(
		private tag: {},
		private min: number = 0,
		private max: number = 0,
		private isActive: boolean = false
	) {}
}

interface MasterTags {
	[Tag.Target]: any[];
	[Tag.Match]: any[];
	[Tag.Performance]?: any[];
	[Tag.Noise]: any[];
}

export { Tag, MasterTags, TargetTag, MatchTag, NoiseTag };
