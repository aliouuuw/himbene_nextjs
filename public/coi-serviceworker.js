/*! coi-serviceworker v0.1.7 - Guido Zuidhof, licensed under MIT */
let coepCredentialless = false;
if (typeof window === 'undefined') {
    self.addEventListener('install', () => self.skipWaiting());
    self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

    self.addEventListener('fetch', function (event) {
        if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') {
            return;
        }

        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (coepCredentialless) {
                        const newHeaders = new Headers(response.headers);
                        newHeaders.set('Cross-Origin-Embedder-Policy', 'credentialless');
                        return new Response(response.body, {
                            status: response.status,
                            statusText: response.statusText,
                            headers: newHeaders,
                        });
                    }
                    return response;
                })
                .catch((error) => {
                    console.error('Fetch error:', error);
                    throw error;
                })
        );
    });
} else {
    (() => {
        const script = document.currentScript;
        const coepDebugging = script?.getAttribute('coep-debugging') === 'true';
        if (coepDebugging) {
            console.log('COEP debugging enabled');
        }
        coepCredentialless = script?.getAttribute('coep-credentialless') === 'true';
        if (coepCredentialless) {
            console.log('COEP credentialless mode enabled');
        }

        if (!crossOriginIsolated) {
            if (coepDebugging) {
                console.log('Not cross origin isolated');
            }
            const serviceWorkerUrl = script?.getAttribute('src') || '/coi-serviceworker.js';
            navigator.serviceWorker?.register(serviceWorkerUrl);
        }
    })();
} 