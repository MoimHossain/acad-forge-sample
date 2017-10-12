# acad-forge-sample
This repository delivers a docker container that provides the [Building Information Modeling](https://en.wikipedia.org/wiki/Building_information_modeling) a.k.a **BIM** document view capabilities to an application. The container provides these capabilities as a service.

### How so?
This service takes an Azure storage account as configuration and provides viewing capabilities to an app directly from the blob container.

### Configuration
- You need to provide the AutoDesk Forge API client ID and client secret
- You need to provide the Azure Storage account credentials

### How to Run it?

Swarm command:
```
docker service create --detach --name bim -d -p 8005:8005 --replicas=1 --network=networkname --constraint 'node.role==worker'  moimhossain/bim:latest
```

### Thanks for reading!
Provide feedback to the author, if you have any.

