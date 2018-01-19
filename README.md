<<<<<<< HEAD
# README #

Welcome to the README for the Unipaper front end website.

### What is this repository for? ###

* This repo contains the source code for www.unipaper.co.uk
* The main technology used is AngularJS.
* The site is hosted on Netlify

### How do I get set up? ###

#### Summary of set up

- The site uses only frontend technologies like AngularJS, HTML, CSS and Javascript. Set up involves creating a virtualhost for the instance and a server configuration file (eg. .htaccess if the server is Apache) to rewrite URLs.

#### Configuration
- Create a virtualhost to point to the base directory of the downloaded source code. For example, if your code is at /var/www/unipaper-frontend, create a virtualhost 'unipaper-frontend.localhost' with /var/www/unipaper-frontend as the DocumentRoot.
- Create a web server configuration file to rewrite URLs to remove '#' from them, and place it in the base directory of the project. If you are using Apache as your web server, this project already has a .htaccess file.

#### Deployment instructions

The site is automatically deployed whenever you commit to master.

```
#!bash

git push origin master

```

A gulp task fetches and creates a sitemap.txt on each build. The build command is,

```
#!bash

gulp

```

### Who do I talk to? ###

* Speak to @abhijeetkumar or @bhuvana87 about the code.
* Speak to @nagarajanp2341 about the business requirements.
=======
>>>>>>> 6a2589a0565a9f4d0fd337342bf2f410bf14ea3e
# ben
