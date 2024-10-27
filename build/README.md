# Build System

## Build Info Updates

The build information is updated automatically when you make Git commits using a pre-commit hook.

### Setup Instructions

1. Make the pre-commit hook executable:
   ```bash
   chmod +x build/git-hooks/pre-commit
   ```

2. Create a symbolic link to the Git hooks directory:
   ```bash
   ln -s ../../build/git-hooks/pre-commit .git/hooks/pre-commit
   ```

Now the build info will only update when you make commits, not when users run the application.

### Manual Updates

If you need to update the build info manually:
```bash
npm run update-build
```

### Build Info Format

The buildInfo.js file contains:
- version: from package.json
- buildDate: timestamp of last commit
- buildNumber: incremented on each commit
- environment: development/production


Note: if you make a commit from VS Code, the pre-commit hook won't work automatically. This is because VS Code's Git integration bypasses the local Git hooks by default.

To make it work with VS Code commits, you have a few options:

1. Configure VS Code to use Git hooks:

Open VS Code settings
Search for "git.enableCommitSigning"
Enable this setting

OR

2. Use a different approach like a VS Code task:

Add VS Code task for build info updates

.vscode/tasks.json
Then you can either:

Manually run the task before committing (Ctrl/Cmd + Shift + B)
Create a keyboard shortcut for the task
Use the VS Code command palette to run it
The most reliable approach would be to use the command line for commits when you want to update the build info, or manually run the update task before committing in VS Code.
