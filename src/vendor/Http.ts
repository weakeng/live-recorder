import request from "request-promise";

class Http {
    static readonly TIMEOUT = 15000;
    static readonly USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36';

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