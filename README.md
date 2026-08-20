# cohort-9-mern-7473-muhammad
Cohort 9 — MERN (NodeJS+ReactJS) assignment for Muhammad Kaif Qureshi

# Running SonarQube locally

Start the server (first run pulls the image and takes a minute or two):

```
docker run -d --name sonarqube -p 9000:9000 sonarqube:lts-community
```

Open http://localhost:9000 and log in with `admin` / `admin`. Change the password when it asks,
then create a token under My Account > Security.

Generate the coverage reports both projects feed to Sonar:

```
cd backend && npm run test:coverage
cd ../frontend && npm run test:coverage
```

The backend run needs the test database, same as `npm run test:integration`.

Then scan from the repository root:

```
docker run --rm \
  -v "$(pwd):/usr/src" \
  --network host \
  sonarsource/sonar-scanner-cli \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.token=YOUR_TOKEN
```

Results appear at http://localhost:9000/dashboard?id=notes-app

To stop the server: `docker stop sonarqube`. To remove it: `docker rm sonarqube`.
