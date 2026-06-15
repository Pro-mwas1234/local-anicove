const fs = require('fs');

function testStrip() {
    // Fake PNG header
    const pngHeader = Buffer.from('89504E470D0A1A0A0000000D49484452', 'hex');
    
    // Fake TS data
    const tsData = Buffer.alloc(188 * 3);
    tsData[0] = 0x47;
    tsData[188] = 0x47;
    tsData[376] = 0x47;
    
    let buffer = Buffer.concat([pngHeader, tsData]);
    console.log("Original size:", buffer.length);
    
    if (buffer.length > 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
        let tsOffset = -1;
        const iend = Buffer.from('49454E44ae426082', 'hex');
        const iendIdx = buffer.indexOf(iend);
        if (iendIdx !== -1 && iendIdx + 8 < buffer.length && buffer[iendIdx + 8] === 0x47) {
            tsOffset = iendIdx + 8;
        } else {
            for (let i = 0; i < Math.min(buffer.length, 100000); i++) {
                if (buffer[i] === 0x47 && buffer[i + 188] === 0x47 && buffer[i + 376] === 0x47) {
                    tsOffset = i;
                    break;
                }
            }
        }
        if (tsOffset !== -1) {
            buffer = buffer.slice(tsOffset);
            console.log("Stripped! New size:", buffer.length);
        } else {
            console.log("No TS sync found");
        }
    }
}
testStrip();
