import { MoreVideoDetails, VideoDetails, videoInfo } from "ytdl-core";

export interface songInfo {
    title: string;
    url: string;
    info: MoreVideoDetails;
}

export class song {
    public readonly title: string;
    public readonly url: string;
    public readonly info: MoreVideoDetails;

    public constructor({ title, url, info }: songInfo) {
        this.title = title;
        this.url = url;
        this.info = info;
    }
}