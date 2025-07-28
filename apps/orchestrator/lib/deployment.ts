import {
  CoreV1Api,
  KubeConfig,
  NetworkingV1Api,
  AppsV1Api,
} from "@kubernetes/client-node";4

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


const kc = new KubeConfig();
kc.loadFromFile(`${process.env.HOME}/.kube/config`);

const coreV1Api = kc.makeApiClient(CoreV1Api);
const networkingV1Api = kc.makeApiClient(NetworkingV1Api);
const appsV1Api = kc.makeApiClient(AppsV1Api);

export const createCodeSpace = async (
  name: string,
  environment: string,
  port: number,
) => {
  let CONTAINER_IMAGE = "";

  if (environment === "reactjs") {
    CONTAINER_IMAGE = "alxn787/react-codespace:2";
  } else if (environment === "nodejs") {
    CONTAINER_IMAGE = "alxn787/node-codespace:2";
  } else {
    throw new Error(`Unsupported environment: ${environment}`);
  }

  console.log(
    `Creating deployment for ${name} with image ${CONTAINER_IMAGE} on port ${port}`,
  );

  const pvc = {
    apiVersion: "v1",
    kind: "PersistentVolumeClaim",
    metadata: {
      name: `${name}-postgres-pvc`,
    },
    spec: {
      accessModes: ["ReadWriteOnce"],
      resources: {
        requests: {
          storage: "1Gi",
        },
      },
    },
  };

  const postgresDeployment = {
    apiVersion: "apps/v1",
    kind: "Deployment",
    metadata: {
      name: `${name}-postgres`,
    },
    spec: {
      replicas: 1,
      selector: {
        matchLabels: {
          app: `${name}-postgres`,
        },
      },
      template: {
        metadata: {
          labels: {
            app: `${name}-postgres`,
          },
        },
        spec: {
          containers: [
            {
              name: "postgres",
              image: "postgres:latest", 
              ports: [
                { containerPort: 5432 }, 
              ],
              env: [
                {
                  name: "POSTGRES_DB",
                  value: `${name}_db`, 
                },
                {
                  name: "POSTGRES_USER",
                  value: "user",
                },
                {
                  name: "POSTGRES_PASSWORD",
                  value: "password", 
                },
              ],
              volumeMounts: [
                {
                  name: "postgres-storage",
                  mountPath: "/var/lib/postgresql/data", 
                },
              ],
            },
          ],
          volumes: [
            {
              name: "postgres-storage",
              persistentVolumeClaim: {
                claimName: `${name}-postgres-pvc`, 
              },
            },
          ],
        },
      },
    },
  };


  const postgresService = {
    apiVersion: "v1",
    kind: "Service",
    metadata: {
      name: `${name}-postgres-service`,
    },
    spec: {
      selector: {
        app: `${name}-postgres`,
      },
      ports: [
        {
          port: 5432,
          targetPort: 5432,
        },
      ],
      type: "ClusterIP",
    },
  };


  const deployment = {
    metadata: {
      name: name,
    },
    spec: {
      replicas: 1,
      selector: {
        matchLabels: {
          app: name,
        },
      },
      template: {
        metadata: {
          labels: {
            app: name,
          },
        },
        spec: {
          containers: [
            {
              name: name,
              image: CONTAINER_IMAGE,
              ports: [
                { containerPort: port },
                { containerPort: 5001 },
              ],
    
              env: [
                {
                  name: "DATABASE_HOST",
                  value: `${name}-postgres-service`,
                },
                {
                  name: "DATABASE_PORT",
                  value: "5432",
                },
                {
                  name: "DATABASE_NAME",
                  value: `${name}_db`,
                },
                {
                  name: "DATABASE_USER",
                  value: "user",
                },
                {
                  name: "DATABASE_PASSWORD",
                  value: "password",
                },
              ],
            },
          ],
        },
      },
    },
  };

  const service = {
    metadata: {
      name: `${name}-service`,
    },
    spec: {
      selector: {
        app: name,
      },
      ports: [
        {
          name: "app",
          port: port,
          targetPort: port,
        },
        {
          name: "api",
          port: 5001,
          targetPort: 5001,
        },
      ],
    },
  };

  const ingress = {
    metadata: {
      name: `${name}-ingress`,
    },
    spec: {
      rules: [
        {
          host: `app.${name}.localhost`,
          http: {
            paths: [
              {
                pathType: "Prefix",
                path: "/",
                backend: {
                  service: {
                    name: `${name}-service`,
                    port: {
                      number: port,
                    },
                  },
                },
              },
            ],
          },
        },
        {
          host: `api.${name}.localhost`,
          http: {
            paths: [
              {
                pathType: "Prefix",
                path: "/",
                backend: {
                  service: {
                    name: `${name}-service`,
                    port: {
                      number: 5001,
                    },
                  },
                },
              },
            ],
          },
        },
      ],
    },
  };

  try {
    // console.log(`Creating PVC: ${pvc.metadata.name}`);
    // const createdPvc = await coreV1Api.createNamespacedPersistentVolumeClaim(
    //  {namespace :"default",
    //   body:pvc}
    // );
    // console.log("Created PVC:", createdPvc.metadata?.name);

    // const createdPostgresDeployment = await appsV1Api.createNamespacedDeployment(
    //   {namespace:"default",
    //   body:postgresDeployment}
    // );
    // console.log("Created PostgreSQL Deployment:", createdPostgresDeployment.metadata?.name);

    // const createdPostgresService = await coreV1Api.createNamespacedService(
    // { namespace:"default",
    //   body:postgresService}
    // );
    // console.log("Created PostgreSQL Service:", createdPostgresService.metadata?.name);


    const createdDeployment = await appsV1Api.createNamespacedDeployment(
     {namespace:"default",
      body:deployment}
    );
    console.log("Created Deployment:", createdDeployment.metadata?.name);

    const createdService = await coreV1Api.createNamespacedService(
      {namespace:"default",
      body:service}
    );
    console.log("Created Service:", createdService.metadata?.name);

    const createdIngress = await networkingV1Api.createNamespacedIngress(
       {namespace:"default",
       body:ingress}
    );
    console.log("Created Ingress:", createdIngress.metadata?.name);

  } catch (err) {
    console.error("Error creating playground resources:", err);
  }
};
