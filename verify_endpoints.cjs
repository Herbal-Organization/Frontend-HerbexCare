const fs = require('fs');
const path = require('path');
const swagger = JSON.parse(fs.readFileSync('swagger.json', 'utf8'));
const swaggerPaths = Object.keys(swagger.paths).map(p => p.toLowerCase());

function checkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            checkDir(fullPath);
        } else if (fullPath.endsWith('.js')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const regex = /httpClient\.(get|post|put|patch|delete)\(\s*(['"`])([^'"`]+)\2/g;
            let match;
            while ((match = regex.exec(content)) !== null) {
                let method = match[1].toLowerCase();
                let apiPath = match[3];
                apiPath = apiPath.split('?')[0];
                let swaggerFormatPath = apiPath.replace(/\$\{([^}]+)\}/g, '{id}').toLowerCase();
                
                const realSwaggerPath = Object.keys(swagger.paths).find(p => p.toLowerCase() === swaggerFormatPath);
                
                if (!realSwaggerPath) {
                    console.log(`PATH MISMATCH found in ${file}: ${apiPath}`);
                } else {
                    const swaggerMethods = Object.keys(swagger.paths[realSwaggerPath]).map(m => m.toLowerCase());
                    if (!swaggerMethods.includes(method)) {
                        console.log(`METHOD MISMATCH found in ${file}:`);
                        console.log(`Expected one of: ${swaggerMethods.join(', ')}`);
                        console.log(`But got: ${method} for ${apiPath}`);
                        console.log('---');
                    }
                }
            }
        }
    }
}

checkDir('src/api');
