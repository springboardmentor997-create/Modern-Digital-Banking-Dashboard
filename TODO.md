# TODO: Fix 404 Errors in Expense API

## Completed Tasks
- [x] Update backend/render.yaml to use FastAPI app (uvicorn app.main:app)
- [x] Update backend/Procfile to use FastAPI app
- [x] Make category optional in ExpenseResponse schema to handle null categories
- [x] Add GET /api/expenses/receipts/{expense_id} route for specific receipts
- [x] Commit and push changes to GitHub repo

## Summary of Changes
The 404 errors were caused by the deployment running a minimal Flask app instead of the full FastAPI app that contains the expense routes. Updated deployment configs to use the correct app. Also fixed potential null category issues and added missing receipt route.

## Next Steps
- Monitor deployment redeploy on Render
- Test the frontend to ensure no more 404 errors
- Verify expense functionality works correctly
