<div align="center">
  <a href="https://github.com/LapseMP/lapse-grp3-2023">
    <img src="https://github.com/COS301-SE-2023/Domain-Pulse-A-Sentiment-Analysis-Platform/assets/105363824/fb923ead-1880-45b3-9795-5bcf6a3485d6" width='800'>

  </a>

  <h3 align="center">A Sentiment Analysis Platform</h3>
  Ctrl Alt Defeat - COS301 Capstone 2023
  <p align="center">
    <br />
    <a href="https://drive.google.com/drive/folders/1s10aE2hZZ3AxrYnmbpiI-6pTMuPrP52z?usp=share_link"><strong>📄Explore the docs»</strong></a>
    <br />
    <a href="https://github.com/orgs/COS301-SE-2023/projects/6"><strong>📌Our Project Board »</strong></a>
    
  </p>
  Documentation
  <br />
  <a href="https://github.com/COS301-SE-2023/Domain-Pulse-A-Sentiment-Analysis-Platform/blob/main/documentation/User%20Manual/Version%203%20(Demo%204)/Domain_Pulse_User_Manual_V3.pdf"><strong>User Manual</strong></a>
  <br />
  <a href="https://github.com/COS301-SE-2023/Domain-Pulse-A-Sentiment-Analysis-Platform/blob/docs/Demo4Documentation/documentation/Coding%20Standards/CodingStandards.pdf"><strong>Coding Standards</strong></a>
  <br />
  <a href="https://github.com/COS301-SE-2023/Domain-Pulse-A-Sentiment-Analysis-Platform/blob/docs/Demo4Documentation/documentation/Testing%20Policy/TestingPolicy.pdf"><strong>Testing Policy Doc</strong></a>
  <br />
<a href="https://github.com/COS301-SE-2023/Domain-Pulse-A-Sentiment-Analysis-Platform/blob/docs/Demo4Documentation/documentation/SRS/Version%204%20(Demo%204)/SRS.pdf"><strong>SRS</strong></a>
  <br />
<a href="https://github.com/COS301-SE-2023/Domain-Pulse-A-Sentiment-Analysis-Platform/blob/docs/Demo4Documentation/documentation/Technical%20Installation%20Manual/technical-installation-manual.pdf"><strong>Technical Installation Manual</strong></a>
  <br />
<a href="https://github.com/COS301-SE-2023/Domain-Pulse-A-Sentiment-Analysis-Platform/blob/docs/Demo4Documentation/documentation/Sentiment_Analysis_Breakdown.pdf">Sentiment Analysis Explanation</strong></a>
  <br />
<a href="https://github.com/COS301-SE-2023/Domain-Pulse-A-Sentiment-Analysis-Platform/blob/docs/Demo4Documentation/documentation/ADD/ArchitecturalDesignDocument.pdf">Architectural Design Document</strong></a>
  <br />

</div>


