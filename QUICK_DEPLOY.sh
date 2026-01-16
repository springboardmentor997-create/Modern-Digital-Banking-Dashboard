#!/bin/bash

echo "========================================"
echo "Banking Dashboard - Quick Deployment"
echo "========================================"
echo ""

echo "[1/4] Adding all changes to git..."
git add .

echo ""
echo "[2/4] Committing changes..."
git commit -m "Fix: Deployment issues - 404 errors, API client, and configuration"

echo ""
echo "[3/4] Pushing to GitHub..."
git push origin main

echo ""
echo "[4/4] Deployment initiated!"
echo ""
echo "========================================"
echo "STATUS: Changes pushed to GitHub"
echo "========================================"
echo ""
echo "Vercel will automatically detect and deploy in 2-3 minutes."
echo ""
echo "Monitor deployment at:"
echo "https://vercel.com/urmilakshirsagar1945-5664s-projects/modern_banking"
echo ""
echo "Your app will be live at:"
echo "https://modern-banking-git-main-urmilakshirsagar1945-5664s-projects.vercel.app"
echo ""
echo "Backend API:"
echo "https://modern-digital-banking-dashboard-1-vg97.onrender.com"
echo ""
