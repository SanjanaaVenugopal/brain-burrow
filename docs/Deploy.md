Deploy using github

1. Install github pages package - npm install gh-pages --save-dev
2. Update package.json with - "homepage": "https://sanjanaavenugopal.github.io/brain-burrow"
   "predeploy": "npm run build",
   "deploy": "gh-pages -d build"}

3. Command to deploy your changes - npm run deploy [Run this command on command prompt in admin mode]

Go to - "homepage": "https://sanjanaavenugopal.github.io/brain-burrow" to view the page
