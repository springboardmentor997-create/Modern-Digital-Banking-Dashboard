# Frontend — Modern Digital Banking Dashboard

This folder contains the React + Vite frontend.

Quick setup (Windows - PowerShell)

```powershell
Set-Location frontend
npm install
npm run dev
```

If you encounter the Rollup/Vite native module error on Windows, try:

```powershell
Remove-Item -Recurse -Force .\node_modules
Remove-Item -Force .\package-lock.json
npm cache clean --force
npm install --no-optional
# or use yarn
npm install -g yarn
yarn
yarn dev
```

The dev server will typically run at `http://localhost:5173`.
