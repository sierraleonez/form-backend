# Divertyone Form Server

This simple server is created to handle the neccesity of Divertyone (Senior High School 1 Tegal Alumni) to record participants of an Iftar Event (Bukber).

# Why don't you just use existing form app like GForm, TypeForm, etc?

We have our own specific requirement that cannot be achieved (As far as we know) with using the fore mentioned apps, for those reason, we choose to develop our own simple app to utilize the skills of our alumni.

# Tech stack
- NodeJS Runtime v18.12.1
- NPM v8.19.2
- PostgreSQL

We use *expressJS* for sake of simplicity of this project and *prisma* to abstracting database connection and migration.

We choose DigitalOcean as our cloud provider simply due to it is so far the simplest (compared to GCP and AWS) for just simple cloud application that doesn't need granular access level and high level infrastructure (even though it is possible to design high level infra here),
