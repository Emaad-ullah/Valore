import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Custom Vite plugin to handle local API requests for mockData.js
function saveBase64Image(base64Str, __dirname) {
  if (!base64Str || !base64Str.startsWith('data:image')) return base64Str;
  const matches = base64Str.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) return base64Str;
  
  const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  const buffer = Buffer.from(matches[2], 'base64');
  const filename = `img_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
  const uploadDir = path.resolve(__dirname, 'public/images/uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, buffer);
  return `/images/uploads/${filename}`;
}

function mockDataApiPlugin() {
  return {
    name: 'mock-data-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/products' && req.method === 'POST') {
           let body = '';
           req.on('data', chunk => body += chunk);
           req.on('end', () => {
             try {
               const newProduct = JSON.parse(body);
               
               // Save base64 images to local disk to keep mockData.js clean
               newProduct.image = saveBase64Image(newProduct.image, __dirname);
               newProduct.closeImage = saveBase64Image(newProduct.closeImage, __dirname);
               if (newProduct.images) {
                 for (const color in newProduct.images) {
                   if (newProduct.images[color].front) newProduct.images[color].front = saveBase64Image(newProduct.images[color].front, __dirname);
                   if (newProduct.images[color].close) newProduct.images[color].close = saveBase64Image(newProduct.images[color].close, __dirname);
                 }
               }

               const mockDataPath = path.resolve(__dirname, 'src/data/mockData.js');
               let content = fs.readFileSync(mockDataPath, 'utf-8');
               const match = content.match(/export const products = (\[[\s\S]*\]);?/);
               if (match) {
                 const array = eval(match[1]);
                 array.push(newProduct);
                 content = content.replace(match[0], `export const products = ${JSON.stringify(array, null, 2)};`);
                 fs.writeFileSync(mockDataPath, content);
                 res.statusCode = 200;
                 res.end(JSON.stringify({ success: true }));
               } else {
                 res.statusCode = 500;
                 res.end(JSON.stringify({ error: 'Could not parse mockData.js' }));
               }
             } catch (e) {
               res.statusCode = 500;
               res.end(JSON.stringify({ error: e.message }));
             }
           });
           return;
        } 
        
        if (req.url.startsWith('/api/products/') && req.method === 'DELETE') {
           const id = req.url.split('/').pop();
           const mockDataPath = path.resolve(__dirname, 'src/data/mockData.js');
           let content = fs.readFileSync(mockDataPath, 'utf-8');
           const match = content.match(/export const products = (\[[\s\S]*\]);?/);
           if (match) {
             try {
               const array = eval(match[1]);
               const updatedArray = array.filter(p => p.id !== parseInt(id));
               content = content.replace(match[0], `export const products = ${JSON.stringify(updatedArray, null, 2)};`);
               fs.writeFileSync(mockDataPath, content);
               res.statusCode = 200;
               res.end(JSON.stringify({ success: true }));
             } catch (e) {
               res.statusCode = 500;
               res.end(JSON.stringify({ error: e.message }));
             }
           } else {
             res.statusCode = 500;
             res.end(JSON.stringify({ error: 'Could not parse mockData.js' }));
           }
           return;
        }
        
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), mockDataApiPlugin()],
  server: {
    port: 5177
  }
})
