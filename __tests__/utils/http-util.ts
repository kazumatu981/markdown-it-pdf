import http from 'http';

export interface SugaredHttpResponse {
    statusCode?: number;
    contentType?: string;
    body: string;
}
export function readFromServer(url: string): Promise<SugaredHttpResponse> {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    contentType: res.headers['content-type'] as string,
                    body: data,
                });
            });
        });
    });
}
