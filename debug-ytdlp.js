const { YtDlpPlugin } = require('@distube/yt-dlp');
const fs = require('fs');
const path = require('path');

console.log('--- Starting YtDlpPlugin Debug ---');

try {
    console.log('Initializing YtDlpPlugin with update: true...');
    const plugin = new YtDlpPlugin({ update: true });
    console.log('Plugin instance created.');

    // Check if we can find the binary path (internal property usually, but let's try to find it on disk)
    // The wrapper usually downloads to a global or local cache.

    console.log('Waiting 10 seconds to allow async update to potentially proceed...');
    setTimeout(() => {
        console.log('--- 10 seconds elapsed ---');
        console.log('If you see this, the process did not hard-hang immediately.');
        process.exit(0);
    }, 10000);

} catch (error) {
    console.error('Error during plugin init:', error);
}
