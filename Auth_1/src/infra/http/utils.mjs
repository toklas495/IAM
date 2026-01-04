import {URL} from 'url';

export function splitUrl(requestUrl){
    const parsed = new URL(requestUrl);
    return {
        baseURL:parsed.origin,
        url:parsed.pathname + parsed.search
    }
}