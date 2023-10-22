Here is a little bit more info about how we worked as a team and organised our development to be as open, collaborative and streamlined as possible.

# 🎯What project management tools did we use?
- **Github:**
  - Github Projects: Kanban board, Workload management, Issue tracking, Progress Visualisations, Burndown charts
  - Github Issues: Tracking issues and bugs, Work assignment, Collaborative problem-solving
  - Github Actions: Automated workflows,Testing and deploying code, Streamlining development
- **Discord:**
  - Facilitating discussions and communication
  - Weekly meetings
  - Group member acitvity tracking through integrating github notifications into discord
- **Notion:**
  - Organising documentation
  - Meetings and minutes
- **Google Meet and Blackboard Collaborate:**
  - Weekly meetings with client and mentors
- **Google Drive and Signal:**
  - External file sharing
  - Secure sharing of sensitive data

# 📁Repository Breakdown

```
├── backend
│   ├── domains
│   │   ├── authchecker
│   │   ├── domains
│   │   ├── domainservice
  │   ├── sourcevalidator
│   │   └── utils
│   ├── engine
│   │   ├── aggregator
│   │   ├── analyser
│   │   ├── engine
│   │   ├── postprocessor
│   │   ├── preprocessor
│   │   ├── processor
│   │   └── utils
│   ├── live_update
│   ├── mockdata
│   ├── profiles
│   │   ├── assets
│   │   ├── check_auth
│   │   ├── profiles
│   │   ├── profileservice
│   │   ├── reportgenerator
│   │   └── utils
│   ├── scripts
│   ├── sourceconnector
│   │   ├── googlereviews
│   │   ├── refresh
│   │   ├── sourceconnector
│   │   ├── tripadvisor
│   │   ├── trustpilot
│   │   ├── utils
│   │   └── youtube
│   └── warehouse
│       ├── CSV
│       ├── authchecker
│       ├── datamanager
│       ├── ingest
│       │   ├── migrations
│       │   ├── static
│       │   └── templates
│       ├── query
│       ├── utils
│       └── warehouse
├── documentation
│   ├── ADD
│   ├── Coding Standards
│   ├── Images
│   ├── SRS
│   ├── Technical Installation Manual
│   ├── Testing Policy
│   └── User Manual
├── frontend
│   ├── cypress
│   │   ├── e2e
│   │   ├── fixtures
│   │   └── support
│   └── src
│       ├── app
│       │   ├── accordion-card
│       │   │   └── directives
│       │   ├── comments-accordion-card
│       │   │   └── directives
│       │   ├── comments-view
│       │   ├── graph-selector
│       │   ├── help-page
│       │   ├── login-page
│       │   ├── main
│       │   ├── modal-container
│       │   ├── register-page
│       │   ├── sidebar
│       │   ├── source-selector
│       │   ├── statistic-selector
│       │   └── tooltip
│       └── assets
│           ├── helpPage
│           ├── icons
│           └── logos
├── nginx
└── notebooks
```

<br>
<br>

# 🛠️Branching Strategy

<h3><b> Git Feature Workflow with Develop Branch </b></h3>
<p>Within this strategy, master (main) branch will always contain a system state that is ready to be deployed and used in production. A seperate development (dev) branch is created from the master branch and is what all developers will branch off of to create components and features within the system. This ensures a production-ready and stable branch is always available and is protected by ensuring developers push to a development branch as opposed to altering said master branch. Once the system is deemed ready to deploy the development branch shall be merged into the master branch.</p>

