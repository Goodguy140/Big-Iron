import { PassThrough } from "stream";
import ytdl = require("ytdl-core");

export function createYTStream(info: ytdl.videoInfo, format: ytdl.videoFormat, options: ytdl.downloadOptions, chunkSize: number = 512 * 1024 /*stream size of each partial stream*/) {
    const stream = new PassThrough();
    let current = -1;
    const contentLength = Number(format.contentLength);
    if (contentLength < chunkSize) {
        // stream is tiny so unnecessary to split
        ytdl.downloadFromInfo(info, { format, ...options }).pipe(stream);
    } else {
        // stream is big so necessary to split
        const pipeNextStream = () => {
            current++;
            let end = chunkSize * (current + 1) - 1;
            if (end >= contentLength) end = undefined;
            const nextStream = ytdl.downloadFromInfo(info, {
                format, ...options, range: {
                    start: chunkSize * current, end
                }
            });
            nextStream.pipe(stream, { end: end === undefined });
            if (end !== undefined) {
                // schedule to pipe next partial stream
                nextStream.on("end", () => {
                    pipeNextStream();
                });
            }
        };
        pipeNextStream();
    }
    return stream;
}