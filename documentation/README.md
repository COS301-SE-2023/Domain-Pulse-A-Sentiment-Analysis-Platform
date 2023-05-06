## Tech Stack  
**Client:** Javascript, Angular

**Server:** Python, Django

## Branching/Git strategy
Our repository follows a branching strategy where we maintain a branch that always contains the latest version of our project. All developers must merge their code into this branch by the end of each day to avoid large merge conflicts down the line and to ensure that the latest changes are integrated into the main branch. This strategy provides a streamlined development process, improves code stability, and allows for quick issue identification and resolution.

**Commit message structure**
The structure of a commit will be as follows
```emoji```(```module```) ```message```
where module module can be 'app' for frontend changes, 'backend' for backend changes, 'docs' for documentation changes, 'test' for test changes, 'config' for configuration changes, 'ci' for continuous integration changes, 'build' for build system changes, 'deploy' for deployment changes

The message should be a short description of the changes made. The emoji should be selected from the dropdown using the Gitmoji vscode extension