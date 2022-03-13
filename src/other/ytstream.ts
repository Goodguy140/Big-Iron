import { PassThrough } from "stream";
import ytdl = require("ytdl-core");
const COOKIE = 'VISITOR_INFO1_LIVE=lBXSZk2hmO4; PREF=f4=4000000&tz=America.Halifax&f6=40000000; LD_S=true; _ga=GA1.2.143511903.1635530783; ajs_anonymous_id=eb120671-abe9-47c3-a5f2-94fbdadfbf04; ajs_user_id=5b2d3f5054b8a414f1000002; LD_T=4997e84a-c21e-4040-cf7e-be2382640b30; _gcl_au=1.1.246772812.1644454948; HSID=ATuI8Pi-BsncSJfoT; SSID=AjFHN8lie-dxgsxfj; APISID=tlEVQG0EBrKMV5PU/A7bJOgZBCViuF4e3b; SAPISID=LeOreo77y_oJeont/ADJrQMD_gIe8Ugwdm; __Secure-1PAPISID=LeOreo77y_oJeont/ADJrQMD_gIe8Ugwdm; __Secure-3PAPISID=LeOreo77y_oJeont/ADJrQMD_gIe8Ugwdm; SID=HghRX_3vz-ohT0lrspzM0P7dGo1vaMD-V6EwBlWW3nxOcFVKoWOUgNwrmMP6Q80vA1NK8g.; __Secure-1PSID=HghRX_3vz-ohT0lrspzM0P7dGo1vaMD-V6EwBlWW3nxOcFVKXeu0HV-DC7cUp9hD_kgYnw.; __Secure-3PSID=HghRX_3vz-ohT0lrspzM0P7dGo1vaMD-V6EwBlWW3nxOcFVKF1J8u3MkwYv8IIZNkjs8mw.; LOGIN_INFO=AFmmF2swRgIhAOj9cr3hn0vNMF4c0J_A2X9tYVE75SliGyCqcSXm-FOaAiEA9vlLSaMNklkRaEoaLrioFi3WbsYCyG0LeU95wFUpjTk:QUQ3MjNmeU1tU291Wk5nSmJjNmcyQ3FYaFhQWmhLZ3JLQzRicHVkWVRTOG1NUEFaXzlySV9wY2ZFNllRTlNRdjhZTFlEWFpWd2I1VGZUQ0ZHSDlaWHgtYXV4UWZVUnFHRWhNY0RkUlVaNDkzbXhyOF93ME1tTUtUR0VVUE1JdndHbHh2akY5UzN5M0J6N1NBMm5lcDRIdk8yN1hpeDJEZVhR; YSC=Slhlvz2ekz4; _gid=GA1.2.194522517.1646694660; amplitude_id_bc73d2c89ab647ec4aa1a2d38de9a951youtube.com=eyJkZXZpY2VJZCI6IjY0NzI2YTdiLTllMmUtNGUxYy05Mzk4LTc4YTk3YTFlMmVmMFIiLCJ1c2VySWQiOiI1YjJkM2Y1MDU0YjhhNDE0ZjEwMDAwMDIiLCJvcHRPdXQiOmZhbHNlLCJzZXNzaW9uSWQiOjE2NDY2OTQ2NTk2OTAsImxhc3RFdmVudFRpbWUiOjE2NDY2OTUyNjg1MjgsImV2ZW50SWQiOjAsImlkZW50aWZ5SWQiOjIxLCJzZXF1ZW5jZU51bWJlciI6MjF9; amplitude_id_765ed530d0f6d48769c02ff01529d23a_devyoutube.com=eyJkZXZpY2VJZCI6IjY4ZDA3M2RlLWRjZDEtNDhmZC1iZWNmLTI5YTk4ZTU2ZDM0OFIiLCJ1c2VySWQiOiI1YjJkM2Y1MDU0YjhhNDE0ZjEwMDAwMDIiLCJvcHRPdXQiOmZhbHNlLCJzZXNzaW9uSWQiOjE2NDY2OTQ2NTk3MDksImxhc3RFdmVudFRpbWUiOjE2NDY2OTUyNjg1NDAsImV2ZW50SWQiOjAsImlkZW50aWZ5SWQiOjIxLCJzZXF1ZW5jZU51bWJlciI6MjF9; SIDCC=AJi4QfHnBjVO0twZvgcs5Su6wGehGZUZm1kviyeAIHggkDwa0DD9PKQZKsdgJ0cylmkHpMHKkmQ; __Secure-3PSIDCC=AJi4QfHgjPXPNgz1O3TQeEONS6b9YVWhWT33HHaFw8zT6ZiOK8pOuobUmZ37jBLAX6NVSgVFUewkey1=value1; key2=value2; key3=value3';
export function createYTStream(info: ytdl.videoInfo, format: ytdl.videoFormat, options: ytdl.downloadOptions, chunkSize: number = 1<<20 /*stream size of each partial stream*/) {
    const stream = new PassThrough();
    let current = -1;
    const contentLength = Number(format.contentLength);
    if (contentLength < chunkSize) {
        // stream is tiny so unnecessary to split
        console.log('Stream is tiny, not splitting');
        ytdl.downloadFromInfo(info, { format, ...options }).pipe(stream);
    } else {
        // stream is big so necessary to split
        console.log('Stream is big, splitting');
        const pipeNextStream = () => {
            current++;
            let end = chunkSize * (current + 1) - 1;
            if (end >= contentLength) end = undefined;
            const nextStream = ytdl.downloadFromInfo(info, {
                format, ...options, range: {
                    start: chunkSize * current, end
                },
                requestOptions: {
                    headers: {
                        cookie: COOKIE,
                    },
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