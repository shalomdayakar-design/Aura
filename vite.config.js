import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Vite plugin to run api handlers in local dev
const apiPlugin = () => ({
  name: 'api-plugin',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url.startsWith('/api/')) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const apiPath = url.pathname;
        const functionName = apiPath.substring(5); // remove '/api/'
        const filePath = path.resolve(__dirname, `api/${functionName}.js`);
        
        if (fs.existsSync(filePath)) {
          try {
            // Load env files if they exist to populate process.env locally
            const envPaths = ['.env', '.env.local', '.env.development'];
            for (const envPath of envPaths) {
              const fullEnvPath = path.resolve(__dirname, envPath);
              if (fs.existsSync(fullEnvPath)) {
                const envContent = fs.readFileSync(fullEnvPath, 'utf8');
                envContent.split(/\r?\n/).forEach(line => {
                  if (line.trim().startsWith('#') || !line.includes('=')) return;
                  const [key, ...valueParts] = line.split('=');
                  const val = valueParts.join('=').trim();
                  const cleanKey = key.trim();
                  let cleanVal = val;
                  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                    cleanVal = val.slice(1, -1);
                  }
                  process.env[cleanKey] = cleanVal;
                });
              }
            }

            // Read request body for POST/PUT/PATCH
            let body = {};
            if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
              body = await new Promise((resolve) => {
                let data = '';
                req.on('data', chunk => { data += chunk; });
                req.on('end', () => {
                  try {
                    resolve(JSON.parse(data));
                  } catch (e) {
                    resolve({});
                  }
                });
              });
            }

            // Mock req and res objects
            const mockReq = {
              method: req.method,
              body,
              query: Object.fromEntries(url.searchParams),
              headers: req.headers
            };

            const mockRes = {
              status(statusCode) {
                res.statusCode = statusCode;
                return this;
              },
              json(data) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
                return this;
              },
              setHeader(name, value) {
                res.setHeader(name, value);
                return this;
              },
              end(data) {
                res.end(data);
                return this;
              }
            };

            // Dynamically import the handler and run it
            const module = await import(filePath + `?t=${Date.now()}`);
            await module.default(mockReq, mockRes);
            return;
          } catch (error) {
            console.error('Error running API handler:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message }));
            return;
          }
        }
      }
      next();
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiPlugin()],
})