![Asset 4@1x](https://github.com/COS301-SE-2023/Domain-Pulse-A-Sentiment-Analysis-Platform/assets/105363824/d5a6490c-aa2c-4747-9efa-3f5e0e779fe2)

<div align="center">
  
[![Issues][issues-shield]][issues-url]
[![Check backend code builds](https://github.com/COS301-SE-2023/Domain-Pulse-A-Sentiment-Analysis-Platform/actions/workflows/backend-build.yml/badge.svg?branch=main)](https://github.com/COS301-SE-2023/Domain-Pulse-A-Sentiment-Analysis-Platform/actions/workflows/backend-build.yml)
[![Check frontend code builds](https://github.com/COS301-SE-2023/Domain-Pulse-A-Sentiment-Analysis-Platform/actions/workflows/frontend-build.yml/badge.svg?branch=main)](https://github.com/COS301-SE-2023/Domain-Pulse-A-Sentiment-Analysis-Platform/actions/workflows/frontend-build.yml)
[![codecov](https://codecov.io/gh/COS301-SE-2023/Domain-Pulse-A-Sentiment-Analysis-Platform/branch/main/graph/badge.svg?token=3VZEDJQL0Z)](https://codecov.io/gh/COS301-SE-2023/Domain-Pulse-A-Sentiment-Analysis-Platform)

<img alt="" src="https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white">
<img alt="" src="https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=green">
<img alt="" src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white">

</div>

![Asset 4@1x](https://github.com/COS301-SE-2023/Domain-Pulse-A-Sentiment-Analysis-Platform/assets/105363824/d5a6490c-aa2c-4747-9efa-3f5e0e779fe2)

<br>

# 📈**What is Domain Pulse?**

- Domain Pulse is the ultimate sentiment analysis platform. It gathers and analyses online opinions about any domain, be it a business, a person, or more. With stunning visuals and easy-to-understand statistics, Domain Pulse helps you understand the online presence and sentiment for any domain.
- 👨‍💻Created by: Ctrl Alt Defeat
  <img style="padding-left:30px;" src="https://github.com/COS301-SE-2023/Domain-Pulse-A-Sentiment-Analysis-Platform/assets/105363824/67f2cbf5-e639-49ed-8510-755c5cb0f830" width='200'>

<br>
<br>

# ⏯️Recorded Demos

- 🔗<a href="https://drive.google.com/file/d/1k016Gz-6wZjXX7A0ueJmnEw9Xr93X7sK/view?usp=share_link">Demo 1</a>

<br>
<br>

# Repository Breakdown

```
├── backend
│   ├── domains
│   │   ├── authchecker
│   │   ├── domains
│   │   ├── domainservice
│   │   ├── sourcevalidator
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

# Branching Strategy

<h3><b> Git Feature Workflow with Develop Branch </b></h3>
<p>Within this strategy, master (main) branch will always contain a system state that is ready to be deployed and used in production. A seperate development (dev) branch is created from the master branch and is what all developers will branch off of to create components and features within the system. This ensures a production-ready and stable branch is always available and is protected by ensuring developers push to a development branch as opposed to altering said master branch. Once the system is deemed ready to deploy the development branch shall be merged into the master branch.</p>

# 👨‍💻Meet the team

<table style="border-width: 1px; width: 100%; font-family: Arial, sans-serif; border-collapse: collapse;">
  <tr>
    <td style="vertical-align: top; width:auto; border: 0; padding: 10px;">
      <img src="https://github.com/COS301-SE-2023/Domain-Pulse-A-Sentiment-Analysis-Platform/assets/105363824/b0c39f63-7c73-43e5-b173-180d20053b7a" width="800" height="auto" style="display: block; margin: 0 auto;">
    </td>
    <td style="vertical-align: top; width: auto; border: 0; padding: 10px;">
      <h2><b style="font-size: 18px;">Christiaan Lombard</b></h2>
      I have a keen interest in machine learning, design and statistics, aswell as how they're amalgamation can result in something unexpectedly beautiful. I enjoy taking on a challenge and with industry experience in design and video editing, aswell as quantative analysis - I feel qualified to take on any project that comes my way.
      <br><br>
      <a href="https://github.com/chrislom12" style="text-decoration: none; margin-right: 10px; display: inline-block; vertical-align: middle;">
        <img src="https://img.icons8.com/material-rounded/24/000000/github.png" width="30" height="30">
      </a>
      <a href="https://www.linkedin.com/in/christiaan-lombard-9a627a1a4/" style="text-decoration: none; margin-right: 10px; display: inline-block; vertical-align: middle;">
        <img src="https://img.icons8.com/fluency/24/000000/linkedin.png"  width="30" height="30">
      </a>
    </td>
  </tr>
  <tr>
    <td style="vertical-align: top; width:auto; border: 0; padding: 10px;">
      <img src="https://github.com/COS301-SE-2023/Domain-Pulse-A-Sentiment-Analysis-Platform/assets/105363824/b220e274-a784-4a65-b4cc-a9c03810a4f2" width="400" height="auto" style="display: block; margin: 0 auto;">
    </td>
    <td style="vertical-align: top; width: auto; border: 0; padding: 10px;">
      <h2><b style="font-size: 18px;">Luke Lawson</b></h2> 
      I am an avid problem and puzzle solver – as such, I have a firm appreciation and aptitude for all things quantitative and analytical. I love being able to put what I know into practice by building something cool - especially if it means I get to challenge myself or learn something new. I consider it 'mission-critical' to hold on to a sense of humour no matter what! I'm particularly interested in machine learning - especially when applied to novel and fascinating domains such as sentiment analysis.
      <br><br>
      <a href="https://github.com/LukeLawsonSoftware" style="text-decoration: none; margin-right: 10px; display: inline-block; vertical-align: middle;">
        <img src="https://img.icons8.com/material-rounded/24/000000/github.png" width="30" height="30">
      </a>
      <a href="https://www.linkedin.com/in/luke-lawson-38a304181/" style="text-decoration: none; margin-right: 10px; display: inline-block; vertical-align: middle;">
        <img src="https://img.icons8.com/fluency/24/000000/linkedin.png"  width="30" height="30">
      </a>
    </td>
  </tr>
  <tr>
    <td style="vertical-align: top; width:auto; border: 0; padding: 10px;">
      <img src="https://github.com/COS301-SE-2023/Domain-Pulse-A-Sentiment-Analysis-Platform/assets/105363824/08c9863c-a8c4-4a44-bee2-941bb6af7552" width="400" height="auto" style="display: block; margin: 0 auto;">
    </td>
    <td style="vertical-align: top; width: auto; border: 0; padding: 10px;">
      <h2><b style="font-size: 23px;">Thuthuka Khumalo</h2></b>
      I am a software developer and graphic designer with a passion for creating intuitive and visually stunning designs. I am a hardworking and dedicated individual who is always willing to learn and improve. I am also a team player and enjoy working with others to achieve a common goal. I am currently working towards being a Cloud Architect. I consider the 2 areas of knowledge i specialize in to be the angular framework and the rust programming language. I also know how to use the adobe suite of products to create presentable media.
      <br><br>
      <a href="https://github.com/thuthuka111" style="text-decoration: none; margin-right: 10px; display: inline-block; vertical-align: middle;">
        <img src="https://img.icons8.com/material-rounded/24/000000/github.png" width="30" height="30">
      </a>
      <a href="https://www.linkedin.com/in/thuthuka-khumalo-95a63b1a4/" style="text-decoration: none; margin-right: 10px; display: inline-block; vertical-align: middle;">
        <img src="https://img.icons8.com/fluency/24/000000/linkedin.png"  width="30" height="30">
      </a>
      <a href="https://portfolio.thuthuka.me/" style="text-decoration: none; margin-right: 10px; display: inline-block; vertical-align: middle;">
        <img src="https://portfolio.thuthuka.me/favicon.ico" width="30" height="30" alt="Portfolio">
      </a>
    </td>
  </tr>
  <tr>
    <td style="vertical-align: top; width:auto; border: 0; padding: 10px;">
      <img src="https://github.com/COS301-SE-2023/Domain-Pulse-A-Sentiment-Analysis-Platform/assets/105363824/8024c567-63b0-4cab-8eb5-cfb3321c56e5)" width="400" height="auto" style="display: block; margin: 0 auto;">
    </td>
    <td style="vertical-align: top; width: auto; border: 0; padding: 10px;">
      <h2><b style="font-size: 18px;">Caden Dobson</b></h2>
      I am an ambitious, resilient and driven individual who always strives to succeed in any given task. My interests are Computer science,           Quantitative Finance, Big data analytics, Artificial intelligence and Statistics. I am inventive and incorporate creative thinking into           achieving logical solutions to problems. I am an avid learner who endeavours to deepen my knowledge in any field possible. I work well in         high pressure environments and always ensure that I put my best foot forward.
      <br><br>
      <a href="https://github.com/cadendobson" style="text-decoration: none; margin-right: 10px; display: inline-block; vertical-align: middle;">
        <img src="https://img.icons8.com/material-rounded/24/000000/github.png" width="30" height="30">
      </a>
      <a href="https://www.linkedin.com/in/caden-dobson-1a1018247/" style="text-decoration: none; margin-right: 10px; display: inline-block; vertical-align: middle;">
        <img src="https://img.icons8.com/fluency/24/000000/linkedin.png"  width="30" height="30">
      </a>
    </td>
  </tr>
  <tr>
    <td style="vertical-align: top; width:auto; border: 0; padding: 10px;">
      <img src="https://github.com/COS301-SE-2023/Domain-Pulse-A-Sentiment-Analysis-Platform/assets/105363824/1c2ebc6c-4843-4499-b6ff-7267541001e4" width="400" height="auto" style="display: block; margin: 0 auto;">
    </td>
    <td style="vertical-align: top; width: auto; border: 0; padding: 10px;">
      <h2><b style="font-size: 18px;">Thomas Blendulf</b></h2>
      I'm a computer science student with a passion and dedication to the work that I do. Whenever I am faced with a challenge I always give my best attempt at completing, learning about and mastering the problem at hand. What drives me to create projects such as that of Domain Pulse is a love for the creation of software and solutions that have meaningful and visible usage and effect for those it is made for.
      <br><br>
      <a href="https://github.com/TomBlendSoftware" style="text-decoration: none; margin-right: 10px; display: inline-block; vertical-align: middle;">
        <img src="https://img.icons8.com/material-rounded/24/000000/github.png" width="30" height="30">
      </a>
      <a href="https://www.linkedin.com/in/thomas-blendulf-57b7a8270/" style="text-decoration: none; margin-right: 10px; display: inline-block; vertical-align: middle;">
        <img src="https://img.icons8.com/fluency/24/000000/linkedin.png"  width="30" height="30">
      </a>
    </td>
  </tr>
  
</table>

[issues-shield]: https://img.shields.io/github/issues/COS301-SE-2023/Domain-Pulse-A-Sentiment-Analysis-Platform

[issues-url]:https://github.com/COS301-SE-2023/Domain-Pulse-A-Sentiment-Analysis-Platform/issues]
