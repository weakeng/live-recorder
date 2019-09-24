import request from "request-promise";

class Http {
    static readonly TIMEOUT = 15000;
    static readonly USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36';

    static async request(Option: any){

        let header = {
            'User-Agent': Http.USER_AGENT,
        };
        header = Object.assign(header, Option.header || {});
        let opt = {
            url: Option.url,
            data: Option.data || {},
            method:Option.method||'GET',
            headers: header,
            timeout: Http.TIMEOUT,
            gzip: true,
            json: true,
        };
        return await request(opt);
    }
}

export default Http;