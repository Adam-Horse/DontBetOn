# Docker Infrastructure

## Kafka

The `kafka-cluster` folder contains a compose file for standing up local development instances of Kafka and related services.

```bash
docker-compose -f kafka-cluster/docker-compose.yml up -d
```

Then can log into Kafka-UI at `http://localhost:8080` to manage Kafka.

> [!WARNING] 
> The configuration is not secured. Do not expose containers to the internet.

